
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ExpertFeedbackRequest {
  title: string;
  description: string;
  sketchDataUrl?: string;
  language?: string;
}

interface ExpertFeedback {
  design: string[];
  functionality: string[];
  market: string[];
  technical: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description, sketchDataUrl, language = "eng" } = await req.json() as ExpertFeedbackRequest;
    
    // Map language code to full language name
    const languageMap: Record<string, string> = {
      eng: "English",
      spa: "Spanish",
      fra: "French",
      deu: "German",
      ita: "Italian",
      por: "Portuguese",
      pol: "Polish",
      tur: "Turkish",
      rus: "Russian",
      nld: "Dutch",
      cze: "Czech",
      ara: "Arabic",
      hin: "Hindi",
      jpn: "Japanese",
      cmn: "Chinese",
      kor: "Korean"
    };
    
    const languageName = languageMap[language] || "English";
    
    // Build expert panel prompt
    const prompt = `
You are a panel of expert advisors, a Mixture of Experts (MoE), designed to help the user develop their invention concept. Your goal is to ask insightful and well-thought-out questions based on the user's provided information to guide them through the invention process.

Here are the areas of expertise represented in this panel:

* **Design Expert:** Focuses on the visual aspects, usability, and aesthetics of the invention.
* **Functionality Expert:** Focuses on how the invention works, its features, and its intended use.
* **Market Analyst:** Focuses on the potential market for the invention, its target audience, and its competitive landscape.
* **Technical Feasibility Expert:** Focuses on the practical aspects of building and implementing the invention, including materials, technology, and potential challenges.

**Instructions for the Panel:**

1.  **Consume All Data:** Carefully review all the information from the user's current session. This includes:
    * The text entered in the 'Title' field: "${title}"
    * The detailed description provided in the 'Description' field: "${description}"

2.  **Ask Targeted Questions:** Based on your area of expertise and the user's data, formulate one or two key questions that will help the user further develop their invention concept. Ensure your questions are specific, open-ended, and encourage detailed responses.

3.  **Well-Thought-Out Questions:** Avoid simple yes/no questions. Instead, aim for questions that require the user to think critically about their invention from different perspectives.

4.  **Focus on Clarity and Detail:** Encourage the user to provide clear and detailed answers to your questions.

5.  **Respond in ${languageName}:** Make sure to generate all your questions in ${languageName}.

**Format your response as a JSON object with the following structure:**
{
  "design": ["Question 1", "Question 2"],
  "functionality": ["Question 1", "Question 2"],
  "market": ["Question 1", "Question 2"],
  "technical": ["Question 1", "Question 2"]
}

**Panel of Experts, please begin your inquiries, each focusing on your area of expertise and referencing the user's provided information where possible.**
`;

    let response;
    
    // If we have an image, use multimodal analysis
    if (sketchDataUrl) {
      const imageBase64 = sketchDataUrl.split(',')[1];
      
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                },
                {
                  inline_data: {
                    mime_type: "image/png",
                    data: imageBase64
                  }
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
            topK: 32,
            topP: 0.95
          }
        }),
      });
    } else {
      // Text-only analysis
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024,
            topK: 32,
            topP: 0.95
          }
        }),
      });
    }

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API returned ${response.status}: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    console.log("Generated expert feedback successfully");
    
    // Try to extract JSON from the response
    let expertFeedback: ExpertFeedback;
    
    try {
      // Try to find JSON content within the response
      const jsonRegex = /{[\s\S]*?}/;
      const match = generatedText.match(jsonRegex);
      
      if (match) {
        const jsonString = match[0];
        expertFeedback = JSON.parse(jsonString);
      } else {
        // Fallback: manual extraction
        const extractQuestions = (text: string, expertType: string): string[] => {
          const regex = new RegExp(`${expertType}[:\\s]*(.*?)(?=\\*\\*|$)`, 's');
          const match = text.match(regex);
          
          if (match && match[1]) {
            // Extract questions that end with a question mark
            const questions = match[1]
              .split(/\n/)
              .filter(line => line.trim().endsWith('?'))
              .map(line => line.trim());
            
            if (questions.length > 0) {
              return questions;
            }
            
            // If no question marks found, just return all non-empty lines
            return match[1]
              .split(/\n/)
              .map(line => line.trim())
              .filter(line => line.length > 0 && !line.startsWith('*'));
          }
          
          return [];
        };
        
        expertFeedback = {
          design: extractQuestions(generatedText, "Design Expert"),
          functionality: extractQuestions(generatedText, "Functionality Expert"),
          market: extractQuestions(generatedText, "Market Analyst"),
          technical: extractQuestions(generatedText, "Technical Feasibility Expert")
        };
      }
    } catch (error) {
      console.error("Error parsing expert feedback:", error);
      // Provide default structure if parsing fails
      expertFeedback = {
        design: ["What visual design elements are most important for your invention?"],
        functionality: ["How does your invention solve the problem you've identified?"],
        market: ["Who is the target audience for your invention?"],
        technical: ["What materials or technologies would be required to build your invention?"]
      };
    }
    
    return new Response(
      JSON.stringify({
        feedback: expertFeedback,
        rawText: generatedText
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in panel-of-experts function:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An unexpected error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
