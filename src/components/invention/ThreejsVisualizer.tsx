
import { useEffect, useRef } from "react";
import { useInvention } from "@/contexts/InventionContext";

export const ThreejsVisualizer = () => {
  const { state } = useInvention();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.threejsVisualization.html) return;

    // Create a blob with the HTML content
    const blob = new Blob([state.threejsVisualization.html], { type: 'text/html' });
    const blobURL = URL.createObjectURL(blob);
    
    // Set the blob URL as the iframe source
    if (iframeRef.current) {
      iframeRef.current.src = blobURL;
    }
    
    // Clean up the blob URL when component unmounts
    return () => {
      URL.revokeObjectURL(blobURL);
    };
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
      <iframe 
        ref={iframeRef}
        title="3D Visualization" 
        className="w-full h-[500px]"
        sandbox="allow-scripts"
      />
    </div>
  );
};
