
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY || ""
);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requiredBuckets = [
      { name: "audio", public: true },
      { name: "transcriptions", public: true },
      { name: "cache", public: true },
      { name: "invention-assets", public: true }
    ];
    
    const results = [];
    
    // Create each bucket if it doesn't exist
    for (const bucket of requiredBuckets) {
      try {
        // Check if bucket exists
        const { data: existingBucket, error: getBucketError } = await supabase.storage.getBucket(bucket.name);
        
        if (getBucketError || !existingBucket) {
          // Create the bucket
          const { data, error } = await supabase.storage.createBucket(bucket.name, {
            public: bucket.public,
          });
          
          if (error) {
            console.error(`Error creating bucket ${bucket.name}:`, error);
            results.push({ bucket: bucket.name, status: "error", error: error.message });
          } else {
            console.log(`Created bucket ${bucket.name}`);
            results.push({ bucket: bucket.name, status: "created" });
          }
        } else {
          console.log(`Bucket ${bucket.name} already exists`);
          
          // Update bucket if needed
          if (existingBucket.public !== bucket.public) {
            const { data, error } = await supabase.storage.updateBucket(bucket.name, {
              public: bucket.public,
            });
            
            if (error) {
              console.error(`Error updating bucket ${bucket.name}:`, error);
              results.push({ bucket: bucket.name, status: "error-update", error: error.message });
            } else {
              console.log(`Updated bucket ${bucket.name}`);
              results.push({ bucket: bucket.name, status: "updated" });
            }
          } else {
            results.push({ bucket: bucket.name, status: "exists" });
          }
        }
      } catch (bucketError) {
        console.error(`Error processing bucket ${bucket.name}:`, bucketError);
        results.push({ bucket: bucket.name, status: "error", error: bucketError.message });
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Storage setup complete", 
        results 
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in setup-storage function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
