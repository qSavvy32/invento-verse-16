
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");

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

    console.log(`Converting speech to text with ElevenLabs API, language: ${languageCode}`);
    
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

    // Call ElevenLabs API with proper debugging
    console.log("Sending request to ElevenLabs API...");
    console.log(`Using API key: ${ELEVENLABS_API_KEY.substring(0, 4)}...${ELEVENLABS_API_KEY.substring(ELEVENLABS_API_KEY.length - 4)}`);
    
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
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const result = await response.json();
    console.log("Transcription successful");

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
