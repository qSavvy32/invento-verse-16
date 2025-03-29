
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, Mic, MicOff, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useInvention } from "@/contexts/InventionContext";
import { ChatMode } from "./types";
import { generateVoiceSystemPrompt } from "./voicePromptUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Define the types we need from @11labs/react
type Language = 
  | "en" | "de" | "pl" | "es" | "it" | "fr" | "pt" | "hi" | "ar" | "zh" | "tr"
  | "ja" | "ko" | "ru" | "nl" | "cs";

// Updated status type to include all possible states from the library
type Status = "connecting" | "connected" | "disconnecting" | "disconnected";

interface UseConversationOptions {
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

interface ConversationHookResult {
  status: Status;
  isSpeaking: boolean;
  startSession: (options: { url?: string; agentId?: string }) => Promise<string>;
  endSession: () => Promise<void>;
  setVolume: (options: { volume: number }) => void;
}

// Import dynamically when the component mounts
let useConversation: (options?: UseConversationOptions) => ConversationHookResult;

interface VoiceConversationProps {
  agentId: string;
  onConversationEnd?: (transcript: string[]) => void;
}

export const VoiceConversation = ({ agentId, onConversationEnd }: VoiceConversationProps) => {
  const { state } = useInvention();
  const [isInitializing, setIsInitializing] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("ideation");
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState<string[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");
  const [conversationInstance, setConversationInstance] = useState<ConversationHookResult | null>(null);

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
  }, []);

  // Update the system prompt when chat mode changes
  useEffect(() => {
    const newPrompt = generateVoiceSystemPrompt(
      state.title,
      state.description,
      chatMode,
      [] // We don't need message history for voice
    );
    setSystemPrompt(newPrompt);
  }, [state.title, state.description, chatMode]);

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

  // Handle messages from the conversation
  const handleMessage = useCallback((message: any) => {
    console.log("Conversation message:", message);
    if (message?.content) {
      setTranscript(prev => [...prev, message.content]);
    }
  }, []);

  // Start the conversation with the ElevenLabs agent
  const startConversation = async () => {
    if (!conversationInstance) {
      toast.error("Voice chat system not ready");
      return;
    }
    
    try {
      setIsInitializing(true);

      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });

      // Get a signed URL from our edge function
      const { data, error } = await supabase.functions.invoke("elevenlabs-voice-agent", {
        body: {
          agentId,
          systemPrompt,
          inventionTitle: state.title,
          inventionDescription: state.description,
          overrides: {
            agent: {
              prompt: {
                prompt: systemPrompt,
              },
              firstMessage: "Hi, I'm Vinci, your invention assistant. Tell me about your invention idea, and I'll help you develop it.",
              language: "en" as Language, // Type assertion to ensure this is treated as a Language
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
      
      // Save transcript
      if (onConversationEnd && transcript.length > 0) {
        onConversationEnd(transcript);
      }
      
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

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-center justify-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={conversationInstance?.status === "connected" ? stopConversation : startConversation}
                disabled={isInitializing || !conversationInstance}
                className={conversationInstance?.status === "connected" ? "bg-red-500 hover:bg-red-600" : ""}
                size="lg"
              >
                {isInitializing ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : conversationInstance?.status === "connected" ? (
                  <MicOff className="h-5 w-5 mr-2" />
                ) : (
                  <Mic className="h-5 w-5 mr-2" />
                )}
                {conversationInstance?.status === "connected" ? "End Voice Chat" : "Start Voice Chat"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {conversationInstance?.status === "connected" 
                ? "End the voice conversation with Vinci" 
                : "Start a voice conversation with Vinci"
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {conversationInstance?.status === "connected" && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={toggleMute}
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10"
                >
                  {isMuted ? (
                    <VolumeX className="h-5 w-5" />
                  ) : (
                    <Volume2 className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isMuted ? "Unmute Vinci" : "Mute Vinci"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {conversationInstance?.status === "connected" && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CircleIcon className={`h-3 w-3 ${conversationInstance.isSpeaking ? "text-red-500" : "text-green-500"}`} />
          <span>Vinci is {conversationInstance.isSpeaking ? "speaking" : "listening"}</span>
        </div>
      )}

      <div className="w-full">
        <div className="text-xs text-muted-foreground text-center mt-2">
          {chatMode === "ideation" && "Ideation Mode: Let's brainstorm your invention idea"}
          {chatMode === "technical" && "Technical Analysis: Exploring feasibility and challenges"}
          {chatMode === "market" && "Market Analysis: Understanding users and market potential"}
          {chatMode === "legal" && "Legal Analysis: Examining IP and regulatory considerations"}
          {chatMode === "business" && "Business Analysis: Exploring commercialization paths"}
          {chatMode === "synthesis" && "Synthesis: Creating a comprehensive evaluation"}
        </div>
      </div>

      {transcript.length > 0 && (
        <div className="w-full mt-4 border rounded-md p-4 max-h-[200px] overflow-y-auto">
          <h3 className="text-sm font-medium mb-2">Conversation Transcript</h3>
          <div className="space-y-2">
            {transcript.map((message, index) => (
              <div key={index} className="text-sm">
                {message}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
