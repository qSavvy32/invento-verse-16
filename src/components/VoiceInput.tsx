
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { LanguageSelector } from "./voice/LanguageSelector";
import { useVoiceRecorder } from "./voice/useVoiceRecorder";

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  className?: string;
  language?: string;
  onLanguageChange?: (language: string) => void;
}

export const VoiceInput = ({ 
  onTranscriptionComplete, 
  className = "",
  language,
  onLanguageChange
}: VoiceInputProps) => {
  const {
    isRecording,
    isProcessing,
    language: recorderLanguage,
    setLanguage: setRecorderLanguage,
    startRecording,
    stopRecording
  } = useVoiceRecorder({ onTranscriptionComplete });

  // Use the passed language if provided, otherwise use the recorder's language
  const currentLanguage = language !== undefined ? language : recorderLanguage;
  
  // Handle language change
  const handleLanguageChange = (value: string) => {
    setRecorderLanguage(value);
    if (onLanguageChange) {
      onLanguageChange(value);
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <LanguageSelector 
        value={currentLanguage} 
        onChange={handleLanguageChange} 
      />
      
      <Button
        variant="outline"
        size="icon"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`rounded-full h-10 w-10 ${isRecording ? 'bg-red-100 text-red-500 hover:bg-red-200' : ''}`}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : isRecording ? (
          <MicOff className="h-5 w-5" />
        ) : (
          <Mic className="h-5 w-5" />
        )}
      </Button>
      
      <span className="text-xs text-muted-foreground">
        {isRecording 
          ? "Click to stop" 
          : isProcessing 
            ? "Processing..." 
            : "Click to speak"}
      </span>
    </div>
  );
};
