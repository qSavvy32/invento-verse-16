
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { AnalysisButtonGroup } from "../analysis/AnalysisButtonGroup";
import { MarkdownContent } from "../analysis/MarkdownContent";

interface AnalysisTabProps {
  isLoading: {
    technical: boolean;
    market: boolean;
    legal: boolean;
    business: boolean;
    comprehensive: boolean;
    users: boolean;
    materials: boolean;
    ip: boolean;
    competition: boolean;
    challenges: boolean;
  };
  updateLoadingState: (type: string, isLoading: boolean) => void;
}

export const AnalysisTab = ({ isLoading, updateLoadingState }: AnalysisTabProps) => {
  const { setAnalysisResults } = useInvention();
  const [analyzedContent, setAnalyzedContent] = useState<string | null>(null);
  
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

  const handleRunAnalysis = (analysisType: string) => {
    console.log(`Running analysis for ${analysisType}`);
    // Implement analysis running logic here
  };
  
  return (
    <div className="pt-4 min-h-[400px]">
      <AnalysisButtonGroup 
        isLoading={isLoading}
        isDisabled={false}
        onRunAnalysis={handleRunAnalysis}
        onAnalysisComplete={handleSetAnalysisResults}
        setIsLoading={updateLoadingState}
      />
      
      {analyzedContent && (
        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <MarkdownContent content={analyzedContent} />
        </div>
      )}
    </div>
  );
};
