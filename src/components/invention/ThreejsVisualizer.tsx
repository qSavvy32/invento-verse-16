
import { useEffect, useRef, useState } from "react";
import { useInvention } from "@/contexts/InventionContext";
import { Loader2 } from "lucide-react";

export const ThreejsVisualizer = () => {
  const { state } = useInvention();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!state.threejsVisualization.html) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Create a blob with the HTML content
      const blob = new Blob([state.threejsVisualization.html], { type: 'text/html' });
      const blobURL = URL.createObjectURL(blob);
      
      // Set the blob URL as the iframe source
      if (iframeRef.current) {
        iframeRef.current.src = blobURL;
        
        // Handle iframe load event
        iframeRef.current.onload = () => {
          setIsLoading(false);
        };
        
        // Handle iframe error event
        iframeRef.current.onerror = () => {
          setError("Failed to load 3D visualization");
          setIsLoading(false);
        };
      }
      
      // Clean up the blob URL when component unmounts
      return () => {
        URL.revokeObjectURL(blobURL);
      };
    } catch (err) {
      console.error("Error setting up 3D visualization:", err);
      setError(`Error: ${err instanceof Error ? err.message : "Unknown error"}`);
      setIsLoading(false);
    }
  }, [state.threejsVisualization.html]);

  if (!state.threejsVisualization.html) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border border-gray-200">
        <p className="text-muted-foreground">No 3D visualization available yet.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative rounded-lg overflow-hidden border border-gray-200 bg-black">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-white animate-spin" />
            <p className="text-white text-sm">Loading 3D visualization...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="bg-red-100 text-red-700 p-4 rounded-md">
            <p>{error}</p>
            <p className="text-sm mt-2">Try generating the visualization again.</p>
          </div>
        </div>
      )}
      
      <iframe 
        ref={iframeRef}
        title="3D Visualization" 
        className="w-full h-[500px]"
        sandbox="allow-scripts"
        allow="accelerometer; camera; encrypted-media; display-capture; geolocation; gyroscope; microphone; web-share"
        loading="lazy"
      />
    </div>
  );
};
