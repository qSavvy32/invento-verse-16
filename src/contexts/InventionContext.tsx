
import { createContext, useContext, useReducer, ReactNode } from 'react';

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

export interface InventionState {
  title: string;
  description: string;
  sketchDataUrl: string | null;
  visualization3dUrl: string | null;
  visualizationPrompts: VisualizationPrompts;
  savedToDatabase: boolean;
  threejsVisualization: {
    code: string | null;
    html: string | null;
  };
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
  | { type: 'UPDATE_DESCRIPTION'; payload: string }
  | { type: 'UPDATE_SKETCH_DATA'; payload: string | null }
  | { type: 'UPDATE_3D_VISUALIZATION'; payload: string | null }
  | { type: 'UPDATE_VISUALIZATIONS'; payload: VisualizationPrompts }
  | { type: 'SAVE_TO_DATABASE'; payload: boolean }
  | { type: 'SET_THREEJS_VISUALIZATION'; payload: { code: string | null; html: string | null } }
  | { type: 'SET_ANALYSIS_RESULTS'; payload: { category: 'technical' | 'market' | 'legal' | 'business', results: string[] } }
  | { type: 'ADD_AUDIO_TRANSCRIPTION'; payload: AudioTranscription };

interface InventionContextType {
  state: InventionState;
  updateTitle: (title: string) => void;
  updateDescription: (description: string | ((prev: string) => string)) => void;
  updateSketchData: (dataUrl: string | null) => void;
  update3DVisualization: (dataUrl: string | null) => void;
  updateVisualizations: (prompts: VisualizationPrompts) => void;
  saveToDatabase: (saved: boolean) => void;
  setThreejsVisualization: (code: string | null, html: string | null) => void;
  setAnalysisResults: (category: 'technical' | 'market' | 'legal' | 'business', results: string[]) => void;
  addAudioTranscription: (transcription: AudioTranscription) => void;
}

// Initial state
const initialState: InventionState = {
  title: '',
  description: '',
  sketchDataUrl: null,
  visualization3dUrl: null,
  visualizationPrompts: {},
  savedToDatabase: false,
  threejsVisualization: {
    code: null,
    html: null
  },
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
    case 'UPDATE_DESCRIPTION':
      return { ...state, description: typeof action.payload === 'function' 
        ? action.payload(state.description) 
        : action.payload 
      };
    case 'UPDATE_SKETCH_DATA':
      return { ...state, sketchDataUrl: action.payload };
    case 'UPDATE_3D_VISUALIZATION':
      return { ...state, visualization3dUrl: action.payload };
    case 'UPDATE_VISUALIZATIONS':
      return { ...state, visualizationPrompts: { ...state.visualizationPrompts, ...action.payload } };
    case 'SAVE_TO_DATABASE':
      return { ...state, savedToDatabase: action.payload };
    case 'SET_THREEJS_VISUALIZATION':
      return { ...state, threejsVisualization: action.payload };
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
  const update3DVisualization = (dataUrl: string | null) => dispatch({ type: 'UPDATE_3D_VISUALIZATION', payload: dataUrl });
  const updateVisualizations = (prompts: VisualizationPrompts) => dispatch({ type: 'UPDATE_VISUALIZATIONS', payload: prompts });
  const saveToDatabase = (saved: boolean) => dispatch({ type: 'SAVE_TO_DATABASE', payload: saved });
  const setThreejsVisualization = (code: string | null, html: string | null) => 
    dispatch({ type: 'SET_THREEJS_VISUALIZATION', payload: { code, html } });
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
        update3DVisualization,
        updateVisualizations,
        saveToDatabase,
        setThreejsVisualization,
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
