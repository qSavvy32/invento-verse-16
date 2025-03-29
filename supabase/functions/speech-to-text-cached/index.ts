
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";
import * as Sentry from "https://cdn.jsdelivr.net/npm/@sentry/browser@7.94.1/+esm";
import { createHash } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
const SENTRY_API_KEY = Deno.env.get("SENTRY_API_KEY");

// Initialize Sentry
if (SENTRY_API_KEY) {
  Sentry.init({
    dsn: SENTRY_API_KEY,
    environment: "production",
    release: "speech-to-text-cached@1.0.0",
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Create a Supabase client for storage operations
const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY || ""
);

// Helper function to generate hash for caching
function generateHash(data: any): string {
  const hash = createHash("md5");
  hash.update(JSON.stringify(data));
  return hash.toString();
}

// Helper function to check if a file exists in storage
async function checkFileExists(bucket: string, path: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error checking if file exists:", error);
    return false;
  }
}

// Background task to store transcription in Supabase Storage
async function storeTranscriptionInStorage(
  hash: string, 
  transcriptionText: string
): Promise<void> {
  try {
    console.log(`Storing transcription for hash: ${hash}`);
    
    // Create a blob from the transcription text
    const transcriptionBlob = new Blob([transcriptionText], {
      type: "application/json",
    });
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("transcriptions")
      .upload(`${hash}.json`, transcriptionBlob, {
        cacheControl: "3600",
        upsert: true,
      });
      
    if (error) {
      console.error("Error storing transcription:", error);
    } else {
      console.log("Successfully stored transcription:", data);
    }
  } catch (error) {
    console.error("Error in storeTranscriptionInStorage:", error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audioData, languageCode = "eng" } = await req.json();
    
    if (!audioData) {
      return new Response(
        JSON.stringify({ error: "No audio data provided" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Generate hash for caching
    const requestHash = generateHash({ audioData: audioData.slice(0, 100), languageCode });
    console.log(`Generated hash: ${requestHash} for language: ${languageCode}`);
    
    // Check if we already have a cached transcription
    const transcriptionPath = `${requestHash}.json`;
    const transcriptionExists = await checkFileExists("transcriptions", transcriptionPath);
    
    if (transcriptionExists) {
      console.log("Found cached transcription, retrieving it");
      
      // Get cached transcription
      const { data, error } = await supabase.storage
        .from("transcriptions")
        .download(transcriptionPath);
        
      if (error) {
        throw new Error(`Error retrieving cached transcription: ${error.message}`);
      }
      
      // Parse the cached transcription
      const text = await data.text();
      const parsedData = JSON.parse(text);
      
      console.log("Successfully retrieved cached transcription");
      
      return new Response(
        JSON.stringify({ text: parsedData.text }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // No cached transcription, validate ElevenLabs API key
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim() === "") {
      console.error("ElevenLabs API key is not configured");
      throw new Error("ElevenLabs API key is not configured");
    }

    // Prepare the request to ElevenLabs
    const formData = new FormData();
    
    // Convert base64 to blob
    const binaryData = atob(audioData.split(',')[1] || audioData);
    const bytes = new Uint8Array(binaryData.length);
    for (let i = 0; i < binaryData.length; i++) {
      bytes[i] = binaryData.charCodeAt(i);
    }
    
    const audioBlob = new Blob([bytes], { type: "audio/webm" });
    formData.append("file", audioBlob);
    formData.append("model_id", "scribe_v1");
    formData.append("tag_audio_events", "true");
    
    // Only add language_code if it's provided
    if (languageCode) {
      formData.append("language_code", languageCode);
    }
    
    formData.append("diarize", "true");

    // Call ElevenLabs API
    console.log("Sending request to ElevenLabs API...");
    
    const response = await fetch("https://api.elevenlabs.io/v1/speech-to-text", {
      method: "POST",
      headers: {
        "xi-api-key": ELEVENLABS_API_KEY,
      },
      body: formData,
    });

    if (!response.ok) {
      console.error(`ElevenLabs API error: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      
      // Add more specific error messages based on status code
      if (response.status === 401) {
        throw new Error("ElevenLabs API authentication failed. Please check your API key.");
      } else if (response.status === 429) {
        throw new Error("ElevenLabs API rate limit exceeded. Please try again later.");
      } else {
        throw new Error(`ElevenLabs API error: ${response.status}`);
      }
    }

    const result = await response.json();
    console.log("Transcription successful");

    // Store the transcription in background
    if (result.text) {
      EdgeRuntime.waitUntil(
        storeTranscriptionInStorage(requestHash, JSON.stringify({ text: result.text }))
      );
    }

    return new Response(
      JSON.stringify({ text: result.text }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in speech-to-text function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
