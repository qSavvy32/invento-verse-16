
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { useVisualizationState } from "./visualization/useVisualizationState";
import { VisualizationButtonsGrid } from "./visualization/VisualizationButtonsGrid";
import { BusinessStrategyPreview } from "./visualization/BusinessStrategyPreview";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const VisualizationTools = () => {
  const navigate = useNavigate();
  const { state } = useInvention();
  const {
    isLoading,
    customPrompt,
    setCustomPrompt,
    handleGenerateSketch,
    handleGenerate3DImage,
    handleGenerateRealistic3DImage,
    handleGenerateBusinessStrategy,
    handleGenerateCustomMarketingImage,
    handleRunAllVisualizations
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
            onRunAllVisualizations={handleRunAllVisualizations}
          />
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={() => navigate("/create/sketch")}
              className="w-full flex items-center gap-2"
            >
              <Pencil size={16} />
              Draw Sketch Manually
            </Button>
          </div>
          
          {/* Most Recent Generation Display */}
          {state.mostRecentGeneration && (
            <div className="mt-6 border rounded-md p-4">
              <h4 className="text-sm font-medium mb-2">
                {state.mostRecentGeneration.name || "Recent Generation"}
              </h4>
              
              {state.mostRecentGeneration.type === 'business-strategy' && state.mostRecentGeneration.svg && (
                <BusinessStrategyPreview svgCode={state.mostRecentGeneration.svg} />
              )}
              
              {(['sketch', 'image', 'marketing-image', '3d-model'].includes(state.mostRecentGeneration.type)) && 
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
