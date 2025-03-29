
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";
import {
  generateSketch,
  generate3DImage,
  generateRealistic3DImage,
  generateBusinessStrategy,
  VisualizationRequest
} from "./visualizationService";

export interface LoadingState {
  sketch: boolean;
  image: boolean;
  realistic3d: boolean;
  businessStrategy: boolean;
  runAll: boolean;
}

export const useVisualizationState = () => {
  const { state, updateSketchData, update3DVisualization, setBusinessStrategySvg } = useInvention();
  const [isLoading, setIsLoading] = useState<LoadingState>({
    sketch: false,
    image: false,
    realistic3d: false,
    businessStrategy: false,
    runAll: false
  });

  const handleGenerateSketch = async () => {
    setIsLoading(prev => ({ ...prev, sketch: true }));
    toast.info("Generating sketch...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description
      };
      
      const sketchUrl = await generateSketch(request);
      updateSketchData(sketchUrl);
      toast.success("Sketch generated successfully");
    } catch (error) {
      console.error("Error generating sketch:", error);
      toast.error("Failed to generate sketch", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, sketch: false }));
    }
  };

  const handleGenerate3DImage = async () => {
    setIsLoading(prev => ({ ...prev, image: true }));
    toast.info("Generating 3D mockup...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description
      };
      
      const imageUrl = await generate3DImage(request);
      update3DVisualization(imageUrl);
      toast.success("3D mockup generated successfully");
    } catch (error) {
      console.error("Error generating 3D mockup:", error);
      toast.error("Failed to generate 3D mockup", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, image: false }));
    }
  };

  const handleGenerateRealistic3DImage = async () => {
    setIsLoading(prev => ({ ...prev, realistic3d: true }));
    toast.info("Generating realistic mockup...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description
      };
      
      const imageUrl = await generateRealistic3DImage(request);
      update3DVisualization(imageUrl);
      toast.success("Realistic mockup generated successfully");
    } catch (error) {
      console.error("Error generating realistic mockup:", error);
      toast.error("Failed to generate realistic mockup", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, realistic3d: false }));
    }
  };

  const handleGenerateBusinessStrategy = async () => {
    setIsLoading(prev => ({ ...prev, businessStrategy: true }));
    toast.info("Generating business strategy visualization...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl
      };
      
      const svgCode = await generateBusinessStrategy(request);
      setBusinessStrategySvg(svgCode);
      toast.success("Business strategy visualization generated successfully");
    } catch (error) {
      console.error("Error generating business strategy:", error);
      toast.error("Failed to generate business strategy", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, businessStrategy: false }));
    }
  };

  return {
    state,
    isLoading,
    handleGenerateSketch,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateBusinessStrategy
  };
};
