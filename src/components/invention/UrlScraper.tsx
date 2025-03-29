
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Globe } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useInvention } from "@/contexts/InventionContext";
import { InventionAsset } from "@/contexts/InventionContext";

interface UrlScraperProps {
  onAddAsset?: (asset: InventionAsset) => void;
}

export const UrlScraper = ({ onAddAsset }: UrlScraperProps) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateDescription } = useInvention();
  
  const handleScrape = async () => {
    if (!url) {
      toast.error("Please enter a URL");
      return;
    }
    
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    
    setIsLoading(true);
    toast.loading("Scraping website content...");
    
    try {
      const { data, error } = await supabase.functions.invoke("scrape-website", {
        body: { url }
      });
      
      if (error) {
        throw new Error(error.message || "Failed to scrape website");
      }
      
      toast.dismiss();
      
      if (data?.content) {
        // Add the content to the description
        updateDescription((prev) => {
          const newContent = `Content from ${url}:\n\n${data.content}`;
          if (prev) {
            return `${prev}\n\n${newContent}`;
          }
          return newContent;
        });
        
        // Add screenshot as asset if available
        if (data.screenshot && onAddAsset) {
          const timestamp = Date.now();
          onAddAsset({
            id: `screenshot-${timestamp}`,
            type: "image",
            url: data.screenshot,
            thumbnailUrl: data.screenshot,
            name: `Screenshot of ${url}`,
            createdAt: timestamp
          });
        }
        
        toast.success("Website content added to your description");
      } else {
        toast.info("No content was extracted from the website");
      }
    } catch (error) {
      console.error("Error scraping website:", error);
      toast.error("Failed to scrape website", {
        description: error instanceof Error ? error.message : "An unexpected error occurred"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <Globe className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-sm font-medium">Web Scraper</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Enter a URL to extract content from a website related to your invention
      </p>
      
      <div className="flex gap-2">
        <Input
          placeholder="https://example.com/article"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-1"
        />
        <Button 
          onClick={handleScrape}
          disabled={isLoading || !url}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Scrape"
          )}
        </Button>
      </div>
    </div>
  );
};
