
import { useEffect, useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { CameraInput } from "@/components/CameraInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Upload } from "lucide-react";
import { FileUploader } from "@/components/FileUploader";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const MultimodalInputArea = () => {
  const { updateSketchData } = useInvention();
  const [isStorageSetup, setIsStorageSetup] = useState(false);
  
  // Setup the storage on initial load
  useEffect(() => {
    const setupStorage = async () => {
      try {
        const { data, error } = await supabase.functions.invoke("setup-storage");
        
        if (error) {
          console.error("Storage setup error:", error);
          toast.error("Failed to setup storage. Some features may be limited.");
        } else {
          console.log("Storage setup success:", data);
          setIsStorageSetup(true);
        }
      } catch (err) {
        console.error("Error invoking setup-storage function:", err);
      }
    };
    
    setupStorage();
  }, []);
  
  const handleCapture = (imageData: string) => {
    updateSketchData(imageData);
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
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera size={16} />
              Camera
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload size={16} />
              Upload Files
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="camera">
            <CameraInput onCapture={handleCapture} />
          </TabsContent>
          
          <TabsContent value="upload">
            <FileUploader onFileUpload={handleCapture} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
