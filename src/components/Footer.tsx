
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GithubIcon, TwitterIcon, LinkedinIcon, BrainIcon } from "lucide-react";

export const Footer = () => {
  return (
    <footer className="bg-invention-paper border-t border-invention-accent/20 pt-12 pb-6">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <BrainIcon className="h-6 w-6 text-invention-accent" />
              <h2 className="text-xl font-leonardo font-semibold text-invention-ink">
                InventoVerse
              </h2>
            </div>
            <p className="text-invention-ink/80 mb-4">
              Empowering inventors with AI-powered tools to bring their ideas to life.
            </p>
            <div className="flex space-x-4">
              <Button variant="ghost" size="icon" className="text-invention-ink hover:text-invention-accent">
                <TwitterIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-invention-ink hover:text-invention-accent">
                <GithubIcon className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-invention-ink hover:text-invention-accent">
                <LinkedinIcon className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-leonardo font-semibold text-invention-ink">Platform</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Features</a></li>
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Pricing</a></li>
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">FAQ</a></li>
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Testimonials</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-leonardo font-semibold text-invention-ink">Resources</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Patent Guide</a></li>
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Invention Blog</a></li>
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Community</a></li>
              <li><a href="#" className="text-invention-ink/80 hover:text-invention-accent">Support</a></li>
            </ul>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-leonardo font-semibold text-invention-ink">Stay Updated</h3>
            <p className="text-invention-ink/80">
              Subscribe to our newsletter for the latest innovation tools and resources.
            </p>
            <div className="flex space-x-2">
              <Input placeholder="Your email" type="email" className="bg-white" />
              <Button>Subscribe</Button>
            </div>
          </div>
        </div>
        
        <div className="mt-12 pt-6 border-t border-invention-accent/20 text-center text-invention-ink/60 text-sm">
          <p>© {new Date().getFullYear()} InventoVerse. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};
