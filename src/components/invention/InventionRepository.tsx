
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Image, Package } from "lucide-react";

export const InventionRepository = () => {
  const { state, updateTitle, updateDescription } = useInvention();
  
  return (
    <Card className="p-4 h-full">
      <h3 className="text-lg font-semibold mb-4">Invention Repository</h3>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="text-sm font-medium mb-1 block">Title</label>
          <Input
            id="title"
            placeholder="Give your invention a name"
            value={state.title}
            onChange={(e) => updateTitle(e.target.value)}
            className="text-base font-semibold"
          />
        </div>
        
        <div>
          <label htmlFor="description" className="text-sm font-medium mb-1 block">Description</label>
          <Textarea
            id="description"
            placeholder="Describe your invention..."
            value={state.description}
            onChange={(e) => updateDescription(e.target.value)}
            className="min-h-[120px]"
          />
        </div>
        
        {/* Preview uploaded assets */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Assets</h4>
          
          <div className="grid grid-cols-1 gap-2">
            {state.sketchDataUrl && (
              <div className="flex items-center p-2 border rounded-md">
                <Image className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">Sketch image</span>
                <div className="ml-auto w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  <img src={state.sketchDataUrl} alt="Sketch" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            {state.visualization3dUrl && (
              <div className="flex items-center p-2 border rounded-md">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">3D Visualization</span>
                <div className="ml-auto w-12 h-12 bg-gray-100 rounded overflow-hidden">
                  <img src={state.visualization3dUrl} alt="3D Visualization" className="w-full h-full object-cover" />
                </div>
              </div>
            )}
            
            {state.threejsVisualization.html && (
              <div className="flex items-center p-2 border rounded-md">
                <Package className="h-4 w-4 mr-2" />
                <span className="text-sm truncate">ThreeJS Model</span>
                <div className="ml-auto w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs">
                  3D View
                </div>
              </div>
            )}
          </div>
          
          {!state.sketchDataUrl && !state.visualization3dUrl && !state.threejsVisualization.html && (
            <div className="text-sm text-muted-foreground italic">
              No assets uploaded yet. Use the tools to add sketches and visualizations.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
