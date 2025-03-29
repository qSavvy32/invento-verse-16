
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
    comprehensive: false
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
              setIsLoading={(type, loading) => setIsLoading(prev => ({ ...prev, [type]: loading }))}
              onAnalysisComplete={handleSetAnalysisResults}
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
