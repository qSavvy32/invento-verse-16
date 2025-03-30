import { FeaturedInventions } from "@/components/FeaturedInventions";
import { Footer } from "@/components/Footer";
import { AuthHeader } from "@/components/AuthHeader";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LightbulbIcon, RocketIcon, BookOpenIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

// Variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
};

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex flex-col">
      <AuthHeader />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 px-6 text-center">
          <motion.div 
            className="max-w-4xl mx-auto"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div 
              className="flex justify-center mb-6"
              variants={itemVariants}
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 300, damping: 10 }}
            >
              <img 
                src="/public/lovable-uploads/59c6581d-3d12-4bbd-b6c9-cb0618679145.png" 
                alt="Vinci Logo" 
                className="h-24 w-24"
              />
            </motion.div>
            <motion.h1 
              className="text-5xl md:text-6xl font-leonardo font-bold mb-6 text-invention-ink"
              variants={itemVariants}
            >
              Where Ideas Become Inventions
            </motion.h1>
            <motion.p 
              className="text-xl mb-10 text-invention-ink/80 max-w-3xl mx-auto"
              variants={itemVariants}
            >
              Vinci combines AI-powered tools with your creativity to bring 
              your revolutionary ideas to life. Sketch, prototype, and launch your 
              next big invention.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row justify-center gap-4"
              variants={itemVariants}
            >
              {user ? (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/create")}
                    className="text-lg px-8"
                  >
                    <LightbulbIcon className="mr-2" />
                    Start Creating
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button 
                    size="lg" 
                    onClick={() => navigate("/auth")}
                    className="text-lg px-8"
                  >
                    <LightbulbIcon className="mr-2" />
                    Get Started
                  </Button>
                </motion.div>
              )}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => navigate("/explore")}
                  className="text-lg px-8"
                >
                  <RocketIcon className="mr-2" />
                  Explore Ideas
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        </section>

        {/* Features */}
        <section className="py-16 px-6 bg-muted/30">
          <div className="max-w-7xl mx-auto">
            <motion.h2 
              className="text-3xl font-bold text-center mb-12 font-leonardo text-invention-ink"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              Your Invention Journey Starts Here
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.2 }}
              variants={{
                hidden: { opacity: 0 },
                visible: { 
                  opacity: 1,
                  transition: { 
                    staggerChildren: 0.2
                  }
                }
              }}
            >
              <motion.div 
                className="bg-background p-6 rounded-lg shadow-sm border border-invention-accent/20"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" }
                  }
                }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div 
                  className="h-12 w-12 bg-invention-accent/10 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <LightbulbIcon className="h-6 w-6 text-invention-accent" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Ideate</h3>
                <p className="text-invention-ink/70">
                  Brainstorm and refine your inventions with AI-powered idea generation and refinement tools.
                </p>
              </motion.div>
              <motion.div 
                className="bg-background p-6 rounded-lg shadow-sm border border-invention-accent/20"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" }
                  }
                }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div 
                  className="h-12 w-12 bg-invention-accent/10 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <BookOpenIcon className="h-6 w-6 text-invention-accent" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Research</h3>
                <p className="text-invention-ink/70">
                  Analyze market potential, technical feasibility, and competitive landscape with intelligent research tools.
                </p>
              </motion.div>
              <motion.div 
                className="bg-background p-6 rounded-lg shadow-sm border border-invention-accent/20"
                variants={{
                  hidden: { opacity: 0, y: 30 },
                  visible: { 
                    opacity: 1, 
                    y: 0,
                    transition: { duration: 0.5, ease: "easeOut" }
                  }
                }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
              >
                <motion.div 
                  className="h-12 w-12 bg-invention-accent/10 rounded-full flex items-center justify-center mb-4"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                >
                  <RocketIcon className="h-6 w-6 text-invention-accent" />
                </motion.div>
                <h3 className="text-xl font-bold mb-2">Prototype</h3>
                <p className="text-invention-ink/70">
                  Quickly create sketches, mockups, and prototypes to visualize your invention and iterate on designs.
                </p>
              </motion.div>
            </motion.div>
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
