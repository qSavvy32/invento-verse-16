
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.16.0";
import * as Sentry from "https://esm.sh/@sentry/deno@7.94.1";

// Initialize Sentry
try {
  Sentry.init({
    dsn: Deno.env.get("SENTRY_DSN"),
    environment: 'production',
    tracesSampleRate: 1.0,
  });
} catch (e) {
  console.error("Invalid Sentry Dsn:", Deno.env.get("SENTRY_DSN"));
}

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
    const { title, description, sketchDataUrl, analysisType } = await req.json();

    // Validate required inputs
    if (!title && !description) {
      throw new Error("At least title or description must be provided");
    }

    console.log(`Received request for ${analysisType} analysis`);

    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    // Prepare base prompt
    let systemPrompt = `You are an expert invention analyst with deep knowledge across technical, market, and legal domains.
      Analyze the provided invention description and sketch (if available) and provide detailed, actionable insights.`;

    // Customize the prompt based on analysis type
    switch (analysisType) {
      case "technical":
        systemPrompt += `Focus on technical feasibility, engineering challenges, and design considerations.`;
        break;
      case "challenges":
        systemPrompt += `Focus on identifying key technical challenges and potential solutions.`;
        break;
      case "materials":
        systemPrompt += `Focus on suggesting appropriate materials and components for this invention.`;
        break;
      case "users":
        systemPrompt += `Focus on target user analysis, primary and secondary user groups, and how the invention addresses their needs.`;
        break;
      case "competition":
        systemPrompt += `Focus on competitive analysis, market positioning, and differentiators.`;
        break;
      case "ip":
        systemPrompt += `Focus on intellectual property considerations, patentability assessment, and protection strategies.`;
        break;
      case "regulatory":
        systemPrompt += `Focus on regulatory compliance requirements and certification needs.`;
        break;
      case "comprehensive":
      default:
        systemPrompt += `Provide a comprehensive analysis covering technical feasibility, market potential, intellectual property considerations, and next steps.`;
        break;
    }

    // Add instructions for output format
    systemPrompt += `\n\nOutput your analysis in a structured JSON format appropriate for the analysis type.`;

    // Prepare user message with invention details
    let userMessage = `Here's my invention idea:\n\nTitle: ${title || "Untitled"}\nDescription: ${description || "No description provided"}`;

    if (sketchDataUrl) {
      userMessage += `\n\nI've also created a sketch of the invention which you can analyze.`;
    }

    userMessage += `\n\nPlease provide a detailed ${analysisType} analysis of this invention idea.`;

    console.log(`Sending request to Anthropic API for ${analysisType} analysis...`);

    // Make request to Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      system: systemPrompt,
      max_tokens: 2000,
      messages: [
        { role: "user", content: userMessage }
      ],
      temperature: 0.7, // Balanced between creativity and consistency
    });

    console.log("Received response from Anthropic API");

    // Parse the response to extract JSON if possible
    let analysisResults;
    try {
      // Try to find and parse JSON in the response
      const jsonMatch = response.content[0].text.match(/```json\n([\s\S]*?)\n```/) || 
                        response.content[0].text.match(/\{[\s\S]*\}/);
                        
      if (jsonMatch) {
        analysisResults = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON found, use the full text response
        analysisResults = { analysis: response.content[0].text };
      }
    } catch (error) {
      console.error("Error parsing JSON from Anthropic response:", error);
      analysisResults = { analysis: response.content[0].text };
    }

    return new Response(JSON.stringify(analysisResults), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-invention function:", error);
    
    // Capture exception in Sentry
    Sentry.captureException(error);
    
    return new Response(
      JSON.stringify({ error: `Anthropic API error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
