
import { useState, useRef } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useInvention } from "@/contexts/InventionContext";

interface UseVoiceRecorderProps {
  onTranscriptionComplete: (text: string) => void;
}

export const useVoiceRecorder = ({ onTranscriptionComplete }: UseVoiceRecorderProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState("eng");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { user } = useAuth();
  const { addAudioTranscription } = useInvention();

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

  const saveAudioToStorage = async (audioBlob: Blob): Promise<string | null> => {
    if (!user) return null;
    
    try {
      const timestamp = Date.now();
      const fileName = `audio_${user.id}_${timestamp}.webm`;
      const filePath = `audio/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('invention-assets')
        .upload(filePath, audioBlob);
        
      if (uploadError) {
        console.error("Error uploading audio:", uploadError);
        return null;
      }
      
      const { data } = supabase.storage
        .from('invention-assets')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error("Error saving audio:", error);
      return null;
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
      
      // Save audio to storage if user is authenticated
      let audioUrl: string | null = null;
      if (user) {
        audioUrl = await saveAudioToStorage(audioBlob);
      }
      
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
          
          // Add transcription to context
          addAudioTranscription({
            audioUrl: audioUrl,
            language: language,
            text: elevenLabsData.text,
            timestamp: Date.now()
          });
          
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
        
        // Add transcription to context (without audio URL since not authenticated)
        addAudioTranscription({
          language: language,
          text: data.text,
          timestamp: Date.now()
        });
        
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

  return {
    isRecording,
    isProcessing,
    language,
    setLanguage,
    startRecording,
    stopRecording
  };
};
