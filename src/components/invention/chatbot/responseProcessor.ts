
import { AnalysisStructuredData } from "./types";

export const processGeminiResponse = (response: any): { 
  displayText: string; 
  structuredData?: AnalysisStructuredData;
} => {
  // Extract the raw text from the Gemini response
  let rawText = "";
  
  if (typeof response === "string") {
    rawText = response;
  } else if (response && response.text) {
    rawText = response.text;
  } else if (response && response.response) {
    rawText = response.response;
  } else {
    return { displayText: "I couldn't process the response properly. Let's continue." };
  }
  
  // Check if there's a JSON block in the response
  let structuredData: AnalysisStructuredData | undefined;
  let displayText = rawText;
  
  try {
    // Try to extract JSON from the text if it exists
    const jsonMatch = rawText.match(/```json\n([\s\S]*?)\n```/) || 
                       rawText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      const jsonText = jsonMatch[1] || jsonMatch[0];
      structuredData = JSON.parse(jsonText.trim());
      
      // Remove the JSON block from the display text
      displayText = rawText.replace(/```json\n[\s\S]*?\n```/, "").trim();
      displayText = displayText.replace(/\{[\s\S]*\}/, "").trim();
    }
  } catch (error) {
    console.error("Error parsing structured data:", error);
    // Continue with the original text if JSON parsing fails
  }
  
  return { displayText, structuredData };
};
