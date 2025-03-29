
import { MultimodalInputArea } from "@/components/invention/MultimodalInputArea";
import { InventionRepository } from "@/components/invention/InventionRepository";
import { VisualizationTools } from "@/components/invention/VisualizationTools";
import { AnalysisTools } from "@/components/invention/AnalysisTools";

export const InventionForm = () => {
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-6">
        <InventionRepository />
        <MultimodalInputArea />
        <VisualizationTools />
        <AnalysisTools />
      </div>
    </div>
  );
};
