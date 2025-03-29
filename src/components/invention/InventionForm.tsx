
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
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { 
  Save, 
  Download, 
  ListTodo, 
  Image, 
  Box3D, 
  LightbulbIcon, 
  Bot 
} from "lucide-react";

export const InventionForm = () => {
  const { state, saveToDatabase } = useInvention();
  const [selectedSection, setSelectedSection] = useState("metadata");
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
  
  const getInputSection = () => {
    switch (selectedSection) {
      case "metadata":
        return <InventionMetadata />;
      case "sketch":
        return <MultimodalInputArea />;
      case "idea":
        return <IdeaGenerator sketchDataUrl={state.sketchDataUrl || undefined} />;
      case "3d":
        return state.visualization3dUrl ? <Visualization3DViewer /> : (
          <div className="p-8 text-center border rounded-lg bg-muted/10">
            <p>No 3D visualization available yet. Generate one in the AI Assistant panel.</p>
          </div>
        );
      default:
        return <InventionMetadata />;
    }
  };
  
  return (
    <div className="space-y-8">
      <div className="border rounded-lg p-4">
        <div className="mb-4">
          <Select value={selectedSection} onValueChange={setSelectedSection}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select input type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="metadata" className="flex items-center">
                <div className="flex items-center gap-2">
                  <ListTodo className="h-4 w-4" />
                  <span>Basic Information</span>
                </div>
              </SelectItem>
              <SelectItem value="sketch">
                <div className="flex items-center gap-2">
                  <Image className="h-4 w-4" />
                  <span>Visual Input</span>
                </div>
              </SelectItem>
              <SelectItem value="idea">
                <div className="flex items-center gap-2">
                  <LightbulbIcon className="h-4 w-4" />
                  <span>Idea Generator</span>
                </div>
              </SelectItem>
              {state.visualization3dUrl && (
                <SelectItem value="3d">
                  <div className="flex items-center gap-2">
                    <Box3D className="h-4 w-4" />
                    <span>3D Visualization</span>
                  </div>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4">
          {getInputSection()}
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
