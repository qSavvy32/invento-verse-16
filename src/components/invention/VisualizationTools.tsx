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
  Box,
  Zap,
  BarChart4,
  Camera
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export const VisualizationTools = () => {
  const { state, updateSketchData, update3DVisualization, setThreejsVisualization, setBusinessStrategySvg } = useInvention();
  const [isLoading, setIsLoading] = useState({
    sketch: false,
    image: false,
    threejs: false,
    realistic3d: false,
    businessStrategy: false,
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
      toast.error("Please generate a sketch first");
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

  const generateRealistic3DImage = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description for your invention first");
      return;
    }

    setIsLoading(prev => ({ ...prev, realistic3d: true }));
    toast.info("Generating realistic 3D image...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-realistic-3d-image", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      update3DVisualization(data.image || null);
      toast.success("Realistic 3D image generated successfully");
    } catch (error) {
      console.error("Error generating realistic 3D image:", error);
      toast.error("Failed to generate realistic 3D image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, realistic3d: false }));
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

  const generateBusinessStrategy = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description for your invention first");
      return;
    }

    setIsLoading(prev => ({ ...prev, businessStrategy: true }));
    toast.info("Generating business strategy visualization...");

    try {
      const { data, error } = await supabase.functions.invoke("generate-business-strategy", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      setBusinessStrategySvg(data.svgCode || null);
      toast.success("Business strategy visualization generated successfully");
    } catch (error) {
      console.error("Error generating business strategy:", error);
      toast.error("Failed to generate business strategy", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, businessStrategy: false }));
    }
  };

  return (
    <Card className="border-invention-accent/20">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Visualization Tools</h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            <Button
              variant="outline"
              onClick={generateSketch}
              disabled={isLoading.sketch || (!state.title && !state.description)}
              className="h-16 flex flex-col justify-center items-center p-2 space-y-1"
            >
              {isLoading.sketch ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1" />
              ) : (
                <Pencil className="h-5 w-5 mb-1" />
              )}
              <span className="text-sm">Generate Sketch</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={generateRealistic3DImage}
              disabled={isLoading.realistic3d || (!state.title && !state.description)}
              className="h-16 flex flex-col justify-center items-center p-2 space-y-1"
            >
              {isLoading.realistic3d ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1" />
              ) : (
                <Camera className="h-5 w-5 mb-1" />
              )}
              <span className="text-sm">Realistic 3D Image</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={generate3DImage}
              disabled={isLoading.image || !state.sketchDataUrl}
              className="h-16 flex flex-col justify-center items-center p-2 space-y-1"
            >
              {isLoading.image ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1" />
              ) : (
                <Image className="h-5 w-5 mb-1" />
              )}
              <span className="text-sm">Generate 3D Model</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={generateThreejsVisualization}
              disabled={isLoading.threejs || (!state.title && !state.description)}
              className="h-16 flex flex-col justify-center items-center p-2 space-y-1"
            >
              {isLoading.threejs ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1" />
              ) : (
                <Box className="h-5 w-5 mb-1" />
              )}
              <span className="text-sm">Interactive 3D</span>
            </Button>
            
            <Button
              variant="outline"
              onClick={generateBusinessStrategy}
              disabled={isLoading.businessStrategy || (!state.title && !state.description)}
              className="h-16 flex flex-col justify-center items-center p-2 space-y-1"
            >
              {isLoading.businessStrategy ? (
                <Loader2 className="h-5 w-5 animate-spin mb-1" />
              ) : (
                <BarChart4 className="h-5 w-5 mb-1" />
              )}
              <span className="text-sm">Business Strategy</span>
            </Button>
          </div>
          
          {state.threejsVisualization.html && (
            <div className="mt-4 border p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">3D Visualization Preview</h4>
              <div className="bg-gray-50 p-2 rounded-lg overflow-hidden" style={{ height: "300px" }}>
                <div dangerouslySetInnerHTML={{ __html: state.threejsVisualization.html }} />
              </div>
            </div>
          )}
          
          {state.businessStrategySvg && (
            <div className="mt-4 border p-4 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Business Strategy Visualization</h4>
              <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: state.businessStrategySvg }} className="flex justify-center" />
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
