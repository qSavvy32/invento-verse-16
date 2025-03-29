
import { useInvention } from "@/contexts/InventionContext";
import { MultimodalInputArea } from "./MultimodalInputArea";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { AnalysisResults } from "./AnalysisResults";
import { Visualization3DViewer } from "./Visualization3DViewer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { InputSelectionCard } from "./InputSelectionCard";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { 
  Save, 
  Download, 
  Image, 
  Package, 
  LightbulbIcon, 
  Bot 
} from "lucide-react";

export const InventionForm = () => {
  const { state, saveToDatabase } = useInvention();
  const [showResults, setShowResults] = useState(true);
  
  const handleSaveDraft = () => {
    // In a real implementation, this would save to the database
    console.log("Saving draft:", state);
    saveToDatabase(true);
    // Show success toast
    toast.success("Draft saved", {
      description: "Your invention has been saved as a draft.",
    });
  };
  
  const handleExport = () => {
    // In a real implementation, this would export the invention data
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `invention-${state.title || 'untitled'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    // Show success toast
    toast.success("Export successful", {
      description: "Your invention has been exported as JSON.",
    });
  };
  
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
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Save Your Work</h2>
          <div className="space-x-4">
            <Button onClick={handleSaveDraft}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button variant="outline" onClick={handleExport}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>
      
      {/* Analysis Results - always show them all */}
      <AnalysisResults />
    </div>
  );
};
