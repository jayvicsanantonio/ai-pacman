import React, { useEffect, useState } from 'react';
import type { Direction } from '../types';

interface SmoothPacmanProps {
  x: number; // Visual position (can be fractional)
  y: number; // Visual position (can be fractional)
  direction: Direction;
  isMoving?: boolean;
  isEating?: boolean;
  isAnimating?: boolean;
}

export const SmoothPacman: React.FC<SmoothPacmanProps> = ({
  x,
  y,
  direction,
  isMoving = false,
  isEating = false,
  isAnimating = false,
}) => {
  const [mouthOpen, setMouthOpen] = useState(false);

  // Animate mouth opening/closing when moving or eating
  useEffect(() => {
    if (isMoving || isEating || isAnimating) {
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 150); // Faster animation for smoother movement

      return () => clearInterval(interval);
    } else {
      setMouthOpen(false);
    }
  }, [isMoving, isEating, isAnimating]);

  // Direction rotation angles
  const getRotationAngle = (direction: Direction): number => {
    switch (direction) {
      case 'right':
        return 0;
      case 'down':
        return 90;
      case 'left':
        return 180;
      case 'up':
        return 270;
      default:
        return 0;
    }
  };

  // Grid cell dimensions
  const cellSizeSmall = 24;
  const cellSizeLarge = 32;
  const gap = 2;
  const containerPaddingSmall = 4;
  const containerPaddingLarge = 8;

  // Calculate center position within each cell, accounting for container padding
  const getCellCenter = (
    coord: number,
    cellSize: number,
    containerPadding: number
  ) => {
    return containerPadding + coord * (cellSize + gap) + cellSize / 2;
  };

  // Pacman size
  const pacmanSizeSmall = 16;
  const pacmanSizeLarge = 22;

  // Enhanced visual effects for smooth movement
  const movementIntensity = isAnimating ? 1.2 : isMoving ? 1.0 : 0.5;

  return (
    <>
      {/* Small screens version */}
      <div
        className="absolute sm:hidden z-30 pointer-events-none"
        style={{
          left: `${getCellCenter(x, cellSizeSmall, containerPaddingSmall) - pacmanSizeSmall / 2}px`,
          top: `${getCellCenter(y, cellSizeSmall, containerPaddingSmall) - pacmanSizeSmall / 2}px`,
          width: `${pacmanSizeSmall}px`,
          height: `${pacmanSizeSmall}px`,
          // Remove CSS transitions to rely on smooth positioning
          transition: 'none',
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `rotate(${getRotationAngle(direction)}deg) scale(${movementIntensity})`,
          }}
        >
          {/* Main Pacman body */}
          <div
            className="w-full h-full relative transition-all duration-150 ease-in-out"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #fef08a, #facc15, #eab308)',
              borderRadius: '50%',
              boxShadow: `0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)${
                isAnimating ? ', 0 0 8px rgba(234, 179, 8, 0.6)' : ''
              }`,
            }}
          >
            {/* Mouth opening */}
            {mouthOpen && (
              <div
                className="absolute z-10"
                style={{
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: `${pacmanSizeSmall / 4}px ${pacmanSizeSmall / 3}px ${pacmanSizeSmall / 4}px 0`,
                  borderColor: 'transparent black transparent transparent',
                  right: '0px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}

            {/* Movement glow effect */}
            {(isMoving || isAnimating) && (
              <div
                className="absolute inset-0 bg-yellow-300 rounded-full opacity-30"
                style={{
                  animation: `ping ${isAnimating ? '0.8s' : '1.2s'} cubic-bezier(0, 0, 0.2, 1) infinite`,
                }}
              />
            )}

            {/* Eating effect */}
            {isEating && (
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-50" />
            )}

            {/* Speed trail effect for smooth movement */}
            {isAnimating && (
              <>
                <div 
                  className="absolute inset-0 bg-yellow-400 rounded-full opacity-20"
                  style={{
                    transform: 'scale(1.3)',
                    animation: 'pulse 0.3s ease-out',
                  }}
                />
                <div 
                  className="absolute inset-0 bg-yellow-500 rounded-full opacity-10"
                  style={{
                    transform: 'scale(1.6)',
                    animation: 'pulse 0.6s ease-out',
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Large screens version */}
      <div
        className="absolute hidden sm:block z-30 pointer-events-none"
        style={{
          left: `${getCellCenter(x, cellSizeLarge, containerPaddingLarge) - pacmanSizeLarge / 2}px`,
          top: `${getCellCenter(y, cellSizeLarge, containerPaddingLarge) - pacmanSizeLarge / 2}px`,
          width: `${pacmanSizeLarge}px`,
          height: `${pacmanSizeLarge}px`,
          // Remove CSS transitions to rely on smooth positioning
          transition: 'none',
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `rotate(${getRotationAngle(direction)}deg) scale(${movementIntensity})`,
          }}
        >
          {/* Main Pacman body */}
          <div
            className="w-full h-full relative transition-all duration-150 ease-in-out"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #fef08a, #facc15, #eab308)',
              borderRadius: '50%',
              boxShadow: `0 3px 6px rgba(0,0,0,0.4), inset 0 2px 4px rgba(255,255,255,0.3)${
                isAnimating ? ', 0 0 12px rgba(234, 179, 8, 0.6)' : ''
              }`,
            }}
          >
            {/* Mouth opening */}
            {mouthOpen && (
              <div
                className="absolute z-10"
                style={{
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: `${pacmanSizeLarge / 3}px ${pacmanSizeLarge / 2}px ${pacmanSizeLarge / 3}px 0`,
                  borderColor: 'transparent black transparent transparent',
                  right: '0px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}

            {/* Movement glow effect */}
            {(isMoving || isAnimating) && (
              <div
                className="absolute inset-0 bg-yellow-300 rounded-full opacity-30"
                style={{
                  animation: `ping ${isAnimating ? '0.8s' : '1.2s'} cubic-bezier(0, 0, 0.2, 1) infinite`,
                }}
              />
            )}

            {/* Eating effect */}
            {isEating && (
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-50" />
            )}

            {/* Speed trail effect for smooth movement */}
            {isAnimating && (
              <>
                <div 
                  className="absolute inset-0 bg-yellow-400 rounded-full opacity-20"
                  style={{
                    transform: 'scale(1.3)',
                    animation: 'pulse 0.3s ease-out',
                  }}
                />
                <div 
                  className="absolute inset-0 bg-yellow-500 rounded-full opacity-10"
                  style={{
                    transform: 'scale(1.6)',
                    animation: 'pulse 0.6s ease-out',
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Custom keyframes for smooth animations */}
      <style jsx>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </>
  );
};
