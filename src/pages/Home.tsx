
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeaturedInventions } from "@/components/FeaturedInventions";
import { BrainIcon, Lightbulb, BarChart3, FileText, Users, ArrowRight } from "lucide-react";

export const Home = () => {
  return (
    <div className="min-h-screen flex flex-col bg-invention-paper">
      <Header />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-16 md:py-24 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 md:pr-12 mb-10 md:mb-0 animate-slide-in">
              <h1 className="text-4xl md:text-5xl font-leonardo font-semibold leading-tight text-invention-ink mb-6">
                Transform Your Ideas into <span className="text-invention-accent">Inventions</span> with AI
              </h1>
              <p className="text-lg text-invention-ink/80 mb-8">
                Sketch, ideate, and develop your inventions with our AI-powered platform. From concept to creation, InventoVerse guides you through every step of the invention process.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-invention-accent text-white hover:bg-invention-accent/90">
                  Start Creating
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg" className="border-invention-ink text-invention-ink hover:bg-invention-ink/10">
                  Explore Inventions
                </Button>
              </div>
            </div>
            
            <div className="md:w-1/2 relative">
              <div className="relative rounded-lg overflow-hidden shadow-xl animate-fade-in">
                <img 
                  src="https://images.unsplash.com/photo-1629224834618-754ce784953a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80" 
                  alt="Invention Sketches" 
                  className="w-full h-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-invention-paper/80 to-transparent"></div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-16 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-leonardo font-semibold text-invention-ink mb-4">
                Powered by Innovative Technology
              </h2>
              <p className="text-lg text-invention-ink/80 max-w-2xl mx-auto">
                Our platform combines cutting-edge AI with intuitive design tools to help you bring your inventions to life.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-invention-paper p-6 rounded-lg border border-invention-accent/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-invention-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <Lightbulb className="h-6 w-6 text-invention-accent" />
                </div>
                <h3 className="text-xl font-leonardo font-semibold text-invention-ink mb-2">
                  AI Idea Generation
                </h3>
                <p className="text-invention-ink/80">
                  Get intelligent suggestions and refinements for your invention ideas based on your sketches and descriptions.
                </p>
              </div>
              
              <div className="bg-invention-paper p-6 rounded-lg border border-invention-accent/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-invention-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-invention-accent" />
                </div>
                <h3 className="text-xl font-leonardo font-semibold text-invention-ink mb-2">
                  Market Analysis
                </h3>
                <p className="text-invention-ink/80">
                  Receive insights on market potential, target demographics, and competitive landscape for your invention.
                </p>
              </div>
              
              <div className="bg-invention-paper p-6 rounded-lg border border-invention-accent/20 shadow-sm hover:shadow-md transition-shadow duration-300">
                <div className="bg-invention-accent/10 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-invention-accent" />
                </div>
                <h3 className="text-xl font-leonardo font-semibold text-invention-ink mb-2">
                  Patent Guidance
                </h3>
                <p className="text-invention-ink/80">
                  Get assistance with patent searches, drafting patent applications, and protecting your intellectual property.
                </p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Featured Inventions Section */}
        <section className="py-16">
          <div className="max-w-7xl mx-auto px-6">
            <FeaturedInventions />
            
            <div className="text-center mt-12">
              <Button size="lg" className="bg-invention-ink text-white hover:bg-invention-ink/90">
                Explore All Inventions
              </Button>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-invention-accent/10">
          <div className="max-w-7xl mx-auto px-6 text-center">
            <div className="max-w-3xl mx-auto">
              <BrainIcon className="h-12 w-12 text-invention-accent mx-auto mb-6" />
              <h2 className="text-3xl font-leonardo font-semibold text-invention-ink mb-6">
                Ready to Turn Your Ideas into Reality?
              </h2>
              <p className="text-lg text-invention-ink/80 mb-8">
                Join thousands of inventors using InventoVerse to develop, refine, and bring their inventions to market.
              </p>
              <Button size="lg" className="bg-invention-accent text-white hover:bg-invention-accent/90">
                Start Creating Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
};

export default Home;
