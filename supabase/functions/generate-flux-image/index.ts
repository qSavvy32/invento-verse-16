
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

    const { prompt, style } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: 'Missing prompt' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Generating ${style} image with prompt:`, prompt);

    // Customize prompt based on style
    let enhancedPrompt = prompt;
    if (style === "3d_model") {
      enhancedPrompt = `${prompt}. 3D model, professional, detailed, high quality, product visualization.`;
    } else if (style === "realistic") {
      enhancedPrompt = `${prompt}. Photorealistic, studio lighting, detailed, product photography, high quality.`;
    }

    // Call the Hugging Face Inference API with Flux model
    const response = await fetch(
      "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell",
      {
        headers: { 
          "Authorization": `Bearer ${HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: enhancedPrompt,
          parameters: {
            go_fast: true,
            num_outputs: 1,
            aspect_ratio: "1:1",
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
    console.log(`${style} image generated successfully`);

    return new Response(
      JSON.stringify({ 
        image_url: imageUrl,
        style: style
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in generate-flux-image function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate image', 
        details: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
