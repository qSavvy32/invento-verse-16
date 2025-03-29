
import { useEffect, useState } from "react";
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { InventionService } from "@/services/InventionService";
import { InventionState } from "@/contexts/InventionContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const SavedInventions = () => {
  const [inventions, setInventions] = useState<InventionState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInventions = async () => {
      try {
        const fetchedInventions = await InventionService.getUserInventions();
        setInventions(fetchedInventions);
      } catch (error) {
        console.error("Error fetching inventions:", error);
        toast.error("Failed to load inventions");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInventions();
  }, []);

  const handleInventionClick = (inventionId: string) => {
    navigate(`/create?id=${inventionId}`);
  };

  const handleDeleteInvention = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this invention?")) {
      const success = await InventionService.deleteInvention(id);
      if (success) {
        toast.success("Invention deleted successfully");
        setInventions(inventions.filter(inv => inv.inventionId !== id));
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Your Saved Inventions</h1>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin h-12 w-12 border-4 border-invention-accent rounded-full border-t-transparent"></div>
          </div>
        ) : inventions.length === 0 ? (
          <div className="text-center p-12 border rounded-lg">
            <h3 className="text-xl font-medium mb-2">No Saved Inventions</h3>
            <p className="text-muted-foreground mb-6">You haven't saved any inventions yet.</p>
            <button 
              className="bg-invention-accent text-white px-6 py-2 rounded-md"
              onClick={() => navigate("/create")}
            >
              Create New Invention
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventions.map((invention) => (
              <div 
                key={invention.inventionId} 
                className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => handleInventionClick(invention.inventionId!)}
              >
                <div className="relative h-48 bg-gray-100">
                  {invention.sketchDataUrl ? (
                    <img 
                      src={invention.sketchDataUrl} 
                      alt={invention.title} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg mb-1 truncate">{invention.title || "Untitled Invention"}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {invention.description || "No description"}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">
                      {new Date(invention.assets[0]?.createdAt || Date.now()).toLocaleDateString()}
                    </span>
                    <button
                      className="text-red-500 hover:text-red-700 text-sm"
                      onClick={(e) => handleDeleteInvention(invention.inventionId!, e)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SavedInventions;
