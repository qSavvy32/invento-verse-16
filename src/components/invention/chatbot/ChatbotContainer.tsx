
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "./ChatInterface";
import { AnalysisViewer } from "./AnalysisViewer";
import { useState } from "react";

export const ChatbotContainer = () => {
  const [activeTab, setActiveTab] = useState("chat");
  
  return (
    <div className="mt-6">
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Vinci Assistant</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="border rounded-lg overflow-hidden">
          <ChatInterface />
        </TabsContent>
        
        <TabsContent value="analysis">
          <AnalysisViewer setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
