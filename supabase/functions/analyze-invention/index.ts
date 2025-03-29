
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
  analysisType?: string; // Added to handle different analysis types
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, sketchDataUrl, analysisType = "comprehensive" } = await req.json() as InventionData;
    
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

    // Create a specialized system prompt based on the analysis type
    let system_prompt = getSystemPrompt(analysisType);

    console.log(`Sending request to Anthropic API for ${analysisType} analysis...`);
    
    // Call Anthropic API with updated model and format
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": ANTHROPIC_API_KEY || "",
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        max_tokens: 4096,
        temperature: 0.5,
        system: system_prompt,
        messages: [
          {
            role: "user",
            content: combined_input
          }
        ],
        thinking: {
          type: "enabled",
          budget_tokens: 2000
        }
      })
    });

    const data = await response.json();
    console.log(`Received response from Anthropic API for ${analysisType} analysis`);
    
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

// Helper function to get the appropriate system prompt based on analysis type
function getSystemPrompt(analysisType: string): string {
  const basePrompt = `
You are InventoVerse AI Catalyst, an expert AI assistant specializing in synthesizing and structuring early-stage invention ideas presented through multiple modalities. Your primary goal is to analyze the provided multimodal context about a user's invention concept and generate a structured JSON object summarizing the core idea, key elements, and potential next steps. You are operating within the InventoVerse platform, designed to help inventors organize and develop their concepts.
`;

  const defaultOutputFormat = `
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
  ],
  "visualization_prompts": { // Add visualization prompts for different aspects of the analysis
    "concept": "string", // A prompt to generate an image visualizing the core concept
    "materials": "string", // A prompt to generate an image of suggested materials/components
    "users": "string", // A prompt to visualize the target users using the invention
    "problem": "string" // A prompt to visualize the problem being solved
  }
}
\`\`\`
`;

  const specificPrompts: Record<string, string> = {
    "technical": `
${basePrompt}

You are now focusing specifically on the technical aspects of the invention. Analyze the materials, engineering challenges, and design considerations of the invention.

**Output JSON Structure:**

\`\`\`json
{
  "technical_analysis": {
    "technical_summary": "string", // Technical summary of the invention (3-5 sentences)
    "key_features_list": [ // List key technical features identified
      "string",
      "string",
      ...
    ],
    "materials_components_ideas": [ // List potential materials and components
      "string",
      "string",
      ...
    ],
    "technical_challenges": [ // List potential technical challenges
      "string",
      "string",
      ...
    ],
    "suggested_improvements": [ // List suggested technical improvements
      "string",
      "string",
      ...
    ]
  },
  "visualization_prompts": {
    "concept": "string", // A technical diagram visualization prompt
    "materials": "string" // A prompt to visualize the materials and components
  }
}
\`\`\`
`,
    "materials": `
${basePrompt}

You are now focusing specifically on suggesting optimal materials for the invention. Consider durability, cost, sustainability, and functional requirements.

**Output JSON Structure:**

\`\`\`json
{
  "materials_analysis": {
    "materials_summary": "string", // Overall summary of material recommendations (3-5 sentences)
    "primary_materials": [ // List recommended primary materials with rationale
      {"material": "string", "rationale": "string"},
      {"material": "string", "rationale": "string"},
      ...
    ],
    "alternative_materials": [ // List alternative materials with pros/cons
      {"material": "string", "pros": "string", "cons": "string"},
      {"material": "string", "pros": "string", "cons": "string"},
      ...
    ],
    "sustainability_considerations": "string" // Notes on environmental impact and sustainability
  },
  "visualization_prompts": {
    "materials": "string" // A prompt to visualize the materials in use
  }
}
\`\`\`
`,
    "challenges": `
${basePrompt}

You are now focusing specifically on identifying potential challenges and obstacles for the invention. Consider technical, market, and regulatory challenges.

**Output JSON Structure:**

\`\`\`json
{
  "challenges_analysis": {
    "challenges_summary": "string", // Overall summary of challenges (3-5 sentences)
    "technical_challenges": [ // List technical challenges
      {"challenge": "string", "potential_solution": "string"},
      {"challenge": "string", "potential_solution": "string"},
      ...
    ],
    "market_challenges": [ // List market/business challenges
      {"challenge": "string", "potential_solution": "string"},
      {"challenge": "string", "potential_solution": "string"},
      ...
    ],
    "regulatory_challenges": [ // List regulatory/legal challenges
      {"challenge": "string", "potential_solution": "string"},
      {"challenge": "string", "potential_solution": "string"},
      ...
    ]
  },
  "visualization_prompts": {
    "concept": "string" // A prompt to visualize the challenges
  }
}
\`\`\`
`,
    "users": `
${basePrompt}

You are now focusing specifically on identifying potential target users and market segments for the invention.

**Output JSON Structure:**

\`\`\`json
{
  "users_analysis": {
    "users_summary": "string", // Overall summary of target users (3-5 sentences)
    "primary_users": [ // List primary user demographics with rationale
      {"user_group": "string", "rationale": "string"},
      {"user_group": "string", "rationale": "string"},
      ...
    ],
    "secondary_users": [ // List secondary user demographics
      {"user_group": "string", "rationale": "string"},
      {"user_group": "string", "rationale": "string"},
      ...
    ],
    "user_needs_addressed": [ // List key user needs addressed by the invention
      "string",
      "string",
      ...
    ]
  },
  "visualization_prompts": {
    "users": "string" // A prompt to visualize the target users
  }
}
\`\`\`
`,
    "competition": `
${basePrompt}

You are now focusing specifically on analyzing potential market competition for the invention.

**Output JSON Structure:**

\`\`\`json
{
  "competition_analysis": {
    "market_summary": "string", // Overall summary of the competitive landscape (3-5 sentences)
    "direct_competitors": [ // List potential direct competitors
      {"competitor": "string", "product": "string", "strengths": "string", "weaknesses": "string"},
      {"competitor": "string", "product": "string", "strengths": "string", "weaknesses": "string"},
      ...
    ],
    "indirect_competitors": [ // List indirect competitors
      {"competitor": "string", "product": "string", "relevance": "string"},
      {"competitor": "string", "product": "string", "relevance": "string"},
      ...
    ],
    "market_gap": "string", // Description of the market gap being filled
    "competitive_advantage": "string" // Potential competitive advantage of the invention
  },
  "visualization_prompts": {
    "concept": "string" // A prompt to visualize the market positioning
  }
}
\`\`\`
`,
    "ip": `
${basePrompt}

You are now focusing specifically on intellectual property protection strategies for the invention.

**Output JSON Structure:**

\`\`\`json
{
  "ip_analysis": {
    "ip_summary": "string", // Overall summary of IP protection strategy (3-5 sentences)
    "patentability_assessment": "string", // Assessment of potential patentability
    "protection_strategies": [ // List recommended IP protection strategies
      {"strategy": "string", "rationale": "string"},
      {"strategy": "string", "rationale": "string"},
      ...
    ],
    "documentation_recommendations": [ // List recommended documentation practices
      "string",
      "string",
      ...
    ],
    "disclosure_considerations": "string" // Guidance on managing disclosures
  },
  "visualization_prompts": {
    "concept": "string" // A prompt to visualize the IP protection strategy
  }
}
\`\`\`
`,
    "regulatory": `
${basePrompt}

You are now focusing specifically on regulatory and compliance considerations for the invention.

**Output JSON Structure:**

\`\`\`json
{
  "regulatory_analysis": {
    "regulatory_summary": "string", // Overall summary of regulatory considerations (3-5 sentences)
    "applicable_regulations": [ // List potentially applicable regulations
      {"regulation": "string", "applicability": "string", "requirements": "string"},
      {"regulation": "string", "applicability": "string", "requirements": "string"},
      ...
    ],
    "certification_requirements": [ // List potential certification requirements
      {"certification": "string", "rationale": "string"},
      {"certification": "string", "rationale": "string"},
      ...
    ],
    "compliance_checklist": [ // Checklist of compliance items
      "string",
      "string",
      ...
    ]
  },
  "visualization_prompts": {
    "concept": "string" // A prompt to visualize the regulatory roadmap
  }
}
\`\`\`
`,
    "comprehensive": `
${basePrompt}

${defaultOutputFormat}

**Processing Instructions & Constraints:**

1.  **Synthesize, Don't Just Copy:** Combine information logically. The \`core_concept_summary\` should be your own synthesis.
2.  **Infer Logically:** Base \`problem_solved\` and \`potential_target_users\` on reasonable inferences from the provided context only.
3.  **Be Specific:** Make \`key_features_list\`, \`materials_components_ideas\`, \`unclear_aspects_questions\`, and \`suggested_next_steps\` as concrete as possible based *only* on the input.
4.  **Adhere to Structure:** Output *only* the valid JSON object matching the specified format precisely. Ensure all keys are present, even if the value is an empty string or empty list where appropriate.
5.  **Conciseness:** Keep summaries and list items reasonably concise.
6.  **No External Knowledge:** Base your analysis solely on the provided input context. Do not invent features, solutions, or details not present or strongly implied.
7.  **No Legal/Patent Advice:** Do not include any text that could be construed as legal or patent advice. Focus on the technical and conceptual aspects.
8.  **Helpful Tone:** While analytical, frame \`unclear_aspects_questions\` and \`suggested_next_steps\` in a constructive and encouraging manner suitable for an inventor's assistant.
9.  **Visualization Prompts:** Create detailed image generation prompts for each aspect of the visualization_prompts object that accurately reflects the invention based on all inputs.

Generate the JSON structure based on the multimodal input provided in the user's message.
`
  };

  return specificPrompts[analysisType] || specificPrompts["comprehensive"];
}
