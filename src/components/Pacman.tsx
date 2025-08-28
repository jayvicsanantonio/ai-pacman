import React, { useEffect, useState } from 'react';
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
  const [mouthOpen, setMouthOpen] = useState(false);

  // Animate mouth opening/closing when moving or eating
  useEffect(() => {
    if (isMoving || isEating) {
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 200); // Slightly slower for better visual effect

      return () => clearInterval(interval);
    } else {
      setMouthOpen(false);
    }
  }, [isMoving, isEating]);

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

  // Grid cell dimensions (matching MazeCell.tsx)
  // Small: w-6 h-6 (24px) with gap-0.5 (2px) + p-1 (4px padding)
  // Large: w-8 h-8 (32px) with gap-0.5 (2px) + p-2 (8px padding)
  const cellSizeSmall = 24;
  const cellSizeLarge = 32;
  const gap = 2;
  const containerPaddingSmall = 4; // p-1
  const containerPaddingLarge = 8; // p-2

  // Calculate center position within each cell, accounting for container padding
  const getCellCenter = (
    coord: number,
    cellSize: number,
    containerPadding: number
  ) => {
    return containerPadding + coord * (cellSize + gap) + cellSize / 2;
  };

  // Pacman size (smaller than cell to ensure no wall overlap)
  const pacmanSizeSmall = 16;
  const pacmanSizeLarge = 22;

  return (
    <>
      {/* Small screens version */}
      <div
        className="absolute sm:hidden transition-all duration-150 ease-linear z-30 pointer-events-none"
        style={{
          left: `${getCellCenter(x, cellSizeSmall, containerPaddingSmall) - pacmanSizeSmall / 2}px`,
          top: `${getCellCenter(y, cellSizeSmall, containerPaddingSmall) - pacmanSizeSmall / 2}px`,
          width: `${pacmanSizeSmall}px`,
          height: `${pacmanSizeSmall}px`,
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-150 ease-out"
          style={{
            transform: `rotate(${getRotationAngle(direction)}deg)`,
          }}
        >
          {/* Main Pacman body */}
          <div
            className="w-full h-full relative transition-all duration-200 ease-in-out"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #fef08a, #facc15, #eab308)',
              borderRadius: '50%',
              boxShadow:
                '0 1px 2px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3)',
            }}
          >
            {/* Mouth opening */}
            {mouthOpen && (
              <div
                className="absolute"
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

            {/* Eye */}
            <div
              className="absolute bg-black rounded-full"
              style={{
                width: '4px',
                height: '4px',
                top: '30%',
                left: '45%',
              }}
            />

            {/* Highlight for 3D effect */}
            <div
              className="absolute bg-yellow-200 rounded-full opacity-70"
              style={{
                width: '3px',
                height: '3px',
                top: '25%',
                left: '35%',
              }}
            />

            {/* Movement glow effect */}
            {isMoving && (
              <div
                className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-30"
                style={{ animationDuration: '1s' }}
              />
            )}

            {/* Eating effect */}
            {isEating && (
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-40" />
            )}
          </div>
        </div>
      </div>

      {/* Large screens version */}
      <div
        className="absolute hidden sm:block transition-all duration-150 ease-linear z-30 pointer-events-none"
        style={{
          left: `${getCellCenter(x, cellSizeLarge, containerPaddingLarge) - pacmanSizeLarge / 2}px`,
          top: `${getCellCenter(y, cellSizeLarge, containerPaddingLarge) - pacmanSizeLarge / 2}px`,
          width: `${pacmanSizeLarge}px`,
          height: `${pacmanSizeLarge}px`,
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-150 ease-out"
          style={{
            transform: `rotate(${getRotationAngle(direction)}deg)`,
          }}
        >
          {/* Main Pacman body */}
          <div
            className="w-full h-full relative transition-all duration-200 ease-in-out"
            style={{
              background:
                'radial-gradient(circle at 30% 30%, #fef08a, #facc15, #eab308)',
              borderRadius: '50%',
              boxShadow:
                '0 2px 4px rgba(0,0,0,0.4), inset 0 1px 2px rgba(255,255,255,0.3)',
            }}
          >
            {/* Mouth opening */}
            {mouthOpen && (
              <div
                className="absolute"
                style={{
                  width: 0,
                  height: 0,
                  borderStyle: 'solid',
                  borderWidth: `${pacmanSizeLarge / 4}px ${pacmanSizeLarge / 3}px ${pacmanSizeLarge / 4}px 0`,
                  borderColor: 'transparent black transparent transparent',
                  right: '0px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                }}
              />
            )}

            {/* Eye */}
            <div
              className="absolute bg-black rounded-full"
              style={{
                width: '4px',
                height: '4px',
                top: '30%',
                left: '45%',
              }}
            />

            {/* Highlight for 3D effect */}
            <div
              className="absolute bg-yellow-200 rounded-full opacity-70"
              style={{
                width: '5px',
                height: '5px',
                top: '25%',
                left: '35%',
              }}
            />

            {/* Movement glow effect */}
            {isMoving && (
              <div
                className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-30"
                style={{ animationDuration: '1s' }}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
