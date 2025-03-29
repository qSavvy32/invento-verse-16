
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
    if (!ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY is not set');
    }

    const { image, prompt } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Missing file data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get file type from base64 string
    const fileType = getFileTypeFromBase64(image);
    console.log(`Analyzing ${fileType} with Anthropic Claude...`);

    // Set the appropriate media type based on the file extension
    const mediaType = getMediaType(fileType);
    
    // Use a dynamic prompt based on file type
    let analysisPrompt = prompt || getDefaultPrompt(fileType);

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: "claude-3-opus-20240229",
        max_tokens: 1000,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: analysisPrompt
              },
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: image
                }
              }
            ]
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Anthropic API error:", errorData);
      throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log("Analysis completed successfully");

    return new Response(
      JSON.stringify({ 
        analysis: data.content[0].text,
        model: data.model,
        fileType: fileType
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in analyze-vision function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze file', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// Helper function to determine file type from base64 string
function getFileTypeFromBase64(base64String: string): string {
  const signatureMap: { [key: string]: string } = {
    '/9j/': 'jpeg',
    'iVBOR': 'png',
    'R0lGOD': 'gif',
    'UklGR': 'webp',
    'Qk0': 'bmp',
    'JVBERi0': 'pdf',
    'UEsDBB': 'docx/xlsx',
    'TcxOTEw': 'doc',
    '0M8R4K': 'doc/xls',
  };

  // Check if we're dealing with a full data URL
  if (base64String.includes(';base64,')) {
    base64String = base64String.split(';base64,')[1];
  }

  // Check the first few characters to identify the file type
  for (const [signature, fileType] of Object.entries(signatureMap)) {
    if (base64String.startsWith(signature)) {
      return fileType;
    }
  }

  return 'unknown';
}

// Helper function to get the appropriate media type for Anthropic
function getMediaType(fileType: string): string {
  const mediaTypeMap: { [key: string]: string } = {
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'bmp': 'image/bmp',
    'pdf': 'application/pdf',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'doc': 'application/msword',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'xls': 'application/vnd.ms-excel',
    'csv': 'text/csv',
    'txt': 'text/plain',
  };

  return mediaTypeMap[fileType] || 'application/octet-stream';
}

// Helper function to get a default prompt based on file type
function getDefaultPrompt(fileType: string): string {
  switch (fileType) {
    case 'pdf':
      return "Analyze this PDF document. Identify key information, summarize the content, and extract any relevant details about the invention or design.";
    case 'doc':
    case 'docx':
      return "Analyze this Word document. Identify key information, summarize the content, and extract any relevant details about the invention or design.";
    case 'xls':
    case 'xlsx':
    case 'csv':
      return "Analyze this spreadsheet. Identify key data points, summarize the content, and extract any relevant information about the invention or design.";
    case 'txt':
      return "Analyze this text file. Summarize the content and extract any relevant information about the invention or design.";
    default:
      return "Analyze this invention or design sketch. Describe what you see, identifying key components, potential functionality, and any notable design elements.";
  }
}
