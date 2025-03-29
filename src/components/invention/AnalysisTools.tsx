
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AnalysisButtonGroup } from "./analysis/AnalysisButtonGroup";
import { MarkdownContent } from "./analysis/MarkdownContent";
import { Card, CardContent } from "@/components/ui/card";
import { useInvention } from "@/contexts/InventionContext";

export const AnalysisTools = () => {
  const { setAnalysisResults } = useInvention();
  const [isLoading, setIsLoading] = useState({
    technical: false,
    market: false,
    legal: false,
    business: false,
    comprehensive: false,
    users: false,
    materials: false,
    ip: false,
    competition: false,
    challenges: false
  });
  const [analysisContent, setAnalysisContent] = useState<string | null>(null);
  
  // Handle setting analysis results
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
  
  // Update the loading state
  const updateLoadingState = (type: any, loading: any) => {
    setIsLoading(prev => ({ ...prev, [type]: loading }));
  };

  const handleRunAnalysis = (analysisType: string) => {
    console.log(`Running analysis for ${analysisType}`);
    // Implement analysis running logic here
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="analysis">
          <TabsList className="mb-4">
            <TabsTrigger value="analysis">Analysis Tools</TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="pt-4">
            <AnalysisButtonGroup 
              isLoading={isLoading}
              isDisabled={false}
              onRunAnalysis={handleRunAnalysis}
              onAnalysisComplete={handleSetAnalysisResults}
              setIsLoading={updateLoadingState}
            />
            
            {analysisContent && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <MarkdownContent content={analysisContent} />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
