
import { useInvention } from "@/contexts/InventionContext";
import { MultimodalInputArea } from "./MultimodalInputArea";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { AnalysisResults } from "./AnalysisResults";
import { Visualization3DViewer } from "./Visualization3DViewer";
import { useState } from "react";
import { toast } from "sonner";
import { InputSelectionCard } from "./InputSelectionCard";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { 
  Image, 
  Package, 
  LightbulbIcon, 
  Bot 
} from "lucide-react";

export const InventionForm = () => {
  const { state } = useInvention();
  const [showResults, setShowResults] = useState(true);
  
  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-4 pb-8 relative max-h-[800px] overflow-hidden" id="invention-design-container">
        <h2 className="text-xl font-semibold mb-6">Design Your Invention</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[700px]">
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
      
      <div className="border rounded-lg p-4">
        <div className="flex items-center mb-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bot className="h-5 w-5" />
            AI Assistant
          </h2>
        </div>
        <AiAssistantPanel onAnalysisComplete={() => setShowResults(true)} />
      </div>
    </div>
  );
};
