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

  // Animate mouth opening/closing when moving
  useEffect(() => {
    if (isMoving || isEating) {
      const interval = setInterval(() => {
        setMouthOpen((prev) => !prev);
      }, 150);

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

  // Position calculation accounting for grid gap (16px cell + 2px gap on small, 24px cell + 2px gap on large)
  const gridUnitSmall = 18; // 16px + 2px gap
  const gridUnitLarge = 26; // 24px + 2px gap

  return (
    <>
      {/* Small screens version */}
      <div
        className="absolute sm:hidden transition-all duration-100 ease-linear z-20 pointer-events-none"
        style={{
          transform: `translate(${x * gridUnitSmall + 1}px, ${y * gridUnitSmall + 1}px)`,
          width: '14px',
          height: '14px',
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `rotate(${getRotationAngle(direction)}deg)`,
          }}
        >
          {/* Main Pacman body */}
          <div
            className="w-full h-full relative transition-all duration-150 ease-in-out"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #fef08a, #facc15, #eab308)',
              borderRadius: '50%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Mouth opening - black circle overlay to create mouth effect */}
            {mouthOpen && (
              <div
                className="absolute bg-black rounded-full"
                style={{
                  width: '10px',
                  height: '10px',
                  right: '-2px',
                  top: '2px',
                }}
              />
            )}

            {/* Eye */}
            <div
              className="absolute bg-black rounded-full"
              style={{
                width: '2px',
                height: '2px',
                top: '3px',
                left: '5px',
              }}
            />

            {/* Highlight for 3D effect */}
            <div
              className="absolute bg-yellow-200 rounded-full opacity-60"
              style={{
                width: '3px',
                height: '3px',
                top: '2px',
                left: '3px',
              }}
            />

            {/* Movement glow effect */}
            {isMoving && (
              <div
                className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-25"
                style={{ animationDuration: '0.6s' }}
              />
            )}

            {/* Eating effect */}
            {isEating && (
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-30" />
            )}
          </div>
        </div>
      </div>

      {/* Large screens version */}
      <div
        className="absolute hidden sm:block transition-all duration-100 ease-linear z-20 pointer-events-none"
        style={{
          transform: `translate(${x * gridUnitLarge + 1}px, ${y * gridUnitLarge + 1}px)`,
          width: '22px',
          height: '22px',
        }}
      >
        <div
          className="relative w-full h-full transition-transform duration-100 ease-out"
          style={{
            transform: `rotate(${getRotationAngle(direction)}deg)`,
          }}
        >
          {/* Main Pacman body */}
          <div
            className="w-full h-full relative transition-all duration-150 ease-in-out"
            style={{
              background:
                'radial-gradient(circle at 35% 35%, #fef08a, #facc15, #eab308)',
              borderRadius: '50%',
              boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
              overflow: 'hidden',
            }}
          >
            {/* Mouth opening - black circle overlay to create mouth effect */}
            {mouthOpen && (
              <div
                className="absolute bg-black rounded-full"
                style={{
                  width: '16px',
                  height: '16px',
                  right: '-3px',
                  top: '3px',
                }}
              />
            )}

            {/* Eye */}
            <div
              className="absolute bg-black rounded-full"
              style={{
                width: '3px',
                height: '3px',
                top: '5px',
                left: '8px',
              }}
            />

            {/* Highlight for 3D effect */}
            <div
              className="absolute bg-yellow-200 rounded-full opacity-60"
              style={{
                width: '4px',
                height: '4px',
                top: '3px',
                left: '4px',
              }}
            />

            {/* Movement glow effect */}
            {isMoving && (
              <div
                className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-25"
                style={{ animationDuration: '0.6s' }}
              />
            )}

            {/* Eating effect */}
            {isEating && (
              <div className="absolute inset-0 bg-yellow-100 rounded-full animate-pulse opacity-30" />
            )}
          </div>

          {/* Eating particles for large screens */}
          {isEating && mouthOpen && (
            <div
              className="absolute animate-bounce"
              style={{
                right: '-2px',
                top: '9px',
              }}
            >
              <div className="w-1 h-1 bg-white rounded-full opacity-75" />
            </div>
          )}
        </div>
      </div>
    </>
  );
};
