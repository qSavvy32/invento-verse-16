
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageGenerationRequest, ImageGenerationResult } from "./types";
import { generateWithFallbackService } from "./fallbackService";

export const generateRealistic3DImage = async (request: ImageGenerationRequest): Promise<ImageGenerationResult> => {
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
      type: 'realistic',
      isFallback
    };
  } catch (error) {
    return generateWithFallbackService(error, prompt, 'realistic');
  }
};
