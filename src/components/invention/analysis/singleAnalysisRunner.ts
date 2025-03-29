
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisState } from "./types";
import { processAnalysisResults } from "./analysisProcessor";

// Function to run a single analysis
export const runAnalysis = async (
  analysisType: string,
  state: AnalysisState,
  setIsLoading: (type: string, isLoading: boolean) => void,
  showToast: boolean = true
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
    
    if (showToast) {
      toast.success(`${analysisType} analysis complete`);
    }
  } catch (error) {
    console.error(`Error running ${analysisType} analysis:`, error);
    toast.error(`Analysis failed`, {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  } finally {
    setIsLoading(analysisType, false);
  }
};
