
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvention } from "@/contexts/InventionContext";
import { GeminiService } from "@/services/GeminiService";

export interface ExpertFeedback {
  design: string[];
  functionality: string[];
  market: string[];
  technical: string[];
}

export const useExpertFeedbackGeneration = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<ExpertFeedback | null>(null);
  const { state, updateMostRecentGeneration } = useInvention();

  const generateFeedback = async (
    title: string,
    description: string,
    sketchDataUrl: string | null,
    language: string = "eng"
  ) => {
    if (!title && !description && !sketchDataUrl) {
      toast.error("Please provide some information about your invention first");
      return;
    }

    setIsAnalyzing(true);
    setError(null);

    try {
      toast.loading("Our panel of experts is analyzing your invention...", {
        id: "expert-feedback",
      });

      const prompt = buildExpertPrompt(title, description, language);
      let imageData = null;
      
      if (sketchDataUrl) {
        // Convert data URL to base64
        const base64Data = sketchDataUrl.split(',')[1];
        imageData = base64Data;
      }
      
      let expertFeedback: ExpertFeedback | null = null;
      
      if (imageData) {
        // If we have an image, use multimodal analysis
        const result = await GeminiService.analyzeFile(
          prompt,
          sketchDataUrl!,
          "image/png"
        );
        
        expertFeedback = parseExpertFeedback(result.analysis);
      } else {
        // Text-only analysis
        const result = await GeminiService.generateText(prompt);
        
        expertFeedback = parseExpertFeedback(result.text);
      }
      
      if (expertFeedback) {
        setFeedback(expertFeedback);
        updateMostRecentGeneration({
          type: 'expert-feedback',
          data: expertFeedback,
          timestamp: Date.now()
        });
        
        toast.success("Expert feedback generated", {
          id: "expert-feedback",
          description: "Our panel of experts has analyzed your invention",
        });
      } else {
        throw new Error("Failed to parse expert feedback");
      }
    } catch (err) {
      console.error("Error generating expert feedback:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate expert feedback. Please try again."
      );
      toast.error("Failed to generate expert feedback", {
        id: "expert-feedback",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    error,
    feedback,
    generateFeedback,
  };
};

// Helper function to build the expert prompt
const buildExpertPrompt = (title: string, description: string, language: string = "eng") => {
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
  
  return `
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
};

// Helper function to parse expert feedback from response
const parseExpertFeedback = (response: string): ExpertFeedback | null => {
  try {
    // Try to find JSON content within the response
    const jsonRegex = /{[\s\S]*?}/;
    const match = response.match(jsonRegex);
    
    if (match) {
      const jsonString = match[0];
      const feedback = JSON.parse(jsonString);
      
      // Validate the expected structure
      if (
        feedback &&
        Array.isArray(feedback.design) &&
        Array.isArray(feedback.functionality) &&
        Array.isArray(feedback.market) &&
        Array.isArray(feedback.technical)
      ) {
        return feedback;
      }
    }
    
    // Fallback: if we can't get a proper JSON structure, try to extract sections manually
    const designQuestions = extractQuestions(response, "Design Expert");
    const functionalityQuestions = extractQuestions(response, "Functionality Expert");
    const marketQuestions = extractQuestions(response, "Market Analyst");
    const technicalQuestions = extractQuestions(response, "Technical Feasibility Expert");
    
    return {
      design: designQuestions,
      functionality: functionalityQuestions,
      market: marketQuestions,
      technical: technicalQuestions
    };
  } catch (err) {
    console.error("Error parsing expert feedback:", err);
    return null;
  }
};

// Helper function to extract questions from text sections
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
