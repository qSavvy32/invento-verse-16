
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  LightbulbIcon, 
  Loader2Icon,
  BookIcon,
  CodeIcon,
  AwardIcon,
  PieChartIcon,
  SparklesIcon,
  RocketIcon,
  ArrowRightIcon
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { captureException } from "@/integrations/sentry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VoiceInput } from "./VoiceInput";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { AuthPrompt } from "./AuthPrompt";

interface IdeaGeneratorProps {
  sketchDataUrl?: string;
}

export const IdeaGenerator = ({ sketchDataUrl }: IdeaGeneratorProps) => {
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
          analysisType: "comprehensive"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Idea generation result:", data);
      
      // Transform the comprehensive analysis into the four categories we need
      const technicalIdeas = [
        ...(data.key_features_list || []).slice(0, 4),
        ...(data.materials_components_ideas || []).slice(0, 4)
      ].slice(0, 4);
      
      const marketIdeas = [
        `Market: ${data.problem_solved || "No specific problem identified."}`,
        `Target audience: ${data.potential_target_users || "No specific users identified."}`,
        ...(data.suggested_next_steps || []).filter(step => 
          step.toLowerCase().includes("market") || 
          step.toLowerCase().includes("customer") || 
          step.toLowerCase().includes("user")
        )
      ].slice(0, 4);
      
      const legalIdeas = [
        ...(data.unclear_aspects_questions || []).filter(q => 
          q.toLowerCase().includes("patent") || 
          q.toLowerCase().includes("intellectual") || 
          q.toLowerCase().includes("legal") || 
          q.toLowerCase().includes("regulatory")
        ),
        "Consider filing a provisional patent application to secure an early filing date while continuing development.",
        "Document all development stages carefully for potential patent application evidence."
      ].slice(0, 4);
      
      const businessIdeas = [
        ...(data.suggested_next_steps || []).filter(step => 
          !step.toLowerCase().includes("market") && 
          !step.toLowerCase().includes("customer") && 
          !step.toLowerCase().includes("user")
        ),
        "Consider developing partnerships with established brands for market entry.",
        "Evaluate manufacturing costs and potential pricing strategies."
      ].slice(0, 4);
      
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
  
  return (
    <div className="py-16 px-6 bg-gradient-to-br from-invention-accent/10 to-invention-highlight/10 rounded-xl border border-invention-accent/20">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-invention-accent/20 rounded-full mb-2">
            <SparklesIcon className="h-8 w-8 text-invention-accent" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-leonardo text-invention-ink">Ignite Your Revolutionary Vision!</h2>
          <p className="text-lg text-invention-ink/80 max-w-2xl mx-auto">
            Every world-changing invention begins with a spark of imagination. What challenge will <span className="font-bold text-invention-accent">YOU</span> solve? How will your idea transform the future?
          </p>
        </div>
        
        <Card className="bg-white/70 backdrop-blur border-invention-accent/30 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl text-invention-ink flex items-center">
              <RocketIcon className="h-5 w-5 mr-2 text-invention-accent" />
              Your Groundbreaking Concept
            </CardTitle>
            <CardDescription>
              Share your vision, no matter how ambitious—we'll help bring it to life
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="description" className="text-invention-ink font-medium">What's your world-changing idea?</Label>
                <VoiceInput onTranscriptionComplete={handleVoiceTranscription} />
              </div>
              <Textarea
                id="description"
                placeholder="I envision a solution that... My invention would revolutionize... The global impact would be..."
                className="h-36 border-invention-accent/30 focus:border-invention-accent focus-visible:ring-invention-accent/20"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
              
              {sketchDataUrl && (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Your visual concept:</p>
                  <img 
                    src={sketchDataUrl} 
                    alt="Your concept visualization" 
                    className="max-h-64 border rounded-md shadow-sm" 
                  />
                </div>
              )}
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <Button 
              onClick={() => generateIdeas()} 
              disabled={isGenerating}
              className="w-full bg-invention-accent hover:bg-invention-accent/90 text-white font-medium shadow-sm group transition-all"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
                  Igniting Your Vision...
                </>
              ) : (
                <>
                  <LightbulbIcon className="mr-2 h-5 w-5" />
                  Transform Your Idea Into Reality
                  <ArrowRightIcon className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </CardContent>
        </Card>
        
        {Object.keys(generatedIdeas).length > 0 && (
          <div className="space-y-6">
            <h3 className="text-2xl font-leonardo font-semibold text-center text-invention-ink">Your Innovation Blueprint</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              <Card className="da-vinci-note border-invention-accent/20 shadow-md transform transition-transform hover:scale-[1.01]">
                <CardHeader className="pb-2 bg-invention-accent/10">
                  <CardTitle className="text-invention-ink flex items-center gap-2">
                    <CodeIcon className="h-5 w-5 text-invention-accent" />
                    Technical Insights
                  </CardTitle>
                  <CardDescription>Engineering and design considerations</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="list-disc pl-5 space-y-2 font-leonardo">
                    {generatedIdeas.technical.map((idea, index) => (
                      <li key={`tech-${index}`} className="text-invention-ink">{idea}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="da-vinci-note border-invention-accent/20 shadow-md transform transition-transform hover:scale-[1.01]">
                <CardHeader className="pb-2 bg-invention-accent/10">
                  <CardTitle className="text-invention-ink flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-invention-accent" />
                    Market Analysis
                  </CardTitle>
                  <CardDescription>Potential market and audience insights</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="list-disc pl-5 space-y-2 font-leonardo">
                    {generatedIdeas.market.map((idea, index) => (
                      <li key={`market-${index}`} className="text-invention-ink">{idea}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="da-vinci-note border-invention-accent/20 shadow-md transform transition-transform hover:scale-[1.01]">
                <CardHeader className="pb-2 bg-invention-accent/10">
                  <CardTitle className="text-invention-ink flex items-center gap-2">
                    <AwardIcon className="h-5 w-5 text-invention-accent" />
                    Intellectual Property
                  </CardTitle>
                  <CardDescription>Patent and legal considerations</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="list-disc pl-5 space-y-2 font-leonardo">
                    {generatedIdeas.legal.map((idea, index) => (
                      <li key={`legal-${index}`} className="text-invention-ink">{idea}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
              
              <Card className="da-vinci-note border-invention-accent/20 shadow-md transform transition-transform hover:scale-[1.01]">
                <CardHeader className="pb-2 bg-invention-accent/10">
                  <CardTitle className="text-invention-ink flex items-center gap-2">
                    <BookIcon className="h-5 w-5 text-invention-accent" />
                    Business Strategy
                  </CardTitle>
                  <CardDescription>Monetization and business recommendations</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <ul className="list-disc pl-5 space-y-2 font-leonardo">
                    {generatedIdeas.business.map((idea, index) => (
                      <li key={`business-${index}`} className="text-invention-ink">{idea}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
      
      {/* Auth Prompt Dialog */}
      {showAuthPrompt && (
        <AuthPrompt 
          onConfirm={saveInputAndRedirect}
          onCancel={handleCloseAuthPrompt}
        />
      )}
    </div>
  );
};
