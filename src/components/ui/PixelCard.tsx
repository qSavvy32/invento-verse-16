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
  disabled?: boolean;
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
  disabled = false
}: PixelCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const variantCfg = VARIANTS[variant] || VARIANTS.default;
  const finalGap = gap ?? variantCfg.gap;
  const finalSpeed = speed ?? variantCfg.speed;
  const finalColors = colors ?? variantCfg.colors;
  const finalNoFocus = noFocus ?? variantCfg.noFocus;
  const {
    handleAnimation
  } = usePixelAnimation(containerRef, canvasRef, finalGap, finalSpeed, finalColors, finalNoFocus);
  const onMouseEnter = () => !disabled && handleAnimation("appear");
  const onMouseLeave = () => !disabled && handleAnimation("disappear");
  const onFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (disabled || e.currentTarget.contains(e.relatedTarget as Node)) return;
    handleAnimation("appear");
  };
  const onBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (disabled || e.currentTarget.contains(e.relatedTarget as Node)) return;
    handleAnimation("disappear");
  };
  return <div ref={containerRef} className={`pixel-card ${active ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onFocus={finalNoFocus ? undefined : onFocus} onBlur={finalNoFocus ? undefined : onBlur} tabIndex={finalNoFocus || disabled ? -1 : 0} onClick={disabled ? undefined : onClick}>
      <canvas className="pixel-card-canvas" ref={canvasRef} />
      
    </div>;
}