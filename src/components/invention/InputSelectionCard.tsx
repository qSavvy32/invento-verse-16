
import React, { useState } from "react";
import PixelCard from "../ui/PixelCard";
import { motion, AnimatePresence } from "framer-motion";

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

  const handleCardClick = () => {
    setIsActive(!isActive);
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {!isActive ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            className="bg-background border rounded-lg p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                {icon}
                {title}
              </h3>
              <button 
                onClick={handleCardClick}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
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
