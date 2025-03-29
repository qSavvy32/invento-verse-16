import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useInvention } from "@/contexts/InventionContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { 
  Loader2,
  Users,
  Lightbulb,
  Scale,
  BarChart,
  Construction,
  Box,
  Inspect,
  Cube
} from "lucide-react";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, updateVisualizations, update3DVisualization, setAnalysisResults, setThreejsVisualization } = useInvention();
  const [selectedAnalysis, setSelectedAnalysis] = useState<string>("technical");
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    technical: false,
    challenges: false,
    materials: false,
    users: false,
    competition: false,
    ip: false,
    regulatory: false,
    visualization: false,
    threejs: false,
  });
  const [customPrompt, setCustomPrompt] = useState("");
  
  const runAnalysis = async (analysisType: string) => {
    // Don't proceed if there's not enough data
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, [analysisType]: true }));
    
    try {
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
          analysisType: analysisType,
          customPrompt: analysisType === "custom" ? customPrompt : undefined
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log(`Analysis result for ${analysisType}:`, data);
      
      // Add timestamp to the analysis results
      const timestamp = new Date().toLocaleTimeString();
      const results = Array.isArray(data[analysisType]) 
        ? data[analysisType].map((item: string) => `${item}`)
        : [];
      
      // Prepend timestamp and analysis type to the first result
      if (results.length > 0) {
        results[0] = `[${timestamp} - ${analysisType}] ${results[0]}`;
      }
      
      // Handle the response differently based on the analysis type
      if (analysisType === "technical") {
        setAnalysisResults("technical", [...state.analysisResults.technical, ...results]);
      } else if (analysisType === "challenges") {
        setAnalysisResults("technical", [...state.analysisResults.technical, ...results]);
      } else if (analysisType === "materials") {
        setAnalysisResults("technical", [...state.analysisResults.technical, ...results]);
      } else if (analysisType === "users") {
        setAnalysisResults("market", [...state.analysisResults.market, ...results]);
      } else if (analysisType === "competition") {
        setAnalysisResults("market", [...state.analysisResults.market, ...results]);
      } else if (analysisType === "ip") {
        setAnalysisResults("legal", [...state.analysisResults.legal, ...results]);
      } else if (analysisType === "regulatory") {
        setAnalysisResults("legal", [...state.analysisResults.legal, ...results]);
      } else if (analysisType === "comprehensive") {
        // Append to all categories
        if (data.technical) setAnalysisResults("technical", [...state.analysisResults.technical, ...data.technical]);
        if (data.market) setAnalysisResults("market", [...state.analysisResults.market, ...data.market]);
        if (data.legal) setAnalysisResults("legal", [...state.analysisResults.legal, ...data.legal]);
        if (data.business) setAnalysisResults("business", [...state.analysisResults.business, ...data.business]);
      }
      
      onAnalysisComplete();
      toast.success(`${analysisType} analysis complete`);
    } catch (error) {
      console.error(`Error running ${analysisType} analysis:`, error);
      toast.error(`Analysis failed`, {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, [analysisType]: false }));
    }
  };
  
  const generate3DVisualization = async () => {
    // Don't proceed if there's not enough data
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, visualization: true }));
    
    try {
      const promptData = {
        concept: state.description,
        materials: "",
        users: "",
        problem: ""
      };
      
      updateVisualizations(promptData);
      
      const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.visualization_url) {
        update3DVisualization(data.visualization_url);
        toast.success("3D visualization generated", {
          description: "View it in the 3D Visualization tab"
        });
      } else {
        throw new Error("No visualization URL returned");
      }
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast.error("Visualization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, visualization: false }));
    }
  };
  
  const generateThreejsVisualization = async () => {
    // Don't proceed if there's not enough data
    if (!state.title && !state.description) {
      toast.error("Please provide a title and description first");
      return;
    }
    
    setIsLoading(prev => ({ ...prev, threejs: true }));
    
    try {
      toast.info("Generating 3D visualization with Claude...", {
        description: "This may take a minute to complete"
      });
      
      const { data, error } = await supabase.functions.invoke("generate-threejs-visualization", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("ThreeJS visualization result:", data);
      
      if (data?.visualization_code && data?.visualization_html) {
        setThreejsVisualization(data.visualization_code, data.visualization_html);
        toast.success("ThreeJS visualization generated", {
          description: "The 3D model is now available below"
        });
      } else {
        throw new Error("No visualization code returned");
      }
    } catch (error) {
      console.error("Error generating ThreeJS visualization:", error);
      toast.error("ThreeJS visualization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(prev => ({ ...prev, threejs: false }));
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <Button 
          onClick={() => runAnalysis("technical")} 
          disabled={isLoading.technical}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.technical ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Construction className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Technical Analysis</div>
            <div className="text-xs text-muted-foreground">Feasibility and engineering</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("users")} 
          disabled={isLoading.users}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.users ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Users className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">User Analysis</div>
            <div className="text-xs text-muted-foreground">Target audience and needs</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("materials")} 
          disabled={isLoading.materials}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.materials ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Box className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Materials Analysis</div>
            <div className="text-xs text-muted-foreground">Components and materials</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("ip")} 
          disabled={isLoading.ip}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.ip ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Scale className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">IP Analysis</div>
            <div className="text-xs text-muted-foreground">Patent and legal issues</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("competition")} 
          disabled={isLoading.competition}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.competition ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <BarChart className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Market Analysis</div>
            <div className="text-xs text-muted-foreground">Competition and positioning</div>
          </div>
        </Button>
        
        <Button 
          onClick={() => runAnalysis("challenges")} 
          disabled={isLoading.challenges}
          variant="outline"
          className="flex items-center gap-2 h-auto py-2"
        >
          {isLoading.challenges ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Inspect className="h-4 w-4" />
          )}
          <div className="text-left">
            <div className="font-medium">Key Challenges</div>
            <div className="text-xs text-muted-foreground">Critical issues to solve</div>
          </div>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <Button 
          onClick={() => generate3DVisualization()} 
          disabled={isLoading.visualization}
          variant="outline"
          className="flex items-center"
        >
          {isLoading.visualization ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          <span>Generate AI Image</span>
        </Button>
        
        <Button
          onClick={() => generateThreejsVisualization()}
          disabled={isLoading.threejs}
          variant="outline"
          className="flex items-center"
        >
          {isLoading.threejs ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Cube className="mr-2 h-4 w-4" />
          )}
          <span>Generate 3D Visualization</span>
        </Button>
        
        <Button
          onClick={() => runAnalysis("comprehensive")}
          disabled={Object.values(isLoading).some(v => v)}
          variant="outline"
          className="flex items-center"
        >
          {Object.values(isLoading).some(v => v) ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          <span>Comprehensive Analysis</span>
        </Button>
      </div>
    </div>
  );
};
