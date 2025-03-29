
import React from "react";

interface BusinessStrategyPreviewProps {
  svgCode: string;
}

export const BusinessStrategyPreview = ({ svgCode }: BusinessStrategyPreviewProps) => {
  if (!svgCode) return null;
  
  return (
    <div className="mt-4 border p-4 rounded-lg">
      <h4 className="text-sm font-medium mb-2">Business Strategy Visualization</h4>
      <div className="bg-gray-50 p-4 rounded-lg overflow-hidden">
        <div dangerouslySetInnerHTML={{ __html: svgCode }} className="flex justify-center" />
      </div>
    </div>
  );
};
