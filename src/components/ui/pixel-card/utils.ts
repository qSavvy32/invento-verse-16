
export const VARIANTS = {
  default: {
    gap: 12,
    speed: 30,
    colors: "#121212,#292929,#3a3a3a",
    noFocus: false,
  },
  blue: {
    gap: 14,
    speed: 30,
    colors: "#4361ee,#3a0ca3,#4895ef",
    noFocus: false,
  },
  pink: {
    gap: 14,
    speed: 25,
    colors: "#f72585,#7209b7,#d00000",
    noFocus: false,
  },
  yellow: {
    gap: 16,
    speed: 35,
    colors: "#ff9e00,#ff6d00,#ff7b00",
    noFocus: false,
  },
  green: {
    gap: 14,
    speed: 35,
    colors: "#2d6a4f,#52b788,#40916c",
    noFocus: false,
  },
  purple: {
    gap: 14,
    speed: 30,
    colors: "#7209b7,#4c1d95,#5a189a",
    noFocus: false,
  },
  rainbow: {
    gap: 14,
    speed: 35,
    colors: "#f72585,#3a0ca3,#4cc9f0,#52b788,#ff7b00",
    noFocus: false,
  },
  red: {
    gap: 14,
    speed: 30,
    colors: "#e63946,#d00000,#9d0208",
    noFocus: false,
  }
};

// Function to calculate effective speed based on reduced motion preference
export const getEffectiveSpeed = (speed: number, reducedMotion: boolean): number => {
  if (reducedMotion) {
    return Math.min(speed * 0.5, 10);
  }
  return speed;
};
