
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisButtonGroup } from "./analysis/AnalysisButtonGroup";
import { generate3DVisualization, generateThreejsVisualization } from "./analysis/VisualizationService";
import { MarkdownContent } from "./analysis/MarkdownContent";
import { PanelOfExperts } from "../panel-of-experts/PanelOfExperts";

interface AnalysisState {
  isLoading: {
    technical: boolean;
    market: boolean;
    legal: boolean;
    business: boolean;
    comprehensive: boolean;
    visualization: boolean;
    threejs: boolean;
  };
  activeTab: string;
  analyzedContent: string | null;
}

export const AiAssistantPanel = () => {
  const { state, update3DVisualization, updateThreejsCode, updateThreejsHtml, setAnalysisResults } = useInvention();
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: {
      technical: false,
      market: false,
      legal: false,
      business: false,
      comprehensive: false,
      visualization: false,
      threejs: false,
    },
    activeTab: "experts",
    analyzedContent: null,
  });
  
  // Update loading state helper
  const updateLoadingState = (type: string, isLoading: boolean) => {
    setAnalysisState(prev => ({
      ...prev,
      isLoading: {
        ...prev.isLoading,
        [type]: isLoading
      }
    }));
  };
  
  // Handle setting analysis results (wrapper around the original function)
  const handleSetAnalysisResults = (results: Record<string, string[]>) => {
    // Convert from record to AnalysisResults
    const analysisResults = {
      technical: results.technical || [],
      market: results.market || [],
      legal: results.legal || [],
      business: results.business || []
    };
    
    setAnalysisResults(analysisResults);
  };
  
  // Create a wrapper for visualization state
  const visualizationStateWrapper = {
    title: state.title,
    description: state.description,
    sketchDataUrl: state.sketchDataUrl,
    updateVisualizations: (data: any) => {
      // Handle visualization prompt updates
    },
    update3DVisualization,
    setThreejsVisualization: (code: string, html: string) => {
      updateThreejsCode(code);
      updateThreejsHtml(html);
    }
  };
  
  // Handle 3D visualization generation
  const handle3DVisualization = () => {
    generate3DVisualization(
      visualizationStateWrapper,
      updateLoadingState
    );
  };
  
  // Handle ThreeJS visualization generation
  const handleThreejsVisualization = () => {
    generateThreejsVisualization(
      visualizationStateWrapper,
      updateLoadingState
    );
  };
  
  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <Tabs defaultValue="experts" onValueChange={(value) => setAnalysisState(prev => ({ ...prev, activeTab: value }))}>
          <TabsList className="mb-4">
            <TabsTrigger value="experts">Panel of Experts</TabsTrigger>
            <TabsTrigger value="analysis">Analysis Tools</TabsTrigger>
            <TabsTrigger value="visualization">Visualization</TabsTrigger>
          </TabsList>
          
          <TabsContent value="experts" className="pt-4 min-h-[400px]">
            <PanelOfExperts />
          </TabsContent>
          
          <TabsContent value="analysis" className="pt-4 min-h-[400px]">
            <AnalysisButtonGroup 
              isLoading={analysisState.isLoading}
              isDisabled={false}
              onAnalysisComplete={handleSetAnalysisResults}
              setIsLoading={updateLoadingState}
            />
            
            {analysisState.analyzedContent && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <MarkdownContent content={analysisState.analyzedContent} />
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="visualization" className="pt-4 min-h-[400px]">
            <div className="grid grid-cols-2 gap-4">
              <button
                className="p-6 border rounded-lg hover:bg-muted/30 transition-colors flex flex-col items-center gap-2"
                onClick={handle3DVisualization}
                disabled={analysisState.isLoading.visualization}
              >
                <span className="text-lg font-semibold">3D Visualization</span>
                <p className="text-sm text-muted-foreground text-center">
                  Generate a 3D visualization of your invention concept
                </p>
              </button>
              
              <button
                className="p-6 border rounded-lg hover:bg-muted/30 transition-colors flex flex-col items-center gap-2"
                onClick={handleThreejsVisualization}
                disabled={analysisState.isLoading.threejs}
              >
                <span className="text-lg font-semibold">Interactive 3D Model</span>
                <p className="text-sm text-muted-foreground text-center">
                  Generate an interactive Three.js 3D model of your invention
                </p>
              </button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
