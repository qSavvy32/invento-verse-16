
import { Pencil, Image, Box, BarChart4, Camera } from "lucide-react";
import { VisualizationButton } from "./VisualizationButton";
import { LoadingState } from "./useVisualizationState";

interface VisualizationButtonsGridProps {
  isLoading: LoadingState;
  hasTitle: boolean;
  hasDescription: boolean;
  hasSketch: boolean;
  onGenerateSketch: () => Promise<void>;
  onGenerateRealistic3D: () => Promise<void>;
  onGenerate3DImage: () => Promise<void>;
  onGenerateThreejs: () => Promise<void>;
  onGenerateBusinessStrategy: () => Promise<void>;
}

export const VisualizationButtonsGrid = ({
  isLoading,
  hasTitle,
  hasDescription,
  hasSketch,
  onGenerateSketch,
  onGenerateRealistic3D,
  onGenerate3DImage,
  onGenerateThreejs,
  onGenerateBusinessStrategy
}: VisualizationButtonsGridProps) => {
  const hasInventionDetails = hasTitle && hasDescription;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
      <VisualizationButton
        onClick={onGenerateSketch}
        disabled={!hasInventionDetails}
        icon={Pencil}
        isLoading={isLoading.sketch}
        label="Generate Sketch"
      />
      
      <VisualizationButton
        onClick={onGenerateRealistic3D}
        disabled={!hasInventionDetails}
        icon={Camera}
        isLoading={isLoading.realistic3d}
        label="Realistic 3D Image"
      />
      
      <VisualizationButton
        onClick={onGenerate3DImage}
        disabled={!hasSketch}
        icon={Image}
        isLoading={isLoading.image}
        label="Generate 3D Model"
      />
      
      <VisualizationButton
        onClick={onGenerateThreejs}
        disabled={!hasInventionDetails}
        icon={Box}
        isLoading={isLoading.threejs}
        label="Interactive 3D"
      />
      
      <VisualizationButton
        onClick={onGenerateBusinessStrategy}
        disabled={!hasInventionDetails}
        icon={BarChart4}
        isLoading={isLoading.businessStrategy}
        label="Business Strategy"
      />
    </div>
  );
};
