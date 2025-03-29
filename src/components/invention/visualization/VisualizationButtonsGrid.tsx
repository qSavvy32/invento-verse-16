
import { Button } from "@/components/ui/button";
import { 
  PencilLine, 
  Image, 
  Shapes, 
  Layers,
  BarChart4,
  Loader2
} from "lucide-react";

interface VisualizationButtonsGridProps {
  isLoading: {
    sketch: boolean;
    image: boolean;
    threejs: boolean;
    realistic3d: boolean;
    businessStrategy: boolean;
  };
  hasTitle: boolean;
  hasDescription: boolean;
  hasSketch: boolean;
  onGenerateSketch: () => void;
  onGenerate3DImage: () => void;
  onGenerateRealistic3D: () => void;
  onGenerateBusinessStrategy: () => void;
}

export const VisualizationButtonsGrid = ({
  isLoading,
  hasTitle,
  hasDescription,
  hasSketch,
  onGenerateSketch,
  onGenerate3DImage,
  onGenerateRealistic3D,
  onGenerateBusinessStrategy
}: VisualizationButtonsGridProps) => {
  const isDisabled = !hasTitle && !hasDescription;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2"
        disabled={isDisabled || isLoading.sketch}
        onClick={onGenerateSketch}
      >
        {isLoading.sketch ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <PencilLine className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-xs font-medium">Generate Sketch</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2"
        disabled={isDisabled || isLoading.realistic3d}
        onClick={onGenerateRealistic3D}
      >
        {isLoading.realistic3d ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <Image className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-xs font-medium">Realistic Mockup</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2"
        disabled={isDisabled || isLoading.image}
        onClick={onGenerate3DImage}
      >
        {isLoading.image ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <Shapes className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-xs font-medium">3D Mockup</span>
      </Button>
      
      <Button
        variant="outline"
        className="h-auto py-4 flex flex-col items-center gap-2"
        disabled={isDisabled || isLoading.businessStrategy}
        onClick={onGenerateBusinessStrategy}
      >
        {isLoading.businessStrategy ? (
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        ) : (
          <BarChart4 className="h-6 w-6 text-muted-foreground" />
        )}
        <span className="text-xs font-medium">Business Strategy</span>
      </Button>
    </div>
  );
};
