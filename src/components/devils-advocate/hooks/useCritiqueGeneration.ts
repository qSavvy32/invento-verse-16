
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export type CritiquesData = {
  technical: string[];
  market: string[];
  originality: string[];
  consequences: string[];
} | null;

export function useCritiqueGeneration() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [critiques, setCritiques] = useState<CritiquesData>(null);

  const generateCritique = async (title: string, description: string, sketchDataUrl?: string) => {
    if (!title && !description) {
      toast.error("Please provide a title or description of your invention idea");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call our Supabase Edge Function for critique generation
      const { data, error } = await supabase.functions.invoke("devils-advocate", {
        body: {
          title,
          description,
          sketchDataUrl
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Devil's advocate critique result:", data);
      
      // Process the critique data
      const processedCritiques = {
        technical: data.technical_feasibility || [],
        market: data.market_reality || [],
        originality: data.originality || [],
        consequences: data.unintended_consequences || []
      };
      
      setCritiques(processedCritiques);
      toast.success("Devil's Advocate critique generated");
    } catch (error) {
      console.error("Error generating critique:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      toast.error("Failed to generate critique", {
        description: errorMessage
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    critiques,
    isAnalyzing,
    error,
    generateCritique
  };
}
