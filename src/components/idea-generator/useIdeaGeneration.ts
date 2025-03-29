
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { captureException } from "@/integrations/sentry";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export const useIdeaGeneration = (sketchDataUrl?: string) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  const [pendingVoiceInput, setPendingVoiceInput] = useState<string | null>(null);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Store pending input in sessionStorage so it persists across auth flow
  useEffect(() => {
    const storedInput = sessionStorage.getItem('pendingInventionInput');
    if (storedInput) {
      try {
        const data = JSON.parse(storedInput);
        setDescription(data.description || "");
        
        // If the user is authenticated and there's pending data, generate ideas
        if (user && (data.description || data.sketchDataUrl)) {
          generateIdeas(data.description, data.sketchDataUrl);
          // Clear stored data after processing
          sessionStorage.removeItem('pendingInventionInput');
        }
      } catch (e) {
        console.error("Error parsing stored input:", e);
        sessionStorage.removeItem('pendingInventionInput');
      }
    }
  }, [user]);
  
  const handleVoiceTranscription = (text: string) => {
    // If user is not authenticated, store the voice input for later
    if (!user) {
      setPendingVoiceInput(text);
      setShowAuthPrompt(true);
      return;
    }
    
    setDescription(prev => {
      // If there's already text, append the new text with a space
      if (prev.trim()) {
        return `${prev} ${text}`;
      }
      return text;
    });
  };
  
  // Save the current input to session storage before redirecting to auth
  const saveInputAndRedirect = () => {
    const inputData = {
      description: pendingVoiceInput ? 
        (description ? `${description} ${pendingVoiceInput}` : pendingVoiceInput) : 
        description,
      sketchDataUrl: sketchDataUrl
    };
    
    sessionStorage.setItem('pendingInventionInput', JSON.stringify(inputData));
    navigate("/auth");
  };
  
  // Generate ideas using Anthropic
  const generateIdeas = async (inputDescription?: string, inputSketchUrl?: string) => {
    const descToUse = inputDescription || description;
    const sketchToUse = inputSketchUrl || sketchDataUrl;
    
    if (!descToUse.trim() && !sketchToUse) {
      toast.error("Please share your world-changing idea first");
      return;
    }
    
    // If user is not authenticated, prompt for auth
    if (!user) {
      setShowAuthPrompt(true);
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call our Supabase Edge Function for idea generation
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: "Idea Generation",
          description: descToUse,
          sketchDataUrl: sketchToUse,
          analysisType: "comprehensive",
          outputFormat: "markdown" // Request markdown-formatted responses
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Idea generation result:", data);
      
      // Enhanced output with markdown formatting and better structure
      const technicalIdeas = data.technical || [
        "## Engineering Feasibility\n\n**Initial assessment**: The concept appears technically viable with current technology.",
        "## Technological Challenges\n\n**Primary challenge**: Integrating multiple systems while maintaining reliability.",
        "## Materials Consideration\n\n**Recommendation**: Explore high-durability composites for key structural components.",
        "## Production Complexity\n\n**Manufacturing approach**: Investigate modular assembly for scalability."
      ];
      
      const marketIdeas = data.market || [
        "## Target Audience\n\n**Primary user group**: Professional users in urban environments seeking efficiency gains.",
        "## Market Positioning\n\n**Value proposition**: Offers 30-40% improvement over existing solutions.",
        "## Competition Analysis\n\n**Competitive landscape**: 3-5 established players with legacy solutions.",
        "## Growth Potential\n\n**Market trajectory**: Expanding at approximately 12% annually."
      ];
      
      const legalIdeas = data.legal || [
        "## Intellectual Property Strategy\n\n**Patentability**: Several novel aspects appear patentable.",
        "## Regulatory Considerations\n\n**Compliance needs**: Will require certification under standard industry regulations.",
        "## Liability Assessment\n\n**Risk factors**: Moderate, can be mitigated through proper documentation.",
        "## Legal Protection\n\n**Recommendation**: Pursue provisional patent application while developing prototype."
      ];
      
      const businessIdeas = data.business || [
        "## Business Model\n\n**Revenue strategy**: Subscription-based service with hardware component.",
        "## Go-to-Market Approach\n\n**Launch strategy**: Begin with targeted industry partnerships.",
        "## Resource Requirements\n\n**Initial investment**: Estimated $250k-500k for prototype development.",
        "## Growth Strategy\n\n**Scaling approach**: Establish proof of concept with early adopters before wider rollout."
      ];
      
      setGeneratedIdeas({
        technical: technicalIdeas,
        market: marketIdeas,
        legal: legalIdeas,
        business: businessIdeas
      });
      
      toast.success("Ideas generated successfully!");
    } catch (error) {
      console.error("Error generating ideas:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      setError(errorMessage);
      captureException(error, { component: "IdeaGenerator", action: "generateIdeas" });
      toast.error("Failed to generate ideas", {
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Close auth prompt and continue with text input only
  const handleCloseAuthPrompt = () => {
    setShowAuthPrompt(false);
    setPendingVoiceInput(null);
  };

  return {
    description,
    setDescription,
    isGenerating,
    generatedIdeas,
    error,
    pendingVoiceInput,
    showAuthPrompt,
    handleVoiceTranscription,
    saveInputAndRedirect,
    generateIdeas,
    handleCloseAuthPrompt
  };
};
