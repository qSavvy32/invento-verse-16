
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface OpenAITextGenerationOptions {
  prompt: string;
  model?: string;
}

export interface OpenAIImageGenerationOptions {
  prompt: string;
}

export const OpenAIService = {
  /**
   * Generate text using OpenAI models
   * @param options The generation options
   */
  generateText: async (options: OpenAITextGenerationOptions): Promise<string | null> => {
    try {
      const { prompt, model = "gpt-4o-mini" } = options;
      
      toast.info("Generating text with OpenAI...");
      
      const { data, error } = await supabase.functions.invoke("openai-generation", {
        body: {
          operationType: "text-generation",
          prompt,
          model
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate text");
      }

      return data.result;
    } catch (error) {
      console.error("Error generating text with OpenAI:", error);
      toast.error("Failed to generate text", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      return null;
    }
  },

  /**
   * Generate an image using DALL-E
   * @param options The image generation options
   */
  generateImage: async (options: OpenAIImageGenerationOptions): Promise<string | null> => {
    try {
      const { prompt } = options;
      
      toast.info("Generating image with DALL-E...");
      
      const { data, error } = await supabase.functions.invoke("openai-generation", {
        body: {
          operationType: "image-generation",
          prompt
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to generate image");
      }

      return data.imageUrl;
    } catch (error) {
      console.error("Error generating image with OpenAI:", error);
      toast.error("Failed to generate image", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      return null;
    }
  }
};
