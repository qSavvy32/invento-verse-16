
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronDown, 
  CodeIcon, 
  BarChart2Icon, 
  ScaleIcon, 
  BookOpenIcon 
} from "lucide-react";
import { MarkdownContent } from "./analysis/MarkdownContent";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AnalysisCardProps {
  title: string;
  icon: React.ReactNode;
  results: string[];
  timestamp: string;
}

const AnalysisCard = ({ title, icon, results, timestamp }: AnalysisCardProps) => {
  const [isOpen, setIsOpen] = useState(true);
  
  if (results.length === 0) return null;
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-4 bg-muted/20 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            {icon}
            {title}
            <span className="text-xs font-normal text-muted-foreground ml-2">
              {timestamp}
            </span>
          </CardTitle>
          {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="p-4 pt-2">
          <div className="max-h-[200px] overflow-y-auto pr-2">
            <ul className="list-disc pl-5 space-y-2">
              {results.map((result, index) => (
                <li key={index} className="markdown-content">
                  <MarkdownContent content={result} />
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export const AnalysisResults = () => {
  const { state } = useInvention();
  const [analysisCards, setAnalysisCards] = useState<Array<{
    id: string;
    type: 'technical' | 'market' | 'legal' | 'business';
    results: string[];
    timestamp: string;
  }>>([]);
  
  useEffect(() => {
    // Create a new array of cards based on the analysis results
    const newCards = [];
    
    // Create cards for technical analysis
    if (state.analysisResults.technical.length > 0) {
      newCards.push({
        id: 'technical',
        type: 'technical',
        results: state.analysisResults.technical,
        timestamp: new Date().toLocaleString()
      });
    }
    
    // Create cards for market analysis
    if (state.analysisResults.market.length > 0) {
      newCards.push({
        id: 'market',
        type: 'market',
        results: state.analysisResults.market,
        timestamp: new Date().toLocaleString()
      });
    }
    
    // Create cards for legal analysis
    if (state.analysisResults.legal.length > 0) {
      newCards.push({
        id: 'legal',
        type: 'legal',
        results: state.analysisResults.legal,
        timestamp: new Date().toLocaleString()
      });
    }
    
    // Create cards for business analysis
    if (state.analysisResults.business.length > 0) {
      newCards.push({
        id: 'business',
        type: 'business',
        results: state.analysisResults.business,
        timestamp: new Date().toLocaleString()
      });
    }
    
    // Replace the cards instead of adding to them
    setAnalysisCards(newCards);
  }, [state.analysisResults]);
  
  // If there are no analysis results at all, don't show anything
  if (
    !state.analysisResults.technical.length && 
    !state.analysisResults.market.length && 
    !state.analysisResults.legal.length && 
    !state.analysisResults.business.length
  ) {
    return null;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Analysis Results</h2>
      <div className="h-[400px] overflow-y-auto pr-2 space-y-4">
        {analysisCards.map(card => {
          let title = "";
          let icon = null;
          
          switch (card.type) {
            case 'technical':
              title = "Technical Analysis";
              icon = <CodeIcon className="h-4 w-4" />;
              break;
            case 'market':
              title = "Market Analysis";
              icon = <BarChart2Icon className="h-4 w-4" />;
              break;
            case 'legal':
              title = "Legal and IP Analysis";
              icon = <ScaleIcon className="h-4 w-4" />;
              break;
            case 'business':
              title = "Business Strategy";
              icon = <BookOpenIcon className="h-4 w-4" />;
              break;
          }
          
          return (
            <AnalysisCard 
              key={card.id}
              title={title}
              icon={icon}
              results={card.results}
              timestamp={card.timestamp}
            />
          );
        })}
      </div>
    </div>
  );
};
