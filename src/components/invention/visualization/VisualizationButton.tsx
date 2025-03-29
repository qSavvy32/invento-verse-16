
import { Button } from "@/components/ui/button";
import { Loader2, LucideIcon } from "lucide-react";

interface VisualizationButtonProps {
  onClick: () => void;
  disabled: boolean;
  icon: LucideIcon;
  isLoading: boolean;
  label: string;
}

export const VisualizationButton = ({
  onClick,
  disabled,
  icon: Icon,
  isLoading,
  label
}: VisualizationButtonProps) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={disabled || isLoading}
      className="h-16 flex flex-col justify-center items-center p-2 space-y-1"
    >
      {isLoading ? (
        <Loader2 className="h-5 w-5 animate-spin mb-1" />
      ) : (
        <Icon className="h-5 w-5 mb-1" />
      )}
      <span className="text-sm">{label}</span>
    </Button>
  );
};
