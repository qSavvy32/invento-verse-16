
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as Sentry from "https://cdn.jsdelivr.net/npm/@sentry/browser@7.94.1/+esm";

const ELEVENLABS_API_KEY = Deno.env.get("ELEVENLABS_API_KEY");
const SENTRY_API_KEY = Deno.env.get("SENTRY_API_KEY");

// Initialize Sentry
if (SENTRY_API_KEY) {
  Sentry.init({
    dsn: SENTRY_API_KEY,
    environment: "production",
    release: "elevenlabs-voice-agent@1.0.0",
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VoiceAgentRequest {
  agentId: string;
  systemPrompt?: string;
  inventionTitle?: string;
  inventionDescription?: string;
  overrides?: {
    agent?: {
      prompt?: {
        prompt?: string;
      };
      firstMessage?: string;
      language?: string;
    };
    tts?: {
      voiceId?: string;
    };
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: VoiceAgentRequest = await req.json();
    const { agentId, systemPrompt, inventionTitle, inventionDescription, overrides } = requestData;

    if (!agentId) {
      return new Response(
        JSON.stringify({ error: "Missing required data. Please provide agentId." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Validate ElevenLabs API key
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim() === "") {
      console.error("ElevenLabs API key is not configured");
      throw new Error("ElevenLabs API key is not configured");
    }

    // Construction agent overrides with the invention context and system prompt
    const agentOverrides = {
      agent: {
        prompt: {
          prompt: systemPrompt || `You are Vinci, an AI assistant specializing in invention development. You're helping with an invention called "${inventionTitle || 'Unnamed invention'}" described as: "${inventionDescription || 'No description provided'}"`,
        },
        firstMessage: overrides?.agent?.firstMessage || "Hi, I'm Vinci, your invention assistant. Tell me about your invention idea, and I'll help you develop it.",
        language: overrides?.agent?.language || "en",
      },
      tts: {
        voiceId: overrides?.tts?.voiceId || "JBFqnCBsd6RMkjVDRZzb", // Default to George voice
      },
    };

    // Generate a signed URL for agent
    const requestHeaders = new Headers();
    requestHeaders.set("xi-api-key", ELEVENLABS_API_KEY);
    requestHeaders.set("Content-Type", "application/json");

    // ElevenLabs API call to get a signed URL
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: "GET",
        headers: requestHeaders,
      }
    );

    if (!response.ok) {
      console.error(`ElevenLabs API error: ${response.status}`);
      const errorText = await response.text();
      console.error(`Error details: ${errorText}`);
      
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    // Get the signed URL
    const data = await response.json();
    
    // Return the data with overrides
    return new Response(
      JSON.stringify({ 
        signedUrl: data.signed_url,
        overrides: agentOverrides
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in elevenlabs-voice-agent function:", error);
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
