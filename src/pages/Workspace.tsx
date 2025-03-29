
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { InventionForm } from "@/components/invention/InventionForm";
import { InventionContextProvider } from "@/contexts/InventionContext";
import { DevilsAdvocate } from "@/components/DevilsAdvocate";

const Workspace = () => {
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
        
        <InventionContextProvider>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <InventionForm />
            </div>
            
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">Critical Feedback</h2>
              <DevilsAdvocate />
            </div>
          </div>
        </InventionContextProvider>
      </main>
      
      <Footer />
    </div>
  );
};

export default Workspace;
