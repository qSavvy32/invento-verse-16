
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InventionAsset } from "@/contexts/InventionContext";

export interface UseCameraControlProps {
  onCapture: (imageData: string) => void;
  onAddAsset?: (asset: InventionAsset) => void;
}

export function useCameraControl({ onCapture, onAddAsset }: UseCameraControlProps) {
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
    // Clear captured image when toggling camera on
    if (!isActive && capturedImage) {
      setCapturedImage(null);
    }
  };

  const switchCamera = () => {
    setIsFrontCamera(prev => !prev);
  };

  const captureImage = async () => {
    if (!videoRef.current) return;
    
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    
    // Get the image data as a Blob
    const imageBlob = await new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          toast.error("Failed to capture image");
        }
      }, "image/jpeg", 0.95);
    });

    if (!imageBlob) return;
    
    // Upload to Supabase Storage
    try {
      const fileName = `invention-sketch-${Date.now()}.jpg`;
      const { data, error } = await supabase.storage
        .from('invention-assets')
        .upload(`sketches/${fileName}`, imageBlob, {
          contentType: 'image/jpeg',
          cacheControl: '3600',
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL for the image
      const { data: publicUrlData } = supabase.storage
        .from('invention-assets')
        .getPublicUrl(`sketches/${fileName}`);
      
      const imageUrl = publicUrlData.publicUrl;
      
      // Also set the data URL for preview
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      
      // Send back the public URL to be used with Anthropic
      onCapture(imageUrl);
      
      // Add as an asset if the callback is provided
      if (onAddAsset) {
        const newAsset: InventionAsset = {
          id: `sketch-${Date.now()}`,
          type: 'sketch',
          url: imageUrl,
          thumbnailUrl: imageDataUrl,
          name: `Sketch ${new Date().toLocaleString()}`,
          createdAt: Date.now()
        };
        onAddAsset(newAsset);
      }
      
      // Stop the camera after capturing
      stopCamera();
      setIsActive(false);
      
      toast.success("Image captured and uploaded!");
    } catch (error) {
      console.error("Error uploading image:", error);
      // Fallback to using data URL if upload fails
      const imageDataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(imageDataUrl);
      onCapture(imageDataUrl);
      
      // Add as an asset if the callback is provided
      if (onAddAsset) {
        const newAsset: InventionAsset = {
          id: `sketch-local-${Date.now()}`,
          type: 'sketch',
          url: imageDataUrl,
          thumbnailUrl: imageDataUrl,
          name: `Sketch ${new Date().toLocaleString()} (Local)`,
          createdAt: Date.now()
        };
        onAddAsset(newAsset);
      }
      
      stopCamera();
      setIsActive(false);
      
      toast.warning("Image captured locally (upload failed)");
    }
  };

  const clearImage = () => {
    setCapturedImage(null);
  };

  const cancelCamera = () => {
    stopCamera();
    setIsActive(false);
  };

  return {
    isActive,
    capturedImage,
    videoRef,
    toggleCamera,
    switchCamera,
    captureImage,
    clearImage,
    cancelCamera
  };
}
