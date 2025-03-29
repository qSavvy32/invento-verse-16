
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { AlertCircle, Loader2, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VoiceInput } from "@/components/VoiceInput";

interface IdeaFormProps {
  description: string;
  setDescription: (description: string) => void;
  sketchDataUrl?: string;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
  onVoiceTranscription: (text: string) => void;
  hideDescriptionInput?: boolean; // New prop to control visibility of description input
}

export const IdeaForm = ({
  description,
  setDescription,
  sketchDataUrl,
  onGenerate,
  isGenerating,
  error,
  onVoiceTranscription,
  hideDescriptionInput = false, // Default to showing the input
}: IdeaFormProps) => {
  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div className="space-y-4">
        {!hideDescriptionInput && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your world-changing idea..."
                className="min-h-[120px] text-sm"
              />
            </div>
            
            <div className="flex justify-end">
              <VoiceInput onTranscriptionComplete={onVoiceTranscription} />
            </div>
          </div>
        )}
        
        <div className="flex justify-center">
          <Button
            onClick={onGenerate}
            disabled={isGenerating || (!description && !sketchDataUrl)}
            className="bg-invention-accent hover:bg-invention-accent/90 text-white font-medium w-full sm:w-auto py-6 px-8"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Transform Your Idea Into Reality
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
