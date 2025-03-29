
import { useState, useEffect } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { FirecrawlService } from "@/services/FirecrawlService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

// Local storage key for saving URL input state
const URL_INPUT_STORAGE_KEY = 'invention_url_scraper_input';

export const UrlScraper = ({ onAddAsset }: { onAddAsset?: (asset: any) => void }) => {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { updateDescription } = useInvention();
  
  // Load saved URL from storage on component mount
  useEffect(() => {
    const savedUrl = localStorage.getItem(URL_INPUT_STORAGE_KEY);
    if (savedUrl) {
      setUrl(savedUrl);
      // Clear storage after restoring
      localStorage.removeItem(URL_INPUT_STORAGE_KEY);
    }
  }, []);
  
  // Save URL to local storage when it changes
  useEffect(() => {
    if (url) {
      localStorage.setItem(URL_INPUT_STORAGE_KEY, url);
    }
  }, [url]);
  
  // Save URL to storage when window is about to unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (url) {
        localStorage.setItem(URL_INPUT_STORAGE_KEY, url);
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('visibilitychange', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('visibilitychange', handleBeforeUnload);
    };
  }, [url]);
  
  const handleScrape = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid URL",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await FirecrawlService.scrapeUrl(url);
      
      if (!result.success) {
        toast({
          title: "Error",
          description: result.error || "Failed to scrape URL",
          variant: "destructive"
        });
        return;
      }
      
      // Extract summary from response
      const summary = result.data.summary || 
        `Content scraped from ${url}. ${result.data.text?.substring(0, 500) || ''}...`;
      
      // Update description with scraped content
      updateDescription((prev) => {
        if (prev.trim()) {
          return `${prev}\n\n--- Scraped from ${url} ---\n${summary}`;
        }
        return `--- Scraped from ${url} ---\n${summary}`;
      });
      
      // Add as asset if callback provided
      if (onAddAsset) {
        onAddAsset({
          id: uuidv4(),
          type: 'document',
          url: url,
          name: `Scraped content from ${new URL(url).hostname}`,
          createdAt: Date.now()
        });
      }
      
      toast({
        title: "Success",
        description: "URL scraped and added to your invention"
      });
      
      // Clear URL input and storage after successful scrape
      setUrl("");
      localStorage.removeItem(URL_INPUT_STORAGE_KEY);
      
    } catch (error) {
      console.error("Error scraping URL:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="url">Website URL</Label>
          <div className="flex gap-2">
            <Input
              id="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={handleScrape} 
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? "Scraping..." : "Scrape"}
            </Button>
          </div>
        </div>
      </div>
      
      <div className="rounded-md bg-muted p-4">
        <h4 className="font-medium mb-2">How it works</h4>
        <p className="text-sm text-muted-foreground">
          Enter a URL to scrape its content. The system will extract key information, 
          create a summary, and add it to your invention description. This can help you 
          research similar products, gather market information, or document inspiration.
        </p>
      </div>
    </div>
  );
};
