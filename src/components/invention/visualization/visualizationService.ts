
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

  // Return both the data URL and storage URL
  return {
    dataUrl: data.sketch_url,
    storageUrl: data.storage_url || null,
    type: 'sketch'
  };
};

export const generate3DImage = async (request: VisualizationRequest) => {
  const { title, description, userId, prompt: customPrompt } = request;
  
  if (!title && !description && !customPrompt) {
    throw new Error("Please provide a title and description first");
  }

  const prompt = customPrompt || `Create marketing imagery for ${title}. ${description}`;

  toast.info("Generating marketing imagery using Hugging Face...");

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

  return {
    dataUrl: data.image_url,
    storageUrl: data.storage_url || null,
    type: 'marketing'
  };
};

export const generateRealistic3DImage = async (request: VisualizationRequest) => {
  const { title, description, userId } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const prompt = `Create a realistic mockup of ${title}. ${description}`;

  toast.info("Generating realistic mockup using Hugging Face...");

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

  return {
    dataUrl: data.image_url,
    storageUrl: data.storage_url || null,
    type: 'realistic'
  };
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

  return {
    svgCode: data.svgCode || null,
    type: 'business-strategy'
  };
};

export const generateCustomMarketingImage = async (request: VisualizationRequest) => {
  if (!request.prompt) {
    throw new Error("Please provide a prompt for your marketing image");
  }

  toast.info("Generating custom marketing imagery using Hugging Face...");

  const { data, error } = await supabase.functions.invoke("generate-flux-image", {
    body: {
      prompt: request.prompt,
      style: "3d_model",
      userId: request.userId
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return {
    dataUrl: data.image_url,
    storageUrl: data.storage_url || null,
    type: 'custom-marketing'
  };
};
