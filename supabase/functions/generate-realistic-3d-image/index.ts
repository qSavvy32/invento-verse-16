
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.16.0";

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

    console.log(`Received request for realistic 3D image generation`);

    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    // Create the prompt for the image generation
    let prompt = `Create a photorealistic 3D rendering of this invention:\n\n`;
    prompt += `Title: ${title || "Untitled"}\n`;
    prompt += `Description: ${description || "No description provided"}\n\n`;
    prompt += `The image should be a high-quality, photorealistic 3D rendering that clearly shows the invention from an optimal viewing angle. Include appropriate lighting, materials, and context to make the invention understandable.`;

    // Include sketch information if available
    if (sketchDataUrl) {
      prompt += `\n\nBased on the inventor's sketch, try to maintain the key design elements while making it look realistic and professional.`;
    }

    console.log(`Sending request to Anthropic API for realistic 3D image generation...`);

    // Request the image from Claude 3
    const response = await anthropic.messages.create({
      model: "claude-3-opus-20240229",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.5,
    });

    // Extract the image from the response
    let imageUrl = null;
    const content = response.content;
    
    for (const item of content) {
      if (item.type === "image") {
        imageUrl = item.source.media_type + ";base64," + item.source.data;
        break;
      }
    }

    if (!imageUrl) {
      throw new Error("No image was generated");
    }

    return new Response(
      JSON.stringify({ 
        image: imageUrl,
        message: "3D realistic image generated successfully" 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating realistic 3D image:", error);
    
    return new Response(
      JSON.stringify({ error: `Image generation error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
