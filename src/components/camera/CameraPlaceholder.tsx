
import { Camera } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CameraPlaceholderProps {
  toggleCamera: () => void;
}

export const CameraPlaceholder = ({ toggleCamera }: CameraPlaceholderProps) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg">
      <Camera size={40} className="text-muted-foreground" />
      <p className="text-center text-muted-foreground">
        Use your camera to capture images of your invention or references
      </p>
      <Button onClick={toggleCamera} className="flex items-center gap-2">
        <Camera className="mr-2 h-4 w-4" />
        Start Camera
      </Button>
    </div>
  );
};
