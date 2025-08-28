import React from 'react';
import type { GhostColor, Direction } from '../types/index';

interface SmoothGhostProps {
  id: string;
  x: number; // Visual position (can be fractional)
  y: number; // Visual position (can be fractional)
  direction: Direction;
  color: GhostColor;
  isVulnerable: boolean;
  isFlashing: boolean;
  isAnimating?: boolean;
}

export const SmoothGhost: React.FC<SmoothGhostProps> = ({
  id,
  x,
  y,
  direction,
  color,
  isVulnerable,
  isFlashing,
  isAnimating = false,
}) => {
  // Color variants for different ghost types
  const ghostColors = {
    red: 'bg-red-500',
    pink: 'bg-pink-500',
    blue: 'bg-blue-500',
    orange: 'bg-orange-500',
  };

  // Vulnerable state styling with blue coloring and flashing animation
  const getGhostClasses = () => {
    let baseClasses = `
      w-full h-full rounded-t-full shadow-lg transition-all duration-150 ease-in-out
    `;

    if (isVulnerable) {
      if (isFlashing) {
        baseClasses += ' bg-blue-500 animate-pulse shadow-blue-400';
      } else {
        baseClasses += ' bg-blue-600 shadow-blue-500';
      }
    } else {
      baseClasses += ` ${ghostColors[color]}`;

      switch (color) {
        case 'red':
          baseClasses += ' shadow-red-400';
          break;
        case 'pink':
          baseClasses += ' shadow-pink-400';
          break;
        case 'blue':
          baseClasses += ' shadow-blue-400';
          break;
        case 'orange':
          baseClasses += ' shadow-orange-400';
          break;
      }
    }

    // Add glow effect when animating
    if (isAnimating && !isVulnerable) {
      baseClasses += ` shadow-lg`;
      switch (color) {
        case 'red':
          baseClasses += ' shadow-red-500/50';
          break;
        case 'pink':
          baseClasses += ' shadow-pink-500/50';
          break;
        case 'blue':
          baseClasses += ' shadow-blue-500/50';
          break;
        case 'orange':
          baseClasses += ' shadow-orange-500/50';
          break;
      }
    }

    return baseClasses;
  };

  // Direction-based transformation (more pronounced for smooth movement)
  const getDirectionTransform = (direction: Direction): string => {
    const scale = isAnimating ? 1.05 : 1.0;
    const baseTransform = `scale(${scale})`;

    switch (direction) {
      case 'left':
        return `${baseTransform} scaleX(-1)`;
      case 'right':
        return `${baseTransform} scaleX(1)`;
      case 'up':
        return `${baseTransform} translateY(-1px)`;
      case 'down':
        return `${baseTransform} translateY(1px)`;
      default:
        return baseTransform;
    }
  };

  // Grid positioning system
  const gap = 2;
  const containerPaddingSmall = 4;
  const containerPaddingLarge = 8;

  // Calculate center position within each cell
  const getCellCenter = (
    coord: number,
    cellSize: number,
    containerPadding: number
  ) => {
    return containerPadding + coord * (cellSize + gap) + cellSize / 2;
  };

  return (
    <>
      {/* Small screens version */}
      <div
        className="absolute sm:hidden z-10 pointer-events-none"
        style={{
          left: `${getCellCenter(x, 24, containerPaddingSmall) - 8}px`,
          top: `${getCellCenter(y, 24, containerPaddingSmall) - 8}px`,
          width: '16px',
          height: '16px',
          // Remove CSS transitions to rely on smooth positioning
          transition: 'none',
        }}
        data-ghost-id={id}
        data-testid={`ghost-${id}`}
      >
        <div 
          className={getGhostClasses()}
          style={{
            transform: getDirectionTransform(direction),
          }}
        >
          {/* Ghost eyes */}
          <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full"></div>
          <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full"></div>

          {/* Ghost bottom wavy edge */}
          <div className="absolute bottom-0 left-0 w-full h-1 flex">
            <div className="flex-1 bg-current rounded-bl-full"></div>
            <div className="flex-1 bg-current rounded-br-full"></div>
          </div>

          {/* Vulnerable state indicator */}
          {isVulnerable && (
            <>
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-blue-300 rounded-t-full opacity-30 animate-ping"></div>

              {/* Flashing overlay when about to end */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white rounded-t-full opacity-60 animate-pulse"></div>
              )}

              {/* Scared face expression */}
              <div className="absolute top-1 left-1 w-1 h-1 bg-white rounded-full animate-bounce"></div>
              <div className="absolute top-1 right-1 w-1 h-1 bg-white rounded-full animate-bounce"></div>

              {/* Scared mouth */}
              <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            </>
          )}

          {/* Movement trail effect */}
          {isAnimating && !isVulnerable && (
            <>
              <div 
                className="absolute inset-0 rounded-t-full opacity-20"
                style={{
                  backgroundColor: `var(--ghost-${color}-light, rgba(156, 163, 175, 0.3))`,
                  transform: 'scale(1.2)',
                  animation: 'pulse 0.4s ease-out',
                }}
              />
              <div 
                className="absolute inset-0 rounded-t-full opacity-10"
                style={{
                  backgroundColor: `var(--ghost-${color}-light, rgba(156, 163, 175, 0.2))`,
                  transform: 'scale(1.4)',
                  animation: 'pulse 0.8s ease-out',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* Large screens version */}
      <div
        className="absolute hidden sm:block z-10 pointer-events-none"
        style={{
          left: `${getCellCenter(x, 32, containerPaddingLarge) - 11}px`,
          top: `${getCellCenter(y, 32, containerPaddingLarge) - 11}px`,
          width: '22px',
          height: '22px',
          // Remove CSS transitions to rely on smooth positioning
          transition: 'none',
        }}
        data-ghost-id={id}
        data-testid={`ghost-${id}-lg`}
      >
        <div 
          className={getGhostClasses()}
          style={{
            transform: getDirectionTransform(direction),
          }}
        >
          {/* Ghost eyes */}
          <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full"></div>
          <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full"></div>

          {/* Ghost bottom wavy edge */}
          <div className="absolute bottom-0 left-0 w-full h-2 flex">
            <div className="flex-1 bg-current rounded-bl-full"></div>
            <div className="flex-1 bg-current rounded-br-full"></div>
          </div>

          {/* Vulnerable state indicator */}
          {isVulnerable && (
            <>
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-blue-300 rounded-t-full opacity-30 animate-ping"></div>

              {/* Flashing overlay when about to end */}
              {isFlashing && (
                <div className="absolute inset-0 bg-white rounded-t-full opacity-60 animate-pulse"></div>
              )}

              {/* Scared face expression */}
              <div className="absolute top-1 left-1 w-2 h-2 bg-white rounded-full animate-bounce"></div>
              <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full animate-bounce"></div>

              {/* Scared mouth */}
              <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-white rounded-full"></div>
            </>
          )}

          {/* Movement trail effect */}
          {isAnimating && !isVulnerable && (
            <>
              <div 
                className="absolute inset-0 rounded-t-full opacity-20"
                style={{
                  backgroundColor: `var(--ghost-${color}-light, rgba(156, 163, 175, 0.3))`,
                  transform: 'scale(1.2)',
                  animation: 'pulse 0.4s ease-out',
                }}
              />
              <div 
                className="absolute inset-0 rounded-t-full opacity-10"
                style={{
                  backgroundColor: `var(--ghost-${color}-light, rgba(156, 163, 175, 0.2))`,
                  transform: 'scale(1.4)',
                  animation: 'pulse 0.8s ease-out',
                }}
              />
            </>
          )}
        </div>
      </div>

      {/* CSS Variables and custom animations */}
      <style>{`
        :root {
          --ghost-red-light: rgba(239, 68, 68, 0.4);
          --ghost-pink-light: rgba(236, 72, 153, 0.4);
          --ghost-blue-light: rgba(59, 130, 246, 0.4);
          --ghost-orange-light: rgba(249, 115, 22, 0.4);
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
