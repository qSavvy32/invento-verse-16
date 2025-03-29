
import { AnalysisButton } from "./AnalysisButton";
import { 
  Construction,
  Users,
  Box,
  Scale,
  BarChart,
  Inspect
} from "lucide-react";

interface AnalysisButtonGroupProps {
  isLoading: Record<string, boolean>;
  isDisabled: boolean;
  onRunAnalysis: (analysisType: string) => void;
}

export const AnalysisButtonGroup = ({
  isLoading,
  isDisabled,
  onRunAnalysis
}: AnalysisButtonGroupProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
      <AnalysisButton 
        icon={<Construction className="h-4 w-4" />}
        title="Technical Analysis"
        description="Feasibility and engineering"
        isLoading={isLoading.technical}
        isDisabled={isDisabled}
        onClick={() => onRunAnalysis("technical")}
      />
      
      <AnalysisButton 
        icon={<Users className="h-4 w-4" />}
        title="User Analysis"
        description="Target audience and needs"
        isLoading={isLoading.users}
        isDisabled={isDisabled}
        onClick={() => onRunAnalysis("users")}
      />
      
      <AnalysisButton 
        icon={<Box className="h-4 w-4" />}
        title="Materials Analysis"
        description="Components and materials"
        isLoading={isLoading.materials}
        isDisabled={isDisabled}
        onClick={() => onRunAnalysis("materials")}
      />
      
      <AnalysisButton 
        icon={<Scale className="h-4 w-4" />}
        title="IP Analysis"
        description="Patent and legal issues"
        isLoading={isLoading.ip}
        isDisabled={isDisabled}
        onClick={() => onRunAnalysis("ip")}
      />
      
      <AnalysisButton 
        icon={<BarChart className="h-4 w-4" />}
        title="Market Analysis"
        description="Competition and positioning"
        isLoading={isLoading.competition}
        isDisabled={isDisabled}
        onClick={() => onRunAnalysis("competition")}
      />
      
      <AnalysisButton 
        icon={<Inspect className="h-4 w-4" />}
        title="Key Challenges"
        description="Critical issues to solve"
        isLoading={isLoading.challenges}
        isDisabled={isDisabled}
        onClick={() => onRunAnalysis("challenges")}
      />
    </div>
  );
};
