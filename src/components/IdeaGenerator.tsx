
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  LightbulbIcon, 
  Loader2Icon,
  BookIcon,
  CodeIcon,
  AwardIcon,
  PieChartIcon
} from "lucide-react";
import { toast } from "sonner";

// Simulated AI responses for the demo
const AI_RESPONSES = {
  technical: [
    "The design could be improved by incorporating a modular component system that allows parts to be easily replaced or upgraded.",
    "Consider using biocomposite materials for the outer shell - they're lightweight and have excellent thermal properties.",
    "Your invention could benefit from an integrated IoT connectivity module to enable data collection and remote monitoring.",
    "The power efficiency could be improved by adding a regenerative energy capture system."
  ],
  market: [
    "Based on market trends, there's a growing demand for sustainable, repairable consumer electronics.",
    "Your target demographic would likely be tech-conscious millennials with environmental concerns.",
    "Consider partnering with established brands for market entry, or launching through crowdfunding platforms.",
    "Similar products are currently priced between $79-$149, suggesting a potential market position."
  ],
  legal: [
    "Your design appears to have novel elements that could be patentable, particularly the connection mechanism.",
    "Consider filing a provisional patent application to secure an early filing date while continuing development.",
    "Prior art search reveals similar concepts, but your implementation appears to have unique characteristics.",
    "Recommend documenting all development stages carefully for potential patent application evidence."
  ],
  business: [
    "A subscription model for updates/replacements could create recurring revenue beyond initial sales.",
    "Manufacturing costs could be optimized by partnering with facilities in Southeast Asia while maintaining quality control.",
    "Early adopter discounts and referral programs could help build initial customer base and momentum.",
    "Consider developing a companion app that adds value and creates an ecosystem around your product."
  ]
};

interface IdeaGeneratorProps {
  sketchDataUrl?: string;
}

export const IdeaGenerator = ({ sketchDataUrl }: IdeaGeneratorProps) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedIdeas, setGeneratedIdeas] = useState<Record<string, string[]>>({});
  
  // Simulate AI-powered idea generation
  const generateIdeas = () => {
    if (!description.trim() && !sketchDataUrl) {
      toast.error("Please provide a description or sketch of your invention idea");
      return;
    }
    
    setIsGenerating(true);
    
    // Simulate API delay
    setTimeout(() => {
      setGeneratedIdeas({
        technical: AI_RESPONSES.technical,
        market: AI_RESPONSES.market,
        legal: AI_RESPONSES.legal,
        business: AI_RESPONSES.business
      });
      
      setIsGenerating(false);
      toast.success("Ideas generated successfully!");
    }, 2000);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="description">Describe your invention idea</Label>
        <Textarea
          id="description"
          placeholder="Describe what problem your invention solves and how it works..."
          className="h-32"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        
        {sketchDataUrl && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">Your sketch:</p>
            <img 
              src={sketchDataUrl} 
              alt="Your sketch" 
              className="max-h-64 border rounded-md" 
            />
          </div>
        )}
      </div>
      
      <Button 
        onClick={generateIdeas} 
        disabled={isGenerating}
        className="w-full"
      >
        {isGenerating ? (
          <>
            <Loader2Icon className="mr-2 h-4 w-4 animate-spin" />
            Generating ideas...
          </>
        ) : (
          <>
            <LightbulbIcon className="mr-2 h-4 w-4" />
            Generate Ideas
          </>
        )}
      </Button>
      
      {Object.keys(generatedIdeas).length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
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
                {generatedIdeas.technical.map((idea, index) => (
                  <li key={`tech-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
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
                {generatedIdeas.market.map((idea, index) => (
                  <li key={`market-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
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
                {generatedIdeas.legal.map((idea, index) => (
                  <li key={`legal-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
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
                {generatedIdeas.business.map((idea, index) => (
                  <li key={`business-${index}`} className="text-invention-ink">{idea}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
