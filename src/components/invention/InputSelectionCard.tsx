
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

  const handleCardClick = () => {
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
    <div className={`${isActive ? 'absolute inset-0 z-50' : 'relative'}`}>
      <AnimatePresence mode="wait">
        {!isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-background border rounded-lg p-6 shadow-lg w-full h-full"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {icon}
                {title}
              </h3>
              <button 
                onClick={handleCardClick}
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
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
    </div>
  );
};
