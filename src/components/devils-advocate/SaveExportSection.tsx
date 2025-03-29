
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventionState } from "@/contexts/InventionContext";
import { Download, Save } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface SaveExportSectionProps {
  inventionState: InventionState;
  onSave: (showToast?: boolean) => Promise<void>;
}

export const SaveExportSection = ({ inventionState, onSave }: SaveExportSectionProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(true);
      toast.success("Invention saved successfully");
    } catch (error) {
      console.error("Error saving invention:", error);
      toast.error("Failed to save invention", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleExport = () => {
    // Create a JSON blob with the invention data
    const inventionData = {
      title: inventionState.title,
      description: inventionState.description,
      createdAt: new Date().toISOString(),
      // Include any other relevant data
    };
    
    const blob = new Blob([JSON.stringify(inventionData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor to trigger download
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inventionState.title || "invention"}.json`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Save & Export</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button 
            variant="default" 
            className="w-full" 
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save to My Inventions
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={handleExport}
          >
            <Download className="h-4 w-4 mr-2" />
            Export as JSON
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
