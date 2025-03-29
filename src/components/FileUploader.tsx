
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  onFileUpload: (dataUrl: string) => void;
}

export const FileUploader = ({ onFileUpload }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const selectedFile = e.target.files[0];
    
    // Check file type (only images for now)
    if (!selectedFile.type.startsWith('image/')) {
      toast.error("Only image files are supported");
      return;
    }
    
    // Check file size (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }
    
    setFile(selectedFile);
    
    // Create a preview
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        const dataUrl = event.target.result as string;
        setPreview(dataUrl);
        onFileUpload(dataUrl);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleAnalyzeVision = async () => {
    if (!file) return;
    
    setIsLoading(true);
    
    try {
      // Convert file to base64 for sending to the edge function
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64 = reader.result?.toString().split(',')[1];
        
        const response = await fetch('/api/analyze-vision', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            image: base64,
            prompt: "Analyze this invention or design sketch. Describe what you see, identifying key components, potential functionality, and any notable design elements."
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to analyze image');
        }
        
        const data = await response.json();
        
        toast.success("Vision analysis complete");
        console.log("Vision analysis results:", data);
        
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Failed to analyze image");
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg">
          <Upload size={40} className="text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            Upload images of your invention, sketches, or reference materials
          </p>
          <div className="flex gap-2">
            <Button as="label" htmlFor="file-upload">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
              <input
                id="file-upload"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: JPG, PNG, GIF, BMP (max 10MB)
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-lg overflow-hidden bg-black">
            <img 
              src={preview!} 
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
          
          <div className="flex items-center text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              {file.type.startsWith('image/') ? (
                <ImageIcon size={16} />
              ) : (
                <FileText size={16} />
              )}
              <span className="font-medium">{file.name}</span>
              <span>({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button as="label" htmlFor="file-upload-replace">
              <Upload className="mr-2 h-4 w-4" />
              Replace File
              <input
                id="file-upload-replace"
                type="file"
                className="sr-only"
                onChange={handleFileChange}
                accept="image/*"
              />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
