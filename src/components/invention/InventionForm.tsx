import { MultimodalInputArea } from "@/components/invention/MultimodalInputArea";
import { InventionRepository } from "@/components/invention/InventionRepository";
import { VisualizationTools } from "@/components/invention/VisualizationTools";
import { PanelOfExperts } from "@/components/panel-of-experts/PanelOfExperts";
import { ExpertBoxes } from "@/components/panel-of-experts/ExpertBoxes";
import { useInvention } from "@/contexts/InventionContext";
import { AutoSave } from "./AutoSave";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState, useEffect } from "react";
import { ExpertFeedback } from "@/components/panel-of-experts/ExpertFeedbackCard";

export const InventionForm = () => {
  const { state } = useInvention();
  const { user } = useAuth();
  const [expertFeedback, setExpertFeedback] = useState<ExpertFeedback | null>(null);
  
  // Check if user has added any content
  const hasContent = 
    state.title.trim() !== '' || 
    state.description.trim() !== '' || 
    state.assets.length > 0 || 
    state.sketchDataUrl !== null;

  // This effect would normally be part of the integration with your actual feedback system
  // For demonstration, we're just setting up a structure
  useEffect(() => {
    // In your real implementation, this would come from your API or state
    const demoFeedback: ExpertFeedback = {
      design: [
        "How might you improve the visual appeal of your invention?",
        "Have you considered alternative color schemes or materials?",
        "What elements of your design would resonate most with your target users?"
      ],
      functionality: [
        "What are the core functions that make your invention unique?",
        "How intuitive is the user interface or interaction model?",
        "Have you identified any potential friction points in the user experience?"
      ],
      market: [
        "Who is your target demographic for this invention?",
        "What similar products exist and how does yours differ?",
        "What pricing strategy would make your invention competitive?"
      ],
      technical: [
        "What are the most challenging technical aspects of your invention?",
        "Have you identified the key components or materials needed?",
        "What manufacturing processes would be required to produce your invention?"
      ]
    };
    
    setExpertFeedback(demoFeedback);
  }, []);
  
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
                <ExpertBoxes feedback={expertFeedback} />
              </div>
              <div>
                <Tabs defaultValue="panel-of-experts" className="w-full">
                  <TabsList className="grid w-full grid-cols-1">
                    <TabsTrigger value="panel-of-experts">Expert Feedback</TabsTrigger>
                  </TabsList>
                  <TabsContent value="panel-of-experts">
                    <PanelOfExperts />
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
