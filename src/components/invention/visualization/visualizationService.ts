
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface VisualizationRequest {
  title?: string;
  description?: string;
  sketchDataUrl?: string | null;
  prompt?: string;
}

export const generateSketch = async (request: VisualizationRequest) => {
  const { title, description } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const prompt = `Invention: ${title}. ${description}`;
  
  toast.info("Generating sketch using Hugging Face...");
  
  const { data, error } = await supabase.functions.invoke("generate-sketch", {
    body: { prompt }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.sketch_url;
};

export const generate3DImage = async (request: VisualizationRequest) => {
  const { sketchDataUrl, description, title } = request;
  
  if (!sketchDataUrl) {
    throw new Error("Please generate a sketch first");
  }

  const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
    body: {
      sketchDataUrl,
      prompt: description || title
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.output?.[0] || null;
};

export const generateRealistic3DImage = async (request: VisualizationRequest) => {
  const { title, description, sketchDataUrl } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const { data, error } = await supabase.functions.invoke("generate-realistic-3d-image", {
    body: {
      title,
      description,
      sketchDataUrl
    }
  });

  if (error) {
    throw new Error(error.message);
  }

  return data.image || null;
};

export const generateThreejsVisualization = async (request: VisualizationRequest) => {
  const { title, description, sketchDataUrl } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const { data, error } = await supabase.functions.invoke("generate-threejs-visualization", {
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
    code: data.visualization_code || null,
    html: data.visualization_html || null
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

  return data.svgCode || null;
};
