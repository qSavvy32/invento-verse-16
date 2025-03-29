
interface ScrapingResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export class FirecrawlService {
  private static API_KEY_STORAGE_KEY = 'firecrawl_api_key';
  
  static saveApiKey(apiKey: string): void {
    localStorage.setItem(this.API_KEY_STORAGE_KEY, apiKey);
    console.log('Firecrawl API key saved');
  }
  
  static getApiKey(): string | null {
    return localStorage.getItem(this.API_KEY_STORAGE_KEY);
  }
  
  static async testApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ url: 'https://example.com' }),
      });
      
      const data = await response.json();
      return data.success === true;
    } catch (error) {
      console.error('Error testing Firecrawl API key:', error);
      return false;
    }
  }
  
  static async scrapeUrl(url: string): Promise<ScrapingResponse> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      return { success: false, error: 'API key not found' };
    }
    
    try {
      const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          url,
          options: {
            includeSummary: true,
            depth: 1,
            maxPages: 1
          }
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.message || 'Failed to scrape URL'
        };
      }
      
      return {
        success: true,
        data
      };
    } catch (error) {
      console.error('Error scraping URL:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}
