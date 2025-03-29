
import React from "react";

interface TranscriptViewerProps {
  transcript: string[];
}

export const TranscriptViewer: React.FC<TranscriptViewerProps> = ({ transcript }) => {
  if (transcript.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-4 border rounded-md p-4 max-h-[200px] overflow-y-auto">
      <h3 className="text-sm font-medium mb-2">Conversation Transcript</h3>
      <div className="space-y-2">
        {transcript.map((message, index) => (
          <div key={index} className="text-sm">
            {message}
          </div>
        ))}
      </div>
    </div>
  );
};
