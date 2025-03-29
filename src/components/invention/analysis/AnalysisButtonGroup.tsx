
import { 
  Construction,
  Users,
  Box,
  Scale,
  BarChart,
  Inspect
} from "lucide-react";
import { AnalysisButton } from "./AnalysisButton";

export interface AnalysisButtonGroupProps {
  isLoading: Record<string, boolean>;
  isDisabled: boolean;
  onRunAnalysis?: (analysisType: string) => void;
  onAnalysisComplete?: (results: Record<string, string[]>) => void;
  setIsLoading?: (type: string, isLoading: boolean) => void;
}

export const AnalysisButtonGroup = ({
  isLoading,
  isDisabled,
  onRunAnalysis,
  onAnalysisComplete,
  setIsLoading
}: AnalysisButtonGroupProps) => {
  const handleRunAnalysis = (analysisType: string) => {
    if (onRunAnalysis) {
      onRunAnalysis(analysisType);
    }
  };
  
  return (
    <div className="space-y-4">
      <h3 className="text-md font-medium mb-2">Analysis Tools</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <AnalysisButton 
          icon={<Construction className="h-4 w-4" />}
          title="Technical Analysis"
          description="Feasibility and engineering"
          isLoading={isLoading.technical}
          isDisabled={isDisabled}
          onClick={() => handleRunAnalysis("technical")}
        />
        
        <AnalysisButton 
          icon={<Users className="h-4 w-4" />}
          title="User Analysis"
          description="Target audience and needs"
          isLoading={isLoading.users}
          isDisabled={isDisabled}
          onClick={() => handleRunAnalysis("users")}
        />
        
        <AnalysisButton 
          icon={<Box className="h-4 w-4" />}
          title="Materials Analysis"
          description="Components and materials"
          isLoading={isLoading.materials}
          isDisabled={isDisabled}
          onClick={() => handleRunAnalysis("materials")}
        />
        
        <AnalysisButton 
          icon={<Scale className="h-4 w-4" />}
          title="IP Analysis"
          description="Patent and legal issues"
          isLoading={isLoading.ip}
          isDisabled={isDisabled}
          onClick={() => handleRunAnalysis("ip")}
        />
        
        <AnalysisButton 
          icon={<BarChart className="h-4 w-4" />}
          title="Market Analysis"
          description="Competition and positioning"
          isLoading={isLoading.competition}
          isDisabled={isDisabled}
          onClick={() => handleRunAnalysis("competition")}
        />
        
        <AnalysisButton 
          icon={<Inspect className="h-4 w-4" />}
          title="Key Challenges"
          description="Critical issues to solve"
          isLoading={isLoading.challenges}
          isDisabled={isDisabled}
          onClick={() => handleRunAnalysis("challenges")}
        />
      </div>
    </div>
  );
};
