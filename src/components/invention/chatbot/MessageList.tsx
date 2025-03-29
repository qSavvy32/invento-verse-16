
import React from "react";
import { ChatMessage } from "./types";
import { AlertTriangle } from "lucide-react";

export const MessageList = ({ messages }: { messages: ChatMessage[] }) => {
  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`flex ${
            message.role === "user" ? "justify-end" : "justify-start"
          }`}
        >
          <div
            className={`max-w-[85%] rounded-lg p-3 ${
              message.role === "user"
                ? "bg-invention-accent text-white"
                : message.isError
                ? "bg-red-100 text-red-800"
                : "bg-muted"
            }`}
          >
            {message.isError && (
              <div className="flex items-center mb-2">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                <span className="text-red-500 font-semibold">Error</span>
              </div>
            )}
            <div className="whitespace-pre-wrap">{message.content}</div>
            <div className="text-xs opacity-70 mt-1">
              {new Date(message.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
