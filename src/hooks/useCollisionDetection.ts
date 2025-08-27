import { useCallback } from 'react';
import type { Position, GhostState } from '../types';
import { CellType } from '../types';

interface CollisionDetectionOptions {
  maze: number[][];
}

interface CollisionResult {
  hasCollision: boolean;
  collisionType?: 'wall' | 'boundary' | 'ghost' | 'pacman';
  collisionData?: unknown;
}

export const useCollisionDetection = ({ maze }: CollisionDetectionOptions) => {
  // Check if a position is within maze boundaries
  const isWithinBounds = useCallback(
    (x: number, y: number): boolean => {
      return x >= 0 && y >= 0 && y < maze.length && x < maze[0].length;
    },
    [maze]
  );

  // Check if a position is a wall
  const isWall = useCallback(
    (x: number, y: number): boolean => {
      if (!isWithinBounds(x, y)) return true; // Out of bounds is treated as wall
      return maze[y][x] === CellType.WALL;
    },
    [maze, isWithinBounds]
  );

  // Check if a position is valid for movement (not a wall, within bounds)
  const isValidPosition = useCallback(
    (x: number, y: number): boolean => {
      // Check bounds first
      if (!isWithinBounds(x, y)) {
        // Special case: Allow tunnel movement on row 9 (middle row)
        if (y === 9 && (x === -1 || x === maze[0].length)) {
          return true;
        }
        return false;
      }

      const cellType = maze[y][x];

      // Allow movement on paths, dots, power pellets
      // Disallow movement on walls
      if (cellType === CellType.WALL) {
        return false;
      }

      // Disallow movement into ghost house for Pacman (ghosts can move through)
      // This will be handled by the specific character movement logic
      return true;
    },
    [maze, isWithinBounds]
  );

  // Check collision between Pacman and a wall
  const checkWallCollision = useCallback(
    (position: Position): CollisionResult => {
      const { x, y } = position;

      if (!isValidPosition(x, y)) {
        return {
          hasCollision: true,
          collisionType: isWithinBounds(x, y) ? 'wall' : 'boundary',
          collisionData: { position: { x, y } },
        };
      }

      return { hasCollision: false };
    },
    [isValidPosition, isWithinBounds]
  );

  // Check collision between two characters (Pacman and Ghost)
  const checkCharacterCollision = useCallback(
    (pos1: Position, pos2: Position): CollisionResult => {
      // Characters collide if they are at the same grid position
      if (pos1.x === pos2.x && pos1.y === pos2.y) {
        return {
          hasCollision: true,
          collisionType: 'ghost', // Assuming pos1 is Pacman and pos2 is Ghost
          collisionData: { position: pos1 },
        };
      }

      return { hasCollision: false };
    },
    []
  );

  // Check collision between Pacman and all ghosts
  const checkPacmanGhostCollisions = useCallback(
    (pacmanPos: Position, ghosts: GhostState[]): CollisionResult => {
      for (const ghost of ghosts) {
        const collision = checkCharacterCollision(pacmanPos, {
          x: ghost.x,
          y: ghost.y,
        });

        if (collision.hasCollision) {
          return {
            hasCollision: true,
            collisionType: 'ghost',
            collisionData: {
              ghost,
              position: pacmanPos,
            },
          };
        }
      }

      return { hasCollision: false };
    },
    [checkCharacterCollision]
  );

  // Check if a character can move to a specific position
  const canMoveTo = useCallback(
    (
      targetPos: Position,
      characterType: 'pacman' | 'ghost' = 'pacman'
    ): boolean => {
      // Check wall/boundary collision
      const wallCollision = checkWallCollision(targetPos);
      if (wallCollision.hasCollision) {
        return false;
      }

      // Additional checks for ghost house access
      if (characterType === 'pacman') {
        const { x, y } = targetPos;
        if (isWithinBounds(x, y) && maze[y][x] === CellType.GHOST_HOUSE) {
          return false; // Pacman cannot enter ghost house
        }
      }

      return true;
    },
    [checkWallCollision, maze, isWithinBounds]
  );

  // Get all valid adjacent positions from a given position
  const getValidAdjacentPositions = useCallback(
    (
      position: Position,
      characterType: 'pacman' | 'ghost' = 'pacman'
    ): Position[] => {
      const { x, y } = position;
      const directions = [
        { x: x, y: y - 1 }, // up
        { x: x, y: y + 1 }, // down
        { x: x - 1, y: y }, // left
        { x: x + 1, y: y }, // right
      ];

      return directions.filter((pos) => canMoveTo(pos, characterType));
    },
    [canMoveTo]
  );

  // Check if two positions are adjacent (for near-collision detection)
  const arePositionsAdjacent = useCallback(
    (pos1: Position, pos2: Position): boolean => {
      const dx = Math.abs(pos1.x - pos2.x);
      const dy = Math.abs(pos1.y - pos2.y);

      // Adjacent if exactly one unit away in one direction
      return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
    },
    []
  );

  // Comprehensive collision check for a character's movement
  const checkMovementCollision = useCallback(
    (
      targetPos: Position,
      characterType: 'pacman' | 'ghost' = 'pacman',
      otherCharacters: Position[] = []
    ): CollisionResult => {
      // Check wall/boundary collision first
      const wallCollision = checkWallCollision(targetPos);
      if (wallCollision.hasCollision) {
        return wallCollision;
      }

      // Check collision with other characters
      for (const otherPos of otherCharacters) {
        const characterCollision = checkCharacterCollision(targetPos, otherPos);
        if (characterCollision.hasCollision) {
          return {
            hasCollision: true,
            collisionType: characterType === 'pacman' ? 'ghost' : 'pacman',
            collisionData: {
              position: targetPos,
              otherPosition: otherPos,
            },
          };
        }
      }

      return { hasCollision: false };
    },
    [checkWallCollision, checkCharacterCollision]
  );

  return {
    // Basic collision checks
    isWithinBounds,
    isWall,
    isValidPosition,
    checkWallCollision,
    checkCharacterCollision,
    checkPacmanGhostCollisions,

    // Movement validation
    canMoveTo,
    getValidAdjacentPositions,
    arePositionsAdjacent,
    checkMovementCollision,

    // Utility functions
    maze,
  };
};
