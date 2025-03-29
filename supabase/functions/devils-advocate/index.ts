
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.16.0";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

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
    const { title, description, sketchDataUrl } = await req.json();

    // Validate required inputs
    if (!title && !description) {
      throw new Error("At least title or description must be provided");
    }

    console.log("Received request for devil's advocate critique");

    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Prepare the system prompt
    const systemPrompt = `You are the Devil's Advocate, a brutally honest invention critic who challenges the feasibility, market viability, and originality of new invention ideas. 
    Your job is to identify flaws, roadblocks, and potential failures that the inventor has overlooked.
    Be respectfully harsh but constructive - point out problems but also suggest improvements where possible.
    Use a direct, slightly provocative tone that makes the inventor defend and improve their idea.
    
    For each invention, provide critique in these categories:
    1. Technical Feasibility - engineering challenges, physics limitations, technical roadblocks
    2. Market Reality - who would actually buy this, why it might fail commercially
    3. Originality - similar existing products, IP conflicts, why it's not as novel as they think
    4. Unintended Consequences - negative social impacts, regulatory issues, potential misuse
    
    Return your critique in JSON format with these categories.`;

    // Prepare user message with invention details
    let userMessage = `Here's my invention idea:\n\nTitle: ${title || "Untitled"}\nDescription: ${description || "No description provided"}`;

    if (sketchDataUrl) {
      userMessage += `\n\nI've also created a sketch of the invention which you can analyze.`;
    }

    userMessage += `\n\nPlease act as the Devil's Advocate and critique this invention idea harshly but constructively.`;

    console.log("Sending request to Anthropic API for devil's advocate critique...");

    // Make request to Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      system: systemPrompt,
      max_tokens: 2000,
      messages: [
        { role: "user", content: userMessage }
      ],
      temperature: 0.7,
    });

    console.log("Received response from Anthropic API");

    // Parse the response to extract JSON if possible
    let critique;
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = response.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                      response.content[0].text.match(/\{[\s\S]*\}/);
                      
      if (jsonMatch) {
        critique = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        console.log("Successfully parsed JSON response");
      } else {
        // If no JSON found, use the full text response
        console.log("No JSON found in response, using full text");
        critique = { 
          analysis: response.content[0].text,
          technical_feasibility: ["No specific technical issues identified"],
          market_reality: ["No specific market issues identified"],
          originality: ["No specific originality issues identified"],
          unintended_consequences: ["No specific consequences identified"]
        };
      }
    } catch (error) {
      console.error("Error parsing JSON from Anthropic response:", error);
      critique = { 
        analysis: response.content[0].text,
        technical_feasibility: ["Error parsing response"],
        market_reality: ["Error parsing response"],
        originality: ["Error parsing response"],
        unintended_consequences: ["Error parsing response"]
      };
    }

    return new Response(JSON.stringify(critique), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in devils-advocate function:", error);
    
    return new Response(
      JSON.stringify({ error: `Error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
