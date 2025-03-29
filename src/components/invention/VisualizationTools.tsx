
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { useVisualizationState } from "./visualization/useVisualizationState";
import { VisualizationButtonsGrid } from "./visualization/VisualizationButtonsGrid";
import { BusinessStrategyPreview } from "./visualization/BusinessStrategyPreview";

export const VisualizationTools = () => {
  const {
    state,
    isLoading,
    handleGenerateSketch,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateBusinessStrategy
  } = useVisualizationState();

  return (
    <Card className="border-invention-accent/20">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium mb-4">Visualization Tools</h3>
        
        <div className="space-y-6">
          <VisualizationButtonsGrid
            isLoading={isLoading}
            hasTitle={!!state.title}
            hasDescription={!!state.description}
            hasSketch={!!state.sketchDataUrl}
            onGenerateSketch={handleGenerateSketch}
            onGenerateRealistic3D={handleGenerateRealistic3DImage}
            onGenerate3DImage={handleGenerate3DImage}
            onGenerateBusinessStrategy={handleGenerateBusinessStrategy}
          />
          
          {state.businessStrategySvg && (
            <BusinessStrategyPreview svgCode={state.businessStrategySvg} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
