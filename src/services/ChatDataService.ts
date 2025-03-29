
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ChatSummaryData {
  title: string;
  description: string;
  timestamp: number;
  technical: string[];
  market: string[];
  legal: string[];
  business: string[];
  engineeringChallenges?: {
    challenge: string;
    description: string;
  }[];
  designConsiderations?: {
    consideration: string;
    explanation: string;
  }[];
  technicalFeasibility?: {
    assessment: string;
    explanation: string;
  };
  userAnalysis?: {
    primaryUserGroup?: {
      groupName: string;
      needsAddressed: string[];
    };
    targetUserGroups?: {
      groupName: string;
      description: string;
    }[];
  };
}

export class ChatDataService {
  /**
   * Save the chat summary data to Supabase
   */
  static async saveChatSummary(summaryData: ChatSummaryData): Promise<string | null> {
    try {
      const { data: userData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        throw new Error("You must be logged in to save chat data");
      }
      
      const userId = userData.user.id;
      
      // Get the current invention id from the URL
      const urlParams = new URLSearchParams(window.location.search);
      const inventionId = urlParams.get('id');
      
      if (!inventionId) {
        throw new Error("No invention ID found. Please save the invention first.");
      }
      
      // Save technical insights
      if (summaryData.technical.length > 0) {
        await this.saveAnalysisResult(inventionId, "technical", summaryData.technical.join("\n\n"));
      }
      
      // Save market insights
      if (summaryData.market.length > 0) {
        await this.saveAnalysisResult(inventionId, "market", summaryData.market.join("\n\n"));
      }
      
      // Save legal insights
      if (summaryData.legal.length > 0) {
        await this.saveAnalysisResult(inventionId, "legal", summaryData.legal.join("\n\n"));
      }
      
      // Save business insights
      if (summaryData.business.length > 0) {
        await this.saveAnalysisResult(inventionId, "business", summaryData.business.join("\n\n"));
      }
      
      // Save the chat data as a JSON string for later reference
      const chatDataAsString = JSON.stringify(summaryData);
      
      const { data, error } = await supabase
        .from('chat_summaries')
        .insert({
          user_id: userId,
          invention_id: inventionId,
          title: summaryData.title,
          data: chatDataAsString,
          created_at: new Date().toISOString()
        })
        .select('id')
        .single();
        
      if (error) {
        throw new Error(`Failed to save chat summary: ${error.message}`);
      }
      
      return data?.id || null;
    } catch (error: any) {
      console.error("Error saving chat summary:", error);
      toast.error(error.message || "Failed to save chat data");
      return null;
    }
  }

  /**
   * Save an analysis result to the database
   */
  private static async saveAnalysisResult(
    inventionId: string, 
    analysisType: string, 
    result: string
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('analysis_results')
        .insert({
          invention_id: inventionId,
          analysis_type: analysisType,
          result
        });
        
      if (error) {
        console.error(`Error saving ${analysisType} analysis:`, error);
      }
    } catch (error) {
      console.error(`Error saving ${analysisType} analysis:`, error);
    }
  }

  /**
   * Get chat summaries for an invention
   */
  static async getChatSummaries(inventionId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('chat_summaries')
        .select('*')
        .eq('invention_id', inventionId)
        .order('created_at', { ascending: false });
        
      if (error) {
        throw new Error(`Failed to fetch chat summaries: ${error.message}`);
      }
      
      return data || [];
    } catch (error: any) {
      console.error("Error fetching chat summaries:", error);
      toast.error(error.message || "Failed to fetch chat data");
      return [];
    }
  }
}
