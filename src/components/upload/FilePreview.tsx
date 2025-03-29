
import React from "react";
import { Button } from "@/components/ui/button";
import { FileText, X, ImageIcon, FileIcon } from "lucide-react";
import { formatFileSize, getFileIcon } from "./FileTypeUtils";

interface FilePreviewProps {
  file: File;
  preview: string | null;
  clearFile: () => void;
}

export const FilePreview: React.FC<FilePreviewProps> = ({ file, preview, clearFile }) => {
  const fileIcon = getFileIcon(file.type);
  
  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative rounded-lg overflow-hidden bg-black">
          <img 
            src={preview} 
            alt="Uploaded file" 
            className="w-full object-contain max-h-[400px]"
          />
          <Button 
            variant="destructive" 
            size="icon" 
            className="absolute top-2 right-2"
            onClick={clearFile}
          >
            <X size={18} />
          </Button>
        </div>
      ) : (
        <div className="relative rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center min-h-[200px]">
          <div className="flex flex-col items-center gap-2 p-6">
            <FileText size={48} className="text-gray-400" />
            <p className="font-medium">{file.name}</p>
            <Button 
              variant="destructive" 
              size="sm"
              className="mt-2"
              onClick={clearFile}
            >
              <X size={16} className="mr-2" /> Remove File
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex items-center text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          {fileIcon === 'image' && <ImageIcon size={16} />}
          {fileIcon === 'file-text' && <FileText size={16} />}
          {fileIcon === 'file' && <FileIcon size={16} />}
          <span className="font-medium">{file.name}</span>
          <span>({formatFileSize(file.size)})</span>
        </div>
      </div>
    </div>
  );
};
