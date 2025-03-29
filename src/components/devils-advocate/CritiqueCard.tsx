
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  ZapIcon,
  UsersIcon,
  LightbulbIcon,
  ShieldAlertIcon,
  Skull
} from "lucide-react";
import { MarkdownContent } from "../invention/analysis/MarkdownContent";

type CritiquesData = {
  technical: string[];
  market: string[];
  originality: string[];
  consequences: string[];
};

interface CritiqueCardProps {
  critiques: CritiquesData;
}

export const CritiqueCard = ({ critiques }: CritiqueCardProps) => {
  return (
    <Card className="border-invention-red/20 bg-invention-paper/50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-invention-red flex items-center gap-2 text-lg font-leonardo">
          <Skull className="h-5 w-5" />
          Critique Results
        </CardTitle>
        <CardDescription>Challenging your assumptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 critique-content max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-invention-red font-leonardo">
              <ZapIcon className="h-4 w-4" /> Technical Feasibility
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.technical.map((critique, index) => (
                <li key={`tech-${index}`} className="text-invention-red/80">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-invention-red font-leonardo">
              <UsersIcon className="h-4 w-4" /> Market Reality
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.market.map((critique, index) => (
                <li key={`market-${index}`} className="text-invention-red/80">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-invention-red font-leonardo">
              <LightbulbIcon className="h-4 w-4" /> Originality Concerns
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.originality.map((critique, index) => (
                <li key={`orig-${index}`} className="text-invention-red/80">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-invention-red font-leonardo">
              <ShieldAlertIcon className="h-4 w-4" /> Unintended Consequences
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.consequences.map((critique, index) => (
                <li key={`conseq-${index}`} className="text-invention-red/80">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
