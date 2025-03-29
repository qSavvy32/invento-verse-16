
import { supabase } from "@/integrations/supabase/client";

interface ScrapingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class FirecrawlService {
  static async scrapeUrl(url: string): Promise<ScrapingResponse> {
    try {
      const { data, error } = await supabase.functions.invoke('scrape-url', {
        body: { url }
      });
      
      if (error) {
        console.error('Error invoking scrape-url function:', error);
        return { 
          success: false, 
          error: error.message || 'Failed to scrape URL' 
        };
      }
      
      return data as ScrapingResponse;
    } catch (error) {
      console.error('Error scraping URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
