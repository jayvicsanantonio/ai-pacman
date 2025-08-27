import React from 'react';
import type { Direction } from '../types';

interface PacmanProps {
  x: number;
  y: number;
  direction: Direction;
  isMoving?: boolean;
  isEating?: boolean;
}

export const Pacman: React.FC<PacmanProps> = ({
  x,
  y,
  direction,
  isMoving = false,
  isEating = false,
}) => {
  // Direction rotation classes using TailwindCSS transform utilities
  const directionClasses = {
    up: '-rotate-90',
    down: 'rotate-90',
    left: 'rotate-180',
    right: 'rotate-0',
  };

  return (
    <div
      className={`
        absolute w-6 h-6 bg-yellow-400 rounded-full
        transition-all duration-300 ease-in-out
        ${directionClasses[direction]}
        ${isMoving ? 'animate-pulse' : ''}
        ${isEating ? 'animate-bounce' : ''}
        shadow-lg
      `}
      style={{
        transform: `translate(${x * 24}px, ${y * 24}px)`,
      }}
    >
      {/* Inner animation layers for enhanced visual effects */}
      <div className="w-full h-full relative overflow-hidden rounded-full">
        {/* Core Pacman body with eating animation */}
        <div
          className={`
            absolute inset-0 bg-yellow-400 rounded-full
            transition-transform duration-150
            ${isEating ? 'scale-95' : 'scale-100'}
          `}
        />

        {/* Movement glow effect */}
        {isMoving && (
          <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-50" />
        )}

        {/* Eating mouth animation effect */}
        {isEating && (
          <div className="absolute inset-0 bg-yellow-500 rounded-full animate-pulse opacity-75" />
        )}
      </div>
    </div>
  );
};
