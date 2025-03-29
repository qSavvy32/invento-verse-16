import { useInvention } from "@/contexts/InventionContext";
import { InventionMetadata } from "./InventionMetadata";
import { MultimodalInputArea } from "./MultimodalInputArea";
import { AiAssistantPanel } from "./AiAssistantPanel";
import { AnalysisResults } from "./AnalysisResults";
import { Visualization3DViewer } from "./Visualization3DViewer";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";

export const InventionForm = () => {
  const { state, saveToDatabase } = useInvention();
  const [selectedSection, setSelectedSection] = useState("metadata");
  
  // Always keep all results
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
      <div className="border rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-4">Invention Details</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Input Type</label>
            <Select value={selectedSection} onValueChange={setSelectedSection}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select input type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="metadata">Basic Information</SelectItem>
                <SelectItem value="sketch">Visual Input</SelectItem>
                {state.visualization3dUrl && <SelectItem value="3d">3D Visualization</SelectItem>}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mt-4">
            {selectedSection === "metadata" && <InventionMetadata />}
            {selectedSection === "sketch" && <MultimodalInputArea />}
            {selectedSection === "3d" && state.visualization3dUrl && <Visualization3DViewer />}
          </div>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <AiAssistantPanel onAnalysisComplete={() => setShowResults(true)} />
      </div>
      
      <div className="border rounded-lg p-4">
        <div className="flex justify-between mb-4">
          <h2 className="text-xl font-semibold">Save Your Work</h2>
          <div className="space-x-4">
            <Button onClick={handleSaveDraft}>Save Draft</Button>
            <Button variant="outline" onClick={handleExport}>Export</Button>
          </div>
        </div>
      </div>
      
      {/* Analysis Results - always show them all */}
      <AnalysisResults />
    </div>
  );
};
