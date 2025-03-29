
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Type definitions
interface GeminiRequest {
  operation: 'generateText' | 'generateImage' | 'analyzeFile' | 'createDataObject';
  prompt: string;
  fileBase64?: string;
  fileType?: string;
  additionalParams?: Record<string, any>;
}

interface GeminiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in the environment variables');
    }

    // Parse the request body
    const requestData: GeminiRequest = await req.json();
    const { operation, prompt, fileBase64, fileType, additionalParams } = requestData;
    
    console.log(`Processing ${operation} operation with Gemini`);

    // Validate required fields
    if (!operation) {
      throw new Error('Operation type is required');
    }
    
    if (!prompt) {
      throw new Error('Prompt is required');
    }

    let responseData: any;

    // Handle different operations
    switch (operation) {
      case 'generateText':
        responseData = await generateText(GEMINI_API_KEY, prompt, additionalParams);
        break;
      
      case 'generateImage':
        // Note: Gemini 2.0 Flash doesn't support image generation directly
        // This is a placeholder for when it becomes available
        throw new Error('Image generation is not yet supported with Gemini 2.0 Flash');
      
      case 'analyzeFile':
        if (!fileBase64 || !fileType) {
          throw new Error('File data and type are required for file analysis');
        }
        responseData = await analyzeFile(GEMINI_API_KEY, prompt, fileBase64, fileType);
        break;
      
      case 'createDataObject':
        responseData = await createDataObject(GEMINI_API_KEY, prompt, additionalParams);
        break;
      
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }

    // Return the response
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: responseData 
      } as GeminiResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error in gemini-ai function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      } as GeminiResponse),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Generate text using Gemini model
 */
async function generateText(apiKey: string, prompt: string, params?: Record<string, any>): Promise<any> {
  const modelVersion = params?.modelVersion || 'gemini-2.0-flash';
  
  // Configure API parameters
  const temperature = params?.temperature || 0.7;
  const maxOutputTokens = params?.maxOutputTokens || 1024;
  const topK = params?.topK || 40;
  const topP = params?.topP || 0.95;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature,
        maxOutputTokens,
        topK,
        topP
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("Text generation completed successfully");
  
  return {
    text: data.candidates[0].content.parts[0].text,
    model: modelVersion,
    finishReason: data.candidates[0].finishReason
  };
}

/**
 * Analyze a file (image or document) using Gemini model
 */
async function analyzeFile(apiKey: string, prompt: string, fileBase64: string, fileType: string): Promise<any> {
  const modelVersion = 'gemini-2.0-flash';
  
  // Convert base64 to proper format if needed
  const base64Data = fileBase64.includes(';base64,') 
    ? fileBase64.split(';base64,')[1] 
    : fileBase64;

  // Construct the API request with multimodal content
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: prompt
            },
            {
              inline_data: {
                mime_type: fileType,
                data: base64Data
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
        topK: 32,
        topP: 0.95
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("File analysis completed successfully");
  
  return {
    analysis: data.candidates[0].content.parts[0].text,
    model: modelVersion,
    finishReason: data.candidates[0].finishReason
  };
}

/**
 * Create a structured data object based on a text prompt
 */
async function createDataObject(apiKey: string, prompt: string, params?: Record<string, any>): Promise<any> {
  const modelVersion = 'gemini-2.0-flash';
  
  // Enhance the prompt to specify JSON output
  const enhancedPrompt = `
    Please generate a valid JSON object based on the following requirements. 
    Make sure the output is properly formatted and can be parsed as JSON.
    The response should only include the JSON object, nothing else.
    
    Requirements:
    ${prompt}
  `;

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              text: enhancedPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.2, // Lower temperature for more consistent structured output
        maxOutputTokens: 1024,
        topK: 40,
        topP: 0.95
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("Data object creation completed successfully");
  
  let jsonResult;
  const responseText = data.candidates[0].content.parts[0].text;
  
  try {
    // Extract JSON if it's wrapped in triple backticks
    if (responseText.includes("```json")) {
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/);
      if (jsonMatch && jsonMatch[1]) {
        jsonResult = JSON.parse(jsonMatch[1]);
      } else {
        throw new Error("Could not extract JSON from the response");
      }
    } else {
      // Try to parse the whole response as JSON
      jsonResult = JSON.parse(responseText);
    }
    
    return {
      data: jsonResult,
      model: modelVersion,
      finishReason: data.candidates[0].finishReason
    };
  } catch (error) {
    console.error("Failed to parse JSON from response:", error);
    
    // Return the raw text if JSON parsing fails
    return {
      rawText: responseText,
      parsingError: "Could not parse response as JSON",
      model: modelVersion,
      finishReason: data.candidates[0].finishReason
    };
  }
}
