
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, MenuIcon, LightbulbIcon, BrainIcon, UserIcon, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const AuthHeader = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setIsDarkMode(!isDarkMode);
  };
  
  const navigation = [
    { name: "Home", href: "/" },
    { name: "Create", href: "/create" },
    { name: "Explore", href: "/explore" },
    { name: "Resources", href: "/resources" },
  ];
  
  return (
    <header className="border-b border-invention-accent/30 py-4 px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-1">
          <BrainIcon className="h-6 w-6 text-invention-accent" />
          <h1 className="text-2xl font-leonardo font-semibold text-invention-ink">
            InventoVerse
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item) => (
            <Button 
              key={item.name} 
              variant="ghost" 
              className="text-invention-ink hover:text-invention-accent"
              onClick={() => navigate(item.href)}
            >
              {item.name}
            </Button>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleDarkMode}
            className="text-invention-ink"
          >
            {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
          </Button>
          
          {user ? (
            <>
              <Button 
                className="hidden md:flex"
                onClick={() => navigate("/create")}
              >
                <LightbulbIcon className="mr-2 h-4 w-4" />
                New Invention
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <UserIcon className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate("/dashboard")}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOutIcon className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          )}
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <MenuIcon className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item) => (
                    <Button 
                      key={item.name} 
                      variant="ghost" 
                      className="justify-start"
                      onClick={() => navigate(item.href)}
                    >
                      {item.name}
                    </Button>
                  ))}
                  
                  {user ? (
                    <>
                      <Button 
                        className="justify-start"
                        onClick={() => navigate("/create")}
                      >
                        <LightbulbIcon className="mr-2 h-4 w-4" />
                        New Invention
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => navigate("/profile")}
                      >
                        Profile
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => navigate("/dashboard")}
                      >
                        Dashboard
                      </Button>
                      <Button 
                        variant="ghost" 
                        className="justify-start text-red-500"
                        onClick={signOut}
                      >
                        <LogOutIcon className="mr-2 h-4 w-4" />
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <Button 
                      className="justify-start"
                      onClick={() => navigate("/auth")}
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
