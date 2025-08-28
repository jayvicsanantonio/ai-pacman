import React from 'react';

interface PowerPelletProps {
  x: number;
  y: number;
  isCollected?: boolean;
  onCollect?: (x: number, y: number) => void;
}

export const PowerPellet: React.FC<PowerPelletProps> = ({
  x,
  y,
  isCollected = false,
  onCollect,
}) => {
  if (isCollected) return null;

  return (
    <div
      className="z-50 absolute inset-0 flex items-center justify-center cursor-pointer"
      onClick={() => onCollect?.(x, y)}
      role="button"
      tabIndex={0}
      aria-label={`Power pellet at position ${x}, ${y}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCollect?.(x, y);
        }
      }}
    >
      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-pacman-yellow rounded-full animate-glowPulse shadow-neonYellow transition-all duration-300 hover:scale-110 hover:shadow-neonYellow glow-effect relative">
        <div className="absolute inset-0 rounded-full animate-ping-fast opacity-60" style={{ background: 'radial-gradient(circle, rgba(247,213,29,0.7), transparent 70%)' }} />
      </div>
    </div>
  );
};
