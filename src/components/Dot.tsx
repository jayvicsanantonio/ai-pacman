import React from 'react';

interface DotProps {
  x: number;
  y: number;
  isCollected?: boolean;
  onCollect?: (x: number, y: number) => void;
}

export const Dot: React.FC<DotProps> = ({
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
      aria-label={`Dot at position ${x}, ${y}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onCollect?.(x, y);
        }
      }}
    >
      <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 bg-yellow-400 rounded-full shadow-sm shadow-yellow-400 animate-pulse transition-all duration-200 hover:scale-125 hover:shadow-md hover:shadow-yellow-400" />
    </div>
  );
};
