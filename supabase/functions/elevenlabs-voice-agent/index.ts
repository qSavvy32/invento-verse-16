
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
    release: "elevenlabs-voice-agent@1.0.0",
  });
}

// Create a Supabase client
const supabase = createClient(
  SUPABASE_URL || "",
  SUPABASE_SERVICE_ROLE_KEY || ""
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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

    // Generate a cache key for this specific agent request
    const cacheKey = generateHash({
      agentId,
      systemPrompt,
      inventionTitle,
      inventionDescription
    });
    
    // Check if we have a cached signed URL for this request
    const cachedSignedUrlPath = `agent-urls/${cacheKey}.json`;
    const signedUrlExists = await checkFileExists("cache", cachedSignedUrlPath);
    
    if (signedUrlExists) {
      console.log("Found cached signed URL, retrieving it");
      
      const { data, error } = await supabase.storage
        .from("cache")
        .download(cachedSignedUrlPath);
        
      if (error) {
        console.error("Error retrieving cached signed URL:", error);
      } else {
        try {
          const cachedData = JSON.parse(await data.text());
          const expiryTime = new Date(cachedData.expiresAt).getTime();
          const currentTime = new Date().getTime();
          
          // If the signed URL hasn't expired yet, return it
          if (expiryTime > currentTime) {
            console.log("Using cached signed URL (valid until " + cachedData.expiresAt + ")");
            
            return new Response(
              JSON.stringify({ 
                signedUrl: cachedData.signed_url,
                overrides: cachedData.overrides,
                cached: true
              }),
              { 
                headers: { ...corsHeaders, "Content-Type": "application/json" } 
              }
            );
          } else {
            console.log("Cached signed URL has expired, generating a new one");
          }
        } catch (error) {
          console.error("Error parsing cached signed URL:", error);
        }
      }
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
    console.log(`Generating signed URL for agent ID: ${agentId}`);
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
    
    // Calculate expiry time (ElevenLabs signed URLs typically expire in 10 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 9); // Set to 9 minutes to be safe
    
    // Store the signed URL in cache for future use
    try {
      const cacheData = {
        signed_url: data.signed_url,
        overrides: agentOverrides,
        expiresAt: expiresAt.toISOString()
      };
      
      const cacheBlob = new Blob([JSON.stringify(cacheData)], {
        type: "application/json",
      });
      
      // Store in background to avoid blocking the response
      EdgeRuntime.waitUntil(
        (async () => {
          const { data, error } = await supabase.storage
            .from("cache")
            .upload(cachedSignedUrlPath, cacheBlob, {
              cacheControl: "600", // Cache for 10 minutes
              upsert: true,
            });
            
          if (error) {
            console.error("Error caching signed URL:", error);
          } else {
            console.log("Successfully cached signed URL:", data);
          }
        })()
      );
    } catch (error) {
      console.error("Error creating cache for signed URL:", error);
    }
    
    // Return the data with overrides
    return new Response(
      JSON.stringify({ 
        signedUrl: data.signed_url,
        overrides: agentOverrides,
        cached: false
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
