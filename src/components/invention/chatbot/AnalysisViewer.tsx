
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare } from "lucide-react";
import { MarkdownContent } from "../analysis/MarkdownContent";

interface AnalysisViewerProps {
  setActiveTab: (tab: string) => void;
}

export const AnalysisViewer = ({ setActiveTab }: AnalysisViewerProps) => {
  const { state } = useInvention();
  const { analysisResults } = state;
  
  const hasTechnical = analysisResults.technical.length > 0;
  const hasMarket = analysisResults.market.length > 0;
  const hasLegal = analysisResults.legal.length > 0;
  const hasBusiness = analysisResults.business.length > 0;
  
  const hasAnyAnalysis = hasTechnical || hasMarket || hasLegal || hasBusiness;
  
  if (!hasAnyAnalysis) {
    return (
      <Card className="p-8 text-center">
        <div className="mb-4 text-muted-foreground">
          No analysis data available yet. Chat with Vinci to generate insights.
        </div>
        <Button onClick={() => setActiveTab("chat")}>
          <MessageSquare className="mr-2 h-4 w-4" />
          Start Chatting
        </Button>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={hasTechnical ? "technical" : hasMarket ? "market" : hasLegal ? "legal" : "business"}>
          <TabsList className="mb-4">
            <TabsTrigger value="technical" disabled={!hasTechnical}>
              Technical
            </TabsTrigger>
            <TabsTrigger value="market" disabled={!hasMarket}>
              Market
            </TabsTrigger>
            <TabsTrigger value="legal" disabled={!hasLegal}>
              Legal
            </TabsTrigger>
            <TabsTrigger value="business" disabled={!hasBusiness}>
              Business
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="technical">
            <div className="space-y-4">
              {analysisResults.technical.map((item, index) => (
                <div key={`technical-${index}`} className="border p-4 rounded-lg">
                  <MarkdownContent content={item} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="market">
            <div className="space-y-4">
              {analysisResults.market.map((item, index) => (
                <div key={`market-${index}`} className="border p-4 rounded-lg">
                  <MarkdownContent content={item} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="legal">
            <div className="space-y-4">
              {analysisResults.legal.map((item, index) => (
                <div key={`legal-${index}`} className="border p-4 rounded-lg">
                  <MarkdownContent content={item} />
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="business">
            <div className="space-y-4">
              {analysisResults.business.map((item, index) => (
                <div key={`business-${index}`} className="border p-4 rounded-lg">
                  <MarkdownContent content={item} />
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
