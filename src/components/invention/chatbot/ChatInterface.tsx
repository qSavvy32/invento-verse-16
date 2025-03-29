
import { useState, useRef, useEffect } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { CircleIcon, PlusIcon, RefreshCw, Send } from "lucide-react";
import { GeminiService } from "@/services/GeminiService";
import { ChatMessage, ChatMode } from "./types";
import { MessageList } from "./MessageList";
import { generateSystemPrompt } from "./promptUtils";
import { processGeminiResponse } from "./responseProcessor";

export const ChatInterface = () => {
  const { state, addAnalysisResult } = useInvention();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<ChatMode>("ideation");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add initial welcome message
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: "welcome",
          role: "assistant",
          content: "Hi there! I'm Vinci, your invention assistant. Tell me about your invention idea, and I'll help you develop it further.",
          timestamp: Date.now(),
        },
      ]);
    }
  }, [messages.length]);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;
    
    // Add user message to chat
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: inputMessage,
      timestamp: Date.now(),
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);
    
    try {
      // Generate the system prompt based on the current context and chat mode
      const systemPrompt = generateSystemPrompt(
        state.title,
        state.description,
        chatMode,
        messages
      );
      
      // Call Gemini API
      const response = await GeminiService.generateText(
        inputMessage,
        {
          systemPrompt,
          temperature: 0.7,
          modelVersion: "gemini-2.0-flash",
        }
      );
      
      if (!response) {
        throw new Error("Failed to get response from AI service");
      }
      
      // Process the response and extract structured data
      const { displayText, structuredData } = processGeminiResponse(response);
      
      // Add assistant message to chat
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: displayText,
        timestamp: Date.now(),
        structuredData,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Store any analysis results in the invention context
      if (structuredData) {
        if (structuredData.technical && structuredData.technical.length > 0) {
          addAnalysisResult("technical", structuredData.technical.join("\n\n"));
        }
        if (structuredData.market && structuredData.market.length > 0) {
          addAnalysisResult("market", structuredData.market.join("\n\n"));
        }
        if (structuredData.legal && structuredData.legal.length > 0) {
          addAnalysisResult("legal", structuredData.legal.join("\n\n"));
        }
        if (structuredData.business && structuredData.business.length > 0) {
          addAnalysisResult("business", structuredData.business.join("\n\n"));
        }
      }
      
      // Update chat mode based on conversation progression
      updateChatMode(messages.length + 2); // +2 for the current user message and assistant response
      
    } catch (error) {
      console.error("Error in chat:", error);
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          timestamp: Date.now(),
          isError: true,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic to progress through chat modes based on conversation stage
  const updateChatMode = (messageCount: number) => {
    if (messageCount >= 10) {
      setChatMode("synthesis");
    } else if (messageCount >= 7) {
      setChatMode("business");
    } else if (messageCount >= 5) {
      setChatMode("legal");
    } else if (messageCount >= 3) {
      setChatMode("market");
    } else if (messageCount >= 1) {
      setChatMode("technical");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const startNewChat = () => {
    setMessages([
      {
        id: "welcome-new",
        role: "assistant",
        content: "Let's start a new conversation about your invention idea!",
        timestamp: Date.now(),
      },
    ]);
    setChatMode("ideation");
  };

  return (
    <Card className="flex flex-col h-[600px] max-h-[80vh]">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center">
          <CircleIcon className="h-3 w-3 mr-2 text-green-500" />
          <h3 className="text-lg font-semibold">Vinci Assistant</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={startNewChat}
          title="Start new chat"
        >
          <PlusIcon className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <MessageList messages={messages} />
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t">
        <div className="flex gap-2">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            className="min-h-[60px] flex-1"
            disabled={isLoading}
          />
          <Button 
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="self-end"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          {chatMode === "ideation" && "Ideation Mode: Let's brainstorm your invention idea"}
          {chatMode === "technical" && "Technical Analysis: Exploring feasibility and challenges"}
          {chatMode === "market" && "Market Analysis: Understanding users and market potential"}
          {chatMode === "legal" && "Legal Analysis: Examining IP and regulatory considerations"}
          {chatMode === "business" && "Business Analysis: Exploring commercialization paths"}
          {chatMode === "synthesis" && "Synthesis: Creating a comprehensive evaluation"}
        </div>
      </div>
    </Card>
  );
};
