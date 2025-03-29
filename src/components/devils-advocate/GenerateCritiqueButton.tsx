
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
      className="h-[200px] w-full"
      onClick={onGenerateCritique}
      active={isAnalyzing}
      disabled={isAnalyzing}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 text-white">
        {isAnalyzing ? (
          <>
            <Loader2Icon className="h-6 w-6 animate-spin mb-2 text-white" />
            <h3 className="font-bold text-lg text-white">Generating critique...</h3>
          </>
        ) : (
          <>
            <Skull className="h-6 w-6 mb-2 text-white" />
            <h3 className="font-bold text-lg text-white">Devil's Advocate Critique</h3>
            <p className="text-sm opacity-90 text-white">Challenge your assumptions</p>
          </>
        )}
      </div>
    </PixelCard>
  );
};
