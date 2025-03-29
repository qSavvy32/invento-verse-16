
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as Sentry from "https://cdn.jsdelivr.net/npm/@sentry/browser@7.94.1/+esm";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
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

    // Check if ElevenLabs API key is set and appears to be valid
    if (!ELEVENLABS_API_KEY) {
      console.error("ElevenLabs API key is not configured");
      throw new Error("ElevenLabs API key is not configured");
    }
    
    // Basic validation: ElevenLabs API keys typically start with specific patterns
    if (!ELEVENLABS_API_KEY.match(/^[a-zA-Z0-9]{32,}$/)) {
      console.error("ElevenLabs API key appears to be invalid (incorrect format)");
      throw new Error("ElevenLabs API key appears to be invalid");
    }

    console.log(`Converting text to speech with ElevenLabs API, language: ${language || 'default'}`);
    console.log(`Using API key: ${ELEVENLABS_API_KEY.substring(0, 4)}...${ELEVENLABS_API_KEY.substring(ELEVENLABS_API_KEY.length - 4)}`);

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
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get audio data as array buffer
    const audioArrayBuffer = await response.arrayBuffer();
    
    // Convert to base64 for transmission
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioArrayBuffer)));

    return new Response(
      JSON.stringify({ 
        audio: base64Audio,
        format: "mp3"
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
