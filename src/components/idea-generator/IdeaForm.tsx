
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Loader2Icon,
  LightbulbIcon,
  RocketIcon,
  ArrowRightIcon,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { VoiceInput } from "../VoiceInput";

interface IdeaFormProps {
  description: string;
  setDescription: (desc: string) => void;
  sketchDataUrl?: string;
  onGenerate: () => void;
  isGenerating: boolean;
  error: string | null;
  onVoiceTranscription: (text: string) => void;
}

export const IdeaForm = ({ 
  description, 
  setDescription, 
  sketchDataUrl, 
  onGenerate, 
  isGenerating, 
  error, 
  onVoiceTranscription 
}: IdeaFormProps) => {
  return (
    <Card className="bg-white/70 backdrop-blur border-invention-accent/30 shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl text-invention-ink flex items-center">
          <RocketIcon className="h-5 w-5 mr-2 text-invention-accent" />
          Your Groundbreaking Concept
        </CardTitle>
        <CardDescription>
          Share your vision, no matter how ambitious—we'll help bring it to life
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description" className="text-invention-ink font-medium">What's your world-changing idea?</Label>
            <VoiceInput onTranscriptionComplete={onVoiceTranscription} />
          </div>
          <Textarea
            id="description"
            placeholder="I envision a solution that... My invention would revolutionize... The global impact would be..."
            className="h-36 border-invention-accent/30 focus:border-invention-accent focus-visible:ring-invention-accent/20"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          {sketchDataUrl && (
            <div className="mt-4">
              <p className="text-sm text-muted-foreground mb-2">Your visual concept:</p>
              <img 
                src={sketchDataUrl} 
                alt="Your concept visualization" 
                className="max-h-64 border rounded-md shadow-sm" 
              />
            </div>
          )}
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="w-full bg-invention-accent hover:bg-invention-accent/90 text-white font-medium shadow-sm group transition-all"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
              Igniting Your Vision...
            </>
          ) : (
            <>
              <LightbulbIcon className="mr-2 h-5 w-5" />
              Transform Your Idea Into Reality
              <ArrowRightIcon className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
