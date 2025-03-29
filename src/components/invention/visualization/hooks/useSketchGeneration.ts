
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInvention } from "@/contexts/InventionContext";
import { toast } from "sonner";
import { generateSketch, VisualizationRequest } from "../visualizationService";

export type SketchLoadingState = boolean;

export const useSketchGeneration = () => {
  const navigate = useNavigate();
  const { state, updateSketchData, addAsset, setMostRecentGeneration } = useInvention();
  const [isLoading, setIsLoading] = useState<SketchLoadingState>(false);

  const handleGenerateSketch = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleGenerateSketch
  };
};
