
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ChatbotContainer } from "./chatbot/ChatbotContainer";
import { CircleIcon } from "lucide-react";

export const VinciAssistant = () => {
  return (
    <Card className="mb-8">
      <div className="flex items-center p-4 border-b">
        <CircleIcon className="h-3 w-3 mr-2 text-green-500" />
        <h3 className="text-lg font-semibold">Vinci Assistant</h3>
      </div>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground mb-4">
          Start by describing your invention idea to Vinci, and I'll help you develop and analyze it.
        </p>
        <ChatbotContainer />
      </CardContent>
    </Card>
  );
};
