
import { useState } from "react";
import { SparklesIcon } from "lucide-react";
import { AuthPrompt } from "../AuthPrompt";
import { useIdeaGeneration } from "./useIdeaGeneration";
import { IdeaForm } from "./IdeaForm";
import { IdeasGrid } from "./IdeasGrid";
import { useInvention } from "@/contexts/InventionContext";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

interface IdeaGeneratorProps {
  sketchDataUrl?: string;
}

export const IdeaGenerator = ({ sketchDataUrl }: IdeaGeneratorProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
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
  
  // Add local state to handle the case when InventionContext is not available
  const [localTitle, setLocalTitle] = useState("");
  const [localDescription, setLocalDescription] = useState("");
  
  // Try to use the InventionContext if available, otherwise catch the error
  const inventionContext = { state: { title: localTitle, description: localDescription }, updateTitle: setLocalTitle, updateDescription: setLocalDescription };
  let contextIsAvailable = false;
  
  try {
    const context = useInvention();
    contextIsAvailable = true;
    // If we get here, the context is available
  } catch (error) {
    // Context not available, we'll use the local state
    contextIsAvailable = false;
  }
  
  // Check if we should hide the form because results are showing
  const hasResults = Object.keys(generatedIdeas).length > 0;
  
  return (
    <div className="py-6 px-0">
      {!isExpanded ? (
        <div className="text-center">
          <Button 
            onClick={() => setIsExpanded(true)}
            className="bg-invention-accent hover:bg-invention-accent/90 text-white px-8 py-6 rounded-xl text-lg font-medium shadow-md transition-all hover:scale-105"
            size="lg"
          >
            <SparklesIcon className="mr-2 h-5 w-5" />
            Try Now!
          </Button>
        </div>
      ) : (
        <div className="max-w-4xl mx-auto py-6 px-6 bg-gradient-to-br from-invention-accent/10 to-invention-highlight/10 rounded-xl border border-invention-accent/20 overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center p-2 bg-invention-accent/20 rounded-full mb-2">
                  <SparklesIcon className="h-6 w-6 text-invention-accent" />
                </div>
                <h2 className="text-2xl font-bold font-leonardo text-invention-ink">Ignite Your Revolutionary Vision!</h2>
                <p className="text-sm text-invention-ink/80 max-w-2xl mx-auto">
                  Every world-changing invention begins with a spark of imagination. What challenge will <span className="font-bold text-invention-accent">YOU</span> solve?
                </p>
              </div>
              <Button 
                variant="outline" 
                onClick={() => setIsExpanded(false)}
                className="shrink-0 ml-4"
              >
                Hide
              </Button>
            </div>
            
            {/* Show the basic info and form only if there are no results yet */}
            {!hasResults && (
              <>
                {/* Add Basic Information Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-invention-ink">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <Input
                        placeholder="Give your invention a name"
                        value={contextIsAvailable ? inventionContext.state.title : localTitle}
                        onChange={(e) => contextIsAvailable ? inventionContext.updateTitle(e.target.value) : setLocalTitle(e.target.value)}
                        className="text-base font-semibold"
                      />
                    </div>
                    
                    <div>
                      <Textarea
                        placeholder="Describe your invention..."
                        value={contextIsAvailable ? inventionContext.state.description : localDescription}
                        onChange={(e) => contextIsAvailable ? inventionContext.updateDescription(e.target.value) : setLocalDescription(e.target.value)}
                        className="min-h-[80px] max-h-[120px] text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4 bg-invention-accent/20" />
                
                <IdeaForm
                  description={description}
                  setDescription={setDescription}
                  sketchDataUrl={sketchDataUrl}
                  onGenerate={() => generateIdeas()}
                  isGenerating={isGenerating}
                  error={error}
                  onVoiceTranscription={handleVoiceTranscription}
                />
              </>
            )}
            
            {/* Results are always visible if they exist */}
            {hasResults && (
              <div className="mt-6">
                <IdeasGrid generatedIdeas={generatedIdeas} />
              </div>
            )}
          </div>
          
          {/* Auth Prompt Dialog */}
          {showAuthPrompt && (
            <AuthPrompt 
              onConfirm={saveInputAndRedirect}
              onCancel={handleCloseAuthPrompt}
            />
          )}
        </div>
      )}
    </div>
  );
};
