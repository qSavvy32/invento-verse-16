
import { useEffect, useRef } from "react";
import { Pixel } from "./Pixel";
import { getEffectiveSpeed } from "./utils";

export const usePixelAnimation = (
  containerRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  finalGap: number,
  finalSpeed: number,
  finalColors: string,
  finalNoFocus: boolean
) => {
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePreviousRef = useRef<number>(performance.now());
  const reducedMotion = useRef<boolean>(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    const ctx = canvasRef.current.getContext("2d");
    
    if (!ctx) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = finalColors.split(",");
    const pxs: Pixel[] = [];
    
    // Use a larger gap for devices with reduced motion or lower performance
    const effectiveGap = reducedMotion ? Math.max(finalGap * 2, 20) : finalGap;
    
    for (let x = 0; x < width; x += effectiveGap) {
      for (let y = 0; y < height; y += effectiveGap) {
        const color = colorsArray[Math.floor(Math.random() * colorsArray.length)];

        const dx = x - width / 2;
        const dy = y - height / 2;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const delay = reducedMotion ? 0 : distance;

        pxs.push(
          new Pixel(
            canvasRef.current,
            ctx,
            x,
            y,
            color,
            getEffectiveSpeed(finalSpeed, reducedMotion),
            delay
          )
        );
      }
    }
    pixelsRef.current = pxs;
  };

  const doAnimate = (fnName: 'appear' | 'disappear') => {
    animationRef.current = requestAnimationFrame(() => doAnimate(fnName));
    const timeNow = performance.now();
    const timePassed = timeNow - timePreviousRef.current;
    const timeInterval = 1000 / (reducedMotion ? 30 : 60); // Reduce FPS for reduced motion

    if (timePassed < timeInterval) return;
    timePreviousRef.current = timeNow - (timePassed % timeInterval);

    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !canvasRef.current) return;

    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    let allIdle = true;
    for (let i = 0; i < pixelsRef.current.length; i++) {
      const pixel = pixelsRef.current[i];
      pixel[fnName]();
      if (!pixel.isIdle) {
        allIdle = false;
      }
    }
    if (allIdle) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  };

  const handleAnimation = (name: 'appear' | 'disappear') => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  useEffect(() => {
    initPixels();
    const observer = new ResizeObserver(() => {
      initPixels();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  return { handleAnimation };
};
