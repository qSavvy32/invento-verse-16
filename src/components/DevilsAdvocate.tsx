
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Loader2Icon,
  AlertTriangleIcon,
  ZapIcon,
  UsersIcon,
  LightbulbIcon,
  ShieldAlertIcon,
  Skull,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvention } from "@/contexts/InventionContext";
import { MarkdownContent } from "./invention/analysis/MarkdownContent";

export const DevilsAdvocate = () => {
  const { state } = useInvention();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [critiques, setCritiques] = useState<Record<string, string[]> | null>(null);
  
  const generateCritique = async () => {
    if (!state.title && !state.description) {
      toast.error("Please provide a title or description of your invention idea");
      return;
    }
    
    setIsAnalyzing(true);
    setError(null);
    
    try {
      // Call our Supabase Edge Function for critique generation
      const { data, error } = await supabase.functions.invoke("devils-advocate", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
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
  
  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={generateCritique} 
        disabled={isAnalyzing}
        className="w-full"
        variant="outline"
      >
        {isAnalyzing ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Generating critique...
          </>
        ) : (
          <>
            <Skull className="mr-2 h-4 w-4" />
            Devil's Advocate Critique
          </>
        )}
      </Button>
      
      {critiques && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <Skull className="h-5 w-5" />
              Devil's Advocate Critique 💀
            </CardTitle>
            <CardDescription>Challenging your assumptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 critique-content">
              <div>
                <h3 className="font-semibold flex items-center gap-1 text-red-800">
                  <ZapIcon className="h-4 w-4" /> 💥 Technical Feasibility 💥
                </h3>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {critiques.technical.map((critique, index) => (
                    <li key={`tech-${index}`} className="text-red-700">
                      <MarkdownContent content={critique} />
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold flex items-center gap-1 text-red-800">
                  <UsersIcon className="h-4 w-4" /> 🚫 Market Reality 🚫
                </h3>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {critiques.market.map((critique, index) => (
                    <li key={`market-${index}`} className="text-red-700">
                      <MarkdownContent content={critique} />
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold flex items-center gap-1 text-red-800">
                  <LightbulbIcon className="h-4 w-4" /> ⚠️ Originality ⚠️
                </h3>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {critiques.originality.map((critique, index) => (
                    <li key={`orig-${index}`} className="text-red-700">
                      <MarkdownContent content={critique} />
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold flex items-center gap-1 text-red-800">
                  <ShieldAlertIcon className="h-4 w-4" /> 🔥 Unintended Consequences 🔥
                </h3>
                <ul className="list-disc pl-5 space-y-1 mt-1">
                  {critiques.consequences.map((critique, index) => (
                    <li key={`conseq-${index}`} className="text-red-700">
                      <MarkdownContent content={critique} />
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
