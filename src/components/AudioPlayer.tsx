
import { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { VolumeIcon, Volume2Icon, PauseIcon, LoaderIcon } from 'lucide-react';
import { captureException } from "@/integrations/sentry";

interface AudioPlayerProps {
  audioData: string;
  audioFormat?: string;
  title?: string;
}

export const AudioPlayer = ({ audioData, audioFormat = 'mp3', title }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  if (!audioRef.current) {
    audioRef.current = new Audio();
    audioRef.current.onended = () => setIsPlaying(false);
    audioRef.current.onerror = (e) => {
      console.error('Audio playback error:', e);
      captureException(e, { context: 'AudioPlayer', audioFormat });
      setIsPlaying(false);
      setIsLoading(false);
    };
    audioRef.current.oncanplaythrough = () => {
      setIsLoading(false);
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(err => {
            console.error('Failed to play audio:', err);
            captureException(err, { context: 'AudioPlayer', audioFormat });
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    };
  }

  const togglePlayback = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      
      // Create blob URL from base64 if not already set
      if (!audioRef.current.src || audioRef.current.src === '') {
        try {
          const binary = atob(audioData);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
          }
          const blob = new Blob([bytes.buffer], { type: `audio/${audioFormat}` });
          const url = URL.createObjectURL(blob);
          
          audioRef.current.src = url;
          // Load will trigger oncanplaythrough which handles playback
          audioRef.current.load();
        } catch (err) {
          console.error('Error creating audio blob:', err);
          captureException(err, { context: 'AudioPlayer', audioFormat });
          setIsLoading(false);
        }
      } else {
        // If already loaded, just play
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
            setIsLoading(false);
          })
          .catch(err => {
            console.error('Failed to play audio:', err);
            captureException(err, { context: 'AudioPlayer', audioFormat });
            setIsPlaying(false);
            setIsLoading(false);
          });
      }
    }
  };

  return (
    <Button 
      variant="outline" 
      size="icon" 
      onClick={togglePlayback}
      title={title || "Play audio"}
      className="rounded-full h-9 w-9"
    >
      {isLoading ? (
        <LoaderIcon className="h-4 w-4 animate-spin" />
      ) : isPlaying ? (
        <PauseIcon className="h-4 w-4" />
      ) : (
        <VolumeIcon className="h-4 w-4" />
      )}
    </Button>
  );
};
