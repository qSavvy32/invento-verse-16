
import { useRef } from "react";
import { CameraView } from "./CameraView";
import { CameraPlaceholder } from "./CameraPlaceholder";
import { ImagePreview } from "./ImagePreview";
import { useCameraControl } from "./useCameraControl";
import { InventionAsset } from "@/contexts/InventionContext";

interface CameraInputProps {
  onCapture: (imageData: string) => void;
  onAddAsset?: (asset: InventionAsset) => void;
}

export const CameraInput = ({ onCapture, onAddAsset }: CameraInputProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const {
    isActive,
    capturedImage,
    videoRef,
    toggleCamera,
    captureImage,
    clearImage,
    cancelCamera,
    switchCamera
  } = useCameraControl({ onCapture, onAddAsset });

  if (capturedImage) {
    return (
      <ImagePreview 
        capturedImage={capturedImage} 
        clearImage={clearImage} 
        toggleCamera={toggleCamera} 
      />
    );
  }

  return (
    <div className="space-y-4">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {isActive ? (
        <CameraView 
          videoRef={videoRef}
          captureImage={captureImage}
          switchCamera={() => switchCamera('')}
          cancelCamera={cancelCamera}
        />
      ) : (
        <CameraPlaceholder toggleCamera={toggleCamera} />
      )}
    </div>
  );
};
