
import { useState, useEffect, useCallback } from "react";
import { ChatMode } from "../types";
import { generateVoiceSystemPrompt } from "../voicePromptUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the types we need from @11labs/react
export type Language = 
  | "en" | "de" | "pl" | "es" | "it" | "fr" | "pt" | "hi" | "ar" | "zh" | "tr"
  | "ja" | "ko" | "ru" | "nl" | "cs";

// Updated status type to include all possible states from the library
export type Status = "connecting" | "connected" | "disconnecting" | "disconnected";

export interface UseConversationOptions {
  clientTools?: Record<string, (...args: any[]) => any>;
  overrides?: {
    agent?: {
      prompt?: {
        prompt?: string;
      };
      firstMessage?: string;
      language?: Language;
    };
    tts?: {
      voiceId?: string;
    };
  };
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: any) => void;
  onError?: (error: any) => void;
}

export interface ConversationHookResult {
  status: Status;
  isSpeaking: boolean;
  startSession: (options: { url?: string; agentId?: string }) => Promise<string>;
  endSession: () => Promise<void>;
  setVolume: (options: { volume: number }) => void;
}

// Import dynamically when the component mounts
let useConversation: (options?: UseConversationOptions) => ConversationHookResult;

export interface UseElevenLabsConversationProps {
  agentId: string;
  onTranscriptUpdate?: (transcript: string[]) => void;
}

export const useElevenLabsConversation = ({ 
  agentId, 
  onTranscriptUpdate 
}: UseElevenLabsConversationProps) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [chatMode, setChatMode] = useState<ChatMode>("ideation");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [conversationInstance, setConversationInstance] = useState<ConversationHookResult | null>(null);
  const [isLibraryLoaded, setIsLibraryLoaded] = useState(false);

  // Handle messages from the conversation
  const handleMessage = useCallback((message: any) => {
    console.log("Conversation message:", message);
    if (message?.content) {
      const updatedTranscript = [...transcript, message.content];
      setTranscript(updatedTranscript);
      if (onTranscriptUpdate) {
        onTranscriptUpdate(updatedTranscript);
      }
    }
  }, [transcript, onTranscriptUpdate]);

  // Dynamically import the @11labs/react module
  useEffect(() => {
    let isActive = true;

    const loadConversationHook = async () => {
      try {
        const elevenLabsModule = await import('@11labs/react');
        if (isActive && elevenLabsModule.useConversation) {
          // Save the hook reference to be used elsewhere in the component
          useConversation = elevenLabsModule.useConversation;
          
          // Initialize conversation with callbacks
          const conversation = useConversation({
            onConnect: () => {
              console.log("Connected to ElevenLabs voice agent");
              toast.success("Connected to voice assistant");
            },
            onDisconnect: () => {
              console.log("Disconnected from ElevenLabs voice agent");
              toast.info("Voice conversation ended");
            },
            onMessage: handleMessage,
            onError: (error) => {
              console.error("Voice agent error:", error);
              toast.error("Voice chat error", { 
                description: typeof error === 'string' ? error : 'An error occurred with the voice agent'
              });
            }
          });
          
          setConversationInstance(conversation);
          setIsLibraryLoaded(true);
        }
      } catch (error) {
        console.error("Error loading conversation hook:", error);
        toast.error("Failed to load voice conversation. Please try again.");
      }
    };

    loadConversationHook();

    return () => {
      isActive = false;
    };
  }, [handleMessage]);

  // Progress through chat modes based on conversation length
  useEffect(() => {
    if (transcript.length >= 15) {
      setChatMode("synthesis");
    } else if (transcript.length >= 12) {
      setChatMode("business");
    } else if (transcript.length >= 9) {
      setChatMode("legal");
    } else if (transcript.length >= 6) {
      setChatMode("market");
    } else if (transcript.length >= 3) {
      setChatMode("technical");
    }
  }, [transcript.length]);

  // Update system prompt when chat mode changes
  useEffect(() => {
    // This assumes we'll pass the invention details as props if needed
    const inventionTitle = ""; // This would come from props or context
    const inventionDescription = ""; // This would come from props or context
    
    const newPrompt = generateVoiceSystemPrompt(
      inventionTitle,
      inventionDescription,
      chatMode,
      [] // We don't need message history for voice
    );
    setSystemPrompt(newPrompt);
  }, [chatMode]);

  // Start the conversation with the ElevenLabs agent
  const startConversation = async (inventionTitle: string, inventionDescription: string) => {
    if (!conversationInstance) {
      toast.error("Voice chat system not ready");
      return;
    }
    
    try {
      setIsInitializing(true);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Update system prompt with current invention details
      const currentPrompt = generateVoiceSystemPrompt(
        inventionTitle,
        inventionDescription,
        chatMode,
        []
      );
      setSystemPrompt(currentPrompt);

      // Get a signed URL from our edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-voice-agent", {
        body: {
          agentId,
          systemPrompt: currentPrompt,
          inventionTitle,
          inventionDescription,
          overrides: {
            agent: {
              prompt: {
                prompt: currentPrompt,
              },
              firstMessage: "Hi, I'm Vinci, your invention assistant. Tell me about your invention idea, and I'll help you develop it.",
              language: "en" as Language,
            },
            tts: {
              voiceId: "JBFqnCBsd6RMkjVDRZzb", // George voice
            },
          },
        }
      });

      if (error) {
        throw new Error(`Failed to initialize voice agent: ${error.message}`);
      }

      if (!data?.signedUrl) {
        throw new Error("Failed to get a valid agent URL");
      }

      // Start the conversation with the signed URL
      await conversationInstance.startSession({ url: data.signedUrl });
      
      toast.success("Voice conversation started");
      
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start voice conversation. Please check microphone permissions and try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  // End the conversation
  const stopConversation = async () => {
    if (!conversationInstance) {
      return;
    }
    
    try {
      // End the conversation session
      await conversationInstance.endSession();
      toast.success("Voice conversation ended");
    } catch (error) {
      console.error("Failed to stop conversation:", error);
      toast.error("Failed to end voice conversation properly.");
    }
  };

  // Toggle mute
  const toggleMute = () => {
    if (!conversationInstance) return;
    
    setIsMuted(!isMuted);
    conversationInstance.setVolume({ volume: isMuted ? 1 : 0 });
  };

  return {
    isInitializing,
    isLibraryLoaded,
    isMuted,
    chatMode,
    transcript,
    conversationInstance,
    startConversation,
    stopConversation,
    toggleMute
  };
};
