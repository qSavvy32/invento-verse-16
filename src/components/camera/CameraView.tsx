
import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { SwitchCamera, X, Circle } from "lucide-react";

interface CameraViewProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  captureImage: () => void;
  switchCamera: () => void;
  cancelCamera: () => void;
}

export const CameraView = ({ 
  videoRef, 
  captureImage, 
  switchCamera, 
  cancelCamera 
}: CameraViewProps) => {
  return (
    <div className="relative rounded-lg overflow-hidden bg-black">
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted 
        className="w-full max-h-[400px] object-contain"
      />
      <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-3">
        {/* Highly visible capture button */}
        <Button 
          onClick={captureImage}
          variant="default"
          size="icon"
          className="rounded-full h-16 w-16 bg-white hover:bg-white/90 flex items-center justify-center"
        >
          <div className="h-14 w-14 rounded-full border-2 border-primary flex items-center justify-center">
            <Circle fill="currentColor" size={40} className="text-primary" />
          </div>
        </Button>
        
        <div className="absolute bottom-24 right-4 flex flex-col gap-2">
          <Button 
            onClick={switchCamera}
            variant="outline"
            size="icon"
            className="rounded-full bg-white/20 hover:bg-white/30 border-0"
            aria-label="Switch camera"
          >
            <SwitchCamera size={18} className="text-white" />
          </Button>
          
          <Button 
            onClick={cancelCamera}
            variant="outline"
            size="icon" 
            className="rounded-full bg-white/20 hover:bg-white/30 border-0"
            aria-label="Cancel"
          >
            <X size={18} className="text-white" />
          </Button>
        </div>
      </div>
      
      {/* Camera instructions overlay */}
      <div className="absolute top-0 left-0 right-0 bg-black/30 text-white p-2 text-center text-sm">
        Tap the center button to capture a photo
      </div>
    </div>
  );
};
