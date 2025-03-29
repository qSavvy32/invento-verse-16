
import { Button } from "@/components/ui/button";
import { Camera, X } from "lucide-react";

interface ImagePreviewProps {
  capturedImage: string;
  clearImage: () => void;
  toggleCamera: () => void;
}

export const ImagePreview = ({ 
  capturedImage, 
  clearImage,
  toggleCamera 
}: ImagePreviewProps) => {
  return (
    <div className="relative">
      <div className="relative rounded-lg overflow-hidden bg-black">
        <img 
          src={capturedImage} 
          alt="Captured" 
          className="w-full object-contain max-h-[400px]"
        />
        <Button 
          variant="destructive" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={clearImage}
        >
          <X size={18} />
        </Button>
      </div>
      <div className="mt-3 flex justify-center gap-2">
        <Button onClick={toggleCamera} className="flex items-center gap-2">
          <Camera size={18} />
          Take Another Photo
        </Button>
      </div>
    </div>
  );
};
