
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardIcon, BookIcon, CodeIcon, PieChartIcon } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
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
  timestamp: string;
}

// A cache of already generated audio data to avoid redundant API calls
const audioCache: Record<string, string> = {};

export const AnalysisResults = () => {
  const { state } = useInvention();
  const [analysisHistory, setAnalysisHistory] = useState<{
    technical: { insights: string[], timestamp: string }[];
    market: { insights: string[], timestamp: string }[];
    legal: { insights: string[], timestamp: string }[];
    business: { insights: string[], timestamp: string }[];
  }>({
    technical: [],
    market: [],
    legal: [],
    business: []
  });
  
  // Update the history when new results come in
  useEffect(() => {
    const currentTime = new Date().toLocaleTimeString();
    
    // For each category, check if we have new insights
    if (state.analysisResults.technical.length > 0) {
      setAnalysisHistory(prev => {
        // Check if these exact insights already exist in our history
        const alreadyExists = prev.technical.some(item => 
          JSON.stringify(item.insights) === JSON.stringify(state.analysisResults.technical)
        );
        
        if (!alreadyExists) {
          return {
            ...prev,
            technical: [...prev.technical, { 
              insights: [...state.analysisResults.technical],
              timestamp: currentTime
            }]
          };
        }
        return prev;
      });
    }
    
    if (state.analysisResults.market.length > 0) {
      setAnalysisHistory(prev => {
        const alreadyExists = prev.market.some(item => 
          JSON.stringify(item.insights) === JSON.stringify(state.analysisResults.market)
        );
        
        if (!alreadyExists) {
          return {
            ...prev,
            market: [...prev.market, { 
              insights: [...state.analysisResults.market],
              timestamp: currentTime
            }]
          };
        }
        return prev;
      });
    }
    
    if (state.analysisResults.legal.length > 0) {
      setAnalysisHistory(prev => {
        const alreadyExists = prev.legal.some(item => 
          JSON.stringify(item.insights) === JSON.stringify(state.analysisResults.legal)
        );
        
        if (!alreadyExists) {
          return {
            ...prev,
            legal: [...prev.legal, { 
              insights: [...state.analysisResults.legal],
              timestamp: currentTime
            }]
          };
        }
        return prev;
      });
    }
    
    if (state.analysisResults.business.length > 0) {
      setAnalysisHistory(prev => {
        const alreadyExists = prev.business.some(item => 
          JSON.stringify(item.insights) === JSON.stringify(state.analysisResults.business)
        );
        
        if (!alreadyExists) {
          return {
            ...prev,
            business: [...prev.business, { 
              insights: [...state.analysisResults.business],
              timestamp: currentTime
            }]
          };
        }
        return prev;
      });
    }
  }, [state.analysisResults]);
  
  // Check if we have any results in the history to show
  const hasAnyResults = 
    analysisHistory.technical.length > 0 ||
    analysisHistory.market.length > 0 ||
    analysisHistory.legal.length > 0 ||
    analysisHistory.business.length > 0;
  
  if (!hasAnyResults) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
      
      <div className="space-y-8">
        {/* Technical Insights */}
        {analysisHistory.technical.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Technical Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisHistory.technical.map((item, index) => (
                <AnalysisCard
                  key={`technical-${index}`}
                  title={`Technical Analysis ${index + 1}`}
                  description="Engineering and design considerations"
                  icon={<CodeIcon className="h-5 w-5" />}
                  insights={item.insights}
                  timestamp={item.timestamp}
                  cardClassName="da-vinci-note"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Market Analysis */}
        {analysisHistory.market.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Market Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisHistory.market.map((item, index) => (
                <AnalysisCard
                  key={`market-${index}`}
                  title={`Market Analysis ${index + 1}`}
                  description="Potential market and audience insights"
                  icon={<PieChartIcon className="h-5 w-5" />}
                  insights={item.insights}
                  timestamp={item.timestamp}
                  cardClassName="da-vinci-note"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Intellectual Property */}
        {analysisHistory.legal.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Intellectual Property</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisHistory.legal.map((item, index) => (
                <AnalysisCard
                  key={`legal-${index}`}
                  title={`IP Analysis ${index + 1}`}
                  description="Patent and legal considerations"
                  icon={<AwardIcon className="h-5 w-5" />}
                  insights={item.insights}
                  timestamp={item.timestamp}
                  cardClassName="da-vinci-note"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Business Strategy */}
        {analysisHistory.business.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-3">Business Strategy</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysisHistory.business.map((item, index) => (
                <AnalysisCard
                  key={`business-${index}`}
                  title={`Business Analysis ${index + 1}`}
                  description="Monetization and business recommendations"
                  icon={<BookIcon className="h-5 w-5" />}
                  insights={item.insights}
                  timestamp={item.timestamp}
                  cardClassName="da-vinci-note"
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const AnalysisCard = ({ title, description, icon, insights, cardClassName, timestamp }: AnalysisCardProps) => {
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
          <div className="text-xs text-muted-foreground mt-1">Generated at {timestamp}</div>
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
