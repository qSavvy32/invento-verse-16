
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { useVisualizationState } from "./visualization/useVisualizationState";
import { VisualizationButtonsGrid } from "./visualization/VisualizationButtonsGrid";
import { BusinessStrategyPreview } from "./visualization/BusinessStrategyPreview";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const VisualizationTools = () => {
  const { state } = useInvention();
  const {
    isLoading,
    customPrompt,
    setCustomPrompt,
    handleGenerateSketch,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateBusinessStrategy,
    handleGenerateCustomMarketingImage
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
            customPrompt={customPrompt}
            setCustomPrompt={setCustomPrompt}
            onGenerateSketch={handleGenerateSketch}
            onGenerateRealistic3D={handleGenerateRealistic3DImage}
            onGenerate3DImage={handleGenerate3DImage}
            onGenerateBusinessStrategy={handleGenerateBusinessStrategy}
            onGenerateCustomMarketingImage={handleGenerateCustomMarketingImage}
          />
          
          {/* Most Recent Generation Display */}
          {state.mostRecentGeneration && (
            <div className="mt-6 border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">
                {state.mostRecentGeneration.name || "Recent Generation"}
              </h4>
              
              {state.mostRecentGeneration.type === 'business-strategy' && state.mostRecentGeneration.svg && (
                <BusinessStrategyPreview svgCode={state.mostRecentGeneration.svg} />
              )}
              
              {(state.mostRecentGeneration.type === 'sketch' || 
                state.mostRecentGeneration.type === 'image' || 
                state.mostRecentGeneration.type.includes('marketing')) && 
                state.mostRecentGeneration.url && (
                <AspectRatio ratio={1} className="overflow-hidden rounded-md border">
                  <img 
                    src={state.mostRecentGeneration.url} 
                    alt={state.mostRecentGeneration.name || "Generated image"} 
                    className="object-cover w-full h-full"
                  />
                </AspectRatio>
              )}
              
              <p className="text-xs text-muted-foreground mt-2">
                Generated at {new Date(state.mostRecentGeneration.createdAt).toLocaleString()}
              </p>
            </div>
          )}
          
          {state.businessStrategySvg && !state.mostRecentGeneration?.svg && (
            <BusinessStrategyPreview svgCode={state.businessStrategySvg} />
          )}
        </div>
      </CardContent>
    </Card>
  );
};
