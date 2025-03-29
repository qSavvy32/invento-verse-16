
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Button } from "@/components/ui/button";
import { Loader2, Image } from "lucide-react";
import { generate3DVisualization, generateThreejsVisualization } from "../analysis/VisualizationService";

interface VisualizationTabProps {
  isLoading: {
    visualization: boolean;
    threejs: boolean;
  };
  updateLoadingState: (type: string, isLoading: boolean) => void;
}

export const VisualizationTab = ({ 
  isLoading, 
  updateLoadingState 
}: VisualizationTabProps) => {
  const { state, update3DVisualization, updateThreejsCode, updateThreejsHtml } = useInvention();
  
  // Create a wrapper for visualization state
  const visualizationStateWrapper = {
    title: state.title,
    description: state.description,
    sketchDataUrl: state.sketchDataUrl,
    updateVisualizations: (data: any) => {
      // Handle visualization prompt updates
      console.log("Updating visualizations with data:", data);
    },
    update3DVisualization,
    setThreejsVisualization: (code: string, html: string) => {
      updateThreejsCode(code);
      updateThreejsHtml(html);
    }
  };
  
  // Handle 3D visualization generation
  const handle3DVisualization = () => {
    generate3DVisualization(
      visualizationStateWrapper,
      updateLoadingState
    );
  };
  
  // Handle ThreeJS visualization generation
  const handleThreejsVisualization = () => {
    generateThreejsVisualization(
      visualizationStateWrapper,
      updateLoadingState
    );
  };
  
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        className="p-6 border rounded-lg hover:bg-muted/30 transition-colors flex flex-col items-center gap-2"
        onClick={handle3DVisualization}
        disabled={isLoading.visualization}
      >
        {isLoading.visualization ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <Image className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-lg font-semibold">3D Visualization</span>
        <p className="text-sm text-muted-foreground text-center">
          Generate a 3D visualization of your invention concept
        </p>
      </button>
      
      <button
        className="p-6 border rounded-lg hover:bg-muted/30 transition-colors flex flex-col items-center gap-2"
        onClick={handleThreejsVisualization}
        disabled={isLoading.threejs}
      >
        {isLoading.threejs ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <Image className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-lg font-semibold">Interactive 3D Model</span>
        <p className="text-sm text-muted-foreground text-center">
          Generate an interactive Three.js 3D model of your invention
        </p>
      </button>
    </div>
  );
};
