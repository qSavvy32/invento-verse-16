
import { useInvention } from "@/contexts/InventionContext";
import { SketchCanvas } from "@/components/SketchCanvas";
import { CameraInput } from "@/components/CameraInput";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button"; 
import { Camera, Pen, Mic } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const MultimodalInputArea = () => {
  const { updateSketchData, updateDescription } = useInvention();
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  
  const handleSketchSave = (dataUrl: string) => {
    updateSketchData(dataUrl);
  };
  
  const handleCameraCapture = (imageData: string) => {
    updateSketchData(imageData);
  };
  
  const startRecording = async () => {
    setRecordingError(null);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      setMediaRecorder(recorder);
      setAudioChunks([]);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prevChunks) => [...prevChunks, e.data]);
        }
      };
      
      recorder.onstop = handleVoiceTranscription;
      
      recorder.start();
      setIsRecording(true);
      
      toast.info("Recording started", {
        description: "Speak clearly to describe your invention."
      });
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setRecordingError("Could not access your microphone. Please check your permissions.");
      toast.error("Recording failed", {
        description: "Could not access your microphone. Please check your permissions."
      });
    }
  };
  
  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      
      // Stop all microphone streams
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
      
      toast.info("Processing voice input...");
    }
  };
  
  const handleVoiceTranscription = async () => {
    if (audioChunks.length === 0) {
      toast.error("No audio recorded");
      return;
    }
    
    try {
      // Create audio blob and convert to base64
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      const reader = new FileReader();
      
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string).split(",")[1];
        
        toast.loading("Transcribing your voice...", { id: "transcription" });
        
        try {
          // Call the Supabase Edge Function for transcription
          const { data, error } = await supabase.functions.invoke("voice-to-text", {
            body: { audio: base64Audio }
          });
          
          if (error) {
            throw new Error(error.message);
          }
          
          if (data?.text) {
            // Update the invention description with the transcribed text
            updateDescription(data.text);
            
            toast.success("Voice transcribed", {
              description: "Your spoken description has been added to the invention.",
              id: "transcription"
            });
          } else {
            throw new Error("No transcription returned");
          }
        } catch (error) {
          console.error("Transcription error:", error);
          toast.error("Transcription failed", { 
            description: error instanceof Error ? error.message : "Failed to process your voice input.",
            id: "transcription"
          });
        }
      };
      
      reader.readAsDataURL(audioBlob);
    } catch (error) {
      console.error("Error processing audio:", error);
      toast.error("Processing failed", {
        description: "There was an error processing your voice recording."
      });
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Visual Input</CardTitle>
        <CardDescription>
          Create a visual representation of your invention
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="sketch" className="space-y-4">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="sketch" className="flex items-center gap-2">
              <Pen size={16} />
              Sketch
            </TabsTrigger>
            <TabsTrigger value="camera" className="flex items-center gap-2">
              <Camera size={16} />
              Camera
            </TabsTrigger>
            <TabsTrigger value="voice" className="flex items-center gap-2">
              <Mic size={16} />
              Voice
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="sketch">
            <SketchCanvas onSketchSave={handleSketchSave} />
          </TabsContent>
          
          <TabsContent value="camera">
            <CameraInput onCapture={handleCameraCapture} />
          </TabsContent>
          
          <TabsContent value="voice">
            <div className="flex flex-col items-center space-y-4 p-4">
              <p className="text-center text-sm text-muted-foreground mb-4">
                Click the microphone button and speak to describe your invention.
                Your voice will be transcribed and added to the description.
              </p>
              
              {recordingError && (
                <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4 w-full">
                  {recordingError}
                </div>
              )}
              
              <Button 
                onClick={isRecording ? stopRecording : startRecording}
                className={`rounded-full h-16 w-16 ${isRecording ? 'bg-destructive hover:bg-destructive/90' : 'bg-primary'}`}
              >
                <Mic size={24} className={isRecording ? 'animate-pulse' : ''} />
              </Button>
              
              <p className="text-sm">
                {isRecording ? 'Click to stop recording' : 'Click to start recording'}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
