
import { useEffect, useState } from "react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  const [parsedContent, setParsedContent] = useState<React.ReactNode>(content);

  useEffect(() => {
    // Very simple markdown parser for basic formatting
    const parseMd = (text: string): React.ReactNode => {
      // Split by lines to process each line
      const lines = text.split('\n');
      
      return lines.map((line, index) => {
        // Bold text: **text** or __text__
        let processedLine = line.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
        
        // Italic text: *text* or _text_
        processedLine = processedLine.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
        
        // Code: `text`
        processedLine = processedLine.replace(/`([^`]+)`/g, '<code>$1</code>');
        
        // Check if the line is a bullet point
        if (line.trim().match(/^[•\-*]\s+(.+)$/)) {
          return (
            <li key={index} dangerouslySetInnerHTML={{ __html: processedLine.replace(/^[•\-*]\s+/, '') }} />
          );
        }
        
        // Regular paragraph
        return (
          <span key={index} 
            dangerouslySetInnerHTML={{ __html: processedLine }}
            className="block mb-1" 
          />
        );
      });
    };
    
    setParsedContent(parseMd(content));
  }, [content]);

  return <>{parsedContent}</>;
};
