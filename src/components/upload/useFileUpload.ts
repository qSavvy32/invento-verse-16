
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { InventionAsset } from "@/contexts/InventionContext";
import { getFileTypeCategory, isFileTypeAllowed, isFileSizeValid } from "./FileTypeUtils";

interface UseFileUploadProps {
  onFileUpload: (dataUrl: string) => void;
  onAddAsset?: (asset: InventionAsset) => void;
}

interface UseFileUploadResult {
  file: File | null;
  preview: string | null;
  isLoading: boolean;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  clearFile: () => void;
}

export const useFileUpload = ({ onFileUpload, onAddAsset }: UseFileUploadProps): UseFileUploadResult => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFile = e.target.files[0];
    
    // Check file type
    if (!isFileTypeAllowed(selectedFile.type)) {
      toast.error("Unsupported file type. Please upload an image, PDF, or document.");
      return;
    }
    
    // Check file size
    if (!isFileSizeValid(selectedFile.size)) {
      toast.error("File size must be less than 50MB");
      return;
    }
    
    setFile(selectedFile);
    setIsLoading(true);
    
    try {
      // Create a preview for images
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            const dataUrl = event.target.result as string;
            setPreview(dataUrl);
          }
        };
        reader.readAsDataURL(selectedFile);
      } else {
        // For non-image files, we'll show an icon
        setPreview(null);
      }
      
      // Upload the file to Supabase Storage
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `invention-asset-${Date.now()}.${fileExt}`;
      const folderPath = selectedFile.type.startsWith('image/') ? 'images' : 'documents';
      const assetType = getFileTypeCategory(selectedFile.type);
      
      const { data, error } = await supabase.storage
        .from('invention-assets')
        .upload(`${folderPath}/${fileName}`, selectedFile, {
          cacheControl: '3600',
        });
      
      if (error) {
        throw error;
      }
      
      // Get the public URL for the file
      const { data: publicUrlData } = supabase.storage
        .from('invention-assets')
        .getPublicUrl(`${folderPath}/${fileName}`);
      
      const fileUrl = publicUrlData.publicUrl;
      
      // Send back the public URL to be used with Anthropic
      onFileUpload(fileUrl);
      
      // Add as an asset if the callback is provided
      if (onAddAsset) {
        const newAsset: InventionAsset = {
          id: `${assetType}-${Date.now()}`,
          type: assetType,
          url: fileUrl,
          thumbnailUrl: assetType === 'image' ? fileUrl : undefined,
          name: selectedFile.name,
          createdAt: Date.now()
        };
        onAddAsset(newAsset);
      }
      
      toast.success("File uploaded successfully!");
    } catch (error) {
      console.error("Error uploading file:", error);
      toast.error("Failed to upload file. Falling back to local processing.");
      
      // Fallback to using data URL if upload fails
      handleLocalProcessing(selectedFile);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLocalProcessing = (selectedFile: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        onFileUpload(dataUrl);
        
        // Add as an asset if the callback is provided
        if (onAddAsset) {
          const newAsset: InventionAsset = {
            id: `local-${Date.now()}`,
            type: getFileTypeCategory(selectedFile.type),
            url: dataUrl,
            thumbnailUrl: selectedFile.type.startsWith('image/') ? dataUrl : undefined,
            name: `${selectedFile.name} (Local)`,
            createdAt: Date.now()
          };
          onAddAsset(newAsset);
        }
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return {
    file,
    preview,
    isLoading,
    handleFileChange,
    clearFile
  };
};
