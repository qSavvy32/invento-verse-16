
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { HomeIcon } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-invention-paper">
      <Header />
      
      <main className="flex-grow flex items-center justify-center py-20">
        <div className="text-center px-6">
          <h1 className="text-6xl font-leonardo font-bold text-invention-ink mb-4">404</h1>
          <p className="text-xl text-invention-ink/80 mb-8">
            This invention hasn't been created yet!
          </p>
          <div className="da-vinci-note inline-block p-6 mx-auto mb-8">
            <p className="font-leonardo text-invention-ink italic">
              "The greatest deception men suffer is from their own opinions."
            </p>
            <p className="text-sm text-invention-ink/70 mt-2">— Leonardo da Vinci</p>
          </div>
          <div>
            <Button className="bg-invention-accent hover:bg-invention-accent/90">
              <HomeIcon className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default NotFound;
