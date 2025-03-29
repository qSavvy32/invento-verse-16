
import { useInvention } from "@/contexts/InventionContext";
import { MultimodalInputArea } from "./MultimodalInputArea";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { useState, useEffect } from "react";
import { 
  Image, 
  Package, 
  Lightbulb, 
  Bot,
  FileText,
  Beaker,
  BarChart3,
  Skull
} from "lucide-react";
import { InventionRepository } from "./InventionRepository";
import { VisualizationTools } from "./VisualizationTools";
import { AnalysisTools } from "./AnalysisTools";
import { DevilsAdvocate } from "../devils-advocate/DevilsAdvocate";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const InventionForm = () => {
  const { state } = useInvention();
  const [showAnalysisTools, setShowAnalysisTools] = useState(false);
  
  // Check if an idea is present or analysis results exist to determine if we should show Devil's Advocate
  const hasIdea = Boolean(state.title || state.description);
  const hasAnalysisResults = 
    state.analysisResults.technical.length > 0 || 
    state.analysisResults.market.length > 0 || 
    state.analysisResults.legal.length > 0 || 
    state.analysisResults.business.length > 0;
  
  // Always show Devils Advocate if we have analysis results
  const showDevilsAdvocate = hasIdea || hasAnalysisResults;
  
  // Check if we have complete information to enable experiment and analysis tools
  const hasCompleteInfo = Boolean(state.title && state.description);
  
  const handleCompileData = () => {
    if (!state.title || !state.description) {
      toast.error("Please provide both a title and description for your invention");
      return;
    }
    
    setShowAnalysisTools(true);
    toast.success("Data compiled successfully! You can now experiment and analyze your invention.");
  };
  
  return (
    <div className="space-y-8 overflow-x-hidden">
      {/* Design Section */}
      <div className="border border-invention-accent/20 rounded-lg p-4 pb-8 relative bg-gradient-to-br from-invention-paper to-white" id="invention-design-container">
        <h2 className="text-xl font-semibold font-leonardo mb-2 text-invention-ink flex items-center gap-2">
          <FileText className="h-5 w-5 text-invention-accent" />
          Design Your Invention
        </h2>
        <p className="text-sm text-muted-foreground mb-4">Provide details about your invention concept</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <MultimodalInputArea />
          </div>
          
          <div>
            <InventionRepository />
          </div>
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button 
            onClick={handleCompileData}
            className="bg-invention-accent hover:bg-invention-accent/90 text-white font-medium w-full sm:w-auto py-6 px-8"
            size="lg"
            disabled={!hasCompleteInfo}
          >
            Compile Invention Data
          </Button>
        </div>
      </div>
      
      {/* Experiment Section - only show if we have complete info */}
      {showAnalysisTools && (
        <div className="border border-invention-accent/20 rounded-lg p-4 pb-8 relative bg-gradient-to-br from-invention-paper to-white">
          <h2 className="text-xl font-semibold font-leonardo mb-2 text-invention-ink flex items-center gap-2">
            <Beaker className="h-5 w-5 text-invention-accent" />
            Experiment
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Generate visualizations for your invention</p>
          
          <VisualizationTools />
        </div>
      )}
      
      {/* Analysis Section - only show if we have complete info */}
      {showAnalysisTools && (
        <div className="border border-invention-accent/20 rounded-lg p-4 pb-8 relative bg-gradient-to-br from-invention-paper to-white">
          <h2 className="text-xl font-semibold font-leonardo mb-2 text-invention-ink flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-invention-accent" />
            Analyze
          </h2>
          <p className="text-sm text-muted-foreground mb-4">Run analysis tools on your invention</p>
          
          <AnalysisTools />
        </div>
      )}
      
      {/* Devil's Advocate section - Only show when an idea exists or we have analysis results */}
      {showDevilsAdvocate && showAnalysisTools && (
        <div className="border border-invention-accent/20 rounded-lg overflow-hidden bg-gradient-to-br from-invention-paper to-white">
          <div className="p-4">
            <h2 className="text-xl font-semibold font-leonardo mb-2 text-invention-ink flex items-center gap-2">
              <Skull className="h-5 w-5 text-invention-red" />
              Devil's Advocate
            </h2>
            <p className="text-sm text-muted-foreground mb-4">Critical analysis of your invention</p>
          </div>
          <DevilsAdvocate />
        </div>
      )}
    </div>
  );
};
