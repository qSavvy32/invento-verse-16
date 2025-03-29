
import { useInvention } from "@/contexts/InventionContext";
import { SketchCanvas } from "@/components/SketchCanvas";
import { CameraInput } from "@/components/CameraInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Pen } from "lucide-react";

export const MultimodalInputArea = () => {
  const { updateSketchData } = useInvention();
  
  const handleSketchSave = (dataUrl: string) => {
    updateSketchData(dataUrl);
  };
  
  const handleCameraCapture = (imageData: string) => {
    updateSketchData(imageData);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Input</CardTitle>
        <CardDescription>
          Create a visual representation of your invention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sketch" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="sketch" className="flex items-center gap-2">
              <Pen size={16} />
              Sketch
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera size={16} />
              Camera
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sketch">
            <SketchCanvas onSketchSave={handleSketchSave} />
          </TabsContent>
          
          <TabsContent value="camera">
            <CameraInput onCapture={handleCameraCapture} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
