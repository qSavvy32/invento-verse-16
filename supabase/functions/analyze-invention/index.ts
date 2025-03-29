
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
    const { title, description, sketchDataUrl, analysisType, outputFormat } = await req.json();

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

    // Request markdown formatting
    if (outputFormat === "markdown") {
      systemPrompt += `
        Format your response using Markdown syntax:
        - Use **bold** for important points
        - Use *italics* for emphasis
        - Use bullet points for lists
        - Use \`code\` for technical terms
        - Structure your answer with clear sections
      `;
    }

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

    // Add instructions for output format based on analysis type
    if (analysisType === "technical") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "analysis_type": "invention_technical_analysis",
          "invention_title": "Title of the invention",
          "invention_description": "Brief description of the invention",
          "technical": [
            "First technical point with **markdown** formatting",
            "Second technical point with *emphasis* where needed"
          ],
          "technical_feasibility": {
            "assessment": "low|medium|high",
            "explanation": "Explanation of technical feasibility assessment"
          },
          "engineering_challenges": [
            {
              "challenge": "Name of the challenge",
              "description": "Detailed description of the challenge with markdown formatting"
            }
          ],
          "design_considerations": [
            {
              "consideration": "Name of the consideration",
              "description": "Description of the design consideration"
            }
          ]
        }
      `;
    } else if (analysisType === "challenges") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "technical": [
            "First challenge with **markdown** formatting",
            "Second challenge with *emphasis* where needed"
          ],
          "key_challenges": [
            {
              "challenge": "Name of the first challenge",
              "description": "Detailed description of the challenge with markdown formatting"
            },
            ... more challenges
          ]
        }
      `;
    } else if (analysisType === "materials") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "technical": [
            "First material suggestion with **markdown** formatting",
            "Second material suggestion with *emphasis* where needed"
          ],
          "materials_analysis": {
            "primary_materials": [
              {
                "material": "Name of material",
                "rationale": "Why this material is appropriate with markdown formatting"
              }
            ],
            "alternative_materials": [
              {
                "material": "Alternative material",
                "pros": "Benefits of this alternative with markdown",
                "cons": "Drawbacks of this alternative with markdown"
              }
            ]
          }
        }
      `;
    } else if (analysisType === "users") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "market": [
            "First user insight with **markdown** formatting",
            "Second user insight with *emphasis* where needed"
          ],
          "user_analysis": {
            "target_user_groups": [
              {
                "group_name": "Name of user group",
                "description": "Description of the user group with markdown formatting"
              }
            ],
            "primary_user_group": {
              "group_name": "Primary user group",
              "needs_addressed": [
                "First need addressed by the invention with markdown",
                "Second need addressed by the invention with markdown"
              ]
            }
          }
        }
      `;
    } else if (analysisType === "competition") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "market": [
            "First market insight with **markdown** formatting",
            "Second market insight with *emphasis* where needed" 
          ],
          "competitive_analysis": {
            "key_competitors": [
              {
                "name": "Competitor name",
                "description": "Description with markdown formatting",
                "strengths": ["Strength 1", "Strength 2"],
                "weaknesses": ["Weakness 1", "Weakness 2"]
              }
            ],
            "market_positioning": "Suggested market positioning with markdown",
            "differentiators": [
              "First differentiator with markdown formatting",
              "Second differentiator with markdown formatting"
            ]
          }
        }
      `;
    } else if (analysisType === "ip") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "legal": [
            "First IP insight with **markdown** formatting",
            "Second IP insight with *emphasis* where needed"
          ],
          "ip_analysis": {
            "patentability": {
              "assessment": "low|medium|high",
              "explanation": "Explanation with markdown formatting"
            },
            "similar_patents": [
              {
                "description": "Description of similar patent with markdown",
                "relevance": "How it relates to this invention"
              }
            ],
            "protection_strategies": [
              "First protection strategy with markdown",
              "Second protection strategy with markdown"
            ]
          }
        }
      `;
    } else if (analysisType === "comprehensive") {
      systemPrompt += `
        Return your analysis in this JSON format:
        {
          "technical": [
            "First technical insight with **markdown** formatting",
            "Second technical insight with *emphasis* where needed"
          ],
          "market": [
            "First market insight with **markdown** formatting",
            "Second market insight with *emphasis* where needed"
          ],
          "legal": [
            "First legal insight with **markdown** formatting",
            "Second legal insight with *emphasis* where needed"
          ],
          "business": [
            "First business strategy with **markdown** formatting",
            "Second business strategy with *emphasis* where needed"
          ]
        }
      `;
    } else {
      systemPrompt += `\n\nOutput your analysis in a structured JSON format with insights formatted in markdown.`;
    }

    // Prepare user message with invention details
    let userMessage = `Here's my invention idea:\n\nTitle: ${title || "Untitled"}\nDescription: ${description || "No description provided"}`;

    if (sketchDataUrl) {
      userMessage += `\n\nI've also created a sketch of the invention which you can analyze.`;
    }

    userMessage += `\n\nPlease provide a detailed ${analysisType} analysis of this invention idea.`;

    console.log(`Sending request to Anthropic API for ${analysisType} analysis...`);

    // Make request to Anthropic API - correct format with system as a top-level parameter
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
        console.log("Successfully parsed JSON response");
      } else {
        // If no JSON found, convert the full text response into structured format
        console.log("No JSON found in response, converting text to structured format");
        
        // Split by lines and filter out empty lines
        const lines = response.content[0].text
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[•\-*]\s*/, '')); // Remove bullet points
          
        // Create structured response based on analysis type
        if (analysisType === "technical" || analysisType === "challenges" || analysisType === "materials") {
          analysisResults = {
            technical: lines
          };
        } else if (analysisType === "users" || analysisType === "competition") {
          analysisResults = {
            market: lines
          };
        } else if (analysisType === "ip" || analysisType === "regulatory") {
          analysisResults = {
            legal: lines
          };
        } else {
          // For comprehensive analysis, split into categories
          const third = Math.ceil(lines.length / 3);
          analysisResults = {
            technical: lines.slice(0, third),
            market: lines.slice(third, 2 * third),
            legal: lines.slice(2 * third)
          };
        }
      }
    } catch (error) {
      console.error("Error parsing JSON from Anthropic response:", error);
      
      // Create a basic structured response with the raw text
      const lines = response.content[0].text
        .split('\n')
        .filter(line => line.trim().length > 0)
        .map(line => line.replace(/^[•\-*]\s*/, '')); // Remove bullet points
      
      if (analysisType === "technical" || analysisType === "challenges" || analysisType === "materials") {
        analysisResults = {
          technical: lines
        };
      } else if (analysisType === "users" || analysisType === "competition") {
        analysisResults = {
          market: lines
        };
      } else if (analysisType === "ip" || analysisType === "regulatory") {
        analysisResults = {
          legal: lines
        };
      } else {
        // For comprehensive analysis, split into categories
        const third = Math.ceil(lines.length / 3);
        analysisResults = {
          technical: lines.slice(0, third),
          market: lines.slice(third, 2 * third),
          legal: lines.slice(2 * third)
        };
      }
    }

    // Ensure we're returning a consistent data structure
    // If we have a specialized format, normalize it to the standard structure
    if (analysisType === "challenges" && analysisResults.key_challenges) {
      const technicalResults = analysisResults.key_challenges.map((challenge: any) => 
        typeof challenge === 'string' ? challenge : `**${challenge.challenge || 'Challenge'}**: ${challenge.description || ''}`
      );
      
      analysisResults = {
        technical: technicalResults
      };
    } 
    // For materials analysis, transform the response
    else if (analysisType === "materials" && analysisResults.materials_analysis) {
      const technicalResults = [
        ...(analysisResults.materials_analysis.primary_materials || []).map((m: any) => 
          `**${m.material}**: ${m.rationale}`
        ),
        ...(analysisResults.materials_analysis.alternative_materials || []).map((m: any) => 
          `**Alternative**: *${m.material}* - Pros: ${m.pros}, Cons: ${m.cons}`
        )
      ];
      
      analysisResults = {
        technical: technicalResults
      };
    }
    // User analysis transformation
    else if (analysisType === "users" && analysisResults.user_analysis) {
      const marketResults = [];
      
      // Add primary user group info
      if (analysisResults.user_analysis.primary_user_group) {
        const primary = analysisResults.user_analysis.primary_user_group;
        marketResults.push(`**Primary users**: ${primary.group_name || 'Unknown'}`);
        
        if (primary.needs_addressed && Array.isArray(primary.needs_addressed)) {
          primary.needs_addressed.forEach((need: string) => {
            marketResults.push(`- *Need*: ${need}`);
          });
        }
      }
      
      // Add target user groups
      if (analysisResults.user_analysis.target_user_groups && Array.isArray(analysisResults.user_analysis.target_user_groups)) {
        analysisResults.user_analysis.target_user_groups.forEach((group: any) => {
          marketResults.push(`**User group**: *${group.group_name}* - ${group.description || ''}`);
        });
      }
      
      analysisResults = {
        market: marketResults
      };
    }
    // Add markdown formatting to any plain text arrays
    Object.keys(analysisResults).forEach(key => {
      if (Array.isArray(analysisResults[key])) {
        analysisResults[key] = analysisResults[key].map((item: string) => {
          // If item doesn't already have markdown formatting, add some basic formatting
          if (typeof item === 'string' && !item.includes('**') && !item.includes('*') && !item.includes('`')) {
            // Add bold to the beginning of the text or to key phrases
            return item.replace(/^([^:]+):/, '**$1**:').replace(/\b(important|critical|key|essential)\b/gi, '**$1**');
          }
          return item;
        });
      }
    });

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
