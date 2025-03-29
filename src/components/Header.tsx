
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, MenuIcon, LightbulbIcon, FlaskConicalIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export const Header = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  
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
        <div className="flex items-center space-x-2">
          <img 
            src="/public/lovable-uploads/59c6581d-3d12-4bbd-b6c9-cb0618679145.png" 
            alt="Vinci Logo" 
            className="h-8 w-8"
          />
          <h1 className="text-2xl font-leonardo font-semibold text-invention-ink">
            Vinci
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
          
          <Button className="hidden md:flex">
            <LightbulbIcon className="mr-2 h-4 w-4" />
            New Invention
          </Button>
          
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
                  <Button className="mt-4">
                    <LightbulbIcon className="mr-2 h-4 w-4" />
                    New Invention
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
