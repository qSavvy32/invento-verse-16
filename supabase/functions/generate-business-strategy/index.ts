
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
      throw new Error("Title or description must be provided");
    }

    console.log(`Generating business strategy visualization for: ${title}`);

    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Build content array for the prompt
    const contentItems = [];
    
    // Base text prompt
    let textPrompt = "You are a business strategy expert tasked with creating a visual business and go-to-market strategy for a new invention. ";
    
    if (title) {
      textPrompt += `\n\nThe invention is: ${title}\n\n`;
    }
    
    if (description) {
      textPrompt += `Description: ${description}\n\n`;
    }
    
    textPrompt += "You MUST create a visually appealing SVG that illustrates a comprehensive business and go-to-market strategy for this invention. The SVG should include:\n\n";
    textPrompt += "1. Target market segments with icons\n";
    textPrompt += "2. Value proposition in a visually distinctive way\n";
    textPrompt += "3. Revenue streams with visual indicators of potential size\n";
    textPrompt += "4. Key partnerships needed (visualized)\n";
    textPrompt += "5. Market entry strategy with a timeline\n";
    textPrompt += "6. Competitive positioning map\n\n";
    textPrompt += "Generate a clean, modern SVG with a cohesive color scheme that uses gradients, icons, and a professional layout. Make sure the SVG is well-formatted and directly usable in a web application. Do not include any explanation, just return valid SVG code.";
    
    // Add the text component to content items
    contentItems.push({
      type: "text",
      text: textPrompt
    });
    
    // We'll skip adding the image for now as it's causing issues
    // If the user really needs image input for business strategy, we can implement a more robust solution later

    console.log("Sending request to Anthropic API for business strategy visualization...");

    // Make request to Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      system: "You are an expert business strategist and visual designer who creates SVG visualizations for business and go-to-market strategies. Your visualizations are clean, modern, and insightful. You use gradients, icons, and professional layouts to convey complex business information in an accessible way. You always generate valid SVG code that can be directly used in web applications.",
      max_tokens: 4000,
      messages: [
        { 
          role: "user", 
          content: contentItems
        }
      ],
      temperature: 0.7,
    });

    console.log("Received response from Anthropic API");
    
    // Extract the SVG code from the response
    let svgCode = response.content[0].text;
    
    // If the response contains code blocks, extract the SVG from within them
    const svgMatch = svgCode.match(/<svg[\s\S]*?<\/svg>/);
    if (svgMatch) {
      svgCode = svgMatch[0];
    }
    
    // Validate that we actually got SVG code
    if (!svgCode.includes('<svg') || !svgCode.includes('</svg>')) {
      throw new Error("Invalid SVG generated");
    }

    return new Response(JSON.stringify({ 
      svgCode: svgCode 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-business-strategy function:", error);
    
    return new Response(
      JSON.stringify({ error: `Error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
