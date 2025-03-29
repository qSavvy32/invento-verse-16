
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const HF_ACCESS_TOKEN = Deno.env.get("HF_ACCESS_TOKEN");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VisualizationRequest {
  sketchDataUrl: string;
  prompt?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sketchDataUrl, prompt } = await req.json() as VisualizationRequest;
    
    if (!sketchDataUrl) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required data. Please provide a sketch image." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Extract the base64 image data (remove the prefix if it exists)
    const base64Data = sketchDataUrl.includes('base64,') 
      ? sketchDataUrl.split('base64,')[1] 
      : sketchDataUrl;

    // Prepare the request to HuggingFace
    console.log("Preparing request to HuggingFace Spaces API");
    
    // Using HF Spaces for 3D visualization (using TRELLIS model)
    // Note: You'll need to replace with the actual space/model that provides 3D visualization
    const hfResponse = await fetch(
      "https://replicate.deliveroo.net/api/models/cjwbw/trellis-3d-pipeline/predictions", 
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${HF_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          input: {
            image: base64Data,
            prompt: prompt || "Generate a 3D model based on this sketch",
            num_inference_steps: 50,
            seed: Math.floor(Math.random() * 1000000)
          }
        })
      }
    );

    if (!hfResponse.ok) {
      const errorData = await hfResponse.json();
      console.error("Error from HuggingFace API:", errorData);
      throw new Error(`HuggingFace API error: ${JSON.stringify(errorData)}`);
    }

    const visualizationResult = await hfResponse.json();
    console.log("Received response from HuggingFace API");
    
    return new Response(
      JSON.stringify(visualizationResult),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in generate-3d-visualization function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
