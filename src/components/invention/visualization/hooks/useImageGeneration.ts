
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";
import { 
  generate3DImage, 
  generateRealistic3DImage, 
  generateCustomMarketingImage,
  VisualizationRequest 
} from "../visualizationService";

export interface ImageLoadingState {
  image: boolean;
  realistic3d: boolean;
  customMarketing: boolean;
}

export const useImageGeneration = () => {
  const { state, update3DVisualization, addAsset, setMostRecentGeneration } = useInvention();
  const [isLoading, setIsLoading] = useState<ImageLoadingState>({
    image: false,
    realistic3d: false,
    customMarketing: false
  });
  const [customPrompt, setCustomPrompt] = useState("");

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
    isLoading,
    customPrompt,
    setCustomPrompt,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateCustomMarketingImage
  };
};
