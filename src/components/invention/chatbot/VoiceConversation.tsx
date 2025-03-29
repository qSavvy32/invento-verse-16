
import { useInvention } from "@/contexts/InventionContext";
import { useElevenLabsConversation } from "./hooks/useElevenLabsConversation";
import { VoiceControls } from "./VoiceControls";
import { ChatModeIndicator } from "./ChatModeIndicator";
import { TranscriptViewer } from "./TranscriptViewer";

interface VoiceConversationProps {
  agentId: string;
  onConversationEnd?: (transcript: string[]) => void;
}

export const VoiceConversation = ({ agentId, onConversationEnd }: VoiceConversationProps) => {
  const { state } = useInvention();
  
  const {
    isInitializing,
    isLibraryLoaded,
    isMuted,
    chatMode,
    transcript,
    conversationInstance,
    startConversation,
    stopConversation,
    toggleMute
  } = useElevenLabsConversation({ 
    agentId,
    onTranscriptUpdate: (updatedTranscript) => {
      if (onConversationEnd && conversationInstance?.status !== "connected") {
        onConversationEnd(updatedTranscript);
      }
    }
  });

  const handleStartConversation = () => {
    startConversation(state.title, state.description);
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <VoiceControls 
        status={conversationInstance?.status}
        isInitializing={isInitializing}
        isSpeaking={conversationInstance?.isSpeaking}
        isMuted={isMuted}
        onStartConversation={handleStartConversation}
        onStopConversation={stopConversation}
        onToggleMute={toggleMute}
        disabled={!isLibraryLoaded}
      />

      <ChatModeIndicator mode={chatMode} />

      <TranscriptViewer transcript={transcript} />
    </div>
  );
};
