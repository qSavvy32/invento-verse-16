
import React from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface FileUploadAreaProps {
  isLoading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ 
  isLoading, 
  onChange 
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg">
      <Upload size={40} className="text-muted-foreground" />
      <p className="text-center text-muted-foreground">
        Upload images, PDFs, or documents of your invention, sketches, or reference materials
      </p>
      <div className="flex gap-2">
        <div className="relative">
          <Button disabled={isLoading}>
            <Upload className="mr-2 h-4 w-4" />
            {isLoading ? "Uploading..." : "Choose File"}
          </Button>
          <input
            id="file-upload"
            type="file"
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={onChange}
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
            disabled={isLoading}
          />
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Supported formats: Images, PDF, Word, Excel, CSV, TXT (max 50MB)
      </p>
    </div>
  );
};
