
export function getEffectiveSpeed(value: string | number, reducedMotion: boolean) {
  const min = 0;
  const max = 100;
  const throttle = 0.001;
  const parsed = typeof value === 'string' ? parseInt(value, 10) : value;

  if (parsed <= min || reducedMotion) {
    return min;
  } else if (parsed >= max) {
    return max * throttle;
  } else {
    return parsed * throttle;
  }
}

export const VARIANTS = {
  default: {
    activeColor: null,
    gap: 5,
    speed: 35,
    colors: "#f8fafc,#f1f5f9,#cbd5e1",
    noFocus: false
  },
  blue: {
    activeColor: "#e0f2fe",
    gap: 10,
    speed: 25,
    colors: "#e0f2fe,#7dd3fc,#0ea5e9",
    noFocus: false
  },
  yellow: {
    activeColor: "#fef08a",
    gap: 3,
    speed: 20,
    colors: "#fef08a,#fde047,#eab308",
    noFocus: false
  },
  pink: {
    activeColor: "#fecdd3",
    gap: 6,
    speed: 80,
    colors: "#fecdd3,#fda4af,#e11d48",
    noFocus: true
  },
  green: {
    activeColor: "#dcfce7",
    gap: 5,
    speed: 40,
    colors: "#dcfce7,#86efac,#22c55e",
    noFocus: false
  },
  purple: {
    activeColor: "#ede9fe",
    gap: 7,
    speed: 60,
    colors: "#ede9fe,#c4b5fd,#8b5cf6",
    noFocus: false
  }
};
