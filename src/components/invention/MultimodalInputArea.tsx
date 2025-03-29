
import { useInvention } from "@/contexts/InventionContext";
import { CameraInput } from "@/components/camera/CameraInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload, Mic } from "lucide-react";
import { FileUploader } from "@/components/upload/FileUploader";
import { useStorageSetup } from "@/hooks/useStorageSetup";
import { VoiceInput } from "@/components/VoiceInput";

export const MultimodalInputArea = () => {
  const { updateSketchData, updateDescription, addAsset } = useInvention();
  const { isStorageSetup, isLoading } = useStorageSetup();
  
  const handleCapture = (imageData: string) => {
    updateSketchData(imageData);
  };
  
  const handleVoiceTranscription = (text: string) => {
    // Append the transcribed text to the description
    updateDescription((prev) => {
      if (prev.trim()) {
        return `${prev}\n\n${text}`;
      }
      return text;
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Input</CardTitle>
        <CardDescription>
          Upload or capture a visual representation of your invention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="camera" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera size={16} />
              Camera
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic size={16} />
              Voice
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera">
            <CameraInput onCapture={handleCapture} onAddAsset={addAsset} />
          </TabsContent>
          
          <TabsContent value="upload">
            <FileUploader onFileUpload={handleCapture} onAddAsset={addAsset} />
          </TabsContent>
          
          <TabsContent value="voice">
            <div className="p-4 border rounded-md">
              <h3 className="text-sm font-medium mb-4">Record Your Description</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Speak about your invention. Your audio will be transcribed and added to your description.
              </p>
              <div className="flex justify-center">
                <VoiceInput onTranscriptionComplete={handleVoiceTranscription} />
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
