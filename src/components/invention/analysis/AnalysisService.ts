
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

// Types for the analysis
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

// Function to run a single analysis
export const runAnalysis = async (
  analysisType: string,
  state: AnalysisState,
  setIsLoading: (type: string, isLoading: boolean) => void
): Promise<void> => {
  // Don't proceed if there's not enough data
  if (!state.title && !state.description) {
    toast.error("Please provide a title and description first");
    return;
  }
  
  setIsLoading(analysisType, true);
  
  try {
    // Log the request for debugging
    console.log(`Starting ${analysisType} analysis with:`, {
      title: state.title,
      description: state.description,
      hasSketch: !!state.sketchDataUrl
    });
    
    // Enhanced prompt to request markdown-formatted output
    const { data, error } = await supabase.functions.invoke("analyze-invention", {
      body: {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
        analysisType: analysisType,
        outputFormat: "markdown" // Request markdown-formatted responses
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log(`Analysis result for ${analysisType}:`, data);
    
    // Add timestamp to the analysis results
    const timestamp = new Date().toLocaleTimeString();
    
    // Handle different types of analysis and their response formats
    processAnalysisResults(analysisType, data, state, timestamp);
    
    toast.success(`${analysisType} analysis complete`);
  } catch (error) {
    console.error(`Error running ${analysisType} analysis:`, error);
    toast.error(`Analysis failed`, {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  } finally {
    setIsLoading(analysisType, false);
  }
};

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

// Helper functions to extract results from various response formats
const extractTechnicalResults = (data: any): string[] => {
  let results: string[] = [];
  
  // If we have engineering_challenges in a structured format
  if (data.engineering_challenges && Array.isArray(data.engineering_challenges)) {
    results = data.engineering_challenges.map((challenge: any) => 
      `${challenge.challenge || challenge.name || 'Challenge'}: ${challenge.description || challenge.explanation || ''}`
    );
  } 
  // If we have design_considerations in a structured format
  else if (data.design_considerations && Array.isArray(data.design_considerations)) {
    results = data.design_considerations.map((item: any) => 
      `${item.consideration || 'Consideration'}: ${item.explanation || item.description || ''}`
    );
  }
  // If we have technical_feasibility as an object
  else if (data.technical_feasibility && typeof data.technical_feasibility === 'object') {
    results = [`Technical feasibility (${data.technical_feasibility.assessment || 'unknown'}): ${data.technical_feasibility.explanation || ''}`];
  }
  // If we have a technical array directly
  else if (data.technical && Array.isArray(data.technical)) {
    results = data.technical;
  }
  // If we have key_challenges
  else if (data.key_challenges && Array.isArray(data.key_challenges)) {
    results = data.key_challenges.map((challenge: any) => 
      typeof challenge === 'string' ? challenge : `${challenge.challenge || 'Challenge'}: ${challenge.description || ''}`
    );
  }
  // If we have analysis array
  else if (data.analysis && Array.isArray(data.analysis)) {
    results = data.analysis;
  }
  // Raw text in analysis field
  else if (data.analysis && typeof data.analysis === 'string') {
    results = [data.analysis];
  }
  // Generic object extraction
  else if (typeof data === 'object' && data !== null) {
    results = Object.entries(data)
      .filter(([key]) => !['id', 'created_at', 'updated_at'].includes(key))
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key.replace(/_/g, ' ')}: ${value}`;
        }
        return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
      });
  }
  
  // If we still have no results, create a generic response
  if (results.length === 0) {
    results = ["Analysis completed but no specific technical points could be extracted."];
  }
  
  return results;
};

const extractMarketResults = (data: any): string[] => {
  let results: string[] = [];
  
  if (Array.isArray(data)) {
    results = data;
  } 
  else if (data.market && Array.isArray(data.market)) {
    results = data.market;
  }
  else if (data.analysis && Array.isArray(data.analysis)) {
    results = data.analysis;
  }
  else if (data.user_analysis && typeof data.user_analysis === 'object') {
    // Handle structured user analysis
    results = [];
    
    // Extract primary user group
    if (data.user_analysis.primary_user_group) {
      const primary = data.user_analysis.primary_user_group;
      results.push(`Primary users: ${primary.group_name || 'Unknown'}`);
      
      if (primary.needs_addressed && Array.isArray(primary.needs_addressed)) {
        primary.needs_addressed.forEach((need: string) => {
          results.push(`- Need: ${need}`);
        });
      }
    }
    
    // Extract target user groups
    if (data.user_analysis.target_user_groups && Array.isArray(data.user_analysis.target_user_groups)) {
      data.user_analysis.target_user_groups.forEach((group: any) => {
        results.push(`User group: ${group.group_name} - ${group.description || ''}`);
      });
    }
  }
  else if (typeof data === 'object' && data !== null) {
    results = Object.entries(data)
      .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key.replace(/_/g, ' ')}: ${value}`;
        } else if (Array.isArray(value)) {
          return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
        }
        return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
      });
  }
  
  return results;
};

const extractLegalResults = (data: any): string[] => {
  let results: string[] = [];
  
  if (Array.isArray(data)) {
    results = data;
  }
  else if (data.legal && Array.isArray(data.legal)) {
    results = data.legal;
  }
  else if (data.analysis && Array.isArray(data.analysis)) {
    results = data.analysis;
  }
  else if (typeof data === 'object' && data !== null) {
    results = Object.entries(data)
      .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key.replace(/_/g, ' ')}: ${value}`;
        } else if (Array.isArray(value)) {
          return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
        }
        return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
      });
  }
  
  return results;
};

const processComprehensiveResults = (data: any, state: AnalysisState, timestamp: string): void => {
  // Process comprehensive analysis which may contain multiple categories
  if (data.technical && Array.isArray(data.technical)) {
    const technicalResults = data.technical;
    if (technicalResults.length > 0) {
      technicalResults[0] = `[${timestamp} - Technical] ${technicalResults[0]}`;
    }
    state.setAnalysisResults("technical", [...state.analysisResults.technical, ...technicalResults]);
  }
  
  if (data.market && Array.isArray(data.market)) {
    const marketResults = data.market;
    if (marketResults.length > 0) {
      marketResults[0] = `[${timestamp} - Market] ${marketResults[0]}`;
    }
    state.setAnalysisResults("market", [...state.analysisResults.market, ...marketResults]);
  }
  
  if (data.legal && Array.isArray(data.legal)) {
    const legalResults = data.legal;
    if (legalResults.length > 0) {
      legalResults[0] = `[${timestamp} - Legal] ${legalResults[0]}`;
    }
    state.setAnalysisResults("legal", [...state.analysisResults.legal, ...legalResults]);
  }
  
  if (data.business && Array.isArray(data.business)) {
    const businessResults = data.business;
    if (businessResults.length > 0) {
      businessResults[0] = `[${timestamp} - Business] ${businessResults[0]}`;
    }
    state.setAnalysisResults("business", [...state.analysisResults.business, ...businessResults]);
  }
  
  // If we don't have structured data, try to extract from the raw response
  if (!data.technical && !data.market && !data.legal && !data.business) {
    const allPoints = Object.entries(data)
      .filter(([key]) => key !== 'analysis_type' && key !== 'invention_title' && key !== 'invention_description')
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key.replace(/_/g, ' ')}: ${value}`;
        } else if (Array.isArray(value)) {
          return `${key.replace(/_/g, ' ')}: ${value.join(', ')}`;
        }
        return `${key.replace(/_/g, ' ')}: ${JSON.stringify(value)}`;
      });
    
    if (allPoints.length > 0) {
      const third = Math.ceil(allPoints.length / 3);
      
      const technicalResults = allPoints.slice(0, third);
      if (technicalResults.length > 0) {
        technicalResults[0] = `[${timestamp} - Technical] ${technicalResults[0]}`;
        state.setAnalysisResults("technical", [...state.analysisResults.technical, ...technicalResults]);
      }
      
      const marketResults = allPoints.slice(third, 2 * third);
      if (marketResults.length > 0) {
        marketResults[0] = `[${timestamp} - Market] ${marketResults[0]}`;
        state.setAnalysisResults("market", [...state.analysisResults.market, ...marketResults]);
      }
      
      const legalResults = allPoints.slice(2 * third);
      if (legalResults.length > 0) {
        legalResults[0] = `[${timestamp} - Legal] ${legalResults[0]}`;
        state.setAnalysisResults("legal", [...state.analysisResults.legal, ...legalResults]);
      }
    }
  }
};

// Function to run all analyses
export const runAllAnalyses = async (
  state: AnalysisState,
  setIsLoading: (type: string, isLoading: boolean) => void,
  onAnalysisComplete: () => void
): Promise<void> => {
  if (!state.title && !state.description) {
    toast.error("Please provide a title and description first");
    return;
  }
  
  setIsLoading("runAll", true);
  toast.info("Running all analyses...", { 
    description: "This may take a minute to complete" 
  });
  
  try {
    // Run all analyses one by one
    const analysisTypes = ["technical", "users", "materials", "ip", "competition", "challenges"];
    
    for (const analysisType of analysisTypes) {
      setIsLoading(analysisType, true);
      
      try {
        console.log(`Starting ${analysisType} analysis in Run All`);
        
        const { data, error } = await supabase.functions.invoke("analyze-invention", {
          body: {
            title: state.title,
            description: state.description,
            sketchDataUrl: state.sketchDataUrl,
            analysisType: analysisType,
            outputFormat: "markdown" // Request markdown-formatted responses
          }
        });
        
        if (error) {
          console.error(`Error in ${analysisType} during Run All:`, error);
          continue; // Skip to next analysis if this one fails
        }
        
        console.log(`Analysis result for ${analysisType} in Run All:`, data);
        
        // Process results for this analysis type
        const timestamp = new Date().toLocaleTimeString();
        processAnalysisResults(analysisType, data, state, timestamp);
      } catch (error) {
        console.error(`Error in ${analysisType} during Run All:`, error);
      } finally {
        setIsLoading(analysisType, false);
      }
    }
    
    onAnalysisComplete();
    toast.success("All analyses completed");
  } catch (error) {
    console.error("Error running all analyses:", error);
    toast.error("Some analyses failed to complete", {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  } finally {
    setIsLoading("runAll", false);
  }
};
