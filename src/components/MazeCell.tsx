import React from 'react';
import { CellType, type MazeCell as MazeCellType } from '../types';
import { Dot } from './Dot';
import { PowerPellet } from './PowerPellet';

interface MazeCellProps extends MazeCellType {
  onClick?: () => void;
  onDotCollect?: (x: number, y: number) => void;
  onPowerPelletCollect?: (x: number, y: number) => void;
}

export const MazeCell: React.FC<MazeCellProps> = ({
  type,
  x,
  y,
  isCollected = false,
  onClick,
  onDotCollect,
  onPowerPelletCollect,
}) => {
  const getCellClasses = () => {
    const baseClasses =
      'w-6 h-6 sm:w-8 sm:h-8 relative transition-all duration-200';

    switch (type) {
      case CellType.WALL:
        return `${baseClasses} bg-gradient-to-br from-blue-700 to-blue-900 border border-blue-400/40 rounded-sm shadow-[inset_0_0_8px_rgba(0,0,0,0.7)]`;
      case CellType.PATH:
        return `${baseClasses} bg-black/90`;
      case CellType.DOT:
        return `${baseClasses} bg-black/90 flex items-center justify-center`;
      case CellType.POWER_PELLET:
        return `${baseClasses} bg-black/90 flex items-center justify-center`;
      case CellType.GHOST_HOUSE:
        return `${baseClasses} bg-gray-800/90 border border-gray-600/50`;
      default:
        return `${baseClasses} bg-black/90`;
    }
  };

  const renderCellContent = () => {
    switch (type) {
      case CellType.DOT:
        return (
          <Dot x={x} y={y} isCollected={isCollected} onCollect={onDotCollect} />
        );
      case CellType.POWER_PELLET:
        return (
          <PowerPellet
            x={x}
            y={y}
            isCollected={isCollected}
            onCollect={onPowerPelletCollect}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={getCellClasses()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={`Cell at ${x}, ${y}`}
    >
      {renderCellContent()}
    </div>
  );
};
