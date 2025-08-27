import React from 'react';
import type { GhostState } from '../types/index';

interface GhostProps extends GhostState {
  cellSize?: number;
}

export const Ghost: React.FC<GhostProps> = ({
  id,
  x,
  y,
  direction,
  color,
  isVulnerable,
  isFlashing,
  cellSize = 24,
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
      absolute w-6 h-6 transition-all duration-300 ease-in-out
      rounded-t-full
    `;

    if (isVulnerable) {
      if (isFlashing) {
        // Flashing animation when vulnerability is about to end
        baseClasses += ' bg-blue-400 animate-pulse';
      } else {
        // Solid blue when vulnerable
        baseClasses += ' bg-blue-600';
      }
    } else {
      // Normal ghost color
      baseClasses += ` ${ghostColors[color]}`;
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

  return (
    <div
      className={`${getGhostClasses()} ${directionClasses[direction]}`}
      style={{
        transform: `translate(${x * cellSize}px, ${y * cellSize}px)`,
        zIndex: 10,
      }}
      data-ghost-id={id}
      data-testid={`ghost-${id}`}
    >
      {/* Ghost body with rounded top */}
      <div className="w-full h-full relative">
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
          <div className="absolute inset-0 bg-blue-300 rounded-t-full opacity-50 animate-ping"></div>
        )}
      </div>
    </div>
  );
};
