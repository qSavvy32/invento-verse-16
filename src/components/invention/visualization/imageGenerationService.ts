
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { OpenAIService } from "@/services/OpenAIService";
import { VisualizationRequest, VisualizationResult } from "./types";

export const generate3DImage = async (request: VisualizationRequest): Promise<VisualizationResult> => {
  const { title, description, userId, prompt: customPrompt } = request;
  
  if (!title && !description && !customPrompt) {
    throw new Error("Please provide a title and description first");
  }

  const prompt = customPrompt || `Create marketing imagery for ${title}. ${description}`;

  toast.info("Generating marketing imagery using AI...");

  try {
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
  } catch (error) {
    console.error("Error generating 3D image:", error);
    
    // If primary service fails, try using OpenAI DALL-E as fallback
    toast.info("Primary image service unavailable, trying fallback service...");
    
    try {
      const imageUrl = await OpenAIService.generateImage({ prompt });
      
      if (imageUrl) {
        toast.success("Image generated successfully using fallback service");
        return {
          dataUrl: imageUrl,
          storageUrl: null,
          type: 'marketing'
        };
      } else {
        throw new Error("Fallback image generation failed");
      }
    } catch (fallbackError) {
      console.error("Fallback image generation failed:", fallbackError);
      toast.error("All image generation services failed", {
        description: "Please try again later"
      });
      return {
        dataUrl: null,
        storageUrl: null,
        type: 'marketing',
        error: error instanceof Error ? error.message : "Image generation failed"
      };
    }
  }
};

export const generateRealistic3DImage = async (request: VisualizationRequest): Promise<VisualizationResult> => {
  const { title, description, userId } = request;
  
  if (!title && !description) {
    throw new Error("Please provide a title and description for your invention first");
  }

  const prompt = `Create a realistic mockup of ${title}. ${description}`;

  toast.info("Generating realistic mockup using AI...");

  try {
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

    // Check if this is a fallback image from DALL-E
    const isFallback = data.fallback === "openai";
    if (isFallback) {
      toast.success("Image generated using fallback service (DALL-E)");
    }

    return {
      dataUrl: data.image_url,
      storageUrl: data.storage_url || null,
      type: 'realistic'
    };
  } catch (error) {
    console.error("Error generating realistic 3D image:", error);
    
    // If primary service fails, try using OpenAI DALL-E as fallback
    toast.info("Primary image service unavailable, trying fallback service...");
    
    try {
      const imageUrl = await OpenAIService.generateImage({ prompt });
      
      if (imageUrl) {
        toast.success("Image generated successfully using fallback service");
        return {
          dataUrl: imageUrl,
          storageUrl: null,
          type: 'realistic'
        };
      } else {
        throw new Error("Fallback image generation failed");
      }
    } catch (fallbackError) {
      console.error("Fallback image generation failed:", fallbackError);
      toast.error("All image generation services failed", {
        description: "Please try again later"
      });
      return {
        dataUrl: null,
        storageUrl: null,
        type: 'realistic',
        error: error instanceof Error ? error.message : "Image generation failed"
      };
    }
  }
};

export const generateCustomMarketingImage = async (request: VisualizationRequest): Promise<VisualizationResult> => {
  if (!request.prompt) {
    throw new Error("Please enter a prompt for your marketing image");
  }

  toast.info("Generating custom marketing imagery using AI...");

  try {
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

    // Check if this is a fallback image from DALL-E
    const isFallback = data.fallback === "openai";
    if (isFallback) {
      toast.success("Image generated using fallback service (DALL-E)");
    }

    return {
      dataUrl: data.image_url,
      storageUrl: data.storage_url || null,
      type: 'custom-marketing'
    };
  } catch (error) {
    console.error("Error generating custom marketing image:", error);
    
    // If primary service fails, try using OpenAI DALL-E as fallback
    toast.info("Primary image service unavailable, trying fallback service...");
    
    try {
      const imageUrl = await OpenAIService.generateImage({ prompt: request.prompt });
      
      if (imageUrl) {
        toast.success("Image generated successfully using fallback service");
        return {
          dataUrl: imageUrl,
          storageUrl: null,
          type: 'custom-marketing'
        };
      } else {
        throw new Error("Fallback image generation failed");
      }
    } catch (fallbackError) {
      console.error("Fallback image generation failed:", fallbackError);
      toast.error("All image generation services failed", {
        description: "Please try again later"
      });
      return {
        dataUrl: null,
        storageUrl: null,
        type: 'custom-marketing',
        error: error instanceof Error ? error.message : "Image generation failed"
      };
    }
  }
};
