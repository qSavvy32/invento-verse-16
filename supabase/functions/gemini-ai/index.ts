
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// CORS headers for browser access
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Type definitions
interface GeminiRequest {
  operation: 'generateText' | 'generateImage' | 'analyzeFile' | 'createDataObject' | 'chatCompletion';
  prompt?: string;
  messages?: Array<{role: string, content: string}>;
  systemPrompt?: string;
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
    const { 
      operation, 
      prompt, 
      messages, 
      systemPrompt,
      fileBase64, 
      fileType, 
      additionalParams 
    } = requestData;
    
    console.log(`Processing ${operation} operation with Gemini`);

    // Validate required fields
    if (!operation) {
      throw new Error('Operation type is required');
    }

    let responseData: any;

    // Handle different operations
    switch (operation) {
      case 'generateText':
        if (!prompt) {
          throw new Error('Prompt is required for text generation');
        }
        responseData = await generateText(GEMINI_API_KEY, prompt, additionalParams);
        break;
      
      case 'generateImage':
        if (!prompt) {
          throw new Error('Prompt is required for image generation');
        }
        responseData = await generateImage(GEMINI_API_KEY, prompt, additionalParams);
        break;
      
      case 'analyzeFile':
        if (!prompt || !fileBase64 || !fileType) {
          throw new Error('Prompt, file data and type are required for file analysis');
        }
        responseData = await analyzeFile(GEMINI_API_KEY, prompt, fileBase64, fileType);
        break;
      
      case 'createDataObject':
        if (!prompt) {
          throw new Error('Prompt is required for data object creation');
        }
        responseData = await createDataObject(GEMINI_API_KEY, prompt, additionalParams);
        break;
        
      case 'chatCompletion':
        if (!messages || !Array.isArray(messages) || messages.length === 0) {
          throw new Error('Messages array is required for chat completion');
        }
        responseData = await chatCompletion(GEMINI_API_KEY, messages, systemPrompt, additionalParams);
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

  // System instruction (if provided)
  const systemInstruction = params?.systemPrompt || null;

  const requestBody: any = {
    contents: [
      {
        parts: [
          {
            text: prompt
          }
        ]
      }
    ],
    generation_config: {
      temperature,
      max_output_tokens: maxOutputTokens,
      top_k: topK,
      top_p: topP
    }
  };

  // Add system instruction if provided
  if (systemInstruction) {
    requestBody.system_instruction = {
      parts: [{ text: systemInstruction }]
    };
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("Text generation completed successfully");
  
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    model: modelVersion,
    finishReason: data.candidates?.[0]?.finishReason
  };
}

/**
 * Generate image using Gemini model
 */
async function generateImage(apiKey: string, prompt: string, params?: Record<string, any>): Promise<any> {
  // Currently using experimental image generation model
  const modelVersion = 'gemini-2.0-flash-exp-image-generation';
  
  // Configure API parameters
  const temperature = params?.temperature || 1.0;
  const maxOutputTokens = params?.maxOutputTokens || 8192;
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
      generation_config: {
        temperature,
        max_output_tokens: maxOutputTokens,
        top_k: topK,
        top_p: topP,
        response_modalities: ["image", "text"],
        response_mime_type: "text/plain",
      }
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("Image generation completed successfully");
  
  // Extract generated images from the response
  const generatedImages = [];
  const candidates = data.candidates || [];
  
  for (let candidateIndex = 0; candidateIndex < candidates.length; candidateIndex++) {
    const candidate = candidates[candidateIndex];
    for (let partIndex = 0; partIndex < candidate.content.parts.length; partIndex++) {
      const part = candidate.content.parts[partIndex];
      if (part.inlineData) {
        generatedImages.push({
          data: part.inlineData.data, // Base64 encoded image data
          mimeType: part.inlineData.mimeType,
          index: `${candidateIndex}_${partIndex}`
        });
      }
    }
  }
  
  // Get any text response as well
  const textResponse = candidates[0]?.content?.parts?.find(part => part.text)?.text || '';
  
  return {
    images: generatedImages,
    text: textResponse,
    model: modelVersion,
    finishReason: candidates[0]?.finishReason
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
      generation_config: {
        temperature: 0.4,
        max_output_tokens: 1024,
        top_k: 32,
        top_p: 0.95
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
    analysis: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    model: modelVersion,
    finishReason: data.candidates?.[0]?.finishReason
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
      generation_config: {
        temperature: 0.2, // Lower temperature for more consistent structured output
        max_output_tokens: 1024,
        top_k: 40,
        top_p: 0.95
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
  const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
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
      finishReason: data.candidates?.[0]?.finishReason
    };
  } catch (error) {
    console.error("Failed to parse JSON from response:", error);
    
    // Return the raw text if JSON parsing fails
    return {
      rawText: responseText,
      parsingError: "Could not parse response as JSON",
      model: modelVersion,
      finishReason: data.candidates?.[0]?.finishReason
    };
  }
}

/**
 * Generate a chat completion with conversation history and system prompt
 */
async function chatCompletion(
  apiKey: string, 
  messages: Array<{role: string, content: string}>,
  systemPrompt?: string,
  params?: Record<string, any>
): Promise<any> {
  const modelVersion = params?.modelVersion || 'gemini-2.0-flash';
  
  // Configure API parameters
  const temperature = params?.temperature || 0.7;
  const maxOutputTokens = params?.maxOutputTokens || 1024;
  const topK = params?.topK || 40;
  const topP = params?.topP || 0.95;

  // Convert messages to Gemini format
  const contents = messages.map(message => ({
    role: message.role === 'user' ? 'user' : 'model',
    parts: [{ text: message.content }]
  }));

  const requestBody: any = {
    contents,
    generation_config: {
      temperature,
      max_output_tokens: maxOutputTokens,
      top_k: topK,
      top_p: topP
    }
  };

  // Add system instruction if provided
  if (systemPrompt) {
    requestBody.system_instruction = {
      parts: [{ text: systemPrompt }]
    };
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelVersion}:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Gemini API error:", errorData);
    throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  console.log("Chat completion generated successfully");
  
  return {
    text: data.candidates?.[0]?.content?.parts?.[0]?.text || "",
    model: modelVersion,
    finishReason: data.candidates?.[0]?.finishReason
  };
}
