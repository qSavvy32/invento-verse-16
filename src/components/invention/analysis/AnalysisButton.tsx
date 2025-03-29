
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface AnalysisButtonProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  isLoading: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export const AnalysisButton = ({
  icon,
  title,
  description,
  isLoading,
  isDisabled,
  onClick,
}: AnalysisButtonProps) => {
  return (
    <Button 
      onClick={onClick} 
      disabled={isLoading || isDisabled}
      variant="outline"
      className="flex items-center gap-2 h-auto py-3 transition-all hover:bg-slate-100 hover:shadow-sm active:scale-[0.98] w-full"
    >
      <div className="flex items-center justify-center w-8 h-8 bg-slate-50 rounded-full">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-500" />
        ) : (
          icon
        )}
      </div>
      <div className="text-left">
        <div className="font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{description}</div>
      </div>
    </Button>
  );
};
