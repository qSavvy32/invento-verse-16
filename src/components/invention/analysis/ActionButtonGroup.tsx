
import { Button } from "@/components/ui/button";
import { 
  Loader2,
  Lightbulb,
  Package,
  Play,
  PencilRuler,
  ImageIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvention } from "@/contexts/InventionContext";

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
  const [generatingSketch, setGeneratingSketch] = useState(false);
  const { state, updateSketchData } = useInvention();

  const generateSketch = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }

    setGeneratingSketch(true);
    
    try {
      toast.info("Generating sketch...", {
        description: "This may take a minute to complete"
      });
      
      const { data, error } = await supabase.functions.invoke("generate-sketch", {
        body: {
          prompt: `${state.title}: ${state.description}`
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.sketch_url) {
        // Download the image and convert to data URL
        const response = await fetch(data.sketch_url);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const dataUrl = reader.result as string;
          updateSketchData(dataUrl);
          
          toast.success("Sketch generated", {
            description: "Your sketch has been created successfully"
          });
        };
        
        reader.readAsDataURL(blob);
      } else {
        throw new Error("No sketch URL returned");
      }
    } catch (error) {
      console.error("Error generating sketch:", error);
      toast.error("Sketch generation failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setGeneratingSketch(false);
    }
  };

  return (
    <div className="space-y-6 pt-2">
      <div className="space-y-4">
        <h3 className="text-md font-medium mb-2">Visualization Tools</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            onClick={onGenerate3DVisualization} 
            disabled={isLoading.visualization || isDisabled}
            variant="outline"
            className="flex items-center"
          >
            {isLoading.visualization ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <ImageIcon className="mr-2 h-4 w-4" />
            )}
            <span>Generate AI Image</span>
          </Button>
          
          <Button 
            onClick={generateSketch} 
            disabled={generatingSketch || isDisabled}
            variant="outline"
            className="flex items-center"
          >
            {generatingSketch ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <PencilRuler className="mr-2 h-4 w-4" />
            )}
            <span>Generate Sketch</span>
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
            <span>Generate 3D Model</span>
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-center">
          <Button
            onClick={onRunAllAnalyses}
            disabled={isDisabled}
            className="w-full md:w-1/2 flex items-center justify-center"
          >
            {isLoading.runAll ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            <span>Run All Analyses</span>
          </Button>
        </div>
        <p className="text-xs text-center text-muted-foreground">
          Run all analysis tools at once to get a comprehensive evaluation
        </p>
      </div>
    </div>
  );
};
