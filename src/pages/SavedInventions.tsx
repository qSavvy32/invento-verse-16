
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthHeader } from "@/components/AuthHeader";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Edit, LayoutGrid, Plus, FileText, ArrowLeft } from "lucide-react";
import { SavedInvention, InventionService } from "@/services/InventionService";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const SavedInventions = () => {
  const [inventions, setInventions] = useState<SavedInvention[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  
  useEffect(() => {
    loadInventions();
  }, [user]);
  
  const loadInventions = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const data = await InventionService.getUserInventions();
      setInventions(data);
    } catch (error) {
      console.error("Error loading inventions:", error);
      toast.error("Failed to load your inventions");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this invention?")) {
      try {
        const success = await InventionService.deleteInvention(id);
        
        if (success) {
          setInventions(prev => prev.filter(inv => inv.id !== id));
          toast.success("Invention deleted successfully");
        } else {
          toast.error("Failed to delete invention");
        }
      } catch (error) {
        console.error("Error deleting invention:", error);
        toast.error("An error occurred while deleting the invention");
      }
    }
  };
  
  const handleEdit = (id: string) => {
    navigate(`/create?id=${id}`);
  };
  
  const handleCreateNew = () => {
    navigate("/create");
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1 container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              className="mr-2"
              onClick={() => navigate("/")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold">Your Inventions</h1>
          </div>
          <p className="text-muted-foreground">
            View and manage all your saved inventions
          </p>
        </div>
        
        <div className="mb-6">
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Create New Invention
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin h-12 w-12 border-4 border-invention-accent rounded-full border-t-transparent"></div>
          </div>
        ) : inventions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="mx-auto flex flex-col items-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No inventions yet</h3>
                <p className="text-muted-foreground mb-6">
                  You haven't saved any inventions yet. Create your first one to get started!
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Invention
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inventions.map((invention) => (
              <Card key={invention.id}>
                <CardHeader>
                  <CardTitle className="truncate">{invention.title || "Untitled Invention"}</CardTitle>
                  <CardDescription>
                    Last updated: {new Date(invention.updated_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {invention.description || "No description"}
                  </p>
                  
                  {/* Thumbnail or asset preview */}
                  {invention.assets.length > 0 && (
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
                      {invention.assets
                        .filter(asset => asset.thumbnailUrl || asset.type === 'image' || asset.type === 'sketch')
                        .slice(0, 3)
                        .map((asset, index) => (
                          <div 
                            key={index} 
                            className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0"
                          >
                            <img 
                              src={asset.thumbnailUrl || asset.url} 
                              alt={asset.name || "Asset"} 
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ))}
                        
                      {invention.assets.length > 3 && (
                        <div className="h-16 w-16 rounded-md bg-muted overflow-hidden flex-shrink-0 flex items-center justify-center">
                          <span className="text-xs font-medium">+{invention.assets.length - 3} more</span>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleDelete(invention.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleEdit(invention.id)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default SavedInventions;
