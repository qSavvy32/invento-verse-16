import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Palette, Cog, BarChart, Wrench } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ExpertFeedback } from "./ExpertFeedbackCard";
import StarBorder from "@/components/ui/StarBorder";

interface ExpertBoxesProps {
  feedback: ExpertFeedback | null;
}

// Define expert data
const experts = [
  {
    id: "design",
    title: "Design Expert",
    icon: Palette,
    description: "Specializes in aesthetics, user experience, and visual appeal of inventions.",
    longDescription: "As a Design Expert, I analyze the visual and interactive elements of your invention. I focus on aesthetics, user experience, ergonomics, and how form meets function. My goal is to help you create an invention that's not just functional, but beautiful and intuitive to use.",
    color: "text-purple-600",
    starColor: "#9333ea",
    bgColor: "bg-purple-50",
    borderColor: "border-purple-200",
    shadowColor: "shadow-purple-100",
    avatarBg: "bg-purple-100",
    row: 0,
    col: 0
  },
  {
    id: "functionality",
    title: "Functionality Expert",
    icon: Cog,
    description: "Focuses on how the invention works, its practical use, and operational efficiency.",
    longDescription: "As a Functionality Expert, I evaluate how well your invention performs its intended purpose. I examine operational efficiency, practical usage scenarios, and potential improvements to core functions. My expertise helps ensure your invention works reliably and effectively.",
    color: "text-blue-600",
    starColor: "#2563eb",
    bgColor: "bg-blue-50",
    borderColor: "border-blue-200",
    shadowColor: "shadow-blue-100",
    avatarBg: "bg-blue-100",
    row: 0,
    col: 1
  },
  {
    id: "market",
    title: "Market Analyst",
    icon: BarChart,
    description: "Analyzes market potential, target audience, and competitive landscape.",
    longDescription: "As a Market Analyst, I help you understand your invention's commercial potential. I research target demographics, pricing strategies, competitive products, and market trends. My insights guide you toward building something people will actually buy and use.",
    color: "text-green-600",
    starColor: "#16a34a",
    bgColor: "bg-green-50",
    borderColor: "border-green-200",
    shadowColor: "shadow-green-100",
    avatarBg: "bg-green-100",
    row: 1,
    col: 0
  },
  {
    id: "technical",
    title: "Technical Feasibility Expert",
    icon: Wrench,
    description: "Evaluates the technical viability, manufacturing processes, and material requirements.",
    longDescription: "As a Technical Feasibility Expert, I assess whether your invention can be built with current technology and at a reasonable cost. I analyze engineering constraints, material selections, manufacturing processes, and potential technical challenges that might arise during development.",
    color: "text-amber-600",
    starColor: "#d97706",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    shadowColor: "shadow-amber-100",
    avatarBg: "bg-amber-100",
    row: 1,
    col: 1
  }
];

export const ExpertBoxes: React.FC<ExpertBoxesProps> = ({ feedback }) => {
  const [activeExpert, setActiveExpert] = useState<string | null>(null);
  const [activeRow, setActiveRow] = useState<number | null>(null);
  const [expandedExpert, setExpandedExpert] = useState<string | null>(null);

  const handleExpertClick = (expertId: string) => {
    if (expandedExpert === expertId) {
      setExpandedExpert(null);
    } else {
      setExpandedExpert(expertId);
    }
  };

  const handleHoverStart = (expertId: string, row: number) => {
    setActiveExpert(expertId);
    setActiveRow(row);
  };

  const handleHoverEnd = () => {
    setActiveExpert(null);
    setActiveRow(null);
  };

  return (
    <div className="relative">
      {/* Standalone robot images that won't get clipped by any container */}
      <div className="absolute inset-0 pointer-events-none overflow-visible" style={{ zIndex: 10000 }}>
        {experts.map((expert) => {
          if (expert.id === "design") {
            return (
              <motion.div 
                key="design-robot"
                className="absolute top-[120px] left-0"
                initial={{ x: 0, opacity: 0 }}
                animate={{ 
                  x: activeExpert === "design" ? -60 : 0,
                  opacity: activeExpert === "design" ? 1 : 0,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25 
                  }
                }}
                style={{ zIndex: 99999 }}
              >
                <img 
                  src="/images/Experts/design robot.png?v=21" 
                  alt="Design Expert Robot" 
                  width={130} 
                  height={130}
                  className="object-contain"
                  style={{ filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.2))' }}
                />
              </motion.div>
            );
          }
          if (expert.id === "functionality") {
            return (
              <motion.div 
                key="functionality-robot"
                className="absolute top-[120px] right-0"
                initial={{ x: 0, opacity: 0 }}
                animate={{ 
                  x: activeExpert === "functionality" ? 60 : 0,
                  opacity: activeExpert === "functionality" ? 1 : 0,
                  transition: { 
                    type: "spring", 
                    stiffness: 400, 
                    damping: 25 
                  }
                }}
              >
                <img 
                  src="/images/Experts/functionality robot.png?v=4" 
                  alt="Functionality Expert Robot" 
                  width={130} 
                  height={130}
                  className="object-contain transform scale-x-100"
                  style={{ filter: 'drop-shadow(0 5px 5px rgba(0,0,0,0.2))' }}
                />
              </motion.div>
            );
          }
          return null;
        })}
      </div>

      <Card className="border-0 shadow-none bg-transparent p-0 m-0">
        <CardContent className="p-0 m-0">
          <h3 className="text-md font-medium mb-4">Expert Panel</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {experts.map((expert) => {
              const feedbackQuestions = feedback ? feedback[expert.id as keyof ExpertFeedback] : [];
              const hasQuestions = feedbackQuestions && feedbackQuestions.length > 0;
              const isExpanded = expandedExpert === expert.id;
              const isRowActive = activeRow === expert.row;
              const isActive = activeExpert === expert.id;
              
              return (
                <StarBorder
                  as={motion.div}
                  key={expert.id}
                  className={cn(
                    "w-full h-full",
                    isExpanded ? "sm:col-span-2 row-span-2" : ""
                  )}
                  color={expert.starColor}
                  speed="8s"
                  layoutId={expert.id}
                  whileHover={{ 
                    y: -5,
                    transition: { duration: 0.2 }
                  }}
                  onClick={() => handleExpertClick(expert.id)}
                  onHoverStart={() => handleHoverStart(expert.id, expert.row)}
                  onHoverEnd={handleHoverEnd}
                >
                  <div className={cn(
                    "rounded-lg border-2 p-4 cursor-pointer transition-all relative overflow-visible h-full",
                    expert.borderColor,
                    expert.bgColor,
                    expert.shadowColor,
                    "shadow hover:shadow-md"
                  )}>
                    {/* Expert Avatar Placeholder - For other experts */}
                    {expert.id !== "design" && (
                      <div className="relative">
                        <motion.div 
                          className={cn(
                            "absolute bottom-0 right-0 w-24 h-24 rounded-full opacity-20",
                            isExpanded ? "sm:-right-12 sm:-bottom-12 sm:w-48 sm:h-48" : "-right-8 -bottom-8",
                            expert.avatarBg
                          )}
                          initial={false}
                          animate={{ 
                            scale: isExpanded ? 1.2 : 1,
                            rotate: isExpanded ? 15 : 0,
                            transition: { duration: 0.5 }
                          }}
                        />
                      </div>
                    )}
                    
                    <div className="relative z-10">
                      <div className={cn(
                        "flex items-start gap-3",
                        isExpanded ? "mb-4" : ""
                      )}>
                        <div className={cn(
                          "p-2 rounded-full flex-shrink-0", 
                          expert.bgColor, 
                          "bg-opacity-50",
                          isExpanded ? "p-3" : ""
                        )}>
                          <expert.icon className={cn(
                            "h-5 w-5", 
                            expert.color,
                            isExpanded ? "h-6 w-6" : ""
                          )} />
                        </div>
                        <div>
                          <h4 className={cn(
                            "font-semibold",
                            isExpanded ? "text-lg" : ""
                          )}>{expert.title}</h4>
                          <AnimatePresence mode="wait">
                            {isExpanded ? (
                              <motion.p 
                                key="long-desc"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-muted-foreground mt-1"
                              >
                                {expert.longDescription}
                              </motion.p>
                            ) : (
                              <motion.p 
                                key="short-desc"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-sm text-muted-foreground"
                              >
                                {expert.description}
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                      
                      {/* Feedback Preview - Shown on hover or when expanded */}
                      <AnimatePresence>
                        {hasQuestions && ((activeExpert === expert.id) || isExpanded) && (
                          <motion.div 
                            className={cn(
                              "mt-4 pt-3 border-t border-dashed",
                              expert.borderColor
                            )}
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <h5 className="text-sm font-medium mb-2">Expert Insights:</h5>
                            <ul className="list-disc pl-5 space-y-1">
                              {feedbackQuestions.slice(0, isExpanded ? 10 : 2).map((question, idx) => (
                                <li key={idx} className={isExpanded ? "text-sm" : "text-xs"}>
                                  {question}
                                </li>
                              ))}
                              {!isExpanded && feedbackQuestions.length > 2 && (
                                <li className="text-xs italic">
                                  {feedbackQuestions.length - 2} more insights...
                                </li>
                              )}
                            </ul>
                            
                            {isExpanded && (
                              <motion.div
                                className="mt-4 flex justify-end"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                              >
                                <span className="text-xs bg-white/50 px-2 py-1 rounded">
                                  Click to minimize
                                </span>
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </StarBorder>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 