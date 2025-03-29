
import { AnalysisState, AnalysisType } from "./types";
import { 
  extractTechnicalResults, 
  extractMarketResults, 
  extractLegalResults, 
  processComprehensiveResults 
} from "./resultProcessors";

// Process and categorize analysis results
export const processAnalysisResults = (
  analysisType: string,
  data: any,
  state: AnalysisState,
  timestamp: string
): void => {
  if (analysisType === "technical" || ["challenges", "materials"].includes(analysisType)) {
    let technicalResults: string[] = extractTechnicalResults(data);
    
    // Prepend timestamp to the first result for better tracking
    if (technicalResults.length > 0) {
      technicalResults[0] = `[${timestamp} - ${analysisType}] ${technicalResults[0]}`;
    }
    
    // Add the results to the existing array
    state.setAnalysisResults("technical", [...state.analysisResults.technical, ...technicalResults]);
  } 
  else if (["users", "competition"].includes(analysisType)) {
    let marketResults = extractMarketResults(data);
    
    if (marketResults.length > 0) {
      marketResults[0] = `[${timestamp} - ${analysisType}] ${marketResults[0]}`;
    } else {
      marketResults = [`[${timestamp}] No specific ${analysisType} analysis results found.`];
    }
    
    state.setAnalysisResults("market", [...state.analysisResults.market, ...marketResults]);
  } 
  else if (["ip", "regulatory"].includes(analysisType)) {
    let legalResults = extractLegalResults(data);
    
    if (legalResults.length > 0) {
      legalResults[0] = `[${timestamp} - ${analysisType}] ${legalResults[0]}`;
    } else {
      legalResults = [`[${timestamp}] No specific ${analysisType} analysis results found.`];
    }
    
    state.setAnalysisResults("legal", [...state.analysisResults.legal, ...legalResults]);
  } 
  else if (analysisType === "comprehensive") {
    processComprehensiveResults(data, state, timestamp);
  }
};
