
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  className?: string;
}

const LANGUAGE_OPTIONS = [
  { value: "eng", label: "English" },
  { value: "spa", label: "Spanish" },
  { value: "fra", label: "French" },
  { value: "deu", label: "German" },
  { value: "ita", label: "Italian" },
  { value: "por", label: "Portuguese" },
  { value: "pol", label: "Polish" },
  { value: "tur", label: "Turkish" },
  { value: "rus", label: "Russian" },
  { value: "nld", label: "Dutch" },
  { value: "cze", label: "Czech" },
  { value: "ara", label: "Arabic" },
  { value: "hin", label: "Hindi" },
  { value: "jpn", label: "Japanese" },
  { value: "cmn", label: "Chinese" },
  { value: "kor", label: "Korean" },
];

export const VoiceInput = ({ onTranscriptionComplete, className = "" }: VoiceInputProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("eng");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { user } = useAuth();

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = processAudio;
      
      mediaRecorder.start();
      setIsRecording(true);
      
      toast.info("Recording started", {
        description: "Speak clearly to describe your invention."
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone", {
        description: "Please check your microphone permissions and try again."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) {
      toast.error("No audio recorded");
      return;
    }
    
    try {
      setIsProcessing(true);
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/webm" });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        // Check if user is authenticated
        if (!user) {
          // If not authenticated, we'll still convert the audio to text
          // but using the more reliable (and already working) voice-to-text function
          // instead of the speech-to-text function that's failing
          processAudioUnauthenticated(base64Audio);
          return;
        }
        
        toast.loading("Transcribing your voice...", { id: "transcription" });
        
        try {
          // First try with ElevenLabs speech-to-text
          const { data: elevenLabsData, error: elevenLabsError } = await supabase.functions.invoke("speech-to-text", {
            body: { 
              audioData: base64Audio,
              languageCode: language
            }
          });
          
          if (elevenLabsError || !elevenLabsData?.text) {
            console.log("ElevenLabs transcription failed, falling back to OpenAI:", elevenLabsError);
            // Fall back to OpenAI voice-to-text
            processAudioUnauthenticated(base64Audio);
            return;
          }
          
          setIsProcessing(false);
          onTranscriptionComplete(elevenLabsData.text);
          
          toast.success("Voice transcribed", {
            description: "Your spoken description has been added.",
            id: "transcription"
          });
        } catch (error) {
          console.error("Transcription error:", error);
          // Fall back to OpenAI voice-to-text
          processAudioUnauthenticated(base64Audio);
        }
      };
    } catch (error) {
      console.error("Error processing audio:", error);
      setIsProcessing(false);
      toast.error("Processing failed", {
        description: "There was an error processing your voice recording."
      });
    }
  };
  
  const processAudioUnauthenticated = async (base64Audio: string) => {
    try {
      const { data, error } = await supabase.functions.invoke("voice-to-text", {
        body: { 
          audio: base64Audio.split(',')[1] || base64Audio
        }
      });
      
      setIsProcessing(false);
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data?.text) {
        onTranscriptionComplete(data.text);
        
        toast.success("Voice transcribed", {
          description: "Your spoken description has been added.",
          id: "transcription"
        });
      } else {
        throw new Error("No transcription returned");
      }
    } catch (error) {
      console.error("Fallback transcription error:", error);
      setIsProcessing(false);
      toast.error("Transcription failed", { 
        description: error instanceof Error ? error.message : "Failed to process your voice input.",
        id: "transcription"
      });
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={language} onValueChange={setLanguage}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Language" />
        </SelectTrigger>
        <SelectContent>
          {LANGUAGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
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
