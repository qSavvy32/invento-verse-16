
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Cube3dIcon } from "lucide-react";

export const Visualization3DViewer = () => {
  const { state } = useInvention();
  
  if (!state.visualization3dUrl) {
    return null;
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cube3dIcon className="h-5 w-5" />
          3D Visualization
        </CardTitle>
        <CardDescription>
          AI-generated 3D model based on your sketch
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg overflow-hidden bg-black/5 relative">
          <img 
            src={state.visualization3dUrl} 
            alt="3D visualization of invention" 
            className="w-full object-contain max-h-[400px]"
          />
          
          {/* Additional 3D controls could go here */}
          <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-xs text-muted-foreground">
            3D visualization is a preliminary concept based on your sketch
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
