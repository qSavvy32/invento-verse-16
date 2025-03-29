
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, ImageIcon, FileIcon } from "lucide-react";
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
    
    // Check file type (expanded to support multiple formats that Anthropic can process)
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
      'application/pdf', 'text/plain', 'text/csv', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
      'application/msword', // doc
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
      'application/vnd.ms-excel' // xls
    ];
    
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Unsupported file type. Please upload an image, PDF, or document.");
      return;
    }
    
    // Check file size (max 20MB)
    if (selectedFile.size > 20 * 1024 * 1024) {
      toast.error("File size must be less than 20MB");
      return;
    }
    
    setFile(selectedFile);
    
    // Create a preview for images and set file data for other types
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          setPreview(dataUrl);
          onFileUpload(dataUrl);
        }
      };
      reader.readAsDataURL(selectedFile);
    } else {
      // For non-image files, we'll show an icon but still process the file
      setPreview(null);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          onFileUpload(dataUrl);
        }
      };
      reader.readAsDataURL(selectedFile);
    }
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
            prompt: "Analyze this content carefully. If it's an image, describe what you see. If it's a document, summarize the key information. Identify key components, potential functionality, and any notable elements."
          }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to analyze file');
        }
        
        const data = await response.json();
        
        toast.success("Analysis complete");
        console.log("Analysis results:", data);
        
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error analyzing file:", error);
      toast.error("Failed to analyze file");
      setIsLoading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreview(null);
  };

  // Helper function to get the appropriate icon based on file type
  const getFileIcon = () => {
    if (!file) return <Upload size={40} />;
    
    if (file.type.startsWith('image/')) {
      return <ImageIcon size={16} />;
    } else if (file.type.includes('pdf')) {
      return <FileText size={16} />;
    } else {
      return <FileIcon size={16} />;
    }
  };

  return (
    <div className="space-y-4">
      {!file ? (
        <div className="flex flex-col items-center justify-center gap-4 p-10 border-2 border-dashed rounded-lg">
          <Upload size={40} className="text-muted-foreground" />
          <p className="text-center text-muted-foreground">
            Upload images, PDFs, or documents of your invention, sketches, or reference materials
          </p>
          <div className="flex gap-2">
            <div className="relative">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Choose File
              </Button>
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: Images, PDF, Word, Excel, CSV, TXT (max 20MB)
          </p>
        </div>
      ) : (
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
              {getFileIcon()}
              <span className="font-medium">{file.name}</span>
              <span>({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Replace File
              </Button>
              <input
                id="file-upload-replace"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
