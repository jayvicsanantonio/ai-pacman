import React from 'react';
import type { GhostState } from '../types/index';

interface GhostProps extends GhostState {}

export const Ghost: React.FC<GhostProps> = ({
  id,
  x,
  y,
  direction,
  color,
  isVulnerable,
  isFlashing,
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
      w-full h-full rounded-t-full shadow-lg
    `;

    if (isVulnerable) {
      if (isFlashing) {
        // Flashing animation when vulnerability is about to end
        // Alternates between blue and white rapidly
        baseClasses += ' bg-blue-500 animate-flicker shadow-blue-400';
      } else {
        // Solid blue when vulnerable with glow effect
        baseClasses += ' bg-blue-600 shadow-blue-500';
      }
    } else {
      // Normal ghost color with appropriate shadow
      baseClasses += ` ${ghostColors[color]} drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]`;

      // Add color-specific shadows for normal state
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

    return baseClasses;
  };

  // Direction-based rotation (subtle effect for ghosts)
  const directionClasses = {
    up: 'rotate-0',
    down: 'rotate-0',
    left: 'scale-x-[-1]',
    right: 'scale-x-[1]',
  };

  // Grid positioning system matching Pacman component
  const gap = 2; // gap-0.5 from GameBoard
  const containerPaddingSmall = 4; // p-1 from GameBoard
  const containerPaddingLarge = 8; // p-2 from GameBoard

  // Calculate center position within each cell, accounting for container padding
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
        className={`absolute sm:hidden transition-all duration-200 ease-in-out z-10 pointer-events-none ${directionClasses[direction]} will-change-transform animate-float`}
        style={{
          left: `${getCellCenter(x, 24, containerPaddingSmall) - 8}px`,
          top: `${getCellCenter(y, 24, containerPaddingSmall) - 8}px`,
          width: '16px',
          height: '16px',
        }}
        data-ghost-id={id}
        data-testid={`ghost-${id}`}
      >
        <div className={getGhostClasses()}>
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
        </div>
      </div>

      {/* Large screens version */}
      <div
        className={`absolute hidden sm:block transition-all duration-200 ease-in-out z-10 pointer-events-none ${directionClasses[direction]} will-change-transform animate-float`}
        style={{
          left: `${getCellCenter(x, 32, containerPaddingLarge) - 11}px`,
          top: `${getCellCenter(y, 32, containerPaddingLarge) - 11}px`,
          width: '22px',
          height: '22px',
        }}
        data-ghost-id={id}
        data-testid={`ghost-${id}-lg`}
      >
        <div className={getGhostClasses()}>
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
        </div>
      </div>
    </>
  );
};
