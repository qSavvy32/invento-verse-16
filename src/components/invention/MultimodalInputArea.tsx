
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { CameraInput } from "@/components/camera/CameraInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Upload, Mic, Globe } from "lucide-react";
import { FileUploader } from "@/components/upload/FileUploader";
import { useStorageSetup } from "@/hooks/useStorageSetup";
import { VoiceInput } from "@/components/VoiceInput";
import { UrlScraper } from "@/components/invention/UrlScraper";
import { FlowingMenu, FlowingMenuItem } from "@/components/ui/FlowingMenu";

export const MultimodalInputArea = () => {
  const { updateSketchData, updateDescription, addAsset } = useInvention();
  const { isStorageSetup, isLoading } = useStorageSetup();
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "voice" | "scraper">("camera");
  
  const handleCapture = (imageData: string) => {
    updateSketchData(imageData);
  };
  
  const handleVoiceTranscription = (text: string) => {
    // Append the transcribed text to the description
    const currentDescription = updateDescription((prev) => {
      const prevText = typeof prev === 'string' ? prev : '';
      if (prevText.trim()) {
        return `${prevText}\n\n${text}`;
      }
      return text;
    });
  };

  const inputOptions: FlowingMenuItem[] = [
    {
      text: "Camera",
      icon: <Camera size={16} />,
      onClick: () => setActiveTab("camera")
    },
    {
      text: "Upload Files",
      icon: <Upload size={16} />,
      onClick: () => setActiveTab("upload")
    },
    {
      text: "Voice",
      icon: <Mic size={16} />,
      onClick: () => setActiveTab("voice")
    },
    {
      text: "Web Scraper",
      icon: <Globe size={16} />,
      onClick: () => setActiveTab("scraper")
    }
  ];
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Input</CardTitle>
        <CardDescription>
          Upload or capture a visual representation of your invention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-4">
            <FlowingMenu items={inputOptions} />
          </div>
          
          <div className="col-span-8">
            {activeTab === "camera" && (
              <div className="p-4 border rounded-md">
                <CameraInput onCapture={handleCapture} onAddAsset={addAsset} />
              </div>
            )}
            
            {activeTab === "upload" && (
              <div className="p-4 border rounded-md">
                <FileUploader onFileUpload={handleCapture} onAddAsset={addAsset} />
              </div>
            )}
            
            {activeTab === "voice" && (
              <div className="p-4 border rounded-md">
                <h3 className="text-sm font-medium mb-4">Record Your Description</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Speak about your invention. Your audio will be transcribed and added to your description.
                </p>
                <div className="flex justify-center">
                  <VoiceInput onTranscriptionComplete={handleVoiceTranscription} />
                </div>
              </div>
            )}
            
            {activeTab === "scraper" && (
              <div className="p-4 border rounded-md">
                <UrlScraper onAddAsset={addAsset} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
