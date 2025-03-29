
import { useInvention } from "@/contexts/InventionContext";
import { Button } from "../ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import PixelCard from "../ui/PixelCard";
import {
  Image,
  Loader2,
  PackageOpen,
  Pencil,
  Cube,
  Zap
} from "lucide-react";

export const GenerateButtons = () => {
  const { state, updateSketchData, update3DVisualization, setThreejsVisualization } = useInvention();
  const [isLoading, setIsLoading] = useState({
    sketch: false,
    image: false,
    threejs: false,
    runAll: false
  });

  const generateSketch = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description for your invention first");
      return;
    }

    setIsLoading(prev => ({ ...prev, sketch: true }));
    toast.info("Generating sketch...");

    try {
      const prompt = `Invention: ${state.title}. ${state.description}`;
      
      const { data, error } = await supabase.functions.invoke("generate-sketch", {
        body: { prompt }
      });

      if (error) {
        throw new Error(error.message);
      }

      updateSketchData(data.sketch_url);
      toast.success("Sketch generated successfully");
    } catch (error) {
      console.error("Error generating sketch:", error);
      toast.error("Failed to generate sketch", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, sketch: false }));
    }
  };

  const generate3DImage = async () => {
    if (!state.sketchDataUrl) {
      toast.error("Please provide a sketch or upload an image first");
      return;
    }

    setIsLoading(prev => ({ ...prev, image: true }));
    toast.info("Generating 3D model...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
        body: {
          sketchDataUrl: state.sketchDataUrl,
          prompt: state.description || state.title
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      update3DVisualization(data.output?.[0] || null);
      toast.success("3D model generated successfully");
    } catch (error) {
      console.error("Error generating 3D model:", error);
      toast.error("Failed to generate 3D model", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, image: false }));
    }
  };

  const generateThreejsVisualization = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description for your invention first");
      return;
    }

    setIsLoading(prev => ({ ...prev, threejs: true }));
    toast.info("Generating interactive 3D visualization...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-threejs-visualization", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setThreejsVisualization(
        data.visualization_code || null,
        data.visualization_html || null
      );
      
      toast.success("3D visualization generated successfully");
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast.error("Failed to generate 3D visualization", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, threejs: false }));
    }
  };

  const runAllAnalyses = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, runAll: true }));
    
    try {
      // Generate sketch
      await generateSketch();
      
      // Wait a bit and then generate 3D
      setTimeout(async () => {
        if (state.sketchDataUrl) {
          await generate3DImage();
        }
        
        // Finally generate ThreeJS visualization
        setTimeout(async () => {
          await generateThreejsVisualization();
          setIsLoading(prev => ({ ...prev, runAll: false }));
          toast.success("All visualizations generated");
        }, 1000);
      }, 1000);
    } catch (error) {
      console.error("Error running all analyses:", error);
      setIsLoading(prev => ({ ...prev, runAll: false }));
      toast.error("Failed to complete all processes");
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Button
          variant="outline"
          onClick={generateSketch}
          disabled={isLoading.sketch || (!state.title && !state.description)}
          className="h-12 flex justify-center items-center"
        >
          {isLoading.sketch ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Pencil className="mr-2 h-4 w-4" />
          )}
          Generate Sketch
        </Button>
        
        <Button
          variant="outline"
          onClick={generate3DImage}
          disabled={isLoading.image || !state.sketchDataUrl}
          className="h-12 flex justify-center items-center"
        >
          {isLoading.image ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Image className="mr-2 h-4 w-4" />
          )}
          Generate Image
        </Button>
        
        <Button
          variant="outline"
          onClick={generateThreejsVisualization}
          disabled={isLoading.threejs || (!state.title && !state.description)}
          className="h-12 flex justify-center items-center"
        >
          {isLoading.threejs ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Cube className="mr-2 h-4 w-4" />
          )}
          Generate 3D Model
        </Button>
      </div>
      
      <PixelCard 
        variant="rainbow" 
        onClick={runAllAnalyses}
        className="w-full mt-4 h-16"
        active={isLoading.runAll}
      >
        <div className="text-center">
          {isLoading.runAll ? (
            <div className="animate-pulse">
              <Loader2 className="mx-auto h-6 w-6 mb-2 animate-spin" />
              <p className="font-medium">Running all processes...</p>
            </div>
          ) : (
            <>
              <Zap className="mx-auto h-6 w-6 mb-2" />
              <p className="font-medium">Run All Analysis</p>
            </>
          )}
        </div>
      </PixelCard>
    </div>
  );
};
