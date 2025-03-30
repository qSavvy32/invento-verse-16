
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatInterface } from "./ChatInterface";
import { AnalysisViewer } from "./AnalysisViewer";
import { useState, useEffect } from "react";
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
  
  // Prevent focus issues when switching to voice tab
  useEffect(() => {
    // When switching to voice tab, ensure we're not auto-focusing or scrolling
    if (activeTab === "voice") {
      // Delay to allow tab content to render first
      setTimeout(() => {
        // Prevent any automatic focus
        document.activeElement instanceof HTMLElement && document.activeElement.blur();
        
        // Make sure we're not scrolling
        window.scrollTo({
          top: 0,
          behavior: 'auto'
        });
        
        // Remove autofocus attributes from any elements
        document.querySelectorAll('[autofocus]').forEach(el => {
          el.removeAttribute('autofocus');
        });
      }, 50);
    }
  }, [activeTab]);
  
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
        
        <TabsContent 
          value="voice" 
          className="border rounded-lg overflow-hidden p-0 flex justify-center voice-tab-container no-focus-scroll" 
          style={{ minHeight: '600px' }}
        >
          {/* Only render the voice conversation component when the voice tab is active */}
          {activeTab === "voice" && (
            <VoiceConversation 
              agentId={VINCI_AGENT_ID}
              onConversationEnd={handleVoiceConversationEnd}
            />
          )}
        </TabsContent>
        
        <TabsContent value="analysis">
          <AnalysisViewer setActiveTab={setActiveTab} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
