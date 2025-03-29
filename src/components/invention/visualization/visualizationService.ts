
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VisualizationRequest {
  title?: string;
  description?: string;
  sketchDataUrl?: string | null;
  prompt?: string;
  userId?: string;
}

export const generateSketch = async (request: VisualizationRequest) => {
  const { title, description, userId } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const prompt = `Create a pencil sketch of ${title}. ${description}`;
  
  toast.info("Generating sketch using Hugging Face...");
  
  const { data, error } = await supabase.functions.invoke("generate-sketch", {
    body: { prompt, userId }
  });

  if (error) {
    throw new Error(error.message);
  }

  // Return the data URL of the sketch for immediate display
  return data.sketch_url;
};

export const generate3DImage = async (request: VisualizationRequest) => {
  const { title, description, userId } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description first");
  }

  const prompt = `Create a 3D mockup of ${title}. ${description}`;

  const { data, error } = await supabase.functions.invoke("generate-flux-image", {
    body: {
      prompt,
      style: "3d_model",
      userId
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.image_url || null;
};

export const generateRealistic3DImage = async (request: VisualizationRequest) => {
  const { title, description, userId } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const prompt = `Create a realistic mockup of ${title}. ${description}`;

  const { data, error } = await supabase.functions.invoke("generate-flux-image", {
    body: {
      prompt,
      style: "realistic",
      userId
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.image_url || null;
};

export const generateBusinessStrategy = async (request: VisualizationRequest) => {
  const { title, description, sketchDataUrl } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const { data, error } = await supabase.functions.invoke("generate-business-strategy", {
    body: {
      title,
      description,
      sketchDataUrl
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.svgCode || null;
};
