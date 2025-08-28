import React from 'react';
import {
  CellType,
  type GhostState,
  type MazeCell as MazeCellType,
  type PacmanState,
} from '../types';
import { Ghost } from './Ghost';
import { MazeCell } from './MazeCell';
import { Pacman } from './Pacman';

interface GameBoardProps {
  maze: number[][];
  dots: Set<string>;
  powerPellets: Set<string>;
  pacman?: PacmanState;
  ghosts?: GhostState[];
  onCellClick?: (x: number, y: number) => void;
  onDotCollect?: (x: number, y: number) => void;
  onPowerPelletCollect?: (x: number, y: number) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  maze,
  dots,
  powerPellets,
  pacman,
  ghosts,
  onCellClick,
  onDotCollect,
  onPowerPelletCollect,
}) => {
  return (
    <div className="flex items-center justify-center p-2 sm:p-4">
      <div className="relative grid grid-cols-21 grid-rows-21 gap-0.5 p-1 sm:p-2 bg-black border-2 sm:border-4 border-blue-600 rounded-lg shadow-2xl max-w-full overflow-hidden">
        {maze.map((row, y) =>
          row.map((cellType, x) => {
            const cellKey = `${x},${y}`;
            const hasDot = dots.has(cellKey);
            const hasPowerPellet = powerPellets.has(cellKey);

            // Debug power pellets
            if (hasPowerPellet) {
              console.log(`Power pellet found at ${cellKey}`);
            }

            // Determine the actual cell type based on collectibles
            let actualCellType = cellType as CellType;
            if (hasDot && cellType === CellType.PATH) {
              actualCellType = CellType.DOT;
            } else if (hasPowerPellet && cellType === CellType.PATH) {
              actualCellType = CellType.POWER_PELLET;
            }

            const mazeCellData: MazeCellType = {
              type: actualCellType,
              x,
              y,
              isCollected:
                !hasDot &&
                !hasPowerPellet &&
                (cellType === CellType.DOT ||
                  cellType === CellType.POWER_PELLET),
            };

            return (
              <MazeCell
                key={cellKey}
                {...mazeCellData}
                onClick={() => onCellClick?.(x, y)}
                onDotCollect={onDotCollect}
                onPowerPelletCollect={onPowerPelletCollect}
              />
            );
          })
        )}

        {/* Render Pacman if provided */}
        {pacman && (
          <Pacman
            x={pacman.x}
            y={pacman.y}
            direction={pacman.direction}
            isMoving={pacman.isMoving}
            isEating={pacman.isEating}
          />
        )}

        {/* Render Ghosts if provided */}
        {ghosts?.map((ghost) => (
          <Ghost key={ghost.id} {...ghost} />
        ))}
      </div>
    </div>
  );
};
