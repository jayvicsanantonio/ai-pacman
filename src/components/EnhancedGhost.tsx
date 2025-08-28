import React, { useEffect, useState, useRef } from 'react';
import type { GhostState } from '../types/index';

interface EnhancedGhostProps extends GhostState {
  isChasing?: boolean;
  isScattering?: boolean;
  isFleeing?: boolean;
  isEaten?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
}

export const EnhancedGhost: React.FC<EnhancedGhostProps> = ({
  id,
  x,
  y,
  direction,
  color,
  isVulnerable,
  isFlashing,
  isChasing = false,
  isScattering = false,
  isFleeing = false,
  isEaten = false,
  speed = 'normal',
}) => {
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x, y });
  const [eyeDirection, setEyeDirection] = useState(direction);
  const [bobOffset, setBobOffset] = useState(0);
  const animationRef = useRef<number>();
  
  // Track position changes for movement animations
  useEffect(() => {
    if (x !== previousPosition.x || y !== previousPosition.y) {
      setIsAnimating(true);
      setPreviousPosition({ x, y });
      
      const timer = setTimeout(() => setIsAnimating(false), 150);
      return () => clearTimeout(timer);
    }
  }, [x, y, previousPosition]);

  // Floating/bobbing animation
  useEffect(() => {
    let startTime = Date.now();
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const bobAmount = Math.sin(elapsed * 0.003) * 2; // Gentle floating
      setBobOffset(bobAmount);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Update eye direction based on movement
  useEffect(() => {
    const timer = setTimeout(() => {
      setEyeDirection(direction);
    }, 100); // Slight delay for natural eye movement
    
    return () => clearTimeout(timer);
  }, [direction]);

  // Color variants with enhanced gradients
  const getGhostColors = () => {
    if (isEaten) {
      return {
        body: 'bg-gradient-to-b from-gray-300 to-gray-500',
        shadow: 'shadow-gray-400',
        glow: 'rgba(156, 163, 175, 0.6)',
      };
    }
    
    if (isVulnerable) {
      return {
        body: isFlashing 
          ? 'bg-gradient-to-b from-blue-400 to-blue-600 animate-pulse' 
          : 'bg-gradient-to-b from-blue-500 to-blue-700',
        shadow: 'shadow-blue-400',
        glow: 'rgba(59, 130, 246, 0.8)',
      };
    }

    switch (color) {
      case 'red':
        return {
          body: 'bg-gradient-to-b from-red-400 to-red-600',
          shadow: 'shadow-red-400',
          glow: 'rgba(239, 68, 68, 0.6)',
        };
      case 'pink':
        return {
          body: 'bg-gradient-to-b from-pink-400 to-pink-600',
          shadow: 'shadow-pink-400',
          glow: 'rgba(236, 72, 153, 0.6)',
        };
      case 'blue':
        return {
          body: 'bg-gradient-to-b from-blue-400 to-blue-600',
          shadow: 'shadow-blue-400',
          glow: 'rgba(59, 130, 246, 0.6)',
        };
      case 'orange':
        return {
          body: 'bg-gradient-to-b from-orange-400 to-orange-600',
          shadow: 'shadow-orange-400',
          glow: 'rgba(249, 115, 22, 0.6)',
        };
      default:
        return {
          body: 'bg-gradient-to-b from-gray-400 to-gray-600',
          shadow: 'shadow-gray-400',
          glow: 'rgba(156, 163, 175, 0.6)',
        };
    }
  };

  // Movement-based classes and effects
  const getMovementEffects = () => {
    let effects = '';
    
    if (isChasing) {
      effects += ' brightness-110 saturate-125';
    } else if (isScattering) {
      effects += ' brightness-90';
    } else if (isFleeing) {
      effects += ' brightness-75 contrast-125';
    }
    
    return effects;
  };

  // Speed-based transition duration
  const getTransitionDuration = () => {
    switch (speed) {
      case 'fast': return 'duration-75';
      case 'slow': return 'duration-200';
      default: return 'duration-100';
    }
  };

  // Direction-based transformations
  const getDirectionTransform = () => {
    const scale = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
    const tilt = isAnimating ? 'rotate(2deg)' : 'rotate(0deg)';
    return `${scale} ${tilt}`;
  };

  // Eye position based on direction
  const getEyePosition = (isLeft: boolean) => {
    const baseLeft = isLeft ? '20%' : '65%';
    const baseTop = '25%';
    
    let offsetX = 0;
    let offsetY = 0;
    
    switch (eyeDirection) {
      case 'left':
        offsetX = -1;
        break;
      case 'right':
        offsetX = 1;
        break;
      case 'up':
        offsetY = -1;
        break;
      case 'down':
        offsetY = 1;
        break;
    }
    
    return {
      left: `calc(${baseLeft} + ${offsetX * 2}px)`,
      top: `calc(${baseTop} + ${offsetY * 2}px)`,
    };
  };

  const colors = getGhostColors();
  const gap = 2;
  const containerPaddingSmall = 4;
  const containerPaddingLarge = 8;

  const getCellCenter = (coord: number, cellSize: number, containerPadding: number) => {
    return containerPadding + coord * (cellSize + gap) + cellSize / 2;
  };

  const GhostBody = ({ size, cellSize, containerPadding }: { size: number; cellSize: number; containerPadding: number }) => (
    <div
      className={`absolute transition-all ${getTransitionDuration()} ease-out z-10 pointer-events-none`}
      style={{
        left: `${getCellCenter(x, cellSize, containerPadding) - size / 2}px`,
        top: `${getCellCenter(y, cellSize, containerPadding) - size / 2 + bobOffset}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
      }}
      data-ghost-id={id}
    >
      <div
        className={`relative w-full h-full transition-transform ${getTransitionDuration()} ease-out`}
        style={{
          transform: getDirectionTransform(),
        }}
      >
        {/* Main ghost body */}
        <div
          className={`w-full h-full relative rounded-t-full shadow-lg transition-all duration-200 ${colors.body} ${colors.shadow}${getMovementEffects()}`}
          style={{
            filter: `drop-shadow(0 0 8px ${colors.glow})`,
          }}
        >
          {/* Ghost wavy bottom */}
          <div className="absolute bottom-0 left-0 w-full" style={{ height: `${size * 0.3}px` }}>
            <svg width="100%" height="100%" viewBox="0 0 22 7" className="fill-current">
              <path d="M0,7 L0,2 Q0,0 2,0 L4,0 Q6,0 6,2 L6,5 Q6,7 8,7 Q10,7 10,5 L10,2 Q10,0 12,0 L14,0 Q16,0 16,2 L16,5 Q16,7 18,7 Q20,7 20,5 L20,2 Q20,0 22,0 L22,7 Z" />
            </svg>
          </div>

          {/* Eyes */}
          <div 
            className="absolute w-3 h-3 bg-white rounded-full transition-all duration-200 ease-out"
            style={getEyePosition(true)}
          >
            <div 
              className="absolute w-1.5 h-1.5 bg-gray-900 rounded-full transition-all duration-100"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>
          
          <div 
            className="absolute w-3 h-3 bg-white rounded-full transition-all duration-200 ease-out"
            style={getEyePosition(false)}
          >
            <div 
              className="absolute w-1.5 h-1.5 bg-gray-900 rounded-full transition-all duration-100"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          </div>

          {/* State-specific effects */}
          {isVulnerable && !isEaten && (
            <>
              {/* Vulnerable glow */}
              <div className="absolute inset-0 bg-blue-300 rounded-t-full opacity-20 animate-ping" />
              
              {/* Scared expression */}
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-2 h-1 bg-white rounded-full" />
              
              {/* Flashing warning */}
              {isFlashing && (
                <div 
                  className="absolute inset-0 bg-white rounded-t-full opacity-60"
                  style={{
                    animation: 'pulse 0.3s ease-in-out infinite alternate',
                  }}
                />
              )}
            </>
          )}

          {/* Movement state indicators */}
          {isChasing && !isVulnerable && (
            <div 
              className="absolute inset-0 rounded-t-full opacity-30"
              style={{
                background: `radial-gradient(circle at 50% 50%, ${colors.glow}, transparent 70%)`,
                animation: 'pulse 1.5s ease-in-out infinite',
              }}
            />
          )}

          {isFleeing && (
            <>
              <div className="absolute inset-0 bg-blue-400 rounded-t-full opacity-40 animate-pulse" />
              <div className="absolute top-2 left-2 w-1 h-1 bg-white rounded-full animate-bounce" />
              <div className="absolute top-2 right-2 w-1 h-1 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
            </>
          )}

          {/* Speed effects */}
          {speed === 'fast' && (
            <>
              <div className="absolute inset-0 bg-current rounded-t-full opacity-20 animate-ping" 
                style={{ animationDuration: '0.5s' }} />
              <div className="absolute -left-1 top-1/2 w-2 h-0.5 bg-current opacity-60 animate-pulse" />
              <div className="absolute -left-2 top-1/3 w-1 h-0.5 bg-current opacity-40 animate-pulse" style={{ animationDelay: '0.1s' }} />
            </>
          )}

          {/* Eaten state */}
          {isEaten && (
            <>
              <div className="absolute inset-0 bg-gray-200 rounded-t-full opacity-80" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="text-xs text-gray-600">💀</div>
              </div>
            </>
          )}
        </div>

        {/* Movement trail for fast ghosts */}
        {speed === 'fast' && isAnimating && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              left: direction === 'left' ? '20%' : direction === 'right' ? '-20%' : '0%',
              top: direction === 'up' ? '20%' : direction === 'down' ? '-20%' : '0%',
              opacity: 0.3,
              transform: 'scale(0.8)',
            }}
          >
            <div className={`w-full h-full rounded-t-full ${colors.body}`} style={{ filter: 'blur(2px)' }} />
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Small screens version */}
      <div className="sm:hidden">
        <GhostBody size={16} cellSize={24} containerPadding={containerPaddingSmall} />
      </div>

      {/* Large screens version */}
      <div className="hidden sm:block">
        <GhostBody size={22} cellSize={32} containerPadding={containerPaddingLarge} />
      </div>
    </>
  );
};

export default EnhancedGhost;
