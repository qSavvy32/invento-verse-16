
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
    <Card className="border-red-200 bg-red-50 w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-800 flex items-center gap-2">
          <Skull className="h-5 w-5" />
          Devil's Advocate Critique 💀
        </CardTitle>
        <CardDescription>Challenging your assumptions</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 critique-content">
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-red-800">
              <ZapIcon className="h-4 w-4" /> 💥 Technical Feasibility 💥
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.technical.map((critique, index) => (
                <li key={`tech-${index}`} className="text-red-700">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-red-800">
              <UsersIcon className="h-4 w-4" /> 🚫 Market Reality 🚫
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.market.map((critique, index) => (
                <li key={`market-${index}`} className="text-red-700">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-red-800">
              <LightbulbIcon className="h-4 w-4" /> ⚠️ Originality ⚠️
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.originality.map((critique, index) => (
                <li key={`orig-${index}`} className="text-red-700">
                  <MarkdownContent content={critique} />
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold flex items-center gap-1 text-red-800">
              <ShieldAlertIcon className="h-4 w-4" /> 🔥 Unintended Consequences 🔥
            </h3>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              {critiques.consequences.map((critique, index) => (
                <li key={`conseq-${index}`} className="text-red-700">
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
