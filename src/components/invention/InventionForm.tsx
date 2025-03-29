
import { MultimodalInputArea } from "@/components/invention/MultimodalInputArea";
import { InventionRepository } from "@/components/invention/InventionRepository";
import { VisualizationTools } from "@/components/invention/VisualizationTools";
import { AnalysisTools } from "@/components/invention/AnalysisTools";
import { AiAssistantPanel } from "@/components/invention/AiAssistantPanel";

export const InventionForm = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-8 space-y-6">
        <InventionRepository />
        <MultimodalInputArea />
        <VisualizationTools />
        <AnalysisTools />
      </div>
      
      <div className="lg:col-span-4">
        <AiAssistantPanel />
      </div>
    </div>
  );
};
