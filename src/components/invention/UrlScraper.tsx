
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvention } from '@/contexts/InventionContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, Globe, Check } from 'lucide-react';

interface UrlScraperProps {
  onAddAsset?: (asset: any) => void;
}

export const UrlScraper = ({ onAddAsset }: UrlScraperProps) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const { updateDescription } = useInvention();

  const isValidUrl = (urlString: string) => {
    try {
      new URL(urlString);
      return true;
    } catch (err) {
      return false;
    }
  };

  const handleScrapeUrl = async () => {
    if (!isValidUrl(url)) {
      toast.error('Please enter a valid URL');
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);

    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url }
      });

      if (error) {
        throw new Error(`Failed to scrape URL: ${error.message}`);
      }

      if (!data.content) {
        throw new Error('No content was scraped from the URL');
      }

      // Format the scraped content
      const scrapedContent = `--- Scraped from ${url} ---
${data.content}
`;

      // Append to description rather than replacing it
      updateDescription((currentDescription: string) => {
        const currentDesc = typeof currentDescription === 'string' ? currentDescription : '';
        if (currentDesc.trim()) {
          return `${currentDesc}\n\n${scrapedContent}`;
        }
        return scrapedContent;
      });

      // Add the URL to assets if onAddAsset is provided
      if (onAddAsset && data.screenshot) {
        const timestamp = Date.now();
        onAddAsset({
          id: `url-scrape-${timestamp}`,
          type: 'image',
          url: data.screenshot,
          thumbnailUrl: data.screenshot,
          name: `Screenshot of ${new URL(url).hostname}`,
          createdAt: timestamp
        });
      }

      setIsSuccess(true);
      toast.success('URL content added to your invention description');
    } catch (error) {
      console.error('Error scraping URL:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to scrape the URL');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Web Scraper</div>
      <p className="text-sm text-muted-foreground mb-4">
        Enter a website URL to extract content and add it to your invention description.
      </p>
      
      <div className="flex gap-2">
        <Input
          placeholder="Enter URL (e.g., https://example.com)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={isLoading}
          className="flex-grow"
        />
        <Button 
          onClick={handleScrapeUrl}
          disabled={isLoading || !url.trim()}
          variant={isSuccess ? "outline" : "default"}
          className={isSuccess ? "border-green-500 text-green-500" : ""}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : isSuccess ? (
            <Check className="h-4 w-4 mr-2" />
          ) : (
            <Globe className="h-4 w-4 mr-2" />
          )}
          {isLoading ? 'Scraping...' : isSuccess ? 'Added' : 'Scrape'}
        </Button>
      </div>
      
      {isSuccess && (
        <p className="text-xs text-green-600">
          Content from {new URL(url).hostname} has been added to your description
        </p>
      )}
    </div>
  );
};
