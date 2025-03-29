
import { Button } from "@/components/ui/button";
import { 
  Loader2,
  Lightbulb,
  Package,
  Play
} from "lucide-react";

interface ActionButtonGroupProps {
  isLoading: Record<string, boolean>;
  isDisabled: boolean;
  onGenerate3DVisualization: () => void;
  onGenerateThreejsVisualization: () => void;
  onRunAllAnalyses: () => void;
}

export const ActionButtonGroup = ({
  isLoading,
  isDisabled,
  onGenerate3DVisualization,
  onGenerateThreejsVisualization,
  onRunAllAnalyses
}: ActionButtonGroupProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
      <Button 
        onClick={onGenerate3DVisualization} 
        disabled={isLoading.visualization || isDisabled}
        variant="outline"
        className="flex items-center"
      >
        {isLoading.visualization ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Lightbulb className="mr-2 h-4 w-4" />
        )}
        <span>Generate AI Image</span>
      </Button>
      
      <Button
        onClick={onGenerateThreejsVisualization}
        disabled={isLoading.threejs || isDisabled}
        variant="outline"
        className="flex items-center"
      >
        {isLoading.threejs ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Package className="mr-2 h-4 w-4" />
        )}
        <span>Generate 3D Visualization</span>
      </Button>
      
      <Button
        onClick={onRunAllAnalyses}
        disabled={isDisabled}
        variant="outline"
        className="flex items-center"
      >
        {isLoading.runAll ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Play className="mr-2 h-4 w-4" />
        )}
        <span>Run All Analyses</span>
      </Button>
    </div>
  );
};
