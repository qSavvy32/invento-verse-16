
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { InventionForm } from "@/components/invention/InventionForm";
import { InventionContextProvider, useInvention } from "@/contexts/InventionContext";
import { DevilsAdvocate } from "@/components/DevilsAdvocate";
import { ThreejsVisualizer } from "@/components/invention/ThreejsVisualizer";
import { Box3D } from "lucide-react";

const WorkspaceContent = () => {
  const { state } = useInvention();
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-leonardo mb-2">
            Create Your Invention
          </h1>
          <p className="text-muted-foreground">
            Bring your ideas to life with the power of AI and your creativity
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <InventionForm />
            
            {state.threejsVisualization.html && (
              <div className="mt-8">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Box3D className="h-5 w-5" />
                  3D Visualization
                </h2>
                <ThreejsVisualizer />
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1">
            <h2 className="text-xl font-semibold mb-4">Critical Feedback</h2>
            <DevilsAdvocate />
          </div>
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
