
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  PencilLine, 
  Image, 
  MessageSquarePlus, 
  Layers,
  BarChart4,
  Loader2,
  Send
} from "lucide-react";
import { useState } from "react";

interface VisualizationButtonsGridProps {
  isLoading: {
    sketch: boolean;
    image: boolean;
    threejs: boolean;
    realistic3d: boolean;
    businessStrategy: boolean;
    customMarketing: boolean;
  };
  hasTitle: boolean;
  hasDescription: boolean;
  hasSketch: boolean;
  customPrompt: string;
  setCustomPrompt: (value: string) => void;
  onGenerateSketch: () => void;
  onGenerate3DImage: () => void;
  onGenerateRealistic3D: () => void;
  onGenerateBusinessStrategy: () => void;
  onGenerateCustomMarketingImage: (prompt: string) => void;
}

export const VisualizationButtonsGrid = ({
  isLoading,
  hasTitle,
  hasDescription,
  hasSketch,
  customPrompt,
  setCustomPrompt,
  onGenerateSketch,
  onGenerate3DImage,
  onGenerateRealistic3D,
  onGenerateBusinessStrategy,
  onGenerateCustomMarketingImage
}: VisualizationButtonsGridProps) => {
  const isDisabled = !hasTitle && !hasDescription;
  const [showCustomPrompt, setShowCustomPrompt] = useState(false);
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          disabled={isDisabled || isLoading.sketch}
          onClick={onGenerateSketch}
        >
          {isLoading.sketch ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <PencilLine className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">Generate Sketch</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          disabled={isDisabled || isLoading.realistic3d}
          onClick={onGenerateRealistic3D}
        >
          {isLoading.realistic3d ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <Image className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">Realistic Mockup</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          disabled={isDisabled || isLoading.customMarketing}
          onClick={() => setShowCustomPrompt(!showCustomPrompt)}
        >
          {isLoading.customMarketing ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <MessageSquarePlus className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">Custom Marketing</span>
        </Button>
        
        <Button
          variant="outline"
          className="h-auto py-4 flex flex-col items-center gap-2"
          disabled={isDisabled || isLoading.businessStrategy}
          onClick={onGenerateBusinessStrategy}
        >
          {isLoading.businessStrategy ? (
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          ) : (
            <BarChart4 className="h-6 w-6 text-muted-foreground" />
          )}
          <span className="text-xs font-medium">Business Strategy</span>
        </Button>
      </div>
      
      {showCustomPrompt && (
        <div className="flex gap-2 items-center mt-4">
          <Input
            placeholder="Describe the marketing imagery you want to generate..."
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={isLoading.customMarketing}
            className="flex-grow"
          />
          <Button
            onClick={() => onGenerateCustomMarketingImage(customPrompt)}
            disabled={!customPrompt.trim() || isLoading.customMarketing}
            size="icon"
          >
            {isLoading.customMarketing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
