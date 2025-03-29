
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardIcon, BookIcon, CodeIcon, PieChartIcon } from "lucide-react";
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AudioPlayer } from "@/components/AudioPlayer";
import { captureException } from "@/integrations/sentry";

interface AnalysisCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  insights: string[];
  cardClassName?: string;
}

// A cache of already generated audio data to avoid redundant API calls
const audioCache: Record<string, string> = {};

export const AnalysisResults = () => {
  const { state } = useInvention();
  
  // Only show categories that have results
  const hasResults = {
    technical: state.analysisResults.technical.length > 0,
    market: state.analysisResults.market.length > 0,
    legal: state.analysisResults.legal.length > 0,
    business: state.analysisResults.business.length > 0
  };
  
  // Check if we have any results to show
  const hasAnyResults = Object.values(hasResults).some(result => result);
  
  if (!hasAnyResults) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasResults.technical && (
          <AnalysisCard
            title="Technical Insights"
            description="Engineering and design considerations"
            icon={<CodeIcon className="h-5 w-5" />}
            insights={state.analysisResults.technical}
            cardClassName="da-vinci-note"
          />
        )}
        
        {hasResults.market && (
          <AnalysisCard
            title="Market Analysis"
            description="Potential market and audience insights"
            icon={<PieChartIcon className="h-5 w-5" />}
            insights={state.analysisResults.market}
            cardClassName="da-vinci-note"
          />
        )}
        
        {hasResults.legal && (
          <AnalysisCard
            title="Intellectual Property"
            description="Patent and legal considerations"
            icon={<AwardIcon className="h-5 w-5" />}
            insights={state.analysisResults.legal}
            cardClassName="da-vinci-note"
          />
        )}
        
        {hasResults.business && (
          <AnalysisCard
            title="Business Strategy"
            description="Monetization and business recommendations"
            icon={<BookIcon className="h-5 w-5" />}
            insights={state.analysisResults.business}
            cardClassName="da-vinci-note"
          />
        )}
      </div>
    </div>
  );
};

const AnalysisCard = ({ title, description, icon, insights, cardClassName }: AnalysisCardProps) => {
  const [audioData, setAudioData] = useState<string | null>(null);
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  
  const generateTextToSpeech = useCallback(async () => {
    // If we already have audio, don't generate it again
    if (audioData) return;
    
    // Create a cache key based on the content
    const cacheKey = title + insights.join();
    
    // Check if we have this in our cache
    if (audioCache[cacheKey]) {
      setAudioData(audioCache[cacheKey]);
      return;
    }
    
    setIsGeneratingAudio(true);
    
    try {
      // Prepare text for speech - combine title and insights
      const speechText = `${title}. ${insights.join(". ")}`;
      
      // Call our text-to-speech edge function
      const { data, error } = await supabase.functions.invoke("text-to-speech", {
        body: {
          text: speechText,
        },
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Store in cache and state
      if (data.audio) {
        audioCache[cacheKey] = data.audio;
        setAudioData(data.audio);
        
        // Show a subtle toast to indicate audio is ready
        toast.success("Audio generated", {
          description: `Audio for ${title} is now ready to play`,
          duration: 3000,
        });
      }
    } catch (error) {
      console.error("Error generating text-to-speech:", error);
      captureException(error, { component: "AnalysisCard", action: "generateTextToSpeech" });
      
      toast.error("Failed to generate audio", {
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsGeneratingAudio(false);
    }
  }, [title, insights, audioData]);
  
  // Generate audio as soon as we render with data
  if (insights.length > 0 && !audioData && !isGeneratingAudio) {
    generateTextToSpeech();
  }
  
  return (
    <Card className={cardClassName}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-invention-ink flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        
        {audioData && (
          <AudioPlayer 
            audioData={audioData} 
            title={`Listen to ${title}`}
          />
        )}
      </CardHeader>
      <CardContent>
        <ul className="list-disc pl-5 space-y-2 font-leonardo">
          {insights.map((insight, index) => (
            <li key={`insight-${index}`} className="text-invention-ink">{insight}</li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};
