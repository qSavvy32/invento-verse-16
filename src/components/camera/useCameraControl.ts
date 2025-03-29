
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "sonner";
import { AssetType } from "@/contexts/InventionContext";

export interface CameraControlOptions {
  onCapture?: (imageDataUrl: string) => void;
  onAddAsset?: (asset: {
    id: string;
    type: AssetType;
    url: string;
    thumbnailUrl: string;
    name: string;
    createdAt: number;
  }) => void;
}

export const useCameraControl = ({ onCapture, onAddAsset }: CameraControlOptions = {}) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isMirrored, setIsMirrored] = useState(true);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeCamera, setActiveCamera] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  
  // Get list of available cameras
  const getAvailableCameras = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const cameras = devices.filter((device) => device.kind === "videoinput");
      setAvailableCameras(cameras);
      
      // If we have camera devices and no active camera is set, set the first one
      if (cameras.length > 0 && !activeCamera) {
        setActiveCamera(cameras[0].deviceId);
      }
    } catch (err) {
      console.error("Error getting camera devices:", err);
      setError("Unable to get camera list");
    }
  }, [activeCamera]);
  
  // Initialize camera
  const initializeCamera = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      
      // Request camera access
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: activeCamera ? { deviceId: { exact: activeCamera } } : true,
        audio: false,
      });
      
      setStream(mediaStream);
      setHasPermission(true);
      setIsActive(true);
      
      // Get list of available cameras after successful initialization
      await getAvailableCameras();
      
      // Reset captured image when initializing camera
      setCapturedImage(null);
    } catch (err: any) {
      console.error("Camera initialization error:", err);
      setHasPermission(false);
      
      if (err.name === "NotAllowedError") {
        setError("Camera access denied. Please allow camera access and try again.");
      } else if (err.name === "NotFoundError") {
        setError("No camera found on this device.");
      } else {
        setError(`Camera error: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  }, [stream, activeCamera, getAvailableCameras]);
  
  // Switch camera
  const switchCamera = useCallback((deviceId: string) => {
    setActiveCamera(deviceId);
  }, []);
  
  // Set video ref source
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Cleanup
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);
  
  // Re-initialize when active camera changes
  useEffect(() => {
    if (activeCamera) {
      initializeCamera();
    }
  }, [activeCamera, initializeCamera]);
  
  // Capture image
  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) {
      toast.error("Camera not initialized properly");
      return;
    }
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    
    if (!context) {
      toast.error("Unable to get canvas context");
      return;
    }
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the video frame to the canvas, handling mirroring if needed
    if (isMirrored) {
      context.translate(canvas.width, 0);
      context.scale(-1, 1);
    }
    
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Reset transform if mirrored
    if (isMirrored) {
      context.setTransform(1, 0, 0, 1, 0, 0);
    }
    
    // Get the image data URL
    const imageDataUrl = canvas.toDataURL("image/png");
    setCapturedImage(imageDataUrl);
    
    // Call the onCapture callback if provided
    if (onCapture) {
      onCapture(imageDataUrl);
    }
    
    // Add to assets if callback provided
    if (onAddAsset) {
      const timestamp = Date.now();
      onAddAsset({
        id: `captured-image-${timestamp}`,
        type: "sketch" as AssetType,
        url: imageDataUrl,
        thumbnailUrl: imageDataUrl,
        name: `Captured Image ${new Date(timestamp).toLocaleString()}`,
        createdAt: timestamp,
      });
    }
    
    toast.success("Image captured successfully");
  }, [isMirrored, onCapture, onAddAsset]);
  
  // Toggle camera
  const toggleCamera = useCallback(() => {
    if (isActive) {
      // Stop camera
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      setIsActive(false);
      setStream(null);
    } else {
      // Start camera
      initializeCamera();
    }
  }, [isActive, stream, initializeCamera]);
  
  // Cancel camera mode
  const cancelCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setIsActive(false);
    setStream(null);
  }, [stream]);
  
  // Clear/retake image
  const clearImage = useCallback(() => {
    setCapturedImage(null);
  }, []);
  
  // Toggle mirroring
  const toggleMirror = useCallback(() => {
    setIsMirrored((prev) => !prev);
  }, []);
  
  return {
    videoRef,
    canvasRef,
    stream,
    isLoading,
    hasPermission,
    error,
    capturedImage,
    isMirrored,
    availableCameras,
    activeCamera,
    isActive,
    initializeCamera,
    captureImage,
    clearImage,
    toggleMirror,
    switchCamera,
    toggleCamera,
    cancelCamera,
  };
};
