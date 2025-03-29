
import { useInvention } from "@/contexts/InventionContext";
import { MultimodalInputArea } from "./MultimodalInputArea";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { InputSelectionCard } from "./InputSelectionCard";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { useState, useEffect } from "react";
import { 
  Image, 
  Package, 
  LightbulbIcon, 
  Bot
} from "lucide-react";
import { GenerateButtons } from "./GenerateButtons";
import PixelCard from "../ui/PixelCard";
import { Visualization3DViewer } from "./Visualization3DViewer";
import { DevilsAdvocate } from "../devils-advocate/DevilsAdvocate";

export const InventionForm = () => {
  const { state } = useInvention();
  const [showResults, setShowResults] = useState(true);
  
  // Check if an idea is present or analysis results exist to determine if we should show Devil's Advocate
  const hasIdea = Boolean(state.title || state.description);
  const hasAnalysisResults = 
    state.analysisResults.technical.length > 0 || 
    state.analysisResults.market.length > 0 || 
    state.analysisResults.legal.length > 0 || 
    state.analysisResults.business.length > 0;
  
  // Always show Devils Advocate if we have analysis results
  const showDevilsAdvocate = hasIdea || hasAnalysisResults;
  
  return (
    <div className="space-y-8 overflow-x-hidden">
      <div className="border border-invention-accent/20 rounded-lg p-4 pb-8 relative max-h-[800px] overflow-hidden bg-gradient-to-br from-invention-paper to-white" id="invention-design-container">
        <h2 className="text-xl font-semibold font-leonardo mb-6 text-invention-ink">Design Your Invention</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[650px] overflow-y-auto custom-scrollbar">
          <InputSelectionCard
            id="sketch"
            title="Visual Input"
            description="Upload or draw your invention concept"
            icon={<Image className="h-6 w-6" />}
            variant="green"
          >
            <MultimodalInputArea />
          </InputSelectionCard>
          
          <InputSelectionCard
            id="idea"
            title="Idea Generator"
            description="Get inspiration for your invention"
            icon={<LightbulbIcon className="h-6 w-6" />}
            variant="yellow"
          >
            <IdeaGenerator sketchDataUrl={state.sketchDataUrl || undefined} />
          </InputSelectionCard>
          
          {state.visualization3dUrl && (
            <InputSelectionCard
              id="3d"
              title="3D Visualization"
              description="View your invention in 3D space"
              icon={<Package className="h-6 w-6" />}
              variant="purple"
            >
              <Visualization3DViewer />
            </InputSelectionCard>
          )}
        </div>
      </div>
      
      {/* Generate buttons section */}
      <div className="border border-invention-accent/20 rounded-lg p-4 bg-gradient-to-br from-invention-paper to-white">
        <h2 className="text-xl font-semibold font-leonardo mb-4 text-invention-ink">Generate Visualizations</h2>
        <GenerateButtons />
      </div>
      
      <div className="border border-invention-accent/20 rounded-lg p-4 bg-gradient-to-br from-invention-paper to-white">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold font-leonardo flex items-center gap-2 text-invention-ink">
            <Bot className="h-5 w-5 text-invention-accent" />
            AI Assistant
          </h2>
        </div>
        <AiAssistantPanel onAnalysisComplete={() => setShowResults(true)} />
      </div>
      
      {/* Devil's Advocate section - Only show when an idea exists or we have analysis results */}
      {showDevilsAdvocate && (
        <div className="border border-invention-accent/20 rounded-lg overflow-hidden bg-gradient-to-br from-invention-paper to-white">
          <DevilsAdvocate />
        </div>
      )}
    </div>
  );
};
