import { Alert, AlertDescription } from "@/components/ui/alert";
import { useInvention } from "@/contexts/InventionContext";
import { GenerateExpertFeedbackButton } from "./GenerateExpertFeedbackButton";
import { ExpertFeedbackCard } from "./ExpertFeedbackCard";
import { SaveExportSection } from "../devils-advocate/SaveExportSection";
import { useExpertFeedbackGeneration } from "./hooks/useExpertFeedbackGeneration";
import { VoiceInput } from "../VoiceInput";
import { useState } from "react";
import { Lightbulb, Users } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const PanelOfExperts = () => {
  const { state, saveToDatabase } = useInvention();
  const { feedback, isAnalyzing, error, generateFeedback } = useExpertFeedbackGeneration();
  const [voiceTranscription, setVoiceTranscription] = useState("");
  const [language, setLanguage] = useState("eng");
  
  const handleGenerateFeedback = async () => {
    await generateFeedback(state.title, state.description, state.sketchDataUrl, language);
  };

  // Handle saving to database with proper typing
  const handleSaveToDatabase = async (showToast?: boolean) => {
    await saveToDatabase(showToast);
  };
  
  const handleTranscriptionComplete = (text: string) => {
    setVoiceTranscription(text);
  };
  
  return (
    <div className="p-4">
      {error && (
        <Alert variant="destructive" className="w-full mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-6 flex flex-col items-end">
        <div className="w-[300px]">
          <GenerateExpertFeedbackButton 
            isAnalyzing={isAnalyzing}
            onGenerateFeedback={handleGenerateFeedback}
          />
        </div>
        
        {feedback && <ExpertFeedbackCard feedback={feedback} />}
        
        <div className="w-[300px]">
          <Card className="bg-gradient-to-br from-blue-50 to-white overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold">Voice Your Idea</h3>
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Speak to our panel of experts in your preferred language
                </p>
                <VoiceInput 
                  onTranscriptionComplete={handleTranscriptionComplete} 
                  language={language}
                  onLanguageChange={setLanguage}
                />
              </div>
              
              {voiceTranscription && (
                <div className="mt-4 p-3 bg-blue-50 rounded-md">
                  <p className="text-sm font-medium mb-1">Your transcribed input:</p>
                  <p className="text-sm italic">{voiceTranscription}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-[300px]">
          <SaveExportSection 
            inventionState={state}
            onSave={handleSaveToDatabase}
          />
        </div>
      </div>
    </div>
  );
};
