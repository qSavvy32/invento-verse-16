
import React from "react";

interface ThreejsPreviewProps {
  html: string;
}

export const ThreejsPreview = ({ html }: ThreejsPreviewProps) => {
  if (!html) return null;
  
  return (
    <div className="mt-4 border p-4 rounded-lg">
      <h4 className="text-sm font-medium mb-2">3D Visualization Preview</h4>
      <div className="bg-gray-50 p-2 rounded-lg overflow-hidden" style={{ height: "300px" }}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  );
};
