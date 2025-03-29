
import { useRef, useEffect } from 'react';
import { Pixel } from './Pixel';
import { getEffectiveSpeed } from './utils';

export function usePixelAnimation(
  containerRef: React.RefObject<HTMLDivElement>,
  canvasRef: React.RefObject<HTMLCanvasElement>,
  finalGap: number,
  finalSpeed: number,
  finalColors: string,
  finalNoFocus: boolean
) {
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number | null>(null);
  const timePreviousRef = useRef(performance.now());
  const renderedSize = useRef<{width: number, height: number} | null>(null);
  const reducedMotion = useRef(
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ).current;

  const initPixels = () => {
    if (!containerRef.current || !canvasRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);
    
    // Prevent re-initializing if dimensions haven't changed
    if (renderedSize.current?.width === width && renderedSize.current?.height === height) {
      return;
    }
    
    renderedSize.current = { width, height };
    
    const ctx = canvasRef.current.getContext("2d");
    
    if (!ctx) return;

    canvasRef.current.width = width;
    canvasRef.current.height = height;
    canvasRef.current.style.width = `${width}px`;
    canvasRef.current.style.height = `${height}px`;

    const colorsArray = finalColors.split(",");
    const pxs: Pixel[] = [];
    
    // Limit the number of pixels based on dimensions to prevent performance issues
    const gap = Math.max(parseInt(finalGap.toString(), 10), 5);
    
    for (let x = 0; x < width; x += gap) {
      for (let y = 0; y < height; y += gap) {
        const color =
          colorsArray[Math.floor(Math.random() * colorsArray.length)];

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
    const timeInterval = 1000 / 60; // ~60 FPS

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
      cancelAnimationFrame(animationRef.current as number);
    }
  };

  const handleAnimation = (name: 'appear' | 'disappear') => {
    if (animationRef.current !== null) {
      cancelAnimationFrame(animationRef.current);
    }
    animationRef.current = requestAnimationFrame(() => doAnimate(name));
  };

  useEffect(() => {
    // Ensure we're not re-initializing unnecessarily
    initPixels();
    
    const observer = new ResizeObserver(() => {
      // Only re-initialize if the container exists
      if (containerRef.current) {
        initPixels();
      }
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      observer.disconnect();
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [finalGap, finalSpeed, finalColors, finalNoFocus]);

  return {
    handleAnimation
  };
}
