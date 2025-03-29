
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { AnalysisState } from "./types";
import { processAnalysisResults } from "./analysisProcessor";
import { runAnalysis } from "./singleAnalysisRunner";

// Function to run all analyses
export const runAllAnalyses = async (
  state: AnalysisState,
  setIsLoading: (type: string, isLoading: boolean) => void
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
      try {
        await runAnalysis(analysisType, state, setIsLoading, false);
      } catch (error) {
        console.error(`Error in ${analysisType} during Run All:`, error);
      }
    }
    
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
