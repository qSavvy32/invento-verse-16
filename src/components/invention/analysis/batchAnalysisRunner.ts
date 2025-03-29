
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisState } from "./types";
import { processAnalysisResults } from "./analysisProcessor";

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
