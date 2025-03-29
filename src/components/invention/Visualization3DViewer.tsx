
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Box, Image } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const Visualization3DViewer = () => {
  const { state } = useInvention();
  
  const hasVisualizations = state.visualizationPrompts && Object.keys(state.visualizationPrompts).length > 0;
  
  if (!state.visualization3dUrl && !hasVisualizations) {
    return null;
  }
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Box className="h-5 w-5" />
          Visualizations
        </CardTitle>
        <CardDescription>
          AI-generated visualizations based on your invention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={state.visualization3dUrl ? "3d" : "concept"} className="space-y-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4">
            {state.visualization3dUrl && (
              <TabsTrigger value="3d">3D Model</TabsTrigger>
            )}
            {state.visualizationPrompts?.concept && (
              <TabsTrigger value="concept">Concept</TabsTrigger>
            )}
            {state.visualizationPrompts?.materials && (
              <TabsTrigger value="materials">Materials</TabsTrigger>
            )}
            {state.visualizationPrompts?.users && (
              <TabsTrigger value="users">Users</TabsTrigger>
            )}
            {state.visualizationPrompts?.problem && (
              <TabsTrigger value="problem">Problem</TabsTrigger>
            )}
          </TabsList>
          
          {state.visualization3dUrl && (
            <TabsContent value="3d" className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black/5 relative">
                <img 
                  src={state.visualization3dUrl} 
                  alt="3D visualization of invention" 
                  className="w-full object-contain max-h-[400px]"
                />
                
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-xs text-muted-foreground">
                  3D visualization is a preliminary concept based on your sketch
                </div>
              </div>
            </TabsContent>
          )}
          
          {state.visualizationPrompts?.concept && (
            <TabsContent value="concept" className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black/5 relative">
                {/* In a real implementation, we would generate an image based on the prompt */}
                <div className="aspect-video bg-gradient-to-r from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <div className="text-center max-w-md p-4">
                    <Image className="h-10 w-10 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500 italic">{state.visualizationPrompts.concept}</p>
                  </div>
                </div>
                <div className="p-2 text-center text-xs text-muted-foreground">
                  Visualization prompt for concept
                </div>
              </div>
            </TabsContent>
          )}
          
          {state.visualizationPrompts?.materials && (
            <TabsContent value="materials" className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black/5 relative">
                <div className="aspect-video bg-gradient-to-r from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <div className="text-center max-w-md p-4">
                    <Image className="h-10 w-10 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500 italic">{state.visualizationPrompts.materials}</p>
                  </div>
                </div>
                <div className="p-2 text-center text-xs text-muted-foreground">
                  Visualization prompt for materials
                </div>
              </div>
            </TabsContent>
          )}
          
          {state.visualizationPrompts?.users && (
            <TabsContent value="users" className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black/5 relative">
                <div className="aspect-video bg-gradient-to-r from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <div className="text-center max-w-md p-4">
                    <Image className="h-10 w-10 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500 italic">{state.visualizationPrompts.users}</p>
                  </div>
                </div>
                <div className="p-2 text-center text-xs text-muted-foreground">
                  Visualization prompt for users
                </div>
              </div>
            </TabsContent>
          )}
          
          {state.visualizationPrompts?.problem && (
            <TabsContent value="problem" className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black/5 relative">
                <div className="aspect-video bg-gradient-to-r from-zinc-100 to-zinc-200 flex items-center justify-center">
                  <div className="text-center max-w-md p-4">
                    <Image className="h-10 w-10 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500 italic">{state.visualizationPrompts.problem}</p>
                  </div>
                </div>
                <div className="p-2 text-center text-xs text-muted-foreground">
                  Visualization prompt for problem
                </div>
              </div>
            </TabsContent>
          )}
        </Tabs>
      </CardContent>
    </Card>
  );
};
