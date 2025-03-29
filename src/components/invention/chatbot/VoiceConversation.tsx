
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CircleIcon, Mic, MicOff, RefreshCw, Volume2, VolumeX } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useInvention } from "@/contexts/InventionContext";
import { ChatMode } from "./types";
import { generateVoiceSystemPrompt } from "./voicePromptUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// This will be installed separately
declare module '@11labs/react' {
  export function useConversation(options?: {
    clientTools?: Record<string, (...args: any[]) => any>;
    overrides?: {
      agent?: {
        prompt?: {
          prompt?: string;
        };
        firstMessage?: string;
        language?: string;
      };
      tts?: {
        voiceId?: string;
      };
    };
    onConnect?: () => void;
    onDisconnect?: () => void;
    onMessage?: (message: any) => void;
    onError?: (error: any) => void;
  }): {
    status: 'connected' | 'disconnected';
    isSpeaking: boolean;
    startSession: (options: { url?: string; agentId?: string }) => Promise<string>;
    endSession: () => Promise<void>;
    setVolume: (options: { volume: number }) => void;
  };
}

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

  // We'll need to dynamically import useConversation once the package is installed
  const [conversation, setConversation] = useState<any>(null);

  useEffect(() => {
    let isActive = true;

    // Dynamic import of @11labs/react once we've installed it
    const loadConversationHook = async () => {
      try {
        // This is a placeholder - in reality we'd need to install the package first
        // const { useConversation } = await import('@11labs/react');
        // We're simulating this for now
        console.log("Would load @11labs/react here");
        if (isActive) {
          // setConversation would be set here with the actual hook
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
              language: "en",
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

      // In real implementation, we would start the conversation here
      // await conversation.startSession({ url: data.signedUrl });
      
      toast.success("Voice conversation started");
      
      // For now, we're simulating this
      console.log("Would start conversation with URL:", data.signedUrl);
      console.log("Using system prompt:", systemPrompt);
      
    } catch (error) {
      console.error("Failed to start conversation:", error);
      toast.error("Failed to start voice conversation. Please check microphone permissions and try again.");
    } finally {
      setIsInitializing(false);
    }
  };

  // End the conversation
  const stopConversation = async () => {
    try {
      // In real implementation, we would end the session here
      // await conversation.endSession();
      
      // For now, we're simulating this
      console.log("Would end conversation here");
      
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
    setIsMuted(!isMuted);
    // In real implementation, we would set the volume here
    // conversation.setVolume({ volume: isMuted ? 1 : 0 });
  };

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-center justify-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={conversation?.status === "connected" ? stopConversation : startConversation}
                disabled={isInitializing}
                className={conversation?.status === "connected" ? "bg-red-500 hover:bg-red-600" : ""}
                size="lg"
              >
                {isInitializing ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : conversation?.status === "connected" ? (
                  <MicOff className="h-5 w-5 mr-2" />
                ) : (
                  <Mic className="h-5 w-5 mr-2" />
                )}
                {conversation?.status === "connected" ? "End Voice Chat" : "Start Voice Chat"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {conversation?.status === "connected" 
                ? "End the voice conversation with Vinci" 
                : "Start a voice conversation with Vinci"
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {conversation?.status === "connected" && (
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

      {conversation?.status === "connected" && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CircleIcon className={`h-3 w-3 ${conversation.isSpeaking ? "text-red-500" : "text-green-500"}`} />
          <span>Vinci is {conversation.isSpeaking ? "speaking" : "listening"}</span>
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
