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
      className="absolute inset-0 flex items-center justify-center cursor-pointer"
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
      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400 transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-yellow-400 glow-effect">
        <div className="absolute inset-0 bg-yellow-300 rounded-full animate-ping opacity-75" />
      </div>
    </div>
  );
};
