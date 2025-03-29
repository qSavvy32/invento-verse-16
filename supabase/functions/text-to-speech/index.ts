
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
    release: "text-to-speech@1.0.0",
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

// Background task to store audio in Supabase Storage
async function storeAudioInStorage(
  hash: string, 
  audio: ArrayBuffer
): Promise<void> {
  try {
    console.log(`Storing audio for hash: ${hash}`);
    
    // Create a blob from the audio buffer
    const audioBlob = new Blob([audio], {
      type: "audio/mpeg",
    });
    
    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from("audio")
      .upload(`${hash}.mp3`, audioBlob, {
        cacheControl: "3600",
        upsert: true,
      });
      
    if (error) {
      console.error("Error storing audio:", error);
    } else {
      console.log("Successfully stored audio:", data);
    }
  } catch (error) {
    console.error("Error in storeAudioInStorage:", error);
  }
}

interface TextToSpeechRequest {
  text: string;
  voiceId?: string;
  modelId?: string;
  language?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: TextToSpeechRequest = await req.json();
    const { text, voiceId = "JBFqnCBsd6RMkjVDRZzb", modelId = "eleven_multilingual_v2", language } = requestData;

    if (!text) {
      return new Response(
        JSON.stringify({ error: "Missing required data. Please provide text." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Generate hash for caching
    const requestHash = generateHash({ text, voiceId, modelId, language });
    console.log(`Generated hash: ${requestHash} for text: ${text.substring(0, 30)}...`);
    
    // Check if we already have a cached audio file
    const audioPath = `${requestHash}.mp3`;
    const audioExists = await checkFileExists("audio", audioPath);
    
    if (audioExists) {
      console.log("Found cached audio, retrieving it");
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from("audio")
        .getPublicUrl(audioPath);
        
      console.log("Using cached audio from:", urlData.publicUrl);
      
      // Fetch the audio file
      const response = await fetch(urlData.publicUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch cached audio: ${response.status}`);
      }
      
      // Get audio data as array buffer
      const audioArrayBuffer = await response.arrayBuffer();
      
      // Convert to base64 for transmission
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

      return new Response(
        JSON.stringify({ 
          audio: base64Audio,
          format: "mp3",
          cached: true
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // No cached audio, validate ElevenLabs API key
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim() === "") {
      console.error("ElevenLabs API key is not configured");
      throw new Error("ElevenLabs API key is not configured");
    }

    // Sanitize and log API key presence (only showing prefix/suffix for security)
    const keyPrefix = ELEVENLABS_API_KEY.substring(0, 4);
    const keySuffix = ELEVENLABS_API_KEY.substring(ELEVENLABS_API_KEY.length - 4);
    console.log(`Converting text to speech with ElevenLabs API, language: ${language || 'default'}`);
    console.log(`Using API key starting with: ${keyPrefix}*** ending with: ***${keySuffix}`);

    // Configure request parameters
    const requestParams: any = {
      model_id: modelId,
      text: text,
      output_format: "mp3_44100_128",
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.5,
        use_speaker_boost: true,
        speed: 1.0,
      }
    };

    // Add optional language parameter if provided
    if (language) {
      requestParams.pronunciation_dictionary_locators = [];  // Required when setting language_id
      requestParams.language_id = language;
    }

    // Call ElevenLabs API
    console.log("Sending request to ElevenLabs API...");
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Accept": "audio/mpeg",
      },
      body: JSON.stringify(requestParams),
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

    // Get audio data as array buffer
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Store the audio in background
    EdgeRuntime.waitUntil(
      storeAudioInStorage(requestHash, audioArrayBuffer)
    );
    
    // Convert to base64 for transmission
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

    return new Response(
      JSON.stringify({ 
        audio: base64Audio,
        format: "mp3",
        cached: false
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in text-to-speech function:", error);
    if (SENTRY_API_KEY) {
      Sentry.captureException(error);
    }
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
