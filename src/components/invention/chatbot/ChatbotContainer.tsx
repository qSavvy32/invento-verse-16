
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "./ChatInterface";
import { AnalysisViewer } from "./AnalysisViewer";
import { useState } from "react";
import { VoiceConversation } from "./VoiceConversation";

// The ElevenLabs agent ID for Vinci
const VINCI_AGENT_ID = "7TTpTYqPcMC7SzpIFfQm"; // Replace with your actual agent ID

export const ChatbotContainer = () => {
  const [activeTab, setActiveTab] = useState("chat");
  
  // Handle conversation transcript when voice conversation ends
  const handleVoiceConversationEnd = (transcript: string[]) => {
    console.log("Voice conversation ended with transcript:", transcript);
    // You could process this transcript or add it to the chat history
    // For now we'll just log it
  };
  
  return (
    <div className="mt-6">
      <Tabs defaultValue="chat" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="chat">Text Chat</TabsTrigger>
          <TabsTrigger value="voice">Voice Chat</TabsTrigger>
          <TabsTrigger value="analysis">Analysis Summary</TabsTrigger>
        </TabsList>
        
        <TabsContent value="chat" className="border rounded-lg overflow-hidden">
          <ChatInterface />
        </TabsContent>
        
        <TabsContent value="voice" className="border rounded-lg p-6">
          <VoiceConversation 
            agentId={VINCI_AGENT_ID}
            onConversationEnd={handleVoiceConversationEnd}
          />
        </TabsContent>
        
        <TabsContent value="analysis">
          <AnalysisViewer setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
