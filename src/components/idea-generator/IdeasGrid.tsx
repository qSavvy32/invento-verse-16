
import { CodeIcon, PieChartIcon, AwardIcon, BookIcon } from "lucide-react";
import { IdeaCard } from "./IdeaCard";
import { Button } from "@/components/ui/button";
import { FlaskConicalIcon, ArrowRightIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useInvention } from "@/contexts/InventionContext";

interface IdeasGridProps {
  generatedIdeas: Record<string, string[]>;
}

export const IdeasGrid = ({ generatedIdeas }: IdeasGridProps) => {
  const navigate = useNavigate();
  const { addAnalysisResult } = useInvention();
  
  const navigateToLab = () => {
    // Save the generated ideas to the InventionContext before navigating
    generatedIdeas.technical?.forEach(item => addAnalysisResult('technical', item));
    generatedIdeas.market?.forEach(item => addAnalysisResult('market', item));
    generatedIdeas.legal?.forEach(item => addAnalysisResult('legal', item));
    generatedIdeas.business?.forEach(item => addAnalysisResult('business', item));
    
    navigate("/create");
  };
  
  if (Object.keys(generatedIdeas).length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-leonardo font-semibold text-center text-invention-ink">Your Innovation Blueprint</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <IdeaCard
          icon={<CodeIcon className="h-5 w-5 text-invention-accent" />}
          title="Technical Insights"
          description="Engineering and design considerations"
          ideas={generatedIdeas.technical || []}
        />
        
        <IdeaCard
          icon={<PieChartIcon className="h-5 w-5 text-invention-accent" />}
          title="Market Analysis"
          description="Potential market and audience insights"
          ideas={generatedIdeas.market || []}
        />
        
        <IdeaCard
          icon={<AwardIcon className="h-5 w-5 text-invention-accent" />}
          title="Intellectual Property"
          description="Patent and legal considerations"
          ideas={generatedIdeas.legal || []}
        />
        
        <IdeaCard
          icon={<BookIcon className="h-5 w-5 text-invention-accent" />}
          title="Business Strategy"
          description="Monetization and business recommendations"
          ideas={generatedIdeas.business || []}
        />
      </div>
      
      {/* Call to Action button to go to "The Lab" - Now full width and larger */}
      <div className="mt-10">
        <p className="text-sm text-muted-foreground mb-4 text-center max-w-xl mx-auto italic">
          Take your idea to the next level in our invention workspace where you can refine, 
          analyze, and develop your concept with AI assistance.
        </p>
        <Button 
          onClick={navigateToLab} 
          className="w-full py-6 bg-invention-accent hover:bg-invention-accent/90 text-white font-medium text-lg shadow-md group transition-all"
          size="lg"
        >
          <FlaskConicalIcon className="mr-2 h-5 w-5" />
          Continue in The Lab
          <ArrowRightIcon className="ml-2 h-4 w-4 opacity-70 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
};
