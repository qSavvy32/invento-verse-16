import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { UserIcon, LogOut, FileText } from "lucide-react";

export const AuthHeader = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };
  
  return (
    <header className="border-b">
      <div className="container max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold font-leonardo flex items-center gap-2">
          <span className="bg-invention-accent text-white px-2 py-1 rounded">
            Invention
          </span>
          <span>Hub</span>
        </Link>
        
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button 
                variant="outline" 
                size="sm"
                asChild
              >
                <Link to="/inventions">
                  <FileText className="h-4 w-4 mr-2" />
                  My Inventions
                </Link>
              </Button>
              
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign out
              </Button>
            </>
          ) : (
            <Button asChild>
              <Link to="/auth">
                <UserIcon className="h-4 w-4 mr-2" />
                Sign in
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};
