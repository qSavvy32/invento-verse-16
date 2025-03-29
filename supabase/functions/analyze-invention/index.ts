
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
    const { title, description, sketchDataUrl, analysisType, outputFormat } = await req.json();

    // Validate required inputs - allow for more flexibility with inputs
    if (!title && !description && !sketchDataUrl) {
      throw new Error("At least one of title, description, or visual input must be provided");
    }

    console.log(`Received request for ${analysisType || "comprehensive"} analysis`);
    console.log(`Input data: Title: ${Boolean(title)}, Description: ${Boolean(description)}, Visual input: ${Boolean(sketchDataUrl)}`);

    const anthropic = new Anthropic({
      apiKey: ANTHROPIC_API_KEY,
    });

    // Build content array for the prompt
    const contentItems = [];
    
    // Base text prompt
    let textPrompt = "You are an innovation analyst tasked with analyzing a new invention idea.";
    
    if (title) {
      textPrompt += `\n\nTitle: ${title}`;
    }
    
    if (description) {
      textPrompt += `\n\nDescription: ${description}`;
    }
    
    // Add analysis type specific instructions
    textPrompt += getAnalysisTypeInstructions(analysisType);
    
    // Add formatting instructions
    if (outputFormat === "markdown") {
      textPrompt += "\n\nFormat your response using rich Markdown with headings, bullet points, and emphasis where appropriate.";
    }
    
    // Add the text component to content items
    contentItems.push({
      type: "text",
      text: textPrompt
    });
    
    // If there's a sketch, add it as an image
    if (sketchDataUrl) {
      // If it's a URL to an image in Supabase Storage
      if (sketchDataUrl.startsWith('http')) {
        try {
          // Fetch the image and convert to base64
          const response = await fetch(sketchDataUrl);
          const imageBlob = await response.blob();
          
          // Convert blob to base64
          const arrayBuffer = await imageBlob.arrayBuffer();
          const base64Data = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
          
          // Determine media type
          const mediaType = response.headers.get('content-type') || 'image/jpeg';
          
          contentItems.push({
            type: "image",
            source: {
              type: "base64",
              media_type: mediaType,
              data: base64Data
            }
          });
        } catch (error) {
          console.error("Error fetching image from URL:", error);
          // Continue without the image
        }
      } 
      // Handle base64 data URLs
      else if (sketchDataUrl.startsWith('data:')) {
        const [mediaTypeWithEncoding, base64Data] = sketchDataUrl.split(',');
        const mediaType = mediaTypeWithEncoding.split(':')[1].split(';')[0];
        
        contentItems.push({
          type: "image",
          source: {
            type: "base64",
            media_type: mediaType,
            data: base64Data
          }
        });
      }
      
      // Add instructions for the image
      contentItems.push({
        type: "text",
        text: "Above is a visual representation of the invention idea. Please analyze it alongside the textual description."
      });
    }

    console.log(`Sending request to Anthropic API for ${analysisType || "comprehensive"} analysis...`);

    // Make request to Anthropic API with a larger max_tokens
    const systemPrompt = getSystemPrompt(analysisType);
    
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      system: systemPrompt,
      max_tokens: 4000, // Increased to allow for more detailed responses
      messages: [
        { 
          role: "user", 
          content: contentItems
        }
      ],
      temperature: 0.7,
    });

    console.log("Received response from Anthropic API");

    // Process the response based on analysis type
    const processedResponse = processResponse(response.content[0].text, analysisType);

    return new Response(JSON.stringify(processedResponse), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in analyze-invention function:", error);
    
    return new Response(
      JSON.stringify({ error: `Error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

function getAnalysisTypeInstructions(analysisType: string): string {
  switch (analysisType) {
    case "technical":
      return "\n\nFocus on technical feasibility, engineering challenges, and implementation requirements.";
    case "users":
      return "\n\nFocus on target users, user experience, user needs, and potential user adoption challenges.";
    case "materials":
      return "\n\nFocus on materials requirements, sustainability, durability, and manufacturing considerations.";
    case "ip":
      return "\n\nFocus on intellectual property considerations, patentability, and potential legal challenges.";
    case "competition":
      return "\n\nFocus on competitive landscape, market positioning, and differentiation strategy.";
    case "challenges":
      return "\n\nFocus on potential obstacles, risks, and challenges that might impact development or adoption.";
    default:
      return "\n\nProvide a comprehensive analysis covering technical, market, legal, and business aspects. Be thorough and detailed in your analysis.";
  }
}

function getSystemPrompt(analysisType: string): string {
  const basePrompt = "You are an expert innovation analyst with deep expertise in technology, business, and market analysis. ";
  
  switch (analysisType) {
    case "technical":
      return basePrompt + "Focus on engineering feasibility, technical innovations, and implementation details.";
    case "users":
      return basePrompt + "Focus on user experience, user needs, and adoption considerations.";
    case "materials":
      return basePrompt + "Focus on materials science, manufacturing processes, and sustainability.";
    case "ip":
      return basePrompt + "Focus on intellectual property, patent strategy, and legal considerations.";
    case "competition":
      return basePrompt + "Focus on competitive analysis, market positioning, and differentiation.";
    case "challenges":
      return basePrompt + "Focus on identifying obstacles, risks, and potential failure points.";
    default:
      return basePrompt + "Provide a comprehensive analysis with actionable insights for the invention idea. Be thorough and detailed, as the inventor will use your analysis to improve their invention.";
  }
}

function processResponse(responseText: string, analysisType: string): any {
  // Try to parse JSON if it exists in the response
  try {
    const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                      responseText.match(/\{[\s\S]*\}/);
                      
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }
  } catch (error) {
    console.log("No valid JSON found in response, using text processing");
  }
  
  // Default processing based on analysis type
  if (analysisType === "technical") {
    return { technical: extractBulletPoints(responseText) };
  } else if (analysisType === "users") {
    return { users: extractBulletPoints(responseText) };
  } else if (analysisType === "materials") {
    return { materials: extractBulletPoints(responseText) };
  } else if (analysisType === "ip") {
    return { ip: extractBulletPoints(responseText) };
  } else if (analysisType === "competition") {
    return { competition: extractBulletPoints(responseText) };
  } else if (analysisType === "challenges") {
    return { challenges: extractBulletPoints(responseText) };
  } else {
    // Comprehensive analysis - extract sections
    return {
      technical: extractSectionContent(responseText, ["technical", "engineering", "technology", "implementation"]),
      market: extractSectionContent(responseText, ["market", "users", "customers", "audience"]),
      legal: extractSectionContent(responseText, ["legal", "ip", "intellectual property", "patent"]),
      business: extractSectionContent(responseText, ["business", "monetization", "revenue", "financial"])
    };
  }
}

function extractBulletPoints(text: string): string[] {
  // Extract all bullet points (lines starting with -, *, or number.)
  const bulletPoints = text.split("\n")
    .filter(line => /^(\s*[-*]\s|^\s*\d+\.\s)/.test(line))
    .map(line => line.replace(/^(\s*[-*]\s|\s*\d+\.\s)/, "").trim());
  
  // If no bullet points found, split by paragraphs
  if (bulletPoints.length === 0) {
    return text.split("\n\n")
      .filter(para => para.trim().length > 0)
      .map(para => para.trim());
  }
  
  return bulletPoints;
}

function extractSectionContent(text: string, keywords: string[]): string[] {
  const lines = text.split("\n");
  const results: string[] = [];
  let inRelevantSection = false;
  let currentSection = "";
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check if this is a heading
    if (line.startsWith("#")) {
      // If we were in a relevant section, save it
      if (inRelevantSection && currentSection.trim()) {
        results.push(currentSection.trim());
        currentSection = "";
      }
      
      // Check if this heading contains any of our keywords
      inRelevantSection = keywords.some(keyword => 
        line.toLowerCase().includes(keyword.toLowerCase()));
    } 
    
    // If we're in a relevant section, collect the content
    if (inRelevantSection && line) {
      currentSection += line + "\n";
    }
  }
  
  // Add the last section if relevant
  if (inRelevantSection && currentSection.trim()) {
    results.push(currentSection.trim());
  }
  
  // If no sections found, look for paragraphs containing keywords
  if (results.length === 0) {
    const paragraphs = text.split("\n\n");
    for (const paragraph of paragraphs) {
      if (keywords.some(keyword => paragraph.toLowerCase().includes(keyword.toLowerCase()))) {
        results.push(paragraph.trim());
      }
    }
  }
  
  // If still nothing found, just split the text into paragraphs
  if (results.length === 0) {
    return text.split("\n\n")
      .filter(para => para.trim().length > 0)
      .map(para => para.trim())
      .slice(0, 4); // Limit to first 4 paragraphs
  }
  
  return results;
}
