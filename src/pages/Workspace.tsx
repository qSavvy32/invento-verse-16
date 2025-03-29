
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { InventionForm } from "@/components/invention/InventionForm";
import { InventionContextProvider, useInvention } from "@/contexts/InventionContext";
import { ThreejsVisualizer } from "@/components/invention/ThreejsVisualizer";
import { AnalysisResults } from "@/components/invention/AnalysisResults";
import { Package, FlaskConicalIcon } from "lucide-react";

const WorkspaceContent = () => {
  const { state } = useInvention();
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8 overflow-x-hidden">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-leonardo mb-2 flex items-center gap-2">
            <FlaskConicalIcon className="h-7 w-7 text-invention-accent" />
            The Lab
          </h1>
          <p className="text-muted-foreground">
            Experiment, test, and perfect your invention with advanced AI tools
          </p>
        </div>
        
        <div className="mb-16 max-w-full">
          <InventionForm />
            
          <div className="mt-8 max-h-[600px]">
            <AnalysisResults />
          </div>
          
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
