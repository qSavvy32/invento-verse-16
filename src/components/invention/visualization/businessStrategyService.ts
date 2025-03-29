
import { supabase } from "@/integrations/supabase/client";
import { VisualizationRequest, VisualizationResult } from "./types";

export const generateBusinessStrategy = async (request: VisualizationRequest): Promise<VisualizationResult> => {
  const { title, description } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const { data, error } = await supabase.functions.invoke("generate-business-strategy", {
    body: {
      title,
      description,
      // Removing sketchDataUrl as it's causing an error
      // sketchDataUrl: state.sketchDataUrl 
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    dataUrl: null,
    storageUrl: null,
    svgCode: data.svgCode || null,
    type: 'business-strategy'
  };
};
