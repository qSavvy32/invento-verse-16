
import React from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, RefreshCw, Volume2, VolumeX, CircleIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Status } from "./hooks/useElevenLabsConversation";

interface VoiceControlsProps {
  status: Status | undefined;
  isInitializing: boolean;
  isSpeaking: boolean | undefined;
  isMuted: boolean;
  onStartConversation: () => void;
  onStopConversation: () => void;
  onToggleMute: () => void;
  disabled: boolean;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  status,
  isInitializing,
  isSpeaking,
  isMuted,
  onStartConversation,
  onStopConversation,
  onToggleMute,
  disabled
}) => {
  const isConnected = status === "connected";

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      <div className="flex items-center justify-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={isConnected ? onStopConversation : onStartConversation}
                disabled={isInitializing || disabled}
                className={isConnected ? "bg-red-500 hover:bg-red-600" : ""}
                size="lg"
              >
                {isInitializing ? (
                  <RefreshCw className="h-5 w-5 animate-spin mr-2" />
                ) : isConnected ? (
                  <MicOff className="h-5 w-5 mr-2" />
                ) : (
                  <Mic className="h-5 w-5 mr-2" />
                )}
                {isConnected ? "End Voice Chat" : "Start Voice Chat"}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isConnected 
                ? "End the voice conversation with Vinci" 
                : "Start a voice conversation with Vinci"
              }
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {isConnected && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onToggleMute}
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

      {isConnected && (
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <CircleIcon className={`h-3 w-3 ${isSpeaking ? "text-red-500" : "text-green-500"}`} />
          <span>Vinci is {isSpeaking ? "speaking" : "listening"}</span>
        </div>
      )}
    </div>
  );
};
