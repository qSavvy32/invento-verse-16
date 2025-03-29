
import React, { useEffect, useRef } from "react";

interface ThreejsPreviewProps {
  html: string;
}

export const ThreejsPreview = ({ html }: ThreejsPreviewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // This effect will run when the html content changes
    // and ensure any scripts inside the HTML content are executed
    if (containerRef.current && html) {
      // Clear previous content
      containerRef.current.innerHTML = '';
      // Add new content
      containerRef.current.innerHTML = html;
      
      // Execute any scripts in the HTML
      const scripts = containerRef.current.getElementsByTagName('script');
      for (let i = 0; i < scripts.length; i++) {
        const script = scripts[i];
        const newScript = document.createElement('script');
        
        // Copy all attributes
        Array.from(script.attributes).forEach(attr => {
          newScript.setAttribute(attr.name, attr.value);
        });
        
        // Copy the content
        newScript.textContent = script.textContent;
        
        // Replace the old script with the new one
        script.parentNode?.replaceChild(newScript, script);
      }
    }
  }, [html]);
  
  if (!html) return null;
  
  return (
    <div className="mt-4 border p-4 rounded-lg">
      <h4 className="text-sm font-medium mb-2">3D Visualization Preview</h4>
      <div 
        className="bg-gray-50 p-2 rounded-lg overflow-hidden" 
        style={{ height: "300px" }}
        ref={containerRef}
      />
    </div>
  );
};
