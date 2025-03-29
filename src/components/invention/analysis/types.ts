
// Analysis Types
export type AnalysisType = 
  | "technical" 
  | "challenges" 
  | "materials" 
  | "users" 
  | "competition" 
  | "ip" 
  | "regulatory" 
  | "comprehensive";

export interface AnalysisResults {
  technical: string[];
  market: string[];
  legal: string[];
  business: string[];
}

export interface AnalysisState {
  analysisResults: AnalysisResults;
  title: string;
  description: string;
  sketchDataUrl: string | null;
  setAnalysisResults: (type: keyof AnalysisResults, results: string[]) => void;
}
