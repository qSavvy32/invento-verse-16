
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AwardIcon, BookIcon, CodeIcon, PieChartIcon } from "lucide-react";

export const AnalysisResults = () => {
  const { state } = useInvention();
  
  // Only show categories that have results
  const hasResults = {
    technical: state.analysisResults.technical.length > 0,
    market: state.analysisResults.market.length > 0,
    legal: state.analysisResults.legal.length > 0,
    business: state.analysisResults.business.length > 0
  };
  
  // Check if we have any results to show
  const hasAnyResults = Object.values(hasResults).some(result => result);
  
  if (!hasAnyResults) {
    return null;
  }
  
  return (
    <div className="mt-6">
      <h2 className="text-2xl font-bold mb-4">Analysis Results</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {hasResults.technical && (
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <CodeIcon className="h-5 w-5" />
                Technical Insights
              </CardTitle>
              <CardDescription>Engineering and design considerations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {state.analysisResults.technical.map((insight, index) => (
                  <li key={`tech-${index}`} className="text-invention-ink">{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {hasResults.market && (
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Market Analysis
              </CardTitle>
              <CardDescription>Potential market and audience insights</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {state.analysisResults.market.map((insight, index) => (
                  <li key={`market-${index}`} className="text-invention-ink">{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {hasResults.legal && (
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <AwardIcon className="h-5 w-5" />
                Intellectual Property
              </CardTitle>
              <CardDescription>Patent and legal considerations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {state.analysisResults.legal.map((insight, index) => (
                  <li key={`legal-${index}`} className="text-invention-ink">{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
        
        {hasResults.business && (
          <Card className="da-vinci-note">
            <CardHeader className="pb-2">
              <CardTitle className="text-invention-ink flex items-center gap-2">
                <BookIcon className="h-5 w-5" />
                Business Strategy
              </CardTitle>
              <CardDescription>Monetization and business recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2 font-leonardo">
                {state.analysisResults.business.map((insight, index) => (
                  <li key={`business-${index}`} className="text-invention-ink">{insight}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
