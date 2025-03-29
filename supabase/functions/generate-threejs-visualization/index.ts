
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Anthropic } from "https://esm.sh/@anthropic-ai/sdk@0.16.0";
import * as Sentry from "https://esm.sh/@sentry/deno@7.94.1";

// Initialize Sentry
try {
  Sentry.init({
    dsn: Deno.env.get("SENTRY_DSN"),
    environment: 'production',
    tracesSampleRate: 1.0,
  });
} catch (e) {
  console.error("Invalid Sentry Dsn:", Deno.env.get("SENTRY_DSN"));
}

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
    const { title, description, sketchDataUrl, outputFormat } = await req.json();

    // Validate required inputs
    if (!title && !description) {
      throw new Error("At least title or description must be provided");
    }

    console.log(`Received request for ThreeJS visualization`);

    const anthropic = new Anthropic({
      apiKey: Deno.env.get("ANTHROPIC_API_KEY"),
    });

    // Prepare system prompt
    const systemPrompt = `You are an expert 3D visualization developer. Your task is to create a simple and clean Three.js 
      scene that visualizes the invention described. You should create a minimal, focused scene that runs efficiently and 
      illustrates the key aspects of the invention.
      
      Return ONLY valid JavaScript code that creates a THREE.js scene. The code should be wrapped in a function 
      called 'createInventionScene' that takes a container DOM element as its parameter and sets up a complete scene.
      
      The returned code must:
      1. Import THREE from a CDN (https://unpkg.com/three@0.158.0/build/three.module.js)
      2. Create a proper THREE.js scene with camera, renderer, and lighting
      3. Create appropriate 3D objects representing the invention
      4. Include animation and mouse/touch controls for rotation
      5. Handle window resizing properly
      6. Be valid, production-ready JavaScript that runs without errors
      7. Include helpful comments to explain what the code is doing
      8. NOT include any HTML, explanations, or content other than pure JavaScript code
      
      Do not include any explanations or comments in your response, ONLY return the JavaScript code.`;

    // Prepare user message with invention details
    let userMessage = `Create a Three.js visualization for this invention:
      
      Title: ${title || "Untitled"}
      Description: ${description || "No description provided"}
      
      The visualization should be simple but effective, focusing on the core concept of the invention.
      Make sure the code uses modern ES6+ JavaScript.
      Include appropriate camera controls to allow users to interact with the 3D model.
      Ensure the scene has good lighting and shadows where appropriate.
      Use appropriate colors and materials that match the invention's purpose.
      Add detailed code comments to explain what each part does.`;

    if (sketchDataUrl) {
      userMessage += `\n\nThe inventor has also created a sketch of the invention which you should try to incorporate into your visualization.`;
    }

    console.log(`Sending request to Anthropic API for ThreeJS visualization...`);

    // Make request to Anthropic API
    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      system: systemPrompt,
      max_tokens: 4000,
      messages: [
        { role: "user", content: userMessage }
      ],
      temperature: 0.7, 
    });

    console.log("Received response from Anthropic API");

    // Extract the JavaScript code from the response
    const scriptContent = response.content[0].text.trim();
    
    // Create a complete HTML page with the Three.js visualization
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Invention"} - 3D Visualization</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; overflow: hidden; }
    body { background-color: #000; }
    canvas { width: 100%; height: 100%; display: block; }
    #info {
      position: absolute;
      top: 10px;
      width: 100%;
      text-align: center;
      color: white;
      font-family: Arial, sans-serif;
      pointer-events: none;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
      z-index: 100;
    }
  </style>
</head>
<body>
  <div id="info">
    <h1>${title || "Invention"}</h1>
    <p>Click and drag to rotate. Scroll to zoom.</p>
  </div>
  <div id="scene-container" style="width: 100%; height: 100%;"></div>
  <script type="module">
    ${scriptContent}

    document.addEventListener('DOMContentLoaded', function() {
      const container = document.getElementById('scene-container');
      if (typeof createInventionScene === 'function') {
        try {
          createInventionScene(container);
        } catch (error) {
          console.error('Error creating scene:', error);
          container.innerHTML = '<div style="color: white; padding: 20px;">Error creating 3D scene: ' + error.message + '</div>';
        }
      } else {
        console.error('createInventionScene function not found');
        container.innerHTML = '<div style="color: white; padding: 20px;">Error: 3D visualization function not found</div>';
      }
    });
  </script>
</body>
</html>`;

    return new Response(JSON.stringify({ 
      visualization_code: scriptContent,
      visualization_html: htmlContent
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-threejs-visualization function:", error);
    
    // Capture exception in Sentry
    Sentry.captureException(error);
    
    return new Response(
      JSON.stringify({ error: `Visualization generation error: ${error.message}` }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
