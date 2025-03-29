
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";

export type RunAllLoadingState = boolean;

export const useRunAllVisualizations = (
  handleGenerateSketch: () => Promise<void>,
  handleGenerate3DImage: () => Promise<void>,
  handleGenerateBusinessStrategy: () => Promise<void>
) => {
  const { state } = useInvention();
  const [isLoading, setIsLoading] = useState<RunAllLoadingState>(false);

  const handleRunAllVisualizations = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }

    setIsLoading(true);
    toast.info("Generating all visualizations...");

    try {
      // Run visualizations in sequence to avoid overwhelming the API
      await handleGenerateSketch();
      await handleGenerate3DImage();
      await handleGenerateBusinessStrategy();
      
      toast.success("All visualizations generated successfully");
    } catch (error) {
      console.error("Error running all visualizations:", error);
      toast.error("Failed to run all visualizations", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleRunAllVisualizations
  };
};
