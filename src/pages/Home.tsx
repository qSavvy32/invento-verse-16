
import { FeaturedInventions } from "@/components/FeaturedInventions";
import { Footer } from "@/components/Footer";
import { AuthHeader } from "@/components/AuthHeader";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BrainIcon, LightbulbIcon, RocketIcon, BookOpenIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <BrainIcon className="h-16 w-16 text-invention-accent" />
            </div>
            <h1 className="text-5xl md:text-6xl font-leonardo font-bold mb-6 text-invention-ink">
              Where Ideas Become Inventions
            </h1>
            <p className="text-xl mb-10 text-invention-ink/80 max-w-3xl mx-auto">
              InventoVerse combines AI-powered tools with your creativity to bring 
              your revolutionary ideas to life. Sketch, prototype, and launch your 
              next big invention.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              {user ? (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/create")}
                  className="text-lg px-8"
                >
                  <LightbulbIcon className="mr-2" />
                  Start Creating
                </Button>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => navigate("/auth")}
                  className="text-lg px-8"
                >
                  <LightbulbIcon className="mr-2" />
                  Get Started
                </Button>
              )}
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => navigate("/explore")}
                className="text-lg px-8"
              >
                <RocketIcon className="mr-2" />
                Explore Ideas
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12 font-leonardo text-invention-ink">
              Your Invention Journey Starts Here
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-background p-6 rounded-lg shadow-sm border border-invention-accent/20">
                <div className="h-12 w-12 bg-invention-accent/10 rounded-full flex items-center justify-center mb-4">
                  <LightbulbIcon className="h-6 w-6 text-invention-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Ideate</h3>
                <p className="text-invention-ink/70">
                  Brainstorm and refine your inventions with AI-powered idea generation and refinement tools.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg shadow-sm border border-invention-accent/20">
                <div className="h-12 w-12 bg-invention-accent/10 rounded-full flex items-center justify-center mb-4">
                  <BookOpenIcon className="h-6 w-6 text-invention-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Research</h3>
                <p className="text-invention-ink/70">
                  Analyze market potential, technical feasibility, and competitive landscape with intelligent research tools.
                </p>
              </div>
              <div className="bg-background p-6 rounded-lg shadow-sm border border-invention-accent/20">
                <div className="h-12 w-12 bg-invention-accent/10 rounded-full flex items-center justify-center mb-4">
                  <RocketIcon className="h-6 w-6 text-invention-accent" />
                </div>
                <h3 className="text-xl font-bold mb-2">Prototype</h3>
                <p className="text-invention-ink/70">
                  Quickly create sketches, mockups, and prototypes to visualize your invention and iterate on designs.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Idea Generator Section */}
        <IdeaGenerator />

        {/* Featured Inventions */}
        <FeaturedInventions />
      </main>

      <Footer />
    </div>
  );
}
