
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { useSketchGeneration } from "./hooks/useSketchGeneration";
import { useImageGeneration } from "./hooks/useImageGeneration";
import { useBusinessStrategyGeneration } from "./hooks/useBusinessStrategyGeneration";
import { useRunAllVisualizations } from "./hooks/useRunAllVisualizations";

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
  const { state } = useInvention();
  
  // Use the individual hooks
  const { 
    isLoading: sketchLoading,
    handleGenerateSketch 
  } = useSketchGeneration();
  
  const {
    isLoading: imageLoading,
    customPrompt,
    setCustomPrompt,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateCustomMarketingImage
  } = useImageGeneration();
  
  const {
    isLoading: businessStrategyLoading,
    handleGenerateBusinessStrategy
  } = useBusinessStrategyGeneration();
  
  const {
    isLoading: runAllLoading,
    handleRunAllVisualizations
  } = useRunAllVisualizations(
    handleGenerateSketch,
    handleGenerate3DImage,
    handleGenerateBusinessStrategy
  );
  
  // Combine loading states
  const isLoading: LoadingState = {
    sketch: sketchLoading,
    image: imageLoading.image,
    threejs: false, // This is currently not used, but keeping for compatibility
    realistic3d: imageLoading.realistic3d,
    businessStrategy: businessStrategyLoading,
    customMarketing: imageLoading.customMarketing,
    runAll: runAllLoading
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
    handleGenerateCustomMarketingImage,
    handleRunAllVisualizations
  };
};
