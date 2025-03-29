
import { AnalysisType, AnalysisResults, AnalysisState } from "./types";
import { runAnalysis } from "./singleAnalysisRunner";
import { runAllAnalyses } from "./batchAnalysisRunner";

// Re-export types with the proper 'export type' syntax
export type { AnalysisType, AnalysisResults, AnalysisState };

// Re-export functions
export { runAnalysis, runAllAnalyses };

// Add logging function for debugging
export const logAnalysisError = (type: AnalysisType, error: Error) => {
  console.error(`Error running analysis for ${type}:`, error);
};
