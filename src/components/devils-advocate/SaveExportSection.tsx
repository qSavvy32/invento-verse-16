
import { Button } from "@/components/ui/button";
import { Save, Download } from "lucide-react";
import { toast } from "sonner";
import { useInvention } from "@/contexts/InventionContext";
import { useAuth } from "@/contexts/AuthContext";

export const SaveExportSection = () => {
  const { state, saveToDatabase } = useInvention();
  const { user } = useAuth();

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `invention-${state.title || 'untitled'}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success("Export successful", {
      description: "Your invention has been exported as JSON.",
    });
  };

  const handleSave = async () => {
    if (!user) {
      toast.error("You need to be logged in to save your invention");
      return;
    }
    
    await saveToDatabase(true);
  };

  return (
    <div className="border rounded-lg p-4 w-full mt-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Save Your Work</h2>
        <div className="space-x-4">
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
    </div>
  );
};
