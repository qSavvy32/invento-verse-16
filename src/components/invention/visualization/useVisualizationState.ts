import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";
import {
  generateSketch,
  generate3DImage,
  generateRealistic3DImage,
  generateBusinessStrategy,
  generateCustomMarketingImage,
  VisualizationRequest
} from "./visualizationService";
import { useNavigate } from "react-router-dom";

export interface LoadingState {
  sketch: boolean;
  image: boolean;
  threejs: boolean;
  realistic3d: boolean;
  businessStrategy: boolean;
  customMarketing: boolean;
  runAll: boolean;
}

export const useVisualizationState = () => {
  const navigate = useNavigate();
  const { state, updateSketchData, update3DVisualization, setBusinessStrategySvg, addAsset, setMostRecentGeneration } = useInvention();
  const [customPrompt, setCustomPrompt] = useState("");
  const [isLoading, setIsLoading] = useState<LoadingState>({
    sketch: false,
    image: false,
    threejs: false,
    realistic3d: false,
    businessStrategy: false,
    customMarketing: false,
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
      
      const result = await generateSketch(request);
      
      // If there's no data URL but there's an error, it means API service failed
      if (!result.dataUrl && result.error) {
        // Offer to redirect to manual canvas
        const confirmed = window.confirm(
          "Sketch AI service is unavailable. Would you like to draw your sketch manually instead?"
        );
        
        if (confirmed) {
          navigate("/create/sketch");
        }
        return;
      }
      
      if (result.dataUrl) {
        updateSketchData(result.dataUrl);
        
        // Add the sketch to the assets repository
        const assetId = `sketch-${Date.now()}`;
        addAsset({
          id: assetId,
          type: "sketch",
          url: result.dataUrl,
          thumbnailUrl: result.dataUrl,
          name: `Sketch: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
        
        // Set as most recent generation
        setMostRecentGeneration({
          id: assetId,
          type: 'sketch',
          url: result.dataUrl,
          name: `Sketch: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
        
        toast.success("Sketch generated successfully");
      }
    } catch (error) {
      console.error("Error generating sketch:", error);
      
      // Offer to redirect to manual canvas
      const confirmed = window.confirm(
        "There was an error generating the sketch. Would you like to draw your sketch manually instead?"
      );
      
      if (confirmed) {
        navigate("/create/sketch");
      } else {
        toast.error("Failed to generate sketch", {
          description: error instanceof Error ? error.message : "An unexpected error occurred"
        });
      }
    } finally {
      setIsLoading(prev => ({ ...prev, sketch: false }));
    }
  };

  const handleGenerate3DImage = async () => {
    setIsLoading(prev => ({ ...prev, image: true }));
    toast.info("Generating marketing imagery...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description,
        prompt: customPrompt
      };
      
      const result = await generate3DImage(request);
      update3DVisualization(result.dataUrl);
      
      // Add the 3D image to the assets repository
      if (result.dataUrl) {
        const assetId = `marketing-${Date.now()}`;
        addAsset({
          id: assetId,
          type: "image",
          url: result.dataUrl,
          thumbnailUrl: result.dataUrl,
          name: `Marketing: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
        
        // Set as most recent generation
        setMostRecentGeneration({
          id: assetId,
          type: 'marketing-image',
          url: result.dataUrl,
          name: `Marketing: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
      }
      
      toast.success("Marketing imagery generated successfully");
    } catch (error) {
      console.error("Error generating marketing imagery:", error);
      toast.error("Failed to generate marketing imagery", {
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
      
      const result = await generateRealistic3DImage(request);
      update3DVisualization(result.dataUrl);
      
      // Add the realistic 3D image to the assets repository
      if (result.dataUrl) {
        const assetId = `realistic-3d-${Date.now()}`;
        addAsset({
          id: assetId,
          type: "image",
          url: result.dataUrl,
          thumbnailUrl: result.dataUrl,
          name: `Realistic Mockup: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
        
        // Set as most recent generation
        setMostRecentGeneration({
          id: assetId,
          type: '3d-model',
          url: result.dataUrl,
          name: `Realistic Mockup: ${state.title || "Untitled"}`,
          createdAt: Date.now()
        });
      }
      
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
      setIsLoading(prev => ({ ...prev, businessStrategy: false }));
    }
  };
  
  const handleGenerateCustomMarketingImage = async (prompt: string) => {
    if (!prompt.trim()) {
      toast.error("Please enter a marketing image prompt");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, customMarketing: true }));
    toast.info("Generating custom marketing imagery...");

    try {
      const request: VisualizationRequest = {
        title: state.title,
        description: state.description,
        prompt: prompt
      };
      
      const result = await generateCustomMarketingImage(request);
      update3DVisualization(result.dataUrl);
      
      // Add the custom marketing image to the assets repository
      if (result.dataUrl) {
        const assetId = `custom-marketing-${Date.now()}`;
        addAsset({
          id: assetId,
          type: "image",
          url: result.dataUrl,
          thumbnailUrl: result.dataUrl,
          name: `Custom Marketing: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`,
          createdAt: Date.now()
        });
        
        // Set as most recent generation
        setMostRecentGeneration({
          id: assetId,
          type: 'marketing-image',
          url: result.dataUrl,
          name: `Custom Marketing: ${prompt.substring(0, 30)}${prompt.length > 30 ? '...' : ''}`,
          createdAt: Date.now()
        });
      }
      
      toast.success("Custom marketing imagery generated successfully");
    } catch (error) {
      console.error("Error generating custom marketing imagery:", error);
      toast.error("Failed to generate custom marketing imagery", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, customMarketing: false }));
    }
  };

  return {
    state,
    isLoading,
    customPrompt,
    setCustomPrompt,
    handleGenerateSketch,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateBusinessStrategy,
    handleGenerateCustomMarketingImage
  };
};
