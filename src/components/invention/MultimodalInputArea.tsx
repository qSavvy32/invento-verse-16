
import { useInvention } from "@/contexts/InventionContext";
import { SketchCanvas } from "@/components/SketchCanvas";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const MultimodalInputArea = () => {
  const { updateSketchData } = useInvention();
  
  const handleSketchSave = (dataUrl: string) => {
    updateSketchData(dataUrl);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sketch Your Concept</CardTitle>
        <CardDescription>
          Create a visual representation of your invention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <SketchCanvas onSketchSave={handleSketchSave} />
      </CardContent>
    </Card>
  );
};
