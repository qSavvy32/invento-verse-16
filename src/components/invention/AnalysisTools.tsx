
import { useState, useEffect } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownContent } from "./analysis/MarkdownContent";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { FlaskConicalIcon, Users, BarChart4, Lightbulb, LucideIcon } from "lucide-react";

interface AnalysisTab {
  id: string;
  label: string;
  icon: LucideIcon;
  resultKey: keyof typeof analyzedContent;
}

export const AnalysisTools = () => {
  const { state, setAnalysisResults } = useInvention();
  const [activeTab, setActiveTab] = useState<string>("technical");
  const [showAnalysis, setShowAnalysis] = useState(false);
  
  // Memoized results
  const analyzedContent = {
    technical: state.analysisResults.technical,
    market: state.analysisResults.market,
    legal: state.analysisResults.legal,
    business: state.analysisResults.business,
  };
  
  // Check if we have any analysis results
  const hasResults = Object.values(analyzedContent).some(arr => arr.length > 0);
  
  // Show analysis panel if we have results
  useEffect(() => {
    if (hasResults) {
      setShowAnalysis(true);
    }
  }, [hasResults]);
  
  // Function to handle completion of analysis
  const handleAnalysisComplete = () => {
    setShowAnalysis(true);
  };
  
  // Define tabs
  const tabs: AnalysisTab[] = [
    { id: "technical", label: "Technical", icon: FlaskConicalIcon, resultKey: "technical" },
    { id: "market", label: "Market", icon: Users, resultKey: "market" },
    { id: "legal", label: "Legal", icon: Lightbulb, resultKey: "legal" },
    { id: "business", label: "Business", icon: BarChart4, resultKey: "business" },
  ];
  
  // Reset analysis results
  const handleResetAnalysis = () => {
    setAnalysisResults({
      technical: [],
      market: [],
      legal: [],
      business: []
    });
    setShowAnalysis(false);
  };
  
  return (
    <Card className="border-invention-accent/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">AI Analysis Tools</h3>
          {hasResults && (
            <button 
              onClick={handleResetAnalysis}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Analysis
            </button>
          )}
        </div>
        
        <div>
          {!showAnalysis ? (
            <AiAssistantPanel onAnalysisComplete={handleAnalysisComplete} />
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const hasContent = analyzedContent[tab.resultKey].length > 0;
                  
                  return (
                    <TabsTrigger 
                      key={tab.id} 
                      value={tab.id}
                      className={!hasContent ? "opacity-50" : ""}
                      disabled={!hasContent}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {tab.label}
                    </TabsTrigger>
                  );
                })}
              </TabsList>
              
              {tabs.map((tab) => (
                <TabsContent key={tab.id} value={tab.id} className="space-y-4">
                  {analyzedContent[tab.resultKey].length > 0 ? (
                    analyzedContent[tab.resultKey].map((result, index) => (
                      <MarkdownContent key={index} content={result} />
                    ))
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">
                      <p>No {tab.label.toLowerCase()} analysis available yet.</p>
                      <p className="text-sm mt-2">Run an analysis to see results here.</p>
                    </div>
                  )}
                </TabsContent>
              ))}
              
              <div className="mt-4">
                <AiAssistantPanel onAnalysisComplete={handleAnalysisComplete} />
              </div>
            </Tabs>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
