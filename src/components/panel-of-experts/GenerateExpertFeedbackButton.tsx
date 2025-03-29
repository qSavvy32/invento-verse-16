
import { Loader2Icon, Users } from "lucide-react";
import PixelCard from "../ui/PixelCard";

interface GenerateExpertFeedbackButtonProps {
  isAnalyzing: boolean;
  onGenerateFeedback: () => void;
}

export const GenerateExpertFeedbackButton = ({ 
  isAnalyzing, 
  onGenerateFeedback 
}: GenerateExpertFeedbackButtonProps) => {
  return (
    <PixelCard 
      variant="blue" 
      className="h-[200px] w-full"
      onClick={onGenerateFeedback}
      active={isAnalyzing}
      disabled={isAnalyzing}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 text-white">
        {isAnalyzing ? (
          <>
            <Loader2Icon className="h-6 w-6 animate-spin mb-2 text-white" />
            <h3 className="font-bold text-lg text-white">Consulting with experts...</h3>
          </>
        ) : (
          <>
            <Users className="h-6 w-6 mb-2 text-white" />
            <h3 className="font-bold text-lg text-white">Consult Panel of Experts</h3>
            <p className="text-sm opacity-90 text-white">Get insights from industry professionals</p>
          </>
        )}
      </div>
    </PixelCard>
  );
};
