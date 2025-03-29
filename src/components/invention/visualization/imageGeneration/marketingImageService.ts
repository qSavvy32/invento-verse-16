
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ImageGenerationRequest, ImageGenerationResult } from "./types";
import { generateWithFallbackService } from "./fallbackService";

export const generate3DImage = async (request: ImageGenerationRequest): Promise<ImageGenerationResult> => {
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
    return generateWithFallbackService(error, prompt, 'marketing');
  }
};
