
import { useEffect, useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { TranscriptViewer } from "./TranscriptViewer";
import { toast } from "sonner";
import "./ElevenLabsWidget.css";
import Dither from "./Dither";

interface VoiceConversationProps {
  agentId: string;
  onConversationEnd?: (transcript: string[]) => void;
}

export const VoiceConversation = ({ agentId, onConversationEnd }: VoiceConversationProps) => {
  const { state } = useInvention();
  const [transcript, setTranscript] = useState<string[]>([]);
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  // Function to track conversation content from widget
  const handleConversationMessage = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail && customEvent.detail.content) {
      setTranscript(prev => [...prev, customEvent.detail.content]);
    }
  };
  
  // Function to track conversation status changes from widget
  const handleStatusChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    if (customEvent.detail) {
      if (customEvent.detail.status === 'connected') {
        toast.success("Connected to voice assistant");
      } else if (customEvent.detail.status === 'disconnected') {
        toast.info("Voice conversation ended");
        if (onConversationEnd && transcript.length > 0) {
          onConversationEnd(transcript);
        }
      }
    }
  };

  // Setup the widget and event listeners
  useEffect(() => {
    const mountPoint = document.getElementById('elevenlabs-widget-direct-mount');
    
    // Clear any existing widgets first
    if (mountPoint) {
      const existingWidget = mountPoint.querySelector('elevenlabs-convai');
      if (existingWidget) {
        mountPoint.removeChild(existingWidget);
      }
    }
    
    // Create and append the widget element directly to the mount point
    if (mountPoint && !mountPoint.querySelector('elevenlabs-convai')) {
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', agentId);
      
      // Set system prompt with invention context if available
      if (state.title || state.description) {
        const systemPrompt = `You are Vinci, an AI assistant specializing in invention development and analysis. You're currently helping with an invention called "${state.title || 'Unnamed invention'}" that is described as: "${state.description || 'No description provided yet'}". Be supportive, encouraging, and help the user develop their idea fully.`;
        widget.setAttribute('system-prompt', systemPrompt);
      }
      
      // Add custom attributes to control the widget UI
      widget.setAttribute('theme', 'light');
      widget.setAttribute('size', 'small');
      
      // Use inline-block to only take up needed space
      widget.style.display = 'inline-block';
      widget.style.width = 'auto';
      widget.style.maxWidth = '500px';
      widget.style.boxSizing = 'border-box';
      widget.style.margin = '0 auto';
      widget.style.padding = '0';
      widget.style.overflow = 'hidden';
      widget.style.position = 'relative';
      widget.style.zIndex = '10';
      
      mountPoint.appendChild(widget);
      
      // Add the script if not already added
      if (!document.querySelector('script[src="https://elevenlabs.io/convai-widget/index.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://elevenlabs.io/convai-widget/index.js';
        script.async = true;
        script.type = 'text/javascript';
        script.onload = () => {
          setWidgetLoaded(true);
          toast.success("ElevenLabs voice widget loaded successfully");
        };
        script.onerror = () => {
          toast.error("Failed to load ElevenLabs voice widget");
        };
        
        // Add the script to the body instead of head to prevent automatic focus
        document.body.appendChild(script);
      } else {
        setWidgetLoaded(true);
      }
    }

    // Add event listeners for widget events
    window.addEventListener('convai-message', handleConversationMessage);
    window.addEventListener('convai-status-change', handleStatusChange);

    // Clean up function
    return () => {
      window.removeEventListener('convai-message', handleConversationMessage);
      window.removeEventListener('convai-status-change', handleStatusChange);
    };
  }, [agentId, state.title, state.description, onConversationEnd]);

  return (
    <div className="flex flex-col items-center justify-center w-full relative">
      {/* Add the Dither background */}
      <div style={{ width: '100%', height: '600px', position: 'absolute', top: 0, left: 0, zIndex: 1 }}>
        <Dither
          waveColor={[0.5, 0.5, 0.5]}
          disableAnimation={false}
          enableMouseInteraction={true}
          mouseRadius={0.3}
          colorNum={4}
          waveAmplitude={0.3}
          waveFrequency={3}
          waveSpeed={0.05}
        />
      </div>
      
      {!widgetLoaded && (
        <div className="text-center p-2 w-full relative z-10">
          <div className="animate-spin h-8 w-8 border-4 border-invention-accent rounded-full border-t-transparent mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading voice assistant...</p>
        </div>
      )}
      
      <div id="elevenlabs-widget-direct-mount" className="flex justify-center items-center relative z-10">
        {/* The widget will be mounted here */}
      </div>
      
      {transcript.length > 0 && (
        <div className="relative z-10 w-full mt-4">
          <TranscriptViewer transcript={transcript} />
        </div>
      )}
    </div>
  );
};
