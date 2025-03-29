
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the service role key
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Check if the bucket exists
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      throw bucketsError;
    }

    const inventionAssetsBucket = buckets.find(bucket => bucket.name === 'invention-assets');

    // Create the bucket if it doesn't exist
    if (!inventionAssetsBucket) {
      const { error: createError } = await supabase
        .storage
        .createBucket('invention-assets', { 
          public: true,
          fileSizeLimit: 52428800, // 50MB in bytes
        });

      if (createError) {
        throw createError;
      }

      // Create folders within the bucket
      const folders = ['sketches', 'images', 'documents'];
      for (const folder of folders) {
        // Create an empty file to represent the folder
        const { error: folderError } = await supabase
          .storage
          .from('invention-assets')
          .upload(`${folder}/.folder`, new Blob(['']));

        if (folderError && !folderError.message.includes('The resource already exists')) {
          throw folderError;
        }
      }

      console.log("Created 'invention-assets' bucket with folders");
    } else {
      console.log("Bucket 'invention-assets' already exists");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage setup complete", 
        bucket: "invention-assets" 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error setting up storage:", error);
    
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
