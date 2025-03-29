
import { OpenAIService } from "@/services/OpenAIService";
import { toast } from "sonner";
import { ImageGenerationRequest, ImageGenerationResult, ImageGenerationType } from "./types";

export const generateWithFallbackService = async (
  error: any, 
  prompt: string,
  type: ImageGenerationType
): Promise<ImageGenerationResult> => {
  console.error(`Error generating ${type} image:`, error);
  
  // Try using OpenAI DALL-E as fallback
  toast.info("Primary image service unavailable, trying fallback service...");
  
  try {
    const imageUrl = await OpenAIService.generateImage({ prompt });
    
    if (imageUrl) {
      toast.success("Image generated successfully using fallback service");
      return {
        dataUrl: imageUrl,
        storageUrl: null,
        isFallback: true,
        type
      };
    } else {
      throw new Error("Fallback image generation failed");
    }
  } catch (fallbackError) {
    console.error(`Fallback ${type} image generation failed:`, fallbackError);
    toast.error("All image generation services failed", {
      description: "Please try again later"
    });
    return {
      dataUrl: null,
      storageUrl: null,
      type,
      error: error instanceof Error ? error.message : "Image generation failed"
    };
  }
};
