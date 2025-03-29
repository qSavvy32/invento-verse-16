
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
  Save,
  Download
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvention } from "@/contexts/InventionContext";
import { MarkdownContent } from "./invention/analysis/MarkdownContent";
import PixelCard from "./ui/PixelCard";

export const DevilsAdvocate = () => {
  const { state, saveToDatabase } = useInvention();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [critiques, setCritiques] = useState<Record<string, string[]> | null>(null);
  
  // Check if an idea is present
  const hasIdea = Boolean(state.title || state.description);
  
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
  
  // Only show if there's an idea
  if (!hasIdea) {
    return null;
  }
  
  return (
    <div className="space-y-6 flex flex-col items-center w-full">
      {error && (
        <Alert variant="destructive" className="w-full">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <PixelCard 
        variant="pink" 
        className="w-full"
        onClick={generateCritique}
        active={isAnalyzing}
      >
        <div className="p-4 text-center">
          {isAnalyzing ? (
            <>
              <Loader2Icon className="mx-auto h-6 w-6 animate-spin mb-2" />
              <h3 className="font-bold text-lg">Generating critique...</h3>
            </>
          ) : (
            <>
              <Skull className="mx-auto h-6 w-6 mb-2" />
              <h3 className="font-bold text-lg">Devil's Advocate Critique</h3>
              <p className="text-sm opacity-80">Challenge your assumptions</p>
            </>
          )}
        </div>
      </PixelCard>
      
      {critiques && (
        <Card className="border-red-200 bg-red-50 w-full">
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
      
      {/* Save Your Work Section - moved from InventionForm */}
      <div className="border rounded-lg p-4 w-full mt-6">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Save Your Work</h2>
          <div className="space-x-4">
            <Button onClick={() => saveToDatabase(true)}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={() => {
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", `invention-${state.title || 'untitled'}.json`);
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
              
              toast.success("Export successful", {
                description: "Your invention has been exported as JSON.",
              });
            }}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
