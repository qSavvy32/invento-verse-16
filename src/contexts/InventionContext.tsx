import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "other";

export interface InventionAsset {
  id?: string;
  type: AssetType;
  url: string;
  thumbnailUrl?: string;
  name?: string;
  createdAt: number;
}

export interface AudioTranscription {
  text: string;
  language: string;
  audioUrl?: string;
  timestamp: number;
}

export interface ThreejsVisualization {
  code: string | null;
  html: string | null;
}

export interface AnalysisResults {
  technical: string[];
  market: string[];
  legal: string[];
  business: string[];
}

// Add this to your type definitions
export interface MostRecentGeneration {
  type: 'sketch' | 'mockup' | 'marketing-image' | '3d-model' | 'business-strategy' | 'expert-feedback';
  data: any;
  timestamp: number;
}

export interface InventionState {
  inventionId: string | null;
  title: string;
  description: string;
  sketchDataUrl: string | null;
  assets: InventionAsset[];
  visualization3dUrl: string | null;
  visualizationPrompts: Record<string, string>;
  savedToDatabase: boolean;
  threejsVisualization: ThreejsVisualization;
  businessStrategySvg: string | null;
  mostRecentGeneration: MostRecentGeneration | null;
  analysisResults: AnalysisResults;
  audioTranscriptions: AudioTranscription[];
}

export interface InventionContextType {
  state: InventionState;
  setState: React.Dispatch<React.SetStateAction<InventionState>>;
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateSketchDataUrl: (sketchDataUrl: string | null) => void;
  addAsset: (asset: InventionAsset) => void;
  removeAsset: (assetId: string) => void;
  updateVisualization3dUrl: (visualization3dUrl: string | null) => void;
  updateVisualizationPrompts: (
    visualizationPrompts: Record<string, string>
  ) => void;
  saveToDatabase: (showToast?: boolean) => Promise<string | null>;
  loadInvention: (id: string) => Promise<void>;
  resetState: () => void;
  updateThreejsCode: (code: string | null) => void;
  updateThreejsHtml: (html: string | null) => void;
  updateBusinessStrategySvg: (svg: string | null) => void;
  addAnalysisResult: (type: keyof AnalysisResults, result: string) => void;
  clearAnalysisResults: () => void;
  addAudioTranscription: (transcription: AudioTranscription) => void;
  updateMostRecentGeneration: (generation: MostRecentGeneration) => void;
}

// Define the initial state
const initialState: InventionState = {
  inventionId: null,
  title: "",
  description: "",
  sketchDataUrl: null,
  assets: [],
  visualization3dUrl: null,
  visualizationPrompts: {},
  savedToDatabase: false,
  threejsVisualization: {
    code: null,
    html: null,
  },
  businessStrategySvg: null,
  mostRecentGeneration: null,
  analysisResults: {
    technical: [],
    market: [],
    legal: [],
    business: [],
  },
  audioTranscriptions: [],
};

const InventionContext = createContext<InventionContextType | undefined>(undefined);

export const InventionContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<InventionState>(initialState);

  useEffect(() => {
    console.log("Invention State updated:", state);
  }, [state]);

  const updateTitle = useCallback((title: string) => {
    setState((prevState) => ({ ...prevState, title }));
  }, []);

  const updateDescription = useCallback((description: string) => {
    setState((prevState) => ({ ...prevState, description }));
  }, []);

  const updateSketchDataUrl = useCallback((sketchDataUrl: string | null) => {
    setState((prevState) => ({ ...prevState, sketchDataUrl }));
  }, []);

  const addAsset = useCallback((asset: InventionAsset) => {
    setState((prevState) => ({
      ...prevState,
      assets: [...prevState.assets, asset],
    }));
  }, []);

  const removeAsset = useCallback((assetId: string) => {
    setState((prevState) => ({
      ...prevState,
      assets: prevState.assets.filter((asset) => asset.id !== assetId),
    }));
  }, []);

  const updateVisualization3dUrl = useCallback((visualization3dUrl: string | null) => {
    setState((prevState) => ({ ...prevState, visualization3dUrl }));
  }, []);

  const updateVisualizationPrompts = useCallback(
    (visualizationPrompts: Record<string, string>) => {
      setState((prevState) => ({ ...prevState, visualizationPrompts }));
    },
    []
  );

  const updateThreejsCode = useCallback((code: string | null) => {
    setState((prevState) => ({
      ...prevState,
      threejsVisualization: { ...prevState.threejsVisualization, code },
    }));
  }, []);

  const updateThreejsHtml = useCallback((html: string | null) => {
    setState((prevState) => ({
      ...prevState,
      threejsVisualization: { ...prevState.threejsVisualization, html },
    }));
  }, []);

  const updateBusinessStrategySvg = useCallback((svg: string | null) => {
    setState((prevState) => ({ ...prevState, businessStrategySvg: svg }));
  }, []);

  const addAnalysisResult = useCallback(
    (type: keyof AnalysisResults, result: string) => {
      setState((prevState) => ({
        ...prevState,
        analysisResults: {
          ...prevState.analysisResults,
          [type]: [...prevState.analysisResults[type], result],
        },
      }));
    },
    []
  );

  const clearAnalysisResults = useCallback(() => {
    setState((prevState) => ({
      ...prevState,
      analysisResults: {
        technical: [],
        market: [],
        legal: [],
        business: [],
      },
    }));
  }, []);

  const addAudioTranscription = useCallback((transcription: AudioTranscription) => {
    setState((prevState) => ({
      ...prevState,
      audioTranscriptions: [...prevState.audioTranscriptions, transcription],
    }));
  }, []);
  
  // Update the state with the most recent generation
  const updateMostRecentGeneration = useCallback((generation: MostRecentGeneration) => {
    setState(prevState => ({
      ...prevState,
      mostRecentGeneration: generation
    }));
  }, []);

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  // Function to save the invention to the database
  const saveToDatabase = useCallback(async (showToast: boolean = true): Promise<string | null> => {
    try {
      // Here you would call your InventionService to save the state
      const save = async () => {
        const { InventionService } = await import("@/services/InventionService");
        return InventionService.saveInvention(state);
      };

      const inventionId = await save();

      if (inventionId) {
        setState((prevState) => ({ ...prevState, savedToDatabase: true, inventionId }));
        if (showToast) {
          const { toast } = await import("sonner");
          toast.success("Invention saved successfully!");
        }
        return inventionId;
      } else {
        if (showToast) {
          const { toast } = await import("sonner");
          toast.error("Failed to save invention.");
        }
        return null;
      }
    } catch (error: any) {
      console.error("Error saving invention:", error);
      const { toast } = await import("sonner");
      toast.error(error.message || "Failed to save invention.");
      return null;
    }
  }, [state]);

  // Function to load an invention from the database
  const loadInvention = useCallback(async (id: string) => {
    try {
      // Here you would call your InventionService to load the state
      const load = async () => {
        const { InventionService } = await import("@/services/InventionService");
        return InventionService.getInventionById(id);
      };

      const loadedState = await load();

      if (loadedState) {
        setState(loadedState);
      } else {
        const { toast } = await import("sonner");
        toast.error("Failed to load invention.");
      }
    } catch (error) {
      console.error("Error loading invention:", error);
      const { toast } = await import("sonner");
      toast.error("Failed to load invention.");
    }
  }, []);

  // Add updateMostRecentGeneration to the context value
  const value = {
    state,
    setState,
    updateTitle,
    updateDescription,
    updateSketchDataUrl,
    addAsset,
    removeAsset,
    updateVisualization3dUrl,
    updateVisualizationPrompts,
    saveToDatabase,
    loadInvention,
    resetState,
    updateThreejsCode,
    updateThreejsHtml,
    updateBusinessStrategySvg,
    addAnalysisResult,
    clearAnalysisResults,
    addAudioTranscription,
    updateMostRecentGeneration,
  };

  return (
    <InventionContext.Provider value={value}>
      {children}
    </InventionContext.Provider>
  );
};

export const useInvention = () => {
  const context = useContext(InventionContext);
  if (!context) {
    throw new Error("useInvention must be used within a InventionContextProvider");
  }
  return context;
};
