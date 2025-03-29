
import { useState } from "react";
import { Loader2Icon, Skull } from "lucide-react";
import PixelCard from "../ui/PixelCard";

interface GenerateCritiqueButtonProps {
  isAnalyzing: boolean;
  onGenerateCritique: () => void;
}

export const GenerateCritiqueButton = ({ 
  isAnalyzing, 
  onGenerateCritique 
}: GenerateCritiqueButtonProps) => {
  return (
    <PixelCard 
      variant="red" 
      className="w-full"
      onClick={onGenerateCritique}
      active={isAnalyzing}
      disabled={isAnalyzing}
    >
      <div className="p-4 text-center">
        {isAnalyzing ? (
          <>
            <Loader2Icon className="mx-auto h-6 w-6 animate-spin mb-2" />
            <h3 className="font-bold text-lg">Generating critique...</h3>
          </>
        ) : (
          <>
            <Skull className="mx-auto h-6 w-6 mb-2" />
            <h3 className="font-bold text-lg">Devil's Advocate Critique</h3>
            <p className="text-sm opacity-80">Challenge your assumptions</p>
          </>
        )}
      </div>
    </PixelCard>
  );
};
