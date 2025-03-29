
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InventionData {
  title: string;
  description: string;
  sketchDataUrl?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, sketchDataUrl } = await req.json() as InventionData;
    
    if (!title && !description) {
      return new Response(
        JSON.stringify({ 
          error: "Missing required data. Please provide at least a title or description." 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Prepare the input for Claude
    let combined_input = `
[USER_PROVIDED_NAME]
${title || "Untitled Invention"}

[USER_DESCRIPTION]
${description || ""}
`;

    // Add sketch analysis if available
    if (sketchDataUrl) {
      combined_input += `
[SKETCH_ANALYSIS]
This is a user-created sketch of their invention. The sketch shows the visual representation that the user has drawn.
`;
    }

    // System prompt for Claude
    const system_prompt = `
You are InventoVerse AI Catalyst, an expert AI assistant specializing in synthesizing and structuring early-stage invention ideas presented through multiple modalities. Your primary goal is to analyze the provided multimodal context about a user's invention concept and generate a structured JSON object summarizing the core idea, key elements, and potential next steps. You are operating within the InventoVerse platform, designed to help inventors organize and develop their concepts.

**Input Format:**

You will receive input structured as follows, combining various text descriptions and analyses. You MUST consider ALL provided sections equally to form a holistic understanding:

* \`[USER_PROVIDED_NAME]\`: The name the user has given the invention.
* \`[USER_DESCRIPTION]\`: The user's primary text description of the invention.
* \`[SKETCH_ANALYSIS]\`: An AI-generated textual description of the user's sketch/drawing. (This section may be absent if no sketch was provided).
* \`[UPLOADED_IMAGE_ANALYSIS_N]\`: AI-generated textual description(s) of uploaded image(s) (e.g., photos, reference images). N starts from 1. (This section may be absent).
* \`[AUDIO_TRANSCRIPT]\`: A transcript of the user's spoken description or notes. (This section may be absent).
* \`[VIDEO_SUMMARY]\`: A user-provided or AI-generated summary of any uploaded video content (e.g., prototype demo). (This section may be absent).

**Core Task:**

Analyze the entirety of the provided context. Synthesize the information to understand the invention's essence, purpose, and key characteristics. Then, generate a **single JSON object** adhering *strictly* to the format specified below. Do NOT output any text before or after the JSON object.

**Output JSON Structure:**

\`\`\`json
{
  "invention_name": "string", // Directly from [USER_PROVIDED_NAME]
  "core_concept_summary": "string", // Your synthesized summary (2-4 sentences) capturing the essence of the invention based on ALL inputs.
  "problem_solved": "string", // Infer the primary problem this invention aims to address based on the context.
  "potential_target_users": "string", // Infer potential users or beneficiaries based on the context.
  "key_features_list": [ // List key features identified or implied across all inputs. Be concise.
    "string",
    "string",
    ...
  ],
  "materials_components_ideas": [ // List any materials or components mentioned or visually implied.
    "string",
    "string",
    ...
  ],
  "visual_elements_summary": "string", // Your brief summary integrating insights ONLY from [SKETCH_ANALYSIS] and [UPLOADED_IMAGE_ANALYSIS_N]. Empty string if no visual input provided.
  "audio_notes_summary": "string", // Your brief summary of key points ONLY from [AUDIO_TRANSCRIPT]. Empty string if no audio input provided.
  "unclear_aspects_questions": [ // List specific questions highlighting ambiguities or areas needing further user clarification based on your analysis.
    "string",
    "string",
    ...
  ],
  "suggested_next_steps": [ // Suggest 2-4 concrete, actionable next steps for the user within the InventoVerse context (e.g., 'Refine sketch based on feasibility analysis', 'Research competing solutions for X feature', 'Define primary material requirements').
    "string",
    "string",
    ...
  ],
  "input_modalities_received": [ // List the types of input context you received (e.g., "USER_DESCRIPTION", "SKETCH_ANALYSIS", "AUDIO_TRANSCRIPT").
    "string",
    "string",
    ...
  ]
}
\`\`\`

**Processing Instructions & Constraints:**

1.  **Synthesize, Don't Just Copy:** Combine information logically. The \`core_concept_summary\` should be your own synthesis.
2.  **Infer Logically:** Base \`problem_solved\` and \`potential_target_users\` on reasonable inferences from the provided context only.
3.  **Be Specific:** Make \`key_features_list\`, \`materials_components_ideas\`, \`unclear_aspects_questions\`, and \`suggested_next_steps\` as concrete as possible based *only* on the input.
4.  **Adhere to Structure:** Output *only* the valid JSON object matching the specified format precisely. Ensure all keys are present, even if the value is an empty string or empty list where appropriate.
5.  **Conciseness:** Keep summaries and list items reasonably concise.
6.  **No External Knowledge:** Base your analysis solely on the provided input context. Do not invent features, solutions, or details not present or strongly implied.
7.  **No Legal/Patent Advice:** Do not include any text that could be construed as legal or patent advice. Focus on the technical and conceptual aspects.
8.  **Helpful Tone:** While analytical, frame \`unclear_aspects_questions\` and \`suggested_next_steps\` in a constructive and encouraging manner suitable for an inventor's assistant.

Generate the JSON structure based on the multimodal input provided in the user's message.
`;

    console.log("Sending request to Anthropic API...");
    
    // Call Anthropic API
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20240229",
        max_tokens: 4096,
        temperature: 0.5,
        system: system_prompt,
        messages: [
          {
            role: "user",
            content: combined_input
          }
        ]
      })
    });

    const data = await response.json();
    console.log("Received response from Anthropic API");
    
    if (!response.ok) {
      console.error("Error from Anthropic API:", data);
      throw new Error(`Anthropic API error: ${data.error?.message || "Unknown error"}`);
    }

    // Extract the content from Claude's response
    const content = data.content[0].text;

    try {
      // Parse the JSON response from Claude
      const analysisResult = JSON.parse(content);
      
      return new Response(
        JSON.stringify(analysisResult),
        { 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    } catch (parseError) {
      console.error("Error parsing Claude response as JSON:", parseError);
      console.log("Raw Claude response:", content);
      
      return new Response(
        JSON.stringify({ 
          error: "Failed to parse AI response", 
          rawResponse: content 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }
  } catch (error) {
    console.error("Error in analyze-invention function:", error);
    
    return new Response(
      JSON.stringify({ error: error.message || "An unexpected error occurred" }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
