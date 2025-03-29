
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, ImageIcon, SwitchCamera, X, Circle } from "lucide-react";
import { toast } from "sonner";

interface CameraInputProps {
  onCapture: (imageData: string) => void;
}

export const CameraInput = ({ onCapture }: CameraInputProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isFrontCamera, setIsFrontCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Start camera when component becomes active
  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [isActive, isFrontCamera]);

  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      const facingMode = isFrontCamera ? "user" : "environment";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: false
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
      setIsActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const toggleCamera = () => {
    setIsActive(prev => !prev);
  };

  const switchCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  const captureImage = () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    const imageData = canvas.toDataURL("image/png");
    setCapturedImage(imageData);
    onCapture(imageData);
    
    // Stop the camera after capturing
    stopCamera();
    setIsActive(false);
    
    toast.success("Image captured!");
  };

  const clearImage = () => {
    setCapturedImage(null);
  };

  const cancelCamera = () => {
    stopCamera();
    setIsActive(false);
  };

  if (capturedImage) {
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
  }

  return (
    <div className="space-y-4">
      {isActive ? (
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
      ) : (
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
      )}
    </div>
  );
};
