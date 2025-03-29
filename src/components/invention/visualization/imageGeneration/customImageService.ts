
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageGenerationRequest, ImageGenerationResult } from "./types";
import { generateWithFallbackService } from "./fallbackService";

export const generateCustomMarketingImage = async (request: ImageGenerationRequest): Promise<ImageGenerationResult> => {
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
      type: 'custom-marketing',
      isFallback
    };
  } catch (error) {
    return generateWithFallbackService(error, request.prompt, 'custom-marketing');
  }
};
