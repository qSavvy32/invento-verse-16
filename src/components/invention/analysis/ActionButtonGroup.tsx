
import { Button } from "@/components/ui/button";
import { 
  ArrowRightCircle, 
  Cpu, 
  Package, 
  LayoutList,
  Zap 
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
      <h3 className="text-md font-medium mb-2">Actions</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <PixelCard 
          variant="default"
          onClick={onRunAllAnalyses}
          className="h-24"
          active={isLoading.runAll}
        >
          <div className="text-center">
            {isLoading.runAll ? (
              <div className="animate-pulse">
                <Zap className="mx-auto h-6 w-6 mb-2" />
                <p className="font-medium">Running all analyses...</p>
              </div>
            ) : (
              <>
                <Zap className="mx-auto h-6 w-6 mb-2" />
                <p className="font-medium">Run All Analyses</p>
                <p className="text-xs opacity-80">Complete invention assessment</p>
              </>
            )}
          </div>
        </PixelCard>
        
        <div className="flex flex-col space-y-2">
          <Button
            variant="outline"
            onClick={onGenerate3DVisualization}
            disabled={isDisabled || isLoading.visualization}
            className="h-12 justify-start"
          >
            {isLoading.visualization ? (
              <span className="animate-pulse flex items-center">
                <Cpu className="mr-2 h-4 w-4 animate-spin" />
                Generating 3D model...
              </span>
            ) : (
              <>
                <Cpu className="mr-2 h-4 w-4" />
                Generate 3D Model
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            onClick={onGenerateThreejsVisualization}
            disabled={isDisabled || isLoading.threejs}
            className="h-12 justify-start"
          >
            {isLoading.threejs ? (
              <span className="animate-pulse flex items-center">
                <Package className="mr-2 h-4 w-4 animate-spin" />
                Generating visualization...
              </span>
            ) : (
              <>
                <Package className="mr-2 h-4 w-4" />
                Generate Web 3D Visualization
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
