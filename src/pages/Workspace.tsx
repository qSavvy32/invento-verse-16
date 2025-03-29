
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { InventionForm } from "@/components/invention/InventionForm";
import { InventionContextProvider, useInvention } from "@/contexts/InventionContext";
import { ThreejsVisualizer } from "@/components/invention/ThreejsVisualizer";
import { AnalysisResults } from "@/components/invention/AnalysisResults";
import { BusinessStrategyViewer } from "@/components/invention/BusinessStrategyViewer";
import { VinciAssistant } from "@/components/invention/VinciAssistant";
import { Package, FlaskConicalIcon, BarChart4 } from "lucide-react";

const WorkspaceContent = () => {
  const { state, loadInvention } = useInvention();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load invention if ID is provided in URL
  useEffect(() => {
    const inventionId = searchParams.get('id');
    if (inventionId) {
      setIsLoading(true);
      loadInvention(inventionId)
        .finally(() => setIsLoading(false));
    }
  }, [searchParams, loadInvention]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-12 w-12 border-4 border-invention-accent rounded-full border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 overflow-hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-leonardo mb-2 flex items-center gap-2">
            <FlaskConicalIcon className="h-7 w-7 text-invention-accent" />
            The Studio
          </h1>
          <p className="text-muted-foreground">
            Experiment, test, and perfect your invention with advanced AI tools
          </p>
        </div>
        
        {/* Vinci Assistant at the top */}
        <VinciAssistant />
        
        <div className="mb-16 max-w-full overflow-hidden">
          <InventionForm />
            
          <div className="mt-8 overflow-hidden max-h-[500px]">
            <AnalysisResults />
          </div>
          
          {state.businessStrategySvg && (
            <div className="mt-8">
              <BusinessStrategyViewer />
            </div>
          )}
          
          {state.threejsVisualization.html && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Package className="h-5 w-5" />
                3D Visualization
              </h2>
              <ThreejsVisualizer />
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

const Workspace = () => {
  return (
    <InventionContextProvider>
      <WorkspaceContent />
    </InventionContextProvider>
  );
};

export default Workspace;
