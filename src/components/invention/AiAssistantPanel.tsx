import { useInvention } from "@/contexts/InventionContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import { Cube, Loader2Icon } from "lucide-react";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { supabase } from "@/integrations/supabase/client";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, setAnalysisResults, update3DVisualization } = useInvention();
  const [analyzing, setAnalyzing] = useState(false);
  const [generating3D, setGenerating3D] = useState(false);
  
  const runAnthropicAnalysis = async () => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    try {
      // Call our Supabase Edge Function
      const { data, error } = await supabase.functions.invoke("analyze-invention", {
        body: {
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      console.log("Analysis result:", data);
      
      // Process results from the AI analysis
      const technicalResults = [
        ...data.key_features_list || [],
        ...data.materials_components_ideas || []
      ];
      
      const marketResults = [
        `Problem solved: ${data.problem_solved}`,
        `Potential users: ${data.potential_target_users}`
      ];
      
      const legalResults = data.unclear_aspects_questions || [];
      
      const businessResults = data.suggested_next_steps || [];
      
      // Update the context with the results
      setAnalysisResults('technical', technicalResults);
      setAnalysisResults('market', marketResults);
      setAnalysisResults('legal', legalResults);
      setAnalysisResults('business', businessResults);
      
      toast({
        title: "Analysis complete",
        description: "AI analysis completed successfully."
      });
      
      onAnalysisComplete();
    } catch (error) {
      console.error("Error running analysis:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };
  
  const generate3DVisualization = async () => {
    if (!state.sketchDataUrl) {
      toast({
        title: "Missing sketch",
        description: "Please create a sketch first to generate a 3D visualization.",
        variant: "destructive"
      });
      return;
    }
    
    setGenerating3D(true);
    
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
        
        toast({
          title: "3D visualization generated",
          description: "Your sketch has been transformed into a 3D visualization."
        });
        
        setGenerating3D(false);
      }, 3000);
      
    } catch (error) {
      console.error("Error generating 3D visualization:", error);
      toast({
        title: "Visualization failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive"
      });
      setGenerating3D(false);
    }
  };
  
  // Simulated AI responses for demo purposes
  const simulateAnalysis = (analysisType: string) => {
    if (!state.title && !state.description) {
      toast({
        title: "Missing information",
        description: "Please provide at least a title or description for your invention.",
        variant: "destructive"
      });
      return;
    }
    
    setAnalyzing(true);
    
    // Simulate API delay
    setTimeout(() => {
      // These would normally come from an API call
      const responses = {
        'technical': [
          "The design could incorporate modular components for easy replacement.",
          "Consider using lightweight materials for the outer structure.",
          "Adding IoT connectivity would enhance monitoring capabilities.",
          "A regenerative energy system could improve power efficiency."
        ],
        'market': [
          "There's growing demand for sustainable, repairable products in this sector.",
          "Target demographic: tech-savvy millennials with environmental concerns.",
          "Consider crowdfunding for market entry and validation.",
          "Competitive products are priced between $79-$149."
        ],
        'legal': [
          "The connection mechanism appears novel and potentially patentable.",
          "Consider filing a provisional patent while continuing development.",
          "Document all development stages carefully for patent evidence.",
          "Prior art search shows similar concepts, but your implementation is unique."
        ]
      };
      
      // Update the context with the "AI-generated" analysis
      if (analysisType === 'all') {
        setAnalysisResults('technical', responses.technical);
        setAnalysisResults('market', responses.market);
        setAnalysisResults('legal', responses.legal);
      } else if (analysisType === 'technical') {
        setAnalysisResults('technical', responses.technical);
      } else if (analysisType === 'market') {
        setAnalysisResults('market', responses.market);
      } else if (analysisType === 'legal') {
        setAnalysisResults('legal', responses.legal);
      }
      
      setAnalyzing(false);
      toast({
        title: "Analysis complete",
        description: `${analysisType === 'all' ? 'Full' : analysisType} analysis completed successfully.`
      });
      
      onAnalysisComplete();
    }, 2000);
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
              onClick={() => simulateAnalysis('technical')}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              Analyze Feasibility
            </Button>
            <Button className="w-full" disabled={analyzing}>Suggest Materials</Button>
            <Button className="w-full" disabled={analyzing}>Identify Challenges</Button>
            
            {state.sketchDataUrl && (
              <Button 
                className="w-full" 
                variant="secondary"
                onClick={generate3DVisualization}
                disabled={generating3D}
              >
                {generating3D ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : <Cube className="mr-2 h-4 w-4" />}
                Generate 3D Visualization
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="market" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => simulateAnalysis('market')}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              Market Analysis
            </Button>
            <Button className="w-full" disabled={analyzing}>Target Users</Button>
            <Button className="w-full" disabled={analyzing}>Competition Research</Button>
          </TabsContent>
          
          <TabsContent value="legal" className="space-y-4">
            <Button 
              className="w-full" 
              onClick={() => simulateAnalysis('legal')}
              disabled={analyzing}
            >
              {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              Patent Search
            </Button>
            <Button className="w-full" disabled={analyzing}>IP Protection Tips</Button>
            <Button className="w-full" disabled={analyzing}>Regulatory Checklist</Button>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 pt-4 border-t space-y-4">
          <Button 
            className="w-full" 
            variant="default" 
            onClick={runAnthropicAnalysis}
            disabled={analyzing}
          >
            {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
            Analyze with Claude 3.7 Sonnet
          </Button>
          
          <Button 
            className="w-full" 
            variant="secondary" 
            onClick={() => simulateAnalysis('all')}
            disabled={analyzing}
          >
            {analyzing ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
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
