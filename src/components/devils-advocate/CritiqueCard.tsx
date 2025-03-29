
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle2, Lightbulb } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface Critique {
  title: string;
  description: string;
  positives: string[];
  negatives: string[];
  suggestions: string[];
}

interface CritiqueCardProps {
  critiques: Critique[] | {
    technical: string[];
    market: string[];
    originality: string[];
    consequences: string[];
  };
}

export const CritiqueCard = ({ critiques }: CritiqueCardProps) => {
  // Check if we have the new format or the old format
  if (!critiques) {
    return <div className="text-center text-muted-foreground">No critiques generated yet</div>;
  }
  
  // Convert the critiques data if it's in the new format
  const formattedCritiques: Critique[] = Array.isArray(critiques) 
    ? critiques 
    : [
        {
          title: "Technical Feasibility",
          description: "Analysis of engineering challenges and technical limitations",
          positives: [],
          negatives: critiques.technical || [],
          suggestions: []
        },
        {
          title: "Market Reality",
          description: "Assessment of commercial viability and market fit",
          positives: [],
          negatives: critiques.market || [],
          suggestions: []
        },
        {
          title: "Originality Assessment",
          description: "Evaluation of novelty and potential IP conflicts",
          positives: [],
          negatives: critiques.originality || [],
          suggestions: []
        },
        {
          title: "Unintended Consequences",
          description: "Potential downsides and regulatory concerns",
          positives: [],
          negatives: critiques.consequences || [],
          suggestions: []
        }
      ];

  if (formattedCritiques.length === 0) {
    return <div className="text-center text-muted-foreground">No critiques generated yet</div>;
  }

  return (
    <div className="space-y-6">
      {formattedCritiques.map((critique, index) => (
        <Card key={index} className="border-invention-accent/20 bg-gradient-to-br from-invention-paper to-white overflow-hidden">
          <CardHeader className="pb-2 border-b border-invention-accent/10">
            <CardTitle className="text-lg font-leonardo text-invention-ink">
              {critique.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <p className="text-sm text-invention-ink/80 mb-4 italic">
              {critique.description}
            </p>
            
            <div className="space-y-4">
              {critique.positives && critique.positives.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-1 text-green-700 mb-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Strengths
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {critique.positives.map((positive, idx) => (
                      <li key={idx} className="text-sm text-invention-ink">
                        {positive}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {critique.negatives && critique.negatives.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-1 text-red-700 mb-2">
                    <AlertTriangle className="h-4 w-4" />
                    Weaknesses
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {critique.negatives.map((negative, idx) => (
                      <li key={idx} className="text-sm text-invention-ink">
                        {negative}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {critique.suggestions && critique.suggestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold flex items-center gap-1 text-amber-700 mb-2">
                    <Lightbulb className="h-4 w-4" />
                    Suggestions
                  </h4>
                  <ul className="list-disc pl-5 space-y-1">
                    {critique.suggestions.map((suggestion, idx) => (
                      <li key={idx} className="text-sm text-invention-ink">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
