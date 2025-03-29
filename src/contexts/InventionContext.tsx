
import { createContext, useContext, useReducer, ReactNode, useCallback } from 'react';
import { InventionService } from '@/services/InventionService';
import { toast } from "sonner";

// Types
export interface VisualizationPrompts {
  concept?: string;
  materials?: string;
  users?: string;
  problem?: string;
}

export interface AudioTranscription {
  audioUrl?: string;
  language: string;
  text: string;
  timestamp: number;
}

export interface InventionAsset {
  id: string;
  type: 'sketch' | 'image' | 'document' | '3d';
  url: string;
  thumbnailUrl?: string;
  name?: string;
  createdAt: number;
}

export interface GeneratedItem {
  id: string;
  type: 'sketch' | 'image' | 'business-strategy' | 'document' | '3d' | string;
  url?: string | null;
  svg?: string | null;
  name?: string;
  createdAt: number;
}

export interface InventionState {
  inventionId?: string;
  title: string;
  description: string;
  sketchDataUrl: string | null; // Keeping for backward compatibility
  assets: InventionAsset[]; // New array to store multiple assets
  visualization3dUrl: string | null;
  visualizationPrompts: VisualizationPrompts;
  savedToDatabase: boolean;
  threejsVisualization: {
    code: string | null;
    html: string | null;
  };
  businessStrategySvg: string | null;
  mostRecentGeneration: GeneratedItem | null;
  analysisResults: {
    technical: string[];
    market: string[];
    legal: string[];
    business: string[];
  };
  audioTranscriptions: AudioTranscription[];
}

type InventionAction = 
  | { type: 'UPDATE_TITLE'; payload: string }
  | { type: 'UPDATE_DESCRIPTION'; payload: string | ((prev: string) => string) }
  | { type: 'UPDATE_SKETCH_DATA'; payload: string | null }
  | { type: 'ADD_ASSET'; payload: InventionAsset }
  | { type: 'REMOVE_ASSET'; payload: string } // id of asset to remove
  | { type: 'UPDATE_3D_VISUALIZATION'; payload: string | null }
  | { type: 'UPDATE_VISUALIZATIONS'; payload: VisualizationPrompts }
  | { type: 'SAVE_TO_DATABASE'; payload: boolean }
  | { type: 'SET_THREEJS_VISUALIZATION'; payload: { code: string | null; html: string | null } }
  | { type: 'SET_BUSINESS_STRATEGY_SVG'; payload: string | null }
  | { type: 'SET_MOST_RECENT_GENERATION'; payload: GeneratedItem | null }
  | { type: 'SET_ANALYSIS_RESULTS'; payload: { category: 'technical' | 'market' | 'legal' | 'business', results: string[] } }
  | { type: 'ADD_AUDIO_TRANSCRIPTION'; payload: AudioTranscription }
  | { type: 'LOAD_INVENTION'; payload: InventionState }
  | { type: 'SET_INVENTION_ID'; payload: string };

interface InventionContextType {
  state: InventionState;
  updateTitle: (title: string) => void;
  updateDescription: (description: string | ((prev: string) => string)) => void;
  updateSketchData: (dataUrl: string | null) => void;
  addAsset: (asset: InventionAsset) => void;
  removeAsset: (assetId: string) => void;
  update3DVisualization: (dataUrl: string | null) => void;
  updateVisualizations: (prompts: VisualizationPrompts) => void;
  saveToDatabase: (showToast?: boolean) => Promise<void>;
  loadInvention: (id: string) => Promise<boolean>;
  setThreejsVisualization: (code: string | null, html: string | null) => void;
  setBusinessStrategySvg: (svgData: string | null) => void;
  setMostRecentGeneration: (item: GeneratedItem | null) => void;
  setAnalysisResults: (category: 'technical' | 'market' | 'legal' | 'business', results: string[]) => void;
  addAudioTranscription: (transcription: AudioTranscription) => void;
}

// Initial state
const initialState: InventionState = {
  title: '',
  description: '',
  sketchDataUrl: null,
  assets: [],
  visualization3dUrl: null,
  visualizationPrompts: {},
  savedToDatabase: false,
  threejsVisualization: {
    code: null,
    html: null
  },
  businessStrategySvg: null,
  mostRecentGeneration: null,
  analysisResults: {
    technical: [],
    market: [],
    legal: [],
    business: []
  },
  audioTranscriptions: []
};

// Reducer
const inventionReducer = (state: InventionState, action: InventionAction): InventionState => {
  switch (action.type) {
    case 'UPDATE_TITLE':
      return { ...state, title: action.payload };
    case 'UPDATE_DESCRIPTION': {
      const newDescription = typeof action.payload === 'function' 
        ? action.payload(state.description) 
        : action.payload;
      return { ...state, description: newDescription };
    }
    case 'UPDATE_SKETCH_DATA':
      return { ...state, sketchDataUrl: action.payload };
    case 'ADD_ASSET':
      return { 
        ...state, 
        assets: [...state.assets, action.payload] 
      };
    case 'REMOVE_ASSET':
      return {
        ...state,
        assets: state.assets.filter(asset => asset.id !== action.payload)
      };
    case 'UPDATE_3D_VISUALIZATION':
      return { ...state, visualization3dUrl: action.payload };
    case 'UPDATE_VISUALIZATIONS':
      return { ...state, visualizationPrompts: { ...state.visualizationPrompts, ...action.payload } };
    case 'SAVE_TO_DATABASE':
      return { ...state, savedToDatabase: action.payload };
    case 'SET_THREEJS_VISUALIZATION':
      return { ...state, threejsVisualization: action.payload };
    case 'SET_BUSINESS_STRATEGY_SVG':
      return { ...state, businessStrategySvg: action.payload };
    case 'SET_MOST_RECENT_GENERATION':
      return { ...state, mostRecentGeneration: action.payload };
    case 'SET_ANALYSIS_RESULTS':
      return { 
        ...state, 
        analysisResults: {
          ...state.analysisResults,
          [action.payload.category]: action.payload.results
        }
      };
    case 'ADD_AUDIO_TRANSCRIPTION':
      return {
        ...state,
        audioTranscriptions: [...state.audioTranscriptions, action.payload]
      };
    case 'LOAD_INVENTION':
      return action.payload;
    case 'SET_INVENTION_ID':
      return { ...state, inventionId: action.payload };
    default:
      return state;
  }
};

// Context
const InventionContext = createContext<InventionContextType | undefined>(undefined);

// Provider component
export const InventionContextProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(inventionReducer, initialState);

  const updateTitle = (title: string) => dispatch({ type: 'UPDATE_TITLE', payload: title });
  
  const updateDescription = (descriptionOrFn: string | ((prev: string) => string)) => 
    dispatch({ type: 'UPDATE_DESCRIPTION', payload: descriptionOrFn });
  
  const updateSketchData = (dataUrl: string | null) => dispatch({ type: 'UPDATE_SKETCH_DATA', payload: dataUrl });
  
  const addAsset = (asset: InventionAsset) => dispatch({ type: 'ADD_ASSET', payload: asset });
  
  const removeAsset = (assetId: string) => dispatch({ type: 'REMOVE_ASSET', payload: assetId });
  
  const update3DVisualization = (dataUrl: string | null) => dispatch({ type: 'UPDATE_3D_VISUALIZATION', payload: dataUrl });
  
  const updateVisualizations = (prompts: VisualizationPrompts) => dispatch({ type: 'UPDATE_VISUALIZATIONS', payload: prompts });
  
  const saveToDatabase = useCallback(async (showToast: boolean = false): Promise<void> => {
    try {
      if (showToast) {
        toast.loading("Saving your invention...");
      }
      
      const inventionId = await InventionService.saveInvention(state);
      
      if (inventionId && inventionId !== state.inventionId) {
        dispatch({ type: 'SET_INVENTION_ID', payload: inventionId });
      }
      
      dispatch({ type: 'SAVE_TO_DATABASE', payload: true });
      
      if (showToast) {
        toast.success("Invention saved successfully!", {
          id: "saving-invention"
        });
      }
    } catch (error) {
      console.error("Error saving to database:", error);
      
      if (showToast) {
        toast.error("Failed to save invention", {
          id: "saving-invention",
          description: error instanceof Error ? error.message : "An unexpected error occurred"
        });
      }
      
      throw error; // Re-throw the error to allow handling by caller
    }
  }, [state]);
  
  const loadInvention = useCallback(async (id: string): Promise<boolean> => {
    try {
      toast.loading("Loading your invention...");
      
      const inventionData = await InventionService.getInventionById(id);
      
      if (!inventionData) {
        toast.error("Invention not found", {
          id: "loading-invention"
        });
        return false;
      }
      
      dispatch({ type: 'LOAD_INVENTION', payload: inventionData });
      
      toast.success("Invention loaded successfully!", {
        id: "loading-invention"
      });
      
      return true;
    } catch (error) {
      console.error("Error loading invention:", error);
      
      toast.error("Failed to load invention", {
        id: "loading-invention",
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      
      return false;
    }
  }, []);
  
  const setThreejsVisualization = (code: string | null, html: string | null) => 
    dispatch({ type: 'SET_THREEJS_VISUALIZATION', payload: { code, html } });
  
  const setBusinessStrategySvg = (svgData: string | null) => 
    dispatch({ type: 'SET_BUSINESS_STRATEGY_SVG', payload: svgData });
  
  const setMostRecentGeneration = (item: GeneratedItem | null) => 
    dispatch({ type: 'SET_MOST_RECENT_GENERATION', payload: item });
  
  const setAnalysisResults = (category: 'technical' | 'market' | 'legal' | 'business', results: string[]) => 
    dispatch({ type: 'SET_ANALYSIS_RESULTS', payload: { category, results } });
  
  const addAudioTranscription = (transcription: AudioTranscription) => 
    dispatch({ type: 'ADD_AUDIO_TRANSCRIPTION', payload: transcription });

  return (
    <InventionContext.Provider 
      value={{ 
        state, 
        updateTitle, 
        updateDescription, 
        updateSketchData, 
        addAsset,
        removeAsset,
        update3DVisualization,
        updateVisualizations,
        saveToDatabase,
        loadInvention,
        setThreejsVisualization,
        setBusinessStrategySvg,
        setMostRecentGeneration,
        setAnalysisResults,
        addAudioTranscription
      }}
    >
      {children}
    </InventionContext.Provider>
  );
};

// Custom hook for using the context
export const useInvention = () => {
  const context = useContext(InventionContext);
  if (context === undefined) {
    throw new Error('useInvention must be used within an InventionContextProvider');
  }
  return context;
};
