
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

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

    // Get Supabase URL and service role key from environment
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase credentials are not set');
    }

    // Create Supabase client with service role key for storage operations
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { prompt, userId } = await req.json();

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
      "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5",
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

    // Get the image blob
    const imageBlob = await response.blob();
    
    // Prepare for storage in Supabase
    const timestamp = Date.now();
    const fileName = `sketch-${timestamp}.png`;
    const folderPath = "sketches";
    const filePath = `${folderPath}/${fileName}`;
    
    // Convert blob to buffer for storage
    const arrayBuffer = await imageBlob.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    // Store the image in the invention-assets bucket
    try {
      // Check if the bucket exists, if not create it
      const { data: buckets } = await supabase.storage.listBuckets();
      if (!buckets?.find(bucket => bucket.name === 'invention-assets')) {
        await supabase.storage.createBucket('invention-assets', {
          public: true
        });
        console.log("Created invention-assets bucket");
      }
      
      // Upload the file to Supabase Storage
      const { data, error } = await supabase.storage
        .from('invention-assets')
        .upload(filePath, buffer, {
          contentType: 'image/png',
          upsert: true
        });
      
      if (error) {
        console.error("Error uploading to Supabase:", error);
        throw error;
      }
      
      console.log("Successfully uploaded sketch to Supabase:", data?.path);
      
      // Get public URL for the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('invention-assets')
        .getPublicUrl(filePath);
      
      const publicUrl = publicUrlData.publicUrl;
      
      // Also convert to base64 for immediate use
      const base64Image = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const dataUrl = `data:image/png;base64,${base64Image}`;
      
      console.log("Sketch generated and stored successfully");
      
      return new Response(
        JSON.stringify({ 
          sketch_url: dataUrl,
          storage_url: publicUrl,
          revised_prompt: enhancedPrompt,
          path: filePath
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    } catch (storageError) {
      console.error("Storage error:", storageError);
      
      // Fall back to base64 if storage fails
      const base64Image = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
      );
      
      const dataUrl = `data:image/png;base64,${base64Image}`;
      
      return new Response(
        JSON.stringify({ 
          sketch_url: dataUrl,
          revised_prompt: enhancedPrompt,
          storage_error: storageError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
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
