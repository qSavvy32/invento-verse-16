
import { Button } from "@/components/ui/button";
import { 
  BarChart4, 
  Package,
  Layers,
  RotateCcw,
  Loader2
} from "lucide-react";
import PixelCard from "@/components/ui/PixelCard";

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
    <div className="space-y-4">
      <h3 className="text-md font-medium">Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Button
          variant="outline"
          className="w-full"
          onClick={onGenerate3DVisualization}
          disabled={isDisabled || isLoading.visualization}
        >
          {isLoading.visualization ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Package className="mr-2 h-4 w-4" />
          )}
          Generate 3D Visualization
        </Button>
        
        <Button
          variant="outline"
          className="w-full"
          onClick={onGenerateThreejsVisualization}
          disabled={isDisabled || isLoading.threejs}
        >
          {isLoading.threejs ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Layers className="mr-2 h-4 w-4" />
          )}
          Generate Interactive 3D
        </Button>
      </div>
      
      <PixelCard
        variant="rainbow"
        className="w-full mt-4"
        onClick={onRunAllAnalyses}
        active={isLoading.runAll}
        disabled={isDisabled || isLoading.runAll}
      >
        <div className="p-3 text-center">
          {isLoading.runAll ? (
            <>
              <Loader2 className="mx-auto h-5 w-5 animate-spin mb-1" />
              <h3 className="font-medium">Running all analyses...</h3>
            </>
          ) : (
            <>
              <BarChart4 className="mx-auto h-5 w-5 mb-1" />
              <h3 className="font-medium">Run All Analyses</h3>
              <p className="text-xs opacity-80">Complete invention analysis</p>
            </>
          )}
        </div>
      </PixelCard>
    </div>
  );
};
