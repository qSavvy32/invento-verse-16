
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisTab } from "./assistant-panel/AnalysisTab";
import { VisualizationTab } from "./assistant-panel/VisualizationTab";
import { ExpertsTab } from "./assistant-panel/ExpertsTab";
import { AnalysisState } from "./assistant-panel/types";

export const AiAssistantPanel = () => {
  const { state } = useInvention();
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    isLoading: {
      technical: false,
      market: false,
      legal: false,
      business: false,
      comprehensive: false,
      visualization: false,
      threejs: false,
      users: false,
      materials: false,
      ip: false,
      competition: false,
      challenges: false,
      runAll: false,
      customMarketing: false
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
            <ExpertsTab />
          </TabsContent>
          
          <TabsContent value="analysis" className="pt-4 min-h-[400px]">
            <AnalysisTab 
              isLoading={analysisState.isLoading} 
              updateLoadingState={updateLoadingState} 
            />
          </TabsContent>
          
          <TabsContent value="visualization" className="pt-4 min-h-[400px]">
            <VisualizationTab 
              isLoading={{
                visualization: analysisState.isLoading.visualization,
                threejs: analysisState.isLoading.threejs
              }} 
              updateLoadingState={updateLoadingState} 
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
