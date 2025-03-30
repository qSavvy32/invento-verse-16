import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, MenuIcon, LightbulbIcon, FlaskConicalIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { motion } from "framer-motion";

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
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          whileHover={{ scale: 1.05 }}
        >
          <motion.img 
            src="/public/lovable-uploads/59c6581d-3d12-4bbd-b6c9-cb0618679145.png" 
            alt="Vinci Logo" 
            className="h-8 w-8"
            whileHover={{ rotate: 10 }}
            transition={{ type: "spring", stiffness: 300, damping: 15 }}
          />
          <h1 className="text-2xl font-leonardo font-semibold text-invention-ink">
            Vinci
          </h1>
        </motion.div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navigation.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.4, 
                ease: "easeOut", 
                delay: index * 0.1 + 0.2 
              }}
            >
              <Button 
                variant="ghost" 
                className="text-invention-ink hover:text-invention-accent"
                onClick={() => navigate(item.href)}
              >
                {item.name}
              </Button>
            </motion.div>
          ))}
        </nav>
        
        <div className="flex items-center space-x-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 }}
            whileTap={{ scale: 0.9 }}
          >
            <Button 
              variant="outline" 
              size="icon" 
              onClick={toggleDarkMode}
              className="text-invention-ink"
            >
              <motion.div
                initial={false}
                animate={{ rotate: isDarkMode ? 180 : 0 }}
                transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
              >
                {isDarkMode ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
              </motion.div>
            </Button>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button className="hidden md:flex">
              <LightbulbIcon className="mr-2 h-4 w-4" />
              New Invention
            </Button>
          </motion.div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.6 }}
                >
                  <Button variant="outline" size="icon">
                    <MenuIcon className="h-5 w-5" />
                  </Button>
                </motion.div>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="flex flex-col space-y-4 mt-8">
                  {navigation.map((item, index) => (
                    <motion.div
                      key={item.name}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ 
                        duration: 0.3, 
                        delay: index * 0.1, 
                        ease: "easeOut" 
                      }}
                    >
                      <Button 
                        variant="ghost" 
                        className="justify-start"
                        onClick={() => navigate(item.href)}
                      >
                        {item.name}
                      </Button>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    <Button className="mt-4">
                      <LightbulbIcon className="mr-2 h-4 w-4" />
                      New Invention
                    </Button>
                  </motion.div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};
