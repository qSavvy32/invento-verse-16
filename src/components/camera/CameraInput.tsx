
import { CameraView } from "./CameraView";
import { CameraPlaceholder } from "./CameraPlaceholder";
import { ImagePreview } from "./ImagePreview";
import { useCameraControl } from "./useCameraControl";

interface CameraInputProps {
  onCapture: (imageData: string) => void;
}

export const CameraInput = ({ onCapture }: CameraInputProps) => {
  const {
    isActive,
    capturedImage,
    videoRef,
    toggleCamera,
    switchCamera,
    captureImage,
    clearImage,
    cancelCamera
  } = useCameraControl({ onCapture });

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
      {isActive ? (
        <CameraView 
          videoRef={videoRef}
          captureImage={captureImage}
          switchCamera={switchCamera}
          cancelCamera={cancelCamera}
        />
      ) : (
        <CameraPlaceholder toggleCamera={toggleCamera} />
      )}
    </div>
  );
};
