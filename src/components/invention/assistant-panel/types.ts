
export interface AnalysisLoadingState {
  technical: boolean;
  market: boolean;
  legal: boolean;
  business: boolean;
  comprehensive: boolean;
  visualization: boolean;
  threejs: boolean;
  users: boolean;
  materials: boolean;
  ip: boolean;
  competition: boolean;
  challenges: boolean;
  runAll: boolean;
  customMarketing: boolean;
}

export interface AnalysisState {
  isLoading: AnalysisLoadingState;
  activeTab: string;
  analyzedContent: string | null;
}
