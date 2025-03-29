
import React, { useState, useEffect, useRef } from "react";
import PixelCard from "../ui/PixelCard";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface InputSelectionCardProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  description: string;
  variant: "blue" | "pink" | "yellow" | "green" | "purple";
  children: React.ReactNode;
}

export const InputSelectionCard = ({
  id,
  title,
  icon,
  description,
  variant,
  children,
}: InputSelectionCardProps) => {
  const [isActive, setIsActive] = useState(false);
  const expandedCardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cardPosition, setCardPosition] = useState({
    top: 0,
    left: 0,
    width: 0,
    height: 0,
  });

  const handleCardClick = () => {
    if (!isActive && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setCardPosition({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
    }
    setIsActive(!isActive);
  };

  // Close the expanded card when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isActive && 
          expandedCardRef.current && 
          !expandedCardRef.current.contains(event.target as Node)) {
        setIsActive(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isActive]);

  // Prevent body scrolling when card is expanded
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isActive]);

  return (
    <div ref={containerRef} className="relative h-full">
      {!isActive && (
        <PixelCard 
          variant={variant} 
          onClick={handleCardClick}
          className="h-full"
        >
          <div className="flex flex-col items-center justify-center h-full w-full">
            <div className="text-3xl mb-2">{icon}</div>
            <h3 className="pixel-card-title">{title}</h3>
            <p className="pixel-card-description">{description}</p>
          </div>
        </PixelCard>
      )}
      
      <AnimatePresence>
        {isActive && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/70 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setIsActive(false)}
            />
            
            <motion.div
              ref={expandedCardRef}
              className="fixed z-50 bg-background border rounded-lg shadow-xl overflow-auto"
              style={{ 
                maxHeight: "90vh",
                width: "min(1200px, 90vw)",
                maxWidth: "90vw"
              }}
              initial={{ 
                opacity: 0,
                scale: 0.7,
                top: cardPosition.top + (cardPosition.height / 2),
                left: cardPosition.left + (cardPosition.width / 2),
                x: "-50%",
                y: "-50%"
              }}
              animate={{ 
                opacity: 1,
                scale: 1,
                top: "50%",
                left: "50%",
                x: "-50%",
                y: "-50%"
              }}
              exit={{ 
                opacity: 0,
                scale: 0.7,
                top: cardPosition.top + (cardPosition.height / 2),
                left: cardPosition.left + (cardPosition.width / 2),
                x: "-50%",
                y: "-50%"
              }}
              transition={{ 
                type: "spring",
                stiffness: 350,
                damping: 25
              }}
            >
              <div className="sticky top-0 z-[1] flex justify-between items-center p-6 border-b bg-background">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {icon}
                  {title}
                </h3>
                <button 
                  onClick={() => setIsActive(false)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  <X size={14} />
                  Close
                </button>
              </div>
              
              <div className="p-6 input-container">
                {children}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
