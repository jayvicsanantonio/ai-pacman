import React, { useEffect, useState, useRef } from 'react';
import type { Direction } from '../types';

interface EnhancedPacmanProps {
  x: number;
  y: number;
  direction: Direction;
  isMoving?: boolean;
  isEating?: boolean;
  isPowerMode?: boolean;
  isInvincible?: boolean;
  speed?: 'slow' | 'normal' | 'fast';
}

export const EnhancedPacman: React.FC<EnhancedPacmanProps> = ({
  x,
  y,
  direction,
  isMoving = false,
  isEating = false,
  isPowerMode = false,
  isInvincible = false,
  speed = 'normal',
}) => {
  const [mouthOpen, setMouthOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [previousPosition, setPreviousPosition] = useState({ x, y });
  const [trailPositions, setTrailPositions] = useState<Array<{ x: number; y: number; opacity: number }>>([]);
  const animationRef = useRef<number>();

  // Track position changes for trail effect
  useEffect(() => {
    if (x !== previousPosition.x || y !== previousPosition.y) {
      setIsAnimating(true);
      
      // Add current position to trail
      setTrailPositions(prev => [
        { x: previousPosition.x, y: previousPosition.y, opacity: 0.8 },
        ...prev.slice(0, 4).map((pos, i) => ({ ...pos, opacity: 0.8 - (i + 1) * 0.2 }))
      ]);
      
      setPreviousPosition({ x, y });
      
      // Reset animation state after movement
      const timer = setTimeout(() => setIsAnimating(false), 200);
      return () => clearTimeout(timer);
    }
  }, [x, y, previousPosition]);

  // Enhanced mouth animation with different speeds and patterns
  useEffect(() => {
    if (isMoving || isEating) {
      const baseInterval = speed === 'fast' ? 120 : speed === 'slow' ? 300 : 180;
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, baseInterval);

      return () => clearInterval(interval);
    } else {
      setMouthOpen(false);
    }
  }, [isMoving, isEating, speed]);

  // Fade out trail positions
  useEffect(() => {
    if (trailPositions.length > 0) {
      const timer = setTimeout(() => {
        setTrailPositions(prev => 
          prev.map(pos => ({ ...pos, opacity: pos.opacity * 0.7 }))
            .filter(pos => pos.opacity > 0.1)
        );
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [trailPositions]);

  // Direction rotation with smooth transitions
  const getRotationAngle = (direction: Direction): number => {
    switch (direction) {
      case 'right': return 0;
      case 'down': return 90;
      case 'left': return 180;
      case 'up': return 270;
      default: return 0;
    }
  };

  // Speed-based transition durations
  const getTransitionDuration = () => {
    switch (speed) {
      case 'fast': return 'duration-75';
      case 'slow': return 'duration-300';
      default: return 'duration-150';
    }
  };

  // Grid positioning calculations
  const getCellCenter = (coord: number, cellSize: number, containerPadding: number) => {
    return containerPadding + coord * (cellSize + 2) + cellSize / 2;
  };

  const PacmanBody = ({ size, cellSize, containerPadding }: { size: number; cellSize: number; containerPadding: number }) => (
    <div
      className={`absolute transition-all ${getTransitionDuration()} ease-out z-30 pointer-events-none`}
      style={{
        left: `${getCellCenter(x, cellSize, containerPadding) - size / 2}px`,
        top: `${getCellCenter(y, cellSize, containerPadding) - size / 2}px`,
        width: `${size}px`,
        height: `${size}px`,
        transform: isAnimating ? 'scale(1.1)' : 'scale(1)',
      }}
    >
      <div
        className={`relative w-full h-full transition-transform ${getTransitionDuration()} ease-out`}
        style={{
          transform: `rotate(${getRotationAngle(direction)}deg)`,
        }}
      >
        {/* Main Pacman body with enhanced gradients */}
        <div
          className={`w-full h-full relative transition-all duration-200 ease-in-out ${
            isInvincible ? 'animate-pulse' : ''
          }`}
          style={{
            background: isPowerMode 
              ? 'radial-gradient(circle at 30% 30%, #fef3c7, #f59e0b, #d97706)' 
              : isInvincible 
              ? 'radial-gradient(circle at 30% 30%, #fef08a, #facc15, #eab308, #ca8a04)'
              : 'radial-gradient(circle at 30% 30%, #fef08a, #facc15, #eab308)',
            borderRadius: '50%',
            boxShadow: isPowerMode
              ? '0 0 15px rgba(245, 158, 11, 0.8), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.4)'
              : isInvincible
              ? '0 0 10px rgba(234, 179, 8, 0.9), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)'
              : '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
            filter: isPowerMode ? 'brightness(1.2) saturate(1.3)' : 'none',
          }}
        >
          {/* Enhanced mouth opening with smooth animation */}
          <div 
            className={`absolute transition-all duration-150 ease-in-out ${
              mouthOpen ? 'opacity-100' : 'opacity-0'
            }`}
            style={{
              width: 0,
              height: 0,
              borderStyle: 'solid',
              borderWidth: `${size * 0.35}px ${size * 0.4}px ${size * 0.35}px 0`,
              borderColor: 'transparent black transparent transparent',
              right: '0px',
              top: '50%',
              transform: `translateY(-50%) ${mouthOpen ? 'scaleX(1)' : 'scaleX(0.3)'}`,
            }}
          />

          {/* Eye with blinking animation */}
          <div 
            className="absolute transition-all duration-100"
            style={{
              width: `${size * 0.15}px`,
              height: `${size * 0.15}px`,
              background: '#1f2937',
              borderRadius: '50%',
              left: `${size * 0.3}px`,
              top: `${size * 0.25}px`,
              transform: mouthOpen ? 'scaleY(0.8)' : 'scaleY(1)',
            }}
          />

          {/* Movement effects */}
          {isMoving && (
            <>
              {/* Speed trail effect */}
              <div 
                className={`absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-20`}
                style={{ 
                  animationDuration: speed === 'fast' ? '0.5s' : speed === 'slow' ? '2s' : '1s' 
                }} 
              />
              
              {/* Movement glow */}
              <div 
                className="absolute inset-0 bg-yellow-400 rounded-full opacity-30"
                style={{
                  animation: 'pulse 1s ease-in-out infinite',
                  animationDelay: '0.1s',
                }}
              />
            </>
          )}

          {/* Eating effect with enhanced visuals */}
          {isEating && (
            <>
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-40" />
              <div 
                className="absolute inset-0 bg-yellow-200 rounded-full"
                style={{
                  animation: 'ping 0.3s ease-out',
                  opacity: 0.6,
                }}
              />
              {/* Eating sparkles */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-200 rounded-full animate-bounce opacity-80" />
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-yellow-300 rounded-full animate-ping opacity-60" />
            </>
          )}

          {/* Power mode aura */}
          {isPowerMode && (
            <div 
              className="absolute inset-0 bg-gradient-to-r from-orange-400 to-yellow-400 rounded-full opacity-20 animate-spin"
              style={{ 
                transform: 'scale(1.5)',
                animationDuration: '3s',
              }}
            />
          )}

          {/* Invincibility flicker */}
          {isInvincible && (
            <div 
              className="absolute inset-0 bg-white rounded-full opacity-40"
              style={{
                animation: 'pulse 0.2s ease-in-out infinite alternate',
              }}
            />
          )}
        </div>
      </div>

      {/* Movement trail effect */}
      {trailPositions.map((pos, index) => (
        <div
          key={`trail-${pos.x}-${pos.y}-${index}`}
          className="absolute w-full h-full pointer-events-none"
          style={{
            left: `${(pos.x - x) * (cellSize + 2)}px`,
            top: `${(pos.y - y) * (cellSize + 2)}px`,
            opacity: pos.opacity,
            transform: `scale(${0.8 - index * 0.1})`,
            transition: 'all 0.1s ease-out',
          }}
        >
          <div 
            className="w-full h-full bg-yellow-300 rounded-full"
            style={{
              filter: 'blur(1px)',
            }}
          />
        </div>
      ))}
    </div>
  );

  return (
    <>
      {/* Small screens version */}
      <div className="sm:hidden">
        <PacmanBody size={16} cellSize={24} containerPadding={4} />
      </div>

      {/* Large screens version */}
      <div className="hidden sm:block">
        <PacmanBody size={22} cellSize={32} containerPadding={8} />
      </div>
    </>
  );
};

export default EnhancedPacman;
