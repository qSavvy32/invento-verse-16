
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { VisualizationRequest, VisualizationResult } from "./types";

export const generateSketch = async (request: VisualizationRequest): Promise<VisualizationResult> => {
  const { title, description, userId } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const prompt = `Create a pencil sketch of ${title}. ${description}`;
  
  toast.info("Attempting to generate sketch...");
  
  try {
    const { data, error } = await supabase.functions.invoke("generate-sketch", {
      body: { prompt, userId }
    });

    if (error) {
      throw new Error(error.message);
    }

    // Return both the data URL and storage URL
    return {
      dataUrl: data.sketch_url,
      storageUrl: data.storage_url || null,
      type: 'sketch'
    };
  } catch (error) {
    console.error("Error generating sketch:", error);
    
    // Check if it's a service unavailable error
    if (error instanceof Error && 
        (error.message.includes("Service Unavailable") || 
         error.message.includes("503"))) {
      toast.error(
        "Sketch service is temporarily unavailable", 
        { description: "Please try again later or use the drawing canvas to create your sketch manually" }
      );
    } else {
      toast.error(
        "Failed to generate sketch", 
        { description: "You can use the drawing canvas to create your sketch manually" }
      );
    }
    
    // Return null to indicate failure, application should redirect to manual sketch canvas
    return {
      dataUrl: null,
      storageUrl: null,
      type: 'sketch',
      error: error instanceof Error ? error.message : "Sketch generation failed"
    };
  }
};
