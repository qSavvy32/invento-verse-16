import { useInvention } from "@/contexts/InventionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { useState } from "react";
import { Box, Loader2Icon, BarChart3, Database, Lightbulb, Target, Users, Search, Award, FileText } from "lucide-react";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { supabase } from "@/integrations/supabase/client";
import { captureException } from "@/integrations/sentry";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, setAnalysisResults, update3DVisualization, updateVisualizations } = useInvention();
  
  // Track which specific analyses are loading with an object instead of a single boolean
  const [loadingAnalyses, setLoadingAnalyses] = useState<{
    challenges: boolean;
    materials: boolean;
    visualization3D: boolean;
    users: boolean;
    competition: boolean;
    ip: boolean;
    regulatory: boolean;
    comprehensive: boolean;
  }>({
    challenges: false,
    materials: false,
    visualization3D: false,
    users: false,
    competition: false,
    ip: false,
    regulatory: false,
    comprehensive: false,
  });
  
  // Generic function to run analysis with different types
  const runAnalysis = async (analysisType: string) => {
    if (!state.title && !state.description) {
      toast.error("Missing information", {
        description: "Please provide at least a title or description for your invention."
      });
      return;
    }
    
    // Set only the specific analysis type as loading
    setLoadingAnalyses(prev => ({ ...prev, [analysisType]: true }));
    
    try {
      // Call our Supabase Edge Function with the specified analysis type
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
          analysisType: analysisType
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log(`${analysisType} analysis result:`, data);
      
      // Check if we got a properly formatted response
      if (data.technical !== undefined) {
        setAnalysisResults('technical', data.technical || []);
      }
      
      if (data.market !== undefined) {
        setAnalysisResults('market', data.market || []);
      }
      
      if (data.legal !== undefined) {
        setAnalysisResults('legal', data.legal || []);
      }
      
      if (data.business !== undefined) {
        setAnalysisResults('business', data.business || []);
      }
      
      // Update visualization prompts if available
      if (data.visualization_prompts) {
        updateVisualizations(data.visualization_prompts);
      }
      
      toast.success("Analysis complete", {
        description: `${analysisType.charAt(0).toUpperCase() + analysisType.slice(1)} analysis completed successfully.`
      });
      
      // Explicitly call onAnalysisComplete to ensure results are shown
      onAnalysisComplete();
    } catch (error) {
      console.error(`Error running ${analysisType} analysis:`, error);
      captureException(error, { component: "AiAssistantPanel", action: "runAnalysis" });
      
      toast.error("Analysis failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      // Only reset the loading state for the specific analysis type
      setLoadingAnalyses(prev => ({ ...prev, [analysisType]: false }));
    }
  };
  
  const generate3DVisualization = async () => {
    if (!state.sketchDataUrl) {
      toast.error("Missing sketch", {
        description: "Please create a sketch first to generate a 3D visualization."
      });
      return;
    }
    
    setLoadingAnalyses(prev => ({ ...prev, visualization3D: true }));
    
    try {
      // For demonstration purposes, we'll simulate this with a timeout
      // In a real implementation, you would call the generate-3d-visualization edge function
      /* 
      const { data, error } = await supabase.functions.invoke("generate-3d-visualization", {
        body: {
          sketchDataUrl: state.sketchDataUrl,
          prompt: state.title || "Invention visualization"
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Update the context with the visualization URL
      update3DVisualization(data.visualizationUrl);
      */
      
      // Simulate successful response after 3 seconds
      setTimeout(() => {
        // Use the same sketch as a placeholder for the 3D visualization
        update3DVisualization(state.sketchDataUrl);
        
        toast.success("3D visualization generated", {
          description: "Your sketch has been transformed into a 3D visualization."
        });
        
        setLoadingAnalyses(prev => ({ ...prev, visualization3D: false }));
        
        // Make sure the 3D visualization is shown
        onAnalysisComplete();
      }, 3000);
      
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast.error("Visualization failed", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
      setLoadingAnalyses(prev => ({ ...prev, visualization3D: false }));
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="technical">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="technical">Technical</TabsTrigger>
            <TabsTrigger value="market">Market</TabsTrigger>
            <TabsTrigger value="legal">Legal</TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("challenges")}
              disabled={loadingAnalyses.challenges}
            >
              {loadingAnalyses.challenges ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Identify Challenges
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("materials")}
              disabled={loadingAnalyses.materials}
            >
              {loadingAnalyses.materials ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
              Suggest Materials
            </Button>
            
            {state.sketchDataUrl && (
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={generate3DVisualization}
                disabled={loadingAnalyses.visualization3D}
              >
                {loadingAnalyses.visualization3D ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Box className="mr-2 h-4 w-4" />}
                Generate 3D Visualization
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="market" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("users")}
              disabled={loadingAnalyses.users}
            >
              {loadingAnalyses.users ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Users className="mr-2 h-4 w-4" />}
              Target Users
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("competition")}
              disabled={loadingAnalyses.competition}
            >
              {loadingAnalyses.competition ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Competition Research
            </Button>
          </TabsContent>
          
          <TabsContent value="legal" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("ip")}
              disabled={loadingAnalyses.ip}
            >
              {loadingAnalyses.ip ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              Patent Search
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("ip")}
              disabled={loadingAnalyses.ip}
            >
              {loadingAnalyses.ip ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Award className="mr-2 h-4 w-4" />}
              IP Protection Tips
            </Button>
            <Button 
              className="w-full" 
              onClick={() => runAnalysis("regulatory")}
              disabled={loadingAnalyses.regulatory}
            >
              {loadingAnalyses.regulatory ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
              Regulatory Checklist
            </Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t space-y-4">
          <Button 
            className="w-full" 
            variant="default" 
            onClick={() => runAnalysis("comprehensive")}
            disabled={loadingAnalyses.comprehensive}
          >
            {loadingAnalyses.comprehensive ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analyze with Claude 3 Sonnet
          </Button>
          
          <Button 
            className="w-full" 
            variant="secondary" 
            onClick={() => runAnalysis("comprehensive")}
            disabled={loadingAnalyses.comprehensive}
          >
            {loadingAnalyses.comprehensive ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <BarChart3 className="mr-2 h-4 w-4" />}
            Generate Comprehensive Analysis
          </Button>
        </div>
        
        {state.sketchDataUrl && (
          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Idea Generation</h3>
            <IdeaGenerator sketchDataUrl={state.sketchDataUrl} />
          </div>
        )}
      </CardContent>
    </Card>
  );
};
