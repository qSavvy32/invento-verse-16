
import { useRef } from "react";
import './PixelCard.css';
import { VARIANTS } from './pixel-card/utils';
import { usePixelAnimation } from './pixel-card/usePixelAnimation';

interface PixelCardProps {
  variant?: keyof typeof VARIANTS;
  gap?: number;
  speed?: number;
  colors?: string;
  noFocus?: boolean;
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;  // Added the disabled property
}

export default function PixelCard({
  variant = "default",
  gap,
  speed,
  colors,
  noFocus,
  className = "",
  children,
  onClick,
  active = false,
  disabled = false  // Added with default value
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;

  const { handleAnimation } = usePixelAnimation(
    containerRef,
    canvasRef,
    finalGap,
    finalSpeed,
    finalColors,
    finalNoFocus
  );

  const onMouseEnter = () => handleAnimation("appear");
  const onMouseLeave = () => handleAnimation("disappear");
  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    handleAnimation("appear");
  };
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    handleAnimation("disappear");
  };

  return (
    <div
      ref={containerRef}
      className={`pixel-card ${active ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      onMouseEnter={disabled ? undefined : onMouseEnter}
      onMouseLeave={disabled ? undefined : onMouseLeave}
      onFocus={finalNoFocus || disabled ? undefined : onFocus}
      onBlur={finalNoFocus || disabled ? undefined : onBlur}
      tabIndex={finalNoFocus || disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
    >
      <canvas
        className="pixel-card-canvas"
        ref={canvasRef}
      />
      <div className="pixel-card-content">
        {children}
      </div>
    </div>
  );
}
