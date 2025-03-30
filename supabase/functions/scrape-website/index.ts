
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const { url } = await req.json();
    
    if (!url) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "URL is required" 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    console.log(`Scraping URL: ${url}`);
    
    // Fetch the URL content
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch URL: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Use cheerio to parse the HTML
    const $ = cheerio.load(html);
    
    // Remove script and style elements
    $("script, style").remove();
    
    // Extract the page title
    const title = $("title").text().trim();
    
    // Extract meta description
    const metaDescription = $('meta[name="description"]').attr("content") || "";
    
    // Extract main text content
    const bodyText = $("body").text().trim().replace(/\s+/g, " ");
    const textContent = bodyText.slice(0, 5000); // Limit to 5000 characters
    
    // Try to take a screenshot - this would normally be done with a headless browser
    // For now, we'll just return the data without a screenshot
    
    const result = {
      title,
      metaDescription,
      text: textContent,
      url
    };
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        data: result
      }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error scraping URL:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: `Failed to scrape URL: ${error.message}` 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
