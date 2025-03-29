
import { supabase } from "@/integrations/supabase/client";

// Type definitions
export type GeminiOperation = 'generateText' | 'generateImage' | 'analyzeFile' | 'createDataObject';

export interface GeminiRequest {
  operation: GeminiOperation;
  prompt: string;
  fileBase64?: string;
  fileType?: string;
  additionalParams?: Record<string, any>;
}

export interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

/**
 * Service for interacting with the Gemini AI API through Supabase edge functions
 */
export const GeminiService = {
  /**
   * Generate text using Gemini model
   */
  generateText: async (prompt: string, additionalParams?: Record<string, any>): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-ai", {
        body: {
          operation: 'generateText',
          prompt,
          additionalParams
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error generating text with Gemini:", error);
      throw error;
    }
  },

  /**
   * Generate image using Gemini model
   */
  generateImage: async (prompt: string, additionalParams?: Record<string, any>): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-ai", {
        body: {
          operation: 'generateImage',
          prompt,
          additionalParams
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error generating image with Gemini:", error);
      throw error;
    }
  },

  /**
   * Analyze a file (image or document) using Gemini model
   */
  analyzeFile: async (prompt: string, fileBase64: string, fileType: string): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-ai", {
        body: {
          operation: 'analyzeFile',
          prompt,
          fileBase64,
          fileType
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error analyzing file with Gemini:", error);
      throw error;
    }
  },

  /**
   * Create a structured data object based on a text prompt
   */
  createDataObject: async (prompt: string, additionalParams?: Record<string, any>): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-ai", {
        body: {
          operation: 'createDataObject',
          prompt,
          additionalParams
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error creating data object with Gemini:", error);
      throw error;
    }
  },
  
  /**
   * Generate a chat completion with conversation history
   */
  chatCompletion: async (
    messages: Array<{role: string, content: string}>, 
    systemPrompt?: string,
    additionalParams?: Record<string, any>
  ): Promise<any> => {
    try {
      const { data, error } = await supabase.functions.invoke("gemini-ai", {
        body: {
          operation: 'chatCompletion',
          messages,
          systemPrompt,
          additionalParams
        }
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error("Error with chat completion:", error);
      throw error;
    }
  }
};
