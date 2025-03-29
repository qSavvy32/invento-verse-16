
export type AssetType =
  | "image"
  | "video"
  | "audio"
  | "document"
  | "sketch"
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

export interface MostRecentGeneration {
  id: string;
  type: string;
  url?: string | null;
  svg?: string | null;
  name: string;
  createdAt: number;
  data?: any;
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
  updateDescription: (description: string | ((prev: string) => string)) => void;
  updateSketchData: (sketchDataUrl: string | null) => void;
  addAsset: (asset: InventionAsset) => void;
  removeAsset: (assetId: string) => void;
  update3DVisualization: (visualization3dUrl: string | null) => void;
  updateVisualizationPrompts: (
    visualizationPrompts: Record<string, string>
  ) => void;
  saveToDatabase: (showToast?: boolean) => Promise<string | null>;
  loadInvention: (id: string) => Promise<void>;
  resetState: () => void;
  updateThreejsCode: (code: string | null) => void;
  updateThreejsHtml: (html: string | null) => void;
  setBusinessStrategySvg: (svg: string | null) => void;
  setAnalysisResults: (results: AnalysisResults) => void;
  addAnalysisResult: (type: keyof AnalysisResults, result: string) => void;
  clearAnalysisResults: () => void;
  addAudioTranscription: (transcription: AudioTranscription) => void;
  setMostRecentGeneration: (generation: MostRecentGeneration) => void;
  updateMostRecentGeneration: (generation: any) => void;
}

// Define the initial state
export const initialState: InventionState = {
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
