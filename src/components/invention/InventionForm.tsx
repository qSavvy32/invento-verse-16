
import { MultimodalInputArea } from "@/components/invention/MultimodalInputArea";
import { InventionRepository } from "@/components/invention/InventionRepository";
import { VisualizationTools } from "@/components/invention/VisualizationTools";
import { AnalysisTools } from "@/components/invention/AnalysisTools";
import { useInvention } from "@/contexts/InventionContext";

export const InventionForm = () => {
  const { state } = useInvention();
  
  // Check if user has added any content
  const hasContent = 
    state.title.trim() !== '' || 
    state.description.trim() !== '' || 
    state.assets.length > 0 || 
    state.sketchDataUrl !== null;
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="space-y-6">
        <InventionRepository hideAssets={true} />
        <MultimodalInputArea />
        <InventionRepository showTitleDesc={false} />
        
        {/* Only show these tools if the user has added some content */}
        {hasContent && (
          <>
            <VisualizationTools />
            <AnalysisTools />
          </>
        )}
      </div>
    </div>
  );
};
