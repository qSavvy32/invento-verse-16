
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface VisualizationState {
  title: string;
  description: string;
  sketchDataUrl: string | null;
  updateVisualizations: (data: any) => void;
  update3DVisualization: (url: string) => void;
  setThreejsVisualization: (code: string, html: string) => void;
}

export const generate3DVisualization = async (
  state: VisualizationState,
  setIsLoading: (type: string, isLoading: boolean) => void
): Promise<void> => {
  // Don't proceed if there's not enough data
  if (!state.title && !state.description) {
    toast.error("Please provide a title and description first");
    return;
  }
  
  setIsLoading("visualization", true);
  
  try {
    const promptData = {
      concept: state.description,
      materials: "",
      users: "",
      problem: ""
    };
    
    state.updateVisualizations(promptData);
    
    const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
      body: {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    if (data?.visualization_url) {
      state.update3DVisualization(data.visualization_url);
      toast.success("3D visualization generated", {
        description: "View it in the 3D Visualization tab"
      });
    } else {
      throw new Error("No visualization URL returned");
    }
  } catch (error) {
    console.error("Error generating 3D visualization:", error);
    toast.error("Visualization failed", {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  } finally {
    setIsLoading("visualization", false);
  }
};

export const generateThreejsVisualization = async (
  state: VisualizationState,
  setIsLoading: (type: string, isLoading: boolean) => void
): Promise<void> => {
  // Don't proceed if there's not enough data
  if (!state.title && !state.description) {
    toast.error("Please provide a title and description first");
    return;
  }
  
  setIsLoading("threejs", true);
  
  try {
    toast.info("Generating 3D visualization with Claude...", {
      description: "This may take a minute to complete"
    });
    
    const { data, error } = await supabase.functions.invoke("generate-threejs-visualization", {
      body: {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
        outputFormat: "markdown" // Request markdown-formatted code if possible
      }
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    console.log("ThreeJS visualization result:", data);
    
    if (data?.visualization_code && data?.visualization_html) {
      state.setThreejsVisualization(data.visualization_code, data.visualization_html);
      toast.success("ThreeJS visualization generated", {
        description: "The 3D model is now available below"
      });
    } else {
      throw new Error("No visualization code returned");
    }
  } catch (error) {
    console.error("Error generating ThreeJS visualization:", error);
    toast.error("ThreeJS visualization failed", {
      description: error instanceof Error ? error.message : "An unexpected error occurred"
    });
  } finally {
    setIsLoading("threejs", false);
  }
};
