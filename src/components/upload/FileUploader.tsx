
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { InventionAsset } from "@/contexts/InventionContext";
import { useFileUpload } from "./useFileUpload";
import { FilePreview } from "./FilePreview";
import { FileUploadArea } from "./FileUploadArea";

interface FileUploaderProps {
  onFileUpload: (dataUrl: string) => void;
  onAddAsset?: (asset: InventionAsset) => void;
}

export const FileUploader = ({ onFileUpload, onAddAsset }: FileUploaderProps) => {
  const {
    file,
    preview,
    isLoading,
    handleFileChange,
    clearFile
  } = useFileUpload({ onFileUpload, onAddAsset });

  return (
    <div className="space-y-4">
      {!file ? (
        <FileUploadArea 
          isLoading={isLoading} 
          onChange={handleFileChange} 
        />
      ) : (
        <div className="space-y-4">
          <FilePreview 
            file={file} 
            preview={preview} 
            clearFile={clearFile} 
          />
          
          <div className="flex gap-2">
            <div className="relative">
              <Button disabled={isLoading}>
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? "Uploading..." : "Replace File"}
              </Button>
              <input
                id="file-upload-replace"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                disabled={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
