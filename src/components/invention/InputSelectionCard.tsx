
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

  return (
    <div ref={containerRef} className="relative">
      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="h-full"
          >
            <PixelCard 
              variant={variant} 
              onClick={handleCardClick}
            >
              <div className="flex flex-col items-center justify-center h-full w-full">
                <div className="text-3xl mb-2">{icon}</div>
                <h3 className="pixel-card-title">{title}</h3>
                <p className="pixel-card-description">{description}</p>
              </div>
            </PixelCard>
          </motion.div>
        ) : (
          <motion.div
            ref={expandedCardRef}
            initial={{ 
              opacity: 0, 
              scale: 0.95, 
              position: "fixed",
              top: cardPosition.top,
              left: cardPosition.left,
              width: cardPosition.width,
              height: cardPosition.height,
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              position: "fixed",
              top: "50%",
              left: "50%",
              width: "75vw",
              height: "auto",
              y: "-50%",
              x: "-50%",
              maxWidth: "1200px"
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.95,
              position: "fixed",
              top: cardPosition.top,
              left: cardPosition.left,
              width: cardPosition.width,
              height: cardPosition.height,
              y: 0,
              x: 0
            }}
            transition={{ 
              duration: 0.5, 
              ease: [0.19, 1, 0.22, 1]
            }}
            className="bg-background border rounded-lg p-6 shadow-lg z-50"
            style={{ 
              maxHeight: "75vh",
              overflow: "auto"
            }}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {icon}
                {title}
              </h3>
              <button 
                onClick={handleCardClick}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                <X size={14} />
                Back to cards
              </button>
            </div>
            <div className="input-container">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {isActive && (
        <div 
          className="fixed inset-0 bg-black/50 z-40" 
          onClick={() => setIsActive(false)}
        />
      )}
    </div>
  );
};
