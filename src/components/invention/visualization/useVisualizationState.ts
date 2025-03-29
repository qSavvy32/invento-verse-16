
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";
import {
  generateSketch,
  generate3DImage,
  generateRealistic3DImage,
  generateThreejsVisualization,
  generateBusinessStrategy,
  VisualizationRequest
} from "./visualizationService";

export interface LoadingState {
  sketch: boolean;
  image: boolean;
  threejs: boolean;
  realistic3d: boolean;
  businessStrategy: boolean;
  runAll: boolean;
}

export const useVisualizationState = () => {
  const { state, updateSketchData, update3DVisualization, setThreejsVisualization, setBusinessStrategySvg } = useInvention();
  const [isLoading, setIsLoading] = useState<LoadingState>({
    sketch: false,
    image: false,
    threejs: false,
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
    toast.info("Generating 3D model...");

    try {
      const request: VisualizationRequest = {
        sketchDataUrl: state.sketchDataUrl,
        description: state.description,
        title: state.title
      };
      
      const imageUrl = await generate3DImage(request);
      update3DVisualization(imageUrl);
      toast.success("3D model generated successfully");
    } catch (error) {
      console.error("Error generating 3D model:", error);
      toast.error("Failed to generate 3D model", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, image: false }));
    }
  };

  const handleGenerateRealistic3DImage = async () => {
    setIsLoading(prev => ({ ...prev, realistic3d: true }));
    toast.info("Generating realistic 3D image...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl
      };
      
      const imageUrl = await generateRealistic3DImage(request);
      update3DVisualization(imageUrl);
      toast.success("Realistic 3D image generated successfully");
    } catch (error) {
      console.error("Error generating realistic 3D image:", error);
      toast.error("Failed to generate realistic 3D image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, realistic3d: false }));
    }
  };

  const handleGenerateThreejsVisualization = async () => {
    setIsLoading(prev => ({ ...prev, threejs: true }));
    toast.info("Generating interactive 3D visualization...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl
      };
      
      const { code, html } = await generateThreejsVisualization(request);
      setThreejsVisualization(code, html);
      toast.success("3D visualization generated successfully");
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast.error("Failed to generate 3D visualization", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, threejs: false }));
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
    handleGenerateThreejsVisualization,
    handleGenerateBusinessStrategy
  };
};
