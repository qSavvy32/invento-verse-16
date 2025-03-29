
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

    const { prompt, style, userId } = await req.json();

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

    // Call the Hugging Face Inference API with the FLUX model
    // Removing the parameters that are causing errors
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
            num_inference_steps: 4,
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

    // Get the image blob
    const imageBlob = await response.blob();
    
    // Prepare for storage in Supabase
    const timestamp = Date.now();
    const fileType = style === "realistic" ? "realistic" : style === "3d_model" ? "3d" : "image";
    const fileName = `${fileType}-${timestamp}.png`;
    const folderPath = "images";
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
      
      console.log("Successfully uploaded image to Supabase:", data?.path);
      
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
      
      console.log(`${style} image generated and stored successfully`);
      
      return new Response(
        JSON.stringify({ 
          image_url: dataUrl,
          storage_url: publicUrl,
          style: style,
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
          image_url: dataUrl,
          style: style,
          storage_error: storageError.message
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }
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
