
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";
import { generateBusinessStrategy, VisualizationRequest } from "../visualizationService";

export type BusinessStrategyLoadingState = boolean;

export const useBusinessStrategyGeneration = () => {
  const { state, setBusinessStrategySvg, setMostRecentGeneration } = useInvention();
  const [isLoading, setIsLoading] = useState<BusinessStrategyLoadingState>(false);

  const handleGenerateBusinessStrategy = async () => {
    setIsLoading(true);
    toast.info("Generating business strategy visualization...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl
      };
      
      const result = await generateBusinessStrategy(request);
      setBusinessStrategySvg(result.svgCode);
      
      // Set as most recent generation if it's an SVG
      if (result.svgCode) {
        setMostRecentGeneration({
          id: `business-strategy-${Date.now()}`,
          type: 'business-strategy',
          url: null,
          svg: result.svgCode,
          name: `Business Strategy: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
      }
      
      toast.success("Business strategy visualization generated successfully");
    } catch (error) {
      console.error("Error generating business strategy:", error);
      toast.error("Failed to generate business strategy", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleGenerateBusinessStrategy
  };
};
