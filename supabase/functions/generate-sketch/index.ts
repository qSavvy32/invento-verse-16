
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
    const HUGGINGFACE_API_KEY = Deno.env.get('HUGGINGFACE_API_KEY');
    if (!HUGGINGFACE_API_KEY) {
      throw new Error('HUGGINGFACE_API_KEY is not set');
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log("Generating sketch with prompt:", prompt);

    // Add sketch styling to the prompt
    const enhancedPrompt = `Detailed hand-drawn sketch or blueprint style drawing of: ${prompt}. Make it look like it was drawn on graph paper or engineering paper with pencil or ink. Include measurements, annotations, and technical details where appropriate. The style should resemble a professional inventor's or engineer's notebook sketch.`;

    // Call the Hugging Face Inference API
    const response = await fetch(
      "https://xl2f8bl842kkcz1b.us-east-1.aws.endpoints.huggingface.cloud",
      {
        headers: { 
          "Accept": "image/png",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`
        },
        method: "POST",
        body: JSON.stringify({
          "inputs": enhancedPrompt,
          "parameters": {
            "num_inference_steps": 30,
            "guidance_scale": 7.5
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Hugging Face API error:", errorText);
      throw new Error(`Hugging Face API error: ${response.status} ${response.statusText}`);
    }

    // Get the image blob and convert to base64
    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();
    const base64Image = btoa(
      new Uint8Array(imageBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
    
    const imageUrl = `data:image/png;base64,${base64Image}`;
    console.log("Sketch generated successfully");

    return new Response(
      JSON.stringify({ 
        sketch_url: imageUrl,
        revised_prompt: enhancedPrompt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-sketch function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate sketch', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
