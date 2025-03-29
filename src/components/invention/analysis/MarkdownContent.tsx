
import { useEffect, useState } from "react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = ({ content }: MarkdownContentProps) => {
  const [parsedContent, setParsedContent] = useState<React.ReactNode>(content);

  useEffect(() => {
    // Enhanced markdown parser for formatting
    const parseMd = (text: string): React.ReactNode => {
      // Process text by blocks first (paragraphs, blockquotes, headers)
      const blocks = text.split('\n\n').filter(block => block.trim().length > 0);
      
      if (blocks.length > 1) {
        return blocks.map((block, blockIndex) => {
          return (
            <div key={`block-${blockIndex}`} className="mb-2">
              {parseBlock(block, blockIndex)}
            </div>
          );
        });
      }
      
      // If no blocks, process as a single piece
      return parseInline(text);
    };
    
    // Parse different block types (headers, blockquotes, lists, paragraphs)
    const parseBlock = (block: string, blockIndex: number): React.ReactNode => {
      // Check for headers
      const headerMatch = block.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        const level = headerMatch[1].length;
        const content = parseInline(headerMatch[2]);
        
        if (level === 1) return <h1 key={`h1-${blockIndex}`}>{content}</h1>;
        if (level === 2) return <h2 key={`h2-${blockIndex}`}>{content}</h2>;
        if (level === 3) return <h3 key={`h3-${blockIndex}`}>{content}</h3>;
        if (level === 4) return <h4 key={`h4-${blockIndex}`}>{content}</h4>;
        if (level === 5) return <h5 key={`h5-${blockIndex}`}>{content}</h5>;
        if (level === 6) return <h6 key={`h6-${blockIndex}`}>{content}</h6>;
      }
      
      // Check for blockquotes
      if (block.startsWith('>')) {
        const content = block.replace(/^>\s?/gm, '');
        return <blockquote key={`quote-${blockIndex}`}>{parseInline(content)}</blockquote>;
      }
      
      // Check if the block is a list
      if (block.match(/^[*\-•]\s+.+(\n[*\-•]\s+.+)*$/)) {
        const items = block.split('\n').filter(line => line.match(/^[*\-•]\s+/));
        return (
          <ul key={`ul-${blockIndex}`}>
            {items.map((item, itemIndex) => {
              const content = item.replace(/^[*\-•]\s+/, '');
              return <li key={`li-${blockIndex}-${itemIndex}`}>{parseInline(content)}</li>;
            })}
          </ul>
        );
      }
      
      // Check if the block is a numbered list
      if (block.match(/^\d+\.\s+.+(\n\d+\.\s+.+)*$/)) {
        const items = block.split('\n').filter(line => line.match(/^\d+\.\s+/));
        return (
          <ol key={`ol-${blockIndex}`}>
            {items.map((item, itemIndex) => {
              const content = item.replace(/^\d+\.\s+/, '');
              return <li key={`li-${blockIndex}-${itemIndex}`}>{parseInline(content)}</li>;
            })}
          </ol>
        );
      }
      
      // Default: treat as paragraph
      return <div key={`p-${blockIndex}`}>{parseInline(block)}</div>;
    };
    
    // Parse inline markdown elements (bold, italic, code, etc.)
    const parseInline = (text: string): React.ReactNode => {
      // Create a DOM element to safely parse HTML-like content
      const tempDiv = document.createElement('div');
      
      // Process bold: **text** or __text__
      let processedText = text.replace(/(\*\*|__)(.*?)\1/g, '<strong>$2</strong>');
      
      // Process italic: *text* or _text_
      processedText = processedText.replace(/(\*|_)(.*?)\1/g, '<em>$2</em>');
      
      // Process code: `text`
      processedText = processedText.replace(/`([^`]+)`/g, '<code>$1</code>');
      
      // Set the HTML content
      tempDiv.innerHTML = processedText;
      
      return <span dangerouslySetInnerHTML={{ __html: processedText }} />;
    };
    
    setParsedContent(parseMd(content));
  }, [content]);

  return <>{parsedContent}</>;
};
