
import { toast } from "sonner";
import { AnalysisState } from "./types";
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
    console.log("Starting batch analysis with state:", {
      title: state.title, 
      description: state.description?.substring(0, 50) + "...",
      hasSketch: !!state.sketchDataUrl
    });
    
    // Run analyses one by one with a delay between them to avoid rate limiting
    const analysisTypes = ["technical", "users", "materials", "ip", "competition", "challenges"];
    
    for (const analysisType of analysisTypes) {
      try {
        console.log(`Running analysis for: ${analysisType}`);
        await runAnalysis(analysisType, state, setIsLoading, false);
        // Small delay between requests to avoid overwhelming the API
        await new Promise(resolve => setTimeout(resolve, 500));
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
