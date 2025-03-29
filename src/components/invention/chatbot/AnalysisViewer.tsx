
import { useState, useEffect } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { MarkdownContent } from "@/components/invention/analysis/MarkdownContent";
import { ChatSummaryDashboard } from "./ChatSummaryDashboard";

interface AnalysisViewerProps {
  setActiveTab?: (tab: string) => void;
}

export const AnalysisViewer = ({ setActiveTab }: AnalysisViewerProps) => {
  const { state } = useInvention();
  const [currentView, setCurrentView] = useState<"insights" | "dashboard">("insights");
  
  const handleChatButtonClick = () => {
    if (setActiveTab) {
      setActiveTab("chat");
    }
  };
  
  const hasContent = (section: string[]) => section.length > 0;
  
  const hasAnyTechnical = hasContent(state.analysisResults.technical);
  const hasAnyMarket = hasContent(state.analysisResults.market);
  const hasAnyLegal = hasContent(state.analysisResults.legal);
  const hasAnyBusiness = hasContent(state.analysisResults.business);
  
  const hasAnyContent = hasAnyTechnical || hasAnyMarket || hasAnyLegal || hasAnyBusiness;

  return (
    <Card className="h-full flex flex-col">
      <div className="p-4 bg-muted/30 border-b flex justify-between items-center">
        <div className="space-x-2">
          <Button 
            variant={currentView === "insights" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCurrentView("insights")}
          >
            Analysis Insights
          </Button>
          <Button 
            variant={currentView === "dashboard" ? "default" : "outline"} 
            size="sm"
            onClick={() => setCurrentView("dashboard")}
          >
            Chat Dashboard
          </Button>
        </div>
        <Button onClick={handleChatButtonClick} size="sm" variant="outline">
          Back to Chat
        </Button>
      </div>
      
      {currentView === "insights" && (
        <div className="flex-1 p-4 overflow-auto">
          {!hasAnyContent ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-muted-foreground mb-2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z"
                />
              </svg>
              <h3 className="text-lg font-medium mb-2">No analysis data yet</h3>
              <p className="text-muted-foreground">
                Continue chatting with Vinci to generate insights about your invention.
              </p>
              <Button onClick={handleChatButtonClick} className="mt-4">
                Chat with Vinci
              </Button>
            </div>
          ) : (
            <Tabs defaultValue={hasAnyTechnical ? "technical" : hasAnyMarket ? "market" : hasAnyLegal ? "legal" : "business"}>
              <TabsList className="grid grid-cols-4 w-full mb-4">
                <TabsTrigger value="technical" disabled={!hasAnyTechnical}>
                  Technical
                </TabsTrigger>
                <TabsTrigger value="market" disabled={!hasAnyMarket}>
                  Market
                </TabsTrigger>
                <TabsTrigger value="legal" disabled={!hasAnyLegal}>
                  Legal
                </TabsTrigger>
                <TabsTrigger value="business" disabled={!hasAnyBusiness}>
                  Business
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="technical" className="space-y-4">
                {state.analysisResults.technical.map((content, index) => (
                  <div key={`technical-${index}`} className="mb-4">
                    <MarkdownContent content={content} />
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="market" className="space-y-4">
                {state.analysisResults.market.map((content, index) => (
                  <div key={`market-${index}`} className="mb-4">
                    <MarkdownContent content={content} />
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="legal" className="space-y-4">
                {state.analysisResults.legal.map((content, index) => (
                  <div key={`legal-${index}`} className="mb-4">
                    <MarkdownContent content={content} />
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="business" className="space-y-4">
                {state.analysisResults.business.map((content, index) => (
                  <div key={`business-${index}`} className="mb-4">
                    <MarkdownContent content={content} />
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}
      
      {currentView === "dashboard" && (
        <div className="flex-1 p-4 overflow-auto">
          <ChatSummaryDashboard inventionId={state.inventionId} />
        </div>
      )}
    </Card>
  );
};
