
import { useState } from "react";
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
  PieChartIcon
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { captureException } from "@/integrations/sentry";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VoiceInput } from "./VoiceInput";

interface IdeaGeneratorProps {
  sketchDataUrl?: string;
}

export const IdeaGenerator = ({ sketchDataUrl }: IdeaGeneratorProps) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string | null>(null);
  
  const handleVoiceTranscription = (text: string) => {
    setDescription(prev => {
      // If there's already text, append the new text with a space
      if (prev.trim()) {
        return `${prev} ${text}`;
      }
      return text;
    });
  };
  
  // Generate ideas using Anthropic
  const generateIdeas = async () => {
    if (!description.trim() && !sketchDataUrl) {
      toast.error("Please provide a description or sketch of your invention idea");
      return;
    }
    
    setIsGenerating(true);
    setError(null);
    
    try {
      // Call our Supabase Edge Function for idea generation
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: "Idea Generation",
          description: description,
          sketchDataUrl: sketchDataUrl,
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
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="description">Describe your invention idea</Label>
          <VoiceInput onTranscriptionComplete={handleVoiceTranscription} />
        </div>
        <Textarea
          id="description"
          placeholder="Describe what problem your invention solves and how it works..."
          className="h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {sketchDataUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Your sketch:</p>
            <img 
              src={sketchDataUrl} 
              alt="Your sketch" 
              className="max-h-64 border rounded-md" 
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
        onClick={generateIdeas} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Generating ideas...
          </>
        ) : (
          <>
            <LightbulbIcon className="mr-2 h-4 w-4" />
            Generate Ideas
          </>
        )}
      </Button>
      
      {Object.keys(generatedIdeas).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <CodeIcon className="h-5 w-5" />
                Technical Insights
              </CardTitle>
              <CardDescription>Engineering and design considerations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {generatedIdeas.technical.map((idea, index) => (
                  <li key={`tech-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Market Analysis
              </CardTitle>
              <CardDescription>Potential market and audience insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {generatedIdeas.market.map((idea, index) => (
                  <li key={`market-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <AwardIcon className="h-5 w-5" />
                Intellectual Property
              </CardTitle>
              <CardDescription>Patent and legal considerations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {generatedIdeas.legal.map((idea, index) => (
                  <li key={`legal-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <BookIcon className="h-5 w-5" />
                Business Strategy
              </CardTitle>
              <CardDescription>Monetization and business recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {generatedIdeas.business.map((idea, index) => (
                  <li key={`business-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
