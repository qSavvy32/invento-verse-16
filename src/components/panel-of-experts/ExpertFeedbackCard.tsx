
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon, Lightbulb, Palette, Cog, BarChart, Wrench } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export interface ExpertFeedback {
  design: string[];
  functionality: string[];
  market: string[];
  technical: string[];
}

interface ExpertFeedbackCardProps {
  feedback: ExpertFeedback;
}

interface ExpertSectionProps {
  title: string;
  icon: LucideIcon;
  questions: string[];
  iconColor: string;
}

const ExpertSection = ({ title, icon: Icon, questions, iconColor }: ExpertSectionProps) => {
  if (questions.length === 0) return null;
  
  return (
    <div className="mb-4">
      <h4 className="text-sm font-semibold flex items-center gap-1 mb-2">
        <Icon className={`h-4 w-4 ${iconColor}`} />
        {title}
      </h4>
      <ul className="list-disc pl-5 space-y-2">
        {questions.map((question, idx) => (
          <li key={idx} className="text-sm text-invention-ink">
            {question}
          </li>
        ))}
      </ul>
    </div>
  );
};

export const ExpertFeedbackCard = ({ feedback }: ExpertFeedbackCardProps) => {
  if (!feedback) {
    return <div className="text-center text-muted-foreground">No expert feedback generated yet</div>;
  }

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-white overflow-hidden">
      <CardHeader className="pb-2 border-b border-blue-100">
        <CardTitle className="text-lg font-leonardo text-blue-900">
          Expert Panel Feedback
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-blue-800/80 mb-4 italic">
          Our panel of experts has analyzed your invention and prepared these key questions to help you develop your concept further.
        </p>
        
        <div className="space-y-4">
          <ExpertSection 
            title="Design Expert" 
            icon={Palette} 
            questions={feedback.design}
            iconColor="text-purple-600" 
          />
          
          <ExpertSection 
            title="Functionality Expert" 
            icon={Cog} 
            questions={feedback.functionality}
            iconColor="text-blue-600" 
          />
          
          <ExpertSection 
            title="Market Analyst" 
            icon={BarChart} 
            questions={feedback.market}
            iconColor="text-green-600" 
          />
          
          <ExpertSection 
            title="Technical Feasibility Expert" 
            icon={Wrench} 
            questions={feedback.technical}
            iconColor="text-amber-600" 
          />
        </div>
      </CardContent>
    </Card>
  );
};
