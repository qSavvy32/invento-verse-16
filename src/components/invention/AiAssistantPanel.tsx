
import { useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { AnalysisButtonGroup } from "./analysis/AnalysisButtonGroup";
import { ActionButtonGroup } from "./analysis/ActionButtonGroup";
import { runAnalysis, runAllAnalyses } from "./analysis/AnalysisService";
import { generate3DVisualization, generateThreejsVisualization } from "./analysis/VisualizationService";

interface AiAssistantPanelProps {
  onAnalysisComplete: () => void;
}

export const AiAssistantPanel = ({ onAnalysisComplete }: AiAssistantPanelProps) => {
  const { state, updateVisualizations, update3DVisualization, setAnalysisResults, setThreejsVisualization } = useInvention();
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    technical: false,
    challenges: false,
    materials: false,
    users: false,
    competition: false,
    ip: false,
    regulatory: false,
    visualization: false,
    threejs: false,
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
    onAnalysisComplete();
  };
  
  // Handle running all analyses
  const handleRunAllAnalyses = async () => {
    await runAllAnalyses(
      {
        analysisResults: state.analysisResults,
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
        setAnalysisResults
      },
      setLoadingState,
      onAnalysisComplete
    );
  };
  
  // Handle generating 3D visualization
  const handleGenerate3DVisualization = async () => {
    await generate3DVisualization(
      {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
        updateVisualizations,
        update3DVisualization,
        setThreejsVisualization
      },
      setLoadingState
    );
  };
  
  // Handle generating ThreeJS visualization
  const handleGenerateThreejsVisualization = async () => {
    await generateThreejsVisualization(
      {
        title: state.title,
        description: state.description,
        sketchDataUrl: state.sketchDataUrl,
        updateVisualizations,
        update3DVisualization,
        setThreejsVisualization
      },
      setLoadingState
    );
  };
  
  return (
    <div className="space-y-4">
      <AnalysisButtonGroup 
        isLoading={isLoading}
        isDisabled={isAnyLoading}
        onRunAnalysis={handleRunAnalysis}
      />
      
      <ActionButtonGroup 
        isLoading={isLoading}
        isDisabled={isAnyLoading}
        onGenerate3DVisualization={handleGenerate3DVisualization}
        onGenerateThreejsVisualization={handleGenerateThreejsVisualization}
        onRunAllAnalyses={handleRunAllAnalyses}
      />
    </div>
  );
};
