
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
  structuredData?: AnalysisStructuredData;
  isError?: boolean;
}

export type ChatMode = 
  | "ideation" 
  | "technical" 
  | "market" 
  | "legal" 
  | "business" 
  | "synthesis";

export interface AnalysisStructuredData {
  technical?: string[];
  market?: string[];
  legal?: string[];
  business?: string[];
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
