/**
 * Animation utility file containing reusable Framer Motion animation variants
 */

// Staggered container animation - use for parent elements with child animations
export const staggerContainer = (staggerChildren = 0.1, delayChildren = 0) => ({
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren,
      delayChildren
    }
  }
});

// Fade up animation - good for text elements in a staggered container
export const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  }
};

// Fade in animation - good for images and cards
export const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      duration: 0.6, 
      ease: "easeInOut" 
    }
  }
};

// Scale animation - good for buttons and interactive elements
export const scaleAnimation = {
  hover: { scale: 1.05 },
  tap: { scale: 0.97 },
  initial: { scale: 1 }
};

// Pop in animation - good for elements that appear suddenly
export const popIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// Slide in from left
export const slideInLeft = {
  hidden: { x: -100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  }
};

// Slide in from right
export const slideInRight = {
  hidden: { x: 100, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { 
      duration: 0.5, 
      ease: "easeOut" 
    }
  }
};

// Bounce animation - good for attention-grabbing elements
export const bounce = {
  initial: { y: 0 },
  animate: {
    y: [-10, 0, -6, 0, -2, 0],
    transition: {
      duration: 1,
      ease: "easeInOut",
      times: [0, 0.3, 0.5, 0.7, 0.9, 1]
    }
  }
};

// Card hover effect with shadow
export const cardHover = {
  rest: { y: 0, boxShadow: "0 2px 10px rgba(0,0,0,0.1)" },
  hover: { 
    y: -8, 
    boxShadow: "0 15px 25px rgba(0,0,0,0.1)", 
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 15
    }
  }
};

// Rotation - good for icons
export const rotate = {
  hover: { rotate: 10 },
  tap: { rotate: 25 }
};

// Pulse - good for notifications or highlights
export const pulse = {
  animate: {
    scale: [1, 1.1, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
}; 