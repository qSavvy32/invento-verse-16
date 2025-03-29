
import { SparklesIcon } from "lucide-react";
import { AuthPrompt } from "../AuthPrompt";
import { useIdeaGeneration } from "./useIdeaGeneration";
import { IdeaForm } from "./IdeaForm";
import { IdeasGrid } from "./IdeasGrid";

interface IdeaGeneratorProps {
  sketchDataUrl?: string;
}

export const IdeaGenerator = ({ sketchDataUrl }: IdeaGeneratorProps) => {
  const {
    description,
    setDescription,
    isGenerating,
    generatedIdeas,
    error,
    pendingVoiceInput,
    showAuthPrompt,
    handleVoiceTranscription,
    saveInputAndRedirect,
    generateIdeas,
    handleCloseAuthPrompt
  } = useIdeaGeneration(sketchDataUrl);
  
  return (
    <div className="py-16 px-6 bg-gradient-to-br from-invention-accent/10 to-invention-highlight/10 rounded-xl border border-invention-accent/20">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-2 bg-invention-accent/20 rounded-full mb-2">
            <SparklesIcon className="h-8 w-8 text-invention-accent" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold font-leonardo text-invention-ink">Ignite Your Revolutionary Vision!</h2>
          <p className="text-lg text-invention-ink/80 max-w-2xl mx-auto">
            Every world-changing invention begins with a spark of imagination. What challenge will <span className="font-bold text-invention-accent">YOU</span> solve? How will your idea transform the future?
          </p>
        </div>
        
        <IdeaForm
          description={description}
          setDescription={setDescription}
          sketchDataUrl={sketchDataUrl}
          onGenerate={() => generateIdeas()}
          isGenerating={isGenerating}
          error={error}
          onVoiceTranscription={handleVoiceTranscription}
        />
        
        <IdeasGrid generatedIdeas={generatedIdeas} />
      </div>
      
      {/* Auth Prompt Dialog */}
      {showAuthPrompt && (
        <AuthPrompt 
          onConfirm={saveInputAndRedirect}
          onCancel={handleCloseAuthPrompt}
        />
      )}
    </div>
  );
};
