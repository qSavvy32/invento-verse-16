
import { ChatbotContainer } from "../chatbot/ChatbotContainer";

interface ChatbotTabProps {
  isLoading: boolean;
  updateLoadingState: (type: string, isLoading: boolean) => void;
}

export const ChatbotTab = ({ isLoading, updateLoadingState }: ChatbotTabProps) => {
  return (
    <div className="pt-4 min-h-[400px]">
      <ChatbotContainer />
    </div>
  );
};
