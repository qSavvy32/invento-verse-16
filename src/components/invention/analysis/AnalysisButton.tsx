
import React from "react";
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
  onClick
}: AnalysisButtonProps) => {
  return (
    <Button
      variant="outline"
      className="h-auto p-4 flex flex-col items-center gap-2 w-full"
      disabled={isDisabled || isLoading}
      onClick={onClick}
    >
      <div className="flex items-center justify-center h-6 w-6 text-muted-foreground">
        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : icon}
      </div>
      <div className="space-y-1 text-center">
        <h3 className="font-medium text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
    </Button>
  );
};
