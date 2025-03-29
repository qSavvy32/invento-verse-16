
import { useInvention } from "@/contexts/InventionContext";
import { InventionMetadata } from "./InventionMetadata";
import { MultimodalInputArea } from "./MultimodalInputArea";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { AnalysisResults } from "./AnalysisResults";
import { Visualization3DViewer } from "./Visualization3DViewer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const InventionForm = () => {
  const { state, saveToDatabase } = useInvention();
  const [showResults, setShowResults] = useState(false);
  
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <InventionMetadata />
        
        <MultimodalInputArea />
        
        {state.visualization3dUrl && <Visualization3DViewer />}
        
        {showResults && <AnalysisResults />}
      </div>
      
      <div className="space-y-6">
        <AiAssistantPanel onAnalysisComplete={() => setShowResults(true)} />
        
        <div className="border rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">Save Your Work</h2>
          <div className="space-y-4">
            <Button onClick={handleSaveDraft} className="w-full">Save Draft</Button>
            <Button variant="outline" onClick={handleExport} className="w-full">Export</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
