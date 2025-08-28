import { useState, useEffect, useCallback, useRef } from 'react';
import type { Direction, Position } from '../types';
import { CellType } from '../types';

interface UseSimpleMovementOptions {
  maze: number[][];
  initialPosition: Position;
  initialDirection: Direction;
  speed?: number;
  onPositionChange?: (position: Position) => void;
  onDirectionChange?: (direction: Direction) => void;
}

export const useSimpleMovement = ({
  maze,
  initialPosition,
  initialDirection,
  speed = 300,
  onPositionChange,
  onDirectionChange,
}: UseSimpleMovementOptions) => {
  const [position, setPosition] = useState<Position>(initialPosition);
  const [direction, setDirectionState] = useState<Direction>(initialDirection);
  const [isMoving, setIsMoving] = useState(false);
  const [nextDirection, setNextDirection] = useState<Direction | null>(null);

  const intervalRef = useRef<number | null>(null);

  // Check if a position is valid for movement
  const isValidPosition = useCallback(
    (x: number, y: number): boolean => {
      // Check bounds
      if (x < 0 || y < 0 || y >= maze.length || x >= maze[0].length) {
        // Special case: Allow tunnel movement on row 9
        if (y === 9 && (x === -1 || x === maze[0].length)) {
          return true;
        }
        return false;
      }

      const cellType = maze[y][x];

      // Allow movement on paths, disallow walls and ghost house
      if (cellType === CellType.WALL || cellType === CellType.GHOST_HOUSE) {
        return false;
      }

      return true;
    },
    [maze]
  );

  // Get next position based on direction
  const getNextPosition = useCallback(
    (currentPos: Position, dir: Direction): Position => {
      let { x, y } = currentPos;

      switch (dir) {
        case 'up':
          y -= 1;
          break;
        case 'down':
          y += 1;
          break;
        case 'left':
          x -= 1;
          // Handle tunnel on left side
          if (x < 0 && y === 9) {
            x = maze[0].length - 1;
          }
          break;
        case 'right':
          x += 1;
          // Handle tunnel on right side
          if (x >= maze[0].length && y === 9) {
            x = 0;
          }
          break;
      }

      return { x, y };
    },
    [maze]
  );

  // Check if movement in a direction is possible
  const canMove = useCallback(
    (pos: Position, dir: Direction): boolean => {
      const nextPos = getNextPosition(pos, dir);
      return isValidPosition(nextPos.x, nextPos.y);
    },
    [getNextPosition, isValidPosition]
  );

  // Set direction
  const setDirection = useCallback(
    (newDirection: Direction) => {
      if (canMove(position, newDirection)) {
        setDirectionState(newDirection);
        setNextDirection(null);

        if (onDirectionChange) {
          onDirectionChange(newDirection);
        }

        // Start moving if not already moving
        if (!isMoving) {
          setIsMoving(true);
        }
      } else {
        // Store for later
        setNextDirection(newDirection);
      }
    },
    [position, canMove, onDirectionChange, isMoving]
  );

  // Movement effect
  useEffect(() => {
    if (!isMoving) return;

    intervalRef.current = window.setInterval(() => {
      setPosition((currentPos) => {
        // Check if we can change to queued direction
        let currentDirection = direction;
        if (nextDirection && canMove(currentPos, nextDirection)) {
          currentDirection = nextDirection;
          setDirectionState(nextDirection);
          setNextDirection(null);

          if (onDirectionChange) {
            onDirectionChange(nextDirection);
          }
        }

        // Try to move in current direction
        if (canMove(currentPos, currentDirection)) {
          const nextPos = getNextPosition(currentPos, currentDirection);

          if (onPositionChange) {
            onPositionChange(nextPos);
          }

          return nextPos;
        } else {
          // Can't move, stop
          setIsMoving(false);
          return currentPos;
        }
      });
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [
    isMoving,
    direction,
    nextDirection,
    canMove,
    getNextPosition,
    onPositionChange,
    onDirectionChange,
    speed,
  ]);

  // Start moving
  const startMoving = useCallback(() => {
    setIsMoving(true);
  }, []);

  // Stop moving
  const stopMoving = useCallback(() => {
    setIsMoving(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset
  const resetMovement = useCallback(() => {
    setPosition(initialPosition);
    setDirectionState(initialDirection);
    setIsMoving(false);
    setNextDirection(null);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialPosition, initialDirection]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    position,
    direction,
    isMoving,
    setDirection,
    startMoving,
    stopMoving,
    resetMovement,
    canMove: (dir: Direction) => canMove(position, dir),
  };
};
