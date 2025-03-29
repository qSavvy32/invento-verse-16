
import React from "react";
import { ChatMode } from "./types";

interface ChatModeIndicatorProps {
  mode: ChatMode;
}

export const ChatModeIndicator: React.FC<ChatModeIndicatorProps> = ({ mode }) => {
  const getModeDescription = (mode: ChatMode): string => {
    switch (mode) {
      case "ideation":
        return "Ideation Mode: Let's brainstorm your invention idea";
      case "technical":
        return "Technical Analysis: Exploring feasibility and challenges";
      case "market":
        return "Market Analysis: Understanding users and market potential";
      case "legal":
        return "Legal Analysis: Examining IP and regulatory considerations";
      case "business":
        return "Business Analysis: Exploring commercialization paths";
      case "synthesis":
        return "Synthesis: Creating a comprehensive evaluation";
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      <div className="text-xs text-muted-foreground text-center mt-2">
        {getModeDescription(mode)}
      </div>
    </div>
  );
};
