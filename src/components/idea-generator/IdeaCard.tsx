
import { 
  Card,
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { ReactNode } from "react";
import { MarkdownContent } from "../invention/analysis/MarkdownContent";

interface IdeaCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  ideas: string[];
}

export const IdeaCard = ({ icon, title, description, ideas }: IdeaCardProps) => {
  return (
    <Card className="da-vinci-note border-invention-accent/20 shadow-md transform transition-transform hover:scale-[1.01]">
      <CardHeader className="pb-2 bg-invention-accent/10">
        <CardTitle className="text-invention-ink flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-2 font-leonardo">
          {ideas.map((idea, index) => (
            <div key={`${title.toLowerCase()}-${index}`} className="text-invention-ink">
              <MarkdownContent content={idea} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
