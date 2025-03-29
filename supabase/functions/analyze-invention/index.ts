
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as Sentry from "https://cdn.jsdelivr.net/npm/@sentry/browser@7.94.1/+esm";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
const SENTRY_API_KEY = Deno.env.get("SENTRY_API_KEY");

// Initialize Sentry
Sentry.init({
  dsn: SENTRY_API_KEY,
  environment: "production",
  release: "analyze-invention@1.0.0",
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InventionAnalysisRequest {
  title?: string;
  description?: string;
  sketchDataUrl?: string;
  analysisType: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestData: InventionAnalysisRequest = await req.json();
    const { title, description, sketchDataUrl, analysisType } = requestData;

    console.log(`Received request for ${analysisType} analysis`);

    if (!title && !description && !sketchDataUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required data. Please provide a title, description, or sketch." }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let systemPrompt = "You are an invention analysis assistant specialized in helping inventors understand and improve their ideas.";
    let userPrompt = "";

    // Configure prompts based on analysis type
    switch (analysisType) {
      case "technical":
        systemPrompt += " Focus on technical aspects, engineering principles, and practical implementation details.";
        userPrompt = `Analyze the technical aspects of this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "challenges":
        systemPrompt += " Focus on identifying technical challenges and suggesting potential solutions.";
        userPrompt = `Identify the technical challenges for this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "materials":
        systemPrompt += " Focus on suggesting appropriate materials, components, and manufacturing considerations.";
        userPrompt = `Suggest materials and components for this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "users":
        systemPrompt += " Focus on identifying potential users, user needs, and use cases.";
        userPrompt = `Identify potential users for this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "competition":
        systemPrompt += " Focus on market analysis, competitive landscape, and competitive advantages.";
        userPrompt = `Analyze the competitive landscape for this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "ip":
        systemPrompt += " Focus on patent strategy, intellectual property protection, and legal considerations.";
        userPrompt = `Provide intellectual property advice for this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "regulatory":
        systemPrompt += " Focus on regulatory requirements, certification needs, and compliance considerations.";
        userPrompt = `Analyze regulatory requirements for this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
      case "comprehensive":
      default:
        systemPrompt += " Provide a comprehensive analysis covering technical, market, legal, and business aspects.";
        userPrompt = `Analyze this invention idea: ${title || ''}\n${description || ''}\n`;
        if (sketchDataUrl) userPrompt += "[A sketch image was provided]";
        break;
    }

    // Add output structure instructions to the system prompt
    systemPrompt += " Structure your output as JSON. Include the following fields as relevant to the analysis:";
    systemPrompt += " key_features_list (array of strings), materials_components_ideas (array of strings),";
    systemPrompt += " technical_challenges (array of objects with challenge and potential_solution),";
    systemPrompt += " problem_solved (string), potential_target_users (string), market_insights (array of strings),";
    systemPrompt += " unclear_aspects_questions (array of strings), suggested_next_steps (array of strings),";
    systemPrompt += " suggested_improvements (array of strings).";
    
    // Add visualization prompts request
    systemPrompt += " Also include a visualization_prompts field with 3 detailed prompts that could be used to generate visualizations of this invention.";

    console.log(`Sending request to Anthropic API for ${analysisType} analysis...`);

    // Use the correct anthropic API endpoint and parameters
    // Note: When using thinking budget, temperature must be set to 0
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4000,
        temperature: 0,  // When using thinking, temperature must be 0
        thinking: {
          type: "enabled",
          budget_tokens: 16000
        },
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user", 
            content: userPrompt
          }
        ]
      })
    });

    console.log("Received response from Anthropic API");

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Error from Anthropic API:", JSON.stringify(errorData));
      throw new Error(`Anthropic API error: ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const result = await response.json();
    
    try {
      // Extract the content from the Anthropic response
      const content = result.content[0].text;
      
      // Try to parse the JSON from the content
      // First, check if the content contains a JSON block
      let jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
      let parsedResult;
      
      if (jsonMatch && jsonMatch[1]) {
        // Extract JSON from code block
        parsedResult = JSON.parse(jsonMatch[1]);
      } else {
        // Try to parse the entire content as JSON
        try {
          parsedResult = JSON.parse(content);
        } catch (e) {
          // If not valid JSON, return the raw content with a warning
          console.warn("Could not parse response as JSON, returning raw content");
          parsedResult = { 
            raw_content: content,
            warning: "Could not parse as structured data" 
          };
        }
      }
      
      return new Response(
        JSON.stringify(parsedResult),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (error) {
      console.error("Error parsing Anthropic response:", error);
      Sentry.captureException(error);
      
      // Return the raw response if JSON parsing fails
      return new Response(
        JSON.stringify({ 
          raw_content: result.content[0].text,
          error: "Failed to parse structured data"
        }),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error in analyze-invention function:", error);
    Sentry.captureException(error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
