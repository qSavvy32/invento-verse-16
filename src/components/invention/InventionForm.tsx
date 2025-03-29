
import { MultimodalInputArea } from "@/components/invention/MultimodalInputArea";
import { InventionRepository } from "@/components/invention/InventionRepository";
import { VisualizationTools } from "@/components/invention/VisualizationTools";
import { AnalysisTools } from "@/components/invention/AnalysisTools";
import { AiAssistantPanel } from "@/components/invention/AiAssistantPanel";

export const InventionForm = () => {
  // Add a handler for when analysis is complete
  const handleAnalysisComplete = () => {
    // This function will be called when analysis is complete
    console.log("Analysis complete");
    // You can add additional logic here if needed
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <InventionRepository />
        <MultimodalInputArea />
        <VisualizationTools />
        <AnalysisTools />
      </div>
      
      <div className="lg:col-span-4">
        <AiAssistantPanel onAnalysisComplete={handleAnalysisComplete} />
      </div>
    </div>
  );
};
