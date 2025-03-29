
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Construction,
  Users,
  Box,
  Scale,
  BarChart,
  Inspect,
  Zap,
  Loader2
} from "lucide-react";
import { runAnalysis, runAllAnalyses } from "./analysis/AnalysisService";
import { toast } from "sonner";

export const AnalysisTools = () => {
  const { state, setAnalysisResults } = useInvention();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    technical: false,
    challenges: false,
    materials: false,
    users: false,
    competition: false,
    ip: false,
    runAll: false,
  });
  
  // Helper to update loading state for a specific analysis type
  const setLoadingState = (type: string, loading: boolean) => {
    setIsLoading(prev => ({ ...prev, [type]: loading }));
  };
  
  // Check if any analysis is currently loading
  const isAnyLoading = Object.values(isLoading).some(v => v);
  
  // Handle running a specific analysis
  const handleRunAnalysis = async (analysisType: string) => {
    await runAnalysis(
      analysisType, 
      {
        analysisResults: state.analysisResults,
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
        setAnalysisResults
      },
      setLoadingState
    );
    toast.success(`${analysisType} analysis completed`);
  };
  
  // Handle running all analyses
  const handleRunAllAnalyses = async () => {
    setLoadingState("runAll", true);
    
    try {
      await runAllAnalyses(
        {
          analysisResults: state.analysisResults,
          title: state.title,
          description: state.description,
          sketchDataUrl: state.sketchDataUrl,
          setAnalysisResults
        },
        setLoadingState
      );
      toast.success("All analyses completed");
    } catch (error) {
      console.error("Error running all analyses:", error);
      toast.error("Failed to complete all analyses");
    } finally {
      setLoadingState("runAll", false);
    }
  };
  
  const AnalysisButton = ({ 
    icon, 
    title, 
    description, 
    type,
    isLoading
  }: { 
    icon: React.ReactNode, 
    title: string, 
    description: string,
    type: string,
    isLoading: boolean
  }) => (
    <Button
      variant="outline"
      disabled={isAnyLoading}
      onClick={() => handleRunAnalysis(type)}
      className="h-24 relative flex flex-col items-center justify-center text-left"
    >
      <div className="flex flex-col items-center">
        {isLoading ? (
          <Loader2 className="h-5 w-5 animate-spin mb-1" />
        ) : (
          <div className="mb-1">{icon}</div>
        )}
        <span className="font-medium text-sm">{title}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </Button>
  );
  
  return (
    <Card className="border-invention-accent/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Analysis Tools</h3>
          
          <Button
            onClick={handleRunAllAnalyses}
            disabled={isAnyLoading}
            variant="default"
            className="bg-invention-accent hover:bg-invention-accent/90"
          >
            {isLoading.runAll ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Running All Analyses...
              </>
            ) : (
              <>
                <Zap className="mr-2 h-4 w-4" />
                Run All Analyses
              </>
            )}
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <AnalysisButton 
            icon={<Construction className="h-4 w-4" />}
            title="Technical Analysis"
            description="Feasibility and engineering"
            type="technical"
            isLoading={isLoading.technical}
          />
          
          <AnalysisButton 
            icon={<Users className="h-4 w-4" />}
            title="User Analysis"
            description="Target audience and needs"
            type="users"
            isLoading={isLoading.users}
          />
          
          <AnalysisButton 
            icon={<Box className="h-4 w-4" />}
            title="Materials Analysis"
            description="Components and materials"
            type="materials"
            isLoading={isLoading.materials}
          />
          
          <AnalysisButton 
            icon={<Scale className="h-4 w-4" />}
            title="IP Analysis"
            description="Patent and legal issues"
            type="ip"
            isLoading={isLoading.ip}
          />
          
          <AnalysisButton 
            icon={<BarChart className="h-4 w-4" />}
            title="Market Analysis"
            description="Competition and positioning"
            type="competition"
            isLoading={isLoading.competition}
          />
          
          <AnalysisButton 
            icon={<Inspect className="h-4 w-4" />}
            title="Key Challenges"
            description="Critical issues to solve"
            type="challenges"
            isLoading={isLoading.challenges}
          />
        </div>
      </CardContent>
    </Card>
  );
};
