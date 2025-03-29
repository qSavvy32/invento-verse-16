
import { MultimodalInputArea } from "@/components/invention/MultimodalInputArea";
import { InventionRepository } from "@/components/invention/InventionRepository";
import { VisualizationTools } from "@/components/invention/VisualizationTools";
import { AnalysisTools } from "@/components/invention/AnalysisTools";
import { DevilsAdvocate } from "@/components/devils-advocate/DevilsAdvocate";
import { useInvention } from "@/contexts/InventionContext";
import { AutoSave } from "./AutoSave";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const InventionForm = () => {
  const { state } = useInvention();
  const { user } = useAuth();
  
  // Check if user has added any content
  const hasContent = 
    state.title.trim() !== '' || 
    state.description.trim() !== '' || 
    state.assets.length > 0 || 
    state.sketchDataUrl !== null;
  
  return (
    <div className="grid grid-cols-1 gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Invention</h2>
        {user && <AutoSave />}
      </div>
      
      <div className="space-y-6">
        <InventionRepository hideAssets={true} />
        <MultimodalInputArea />
        <InventionRepository showTitleDesc={false} />
        
        {/* Only show these tools if the user has added some content */}
        {hasContent && (
          <>
            <VisualizationTools />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <AnalysisTools />
              </div>
              <div>
                <Tabs defaultValue="devils-advocate" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="devils-advocate">Devil's Advocate</TabsTrigger>
                  </TabsList>
                  <TabsContent value="devils-advocate">
                    <DevilsAdvocate />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
