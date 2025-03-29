import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, ImageIcon, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { InventionAsset } from "@/contexts/InventionContext";

interface FileUploaderProps {
  onFileUpload: (dataUrl: string) => void;
  onAddAsset?: (asset: InventionAsset) => void;
}

export const FileUploader = ({ onFileUpload, onAddAsset }: FileUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
    
    // Check file size (max 50MB to accommodate Anthropic's limits)
    if (selectedFile.size > 50 * 1024 * 1024) {
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
      const assetType = selectedFile.type.startsWith('image/') ? 'image' : 'document';
      
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
          type: assetType as 'image' | 'document',
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
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          onFileUpload(dataUrl);
          
          // Add as an asset if the callback is provided
          if (onAddAsset) {
            const newAsset: InventionAsset = {
              id: `local-${Date.now()}`,
              type: file.type.startsWith('image/') ? 'image' : 'document',
              url: dataUrl,
              thumbnailUrl: file.type.startsWith('image/') ? dataUrl : undefined,
              name: `${selectedFile.name} (Local)`,
              createdAt: Date.now()
            };
            onAddAsset(newAsset);
          }
        }
      };
      reader.readAsDataURL(selectedFile);
    } finally {
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
              <Button disabled={isLoading}>
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? "Uploading..." : "Choose File"}
              </Button>
              <input
                id="file-upload"
                type="file"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.txt"
                disabled={isLoading}
              />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Supported formats: Images, PDF, Word, Excel, CSV, TXT (max 50MB)
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
