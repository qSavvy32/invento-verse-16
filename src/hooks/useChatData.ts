
import { useState } from 'react';
import { ChatDataService, ChatSummaryData } from '@/services/ChatDataService';
import { toast } from 'sonner';

export const useChatData = () => {
  const [isLoading, setIsLoading] = useState(false);

  const saveChatSummary = async (summaryData: ChatSummaryData) => {
    setIsLoading(true);
    try {
      const id = await ChatDataService.saveChatSummary(summaryData);
      if (id) {
        toast.success('Chat summary saved successfully');
        return id;
      }
    } catch (error) {
      console.error('Error saving chat summary:', error);
      toast.error('Failed to save chat summary');
    } finally {
      setIsLoading(false);
    }
    return null;
  };

  const getChatSummaries = async (inventionId: string) => {
    setIsLoading(true);
    try {
      return await ChatDataService.getChatSummaries(inventionId);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    saveChatSummary,
    getChatSummaries
  };
};
