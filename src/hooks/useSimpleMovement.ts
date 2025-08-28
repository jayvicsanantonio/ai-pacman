import { useCallback, useEffect, useRef, useState } from 'react';
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

  // Check if a position is within maze boundaries
  const isWithinBounds = useCallback(
    (x: number, y: number): boolean => {
      return x >= 0 && y >= 0 && y < maze.length && x < maze[0].length;
    },
    [maze]
  );

  // Check if a position is valid for movement
  const isValidPosition = useCallback(
    (x: number, y: number): boolean => {
      // Special case: Allow tunnel movement on row 9 (horizontal tunnel)
      if (y === 9) {
        // Left tunnel entrance/exit
        if (x === -1) return true;
        // Right tunnel entrance/exit
        if (x === maze[0].length) return true;
      }

      // Check bounds - must be within maze boundaries
      if (!isWithinBounds(x, y)) {
        return false;
      }

      const cellType = maze[y][x];

      // Allow movement on paths, dots, and power pellets
      // Disallow movement on walls and ghost house
      if (cellType === CellType.WALL) {
        return false;
      }

      // Pacman cannot enter ghost house
      if (cellType === CellType.GHOST_HOUSE) {
        return false;
      }

      // All other cell types (PATH, DOT, POWER_PELLET) are valid
      return true;
    },
    [maze, isWithinBounds]
  );

  // Get next position based on current position and direction
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
          // Handle left tunnel: if moving left from x=0 on row 9, wrap to right side
          if (x < 0 && y === 9) {
            x = maze[0].length - 1;
          }
          break;
        case 'right':
          x += 1;
          // Handle right tunnel: if moving right from last column on row 9, wrap to left side
          if (x >= maze[0].length && y === 9) {
            x = 0;
          }
          break;
      }

      return { x, y };
    },
    [maze]
  );

  // Check if movement in a specific direction is possible from current position
  const canMove = useCallback(
    (pos: Position, dir: Direction): boolean => {
      const nextPos = getNextPosition(pos, dir);
      const isValid = isValidPosition(nextPos.x, nextPos.y);

      console.log(
        `Checking move from (${pos.x},${pos.y}) ${dir} to (${nextPos.x},${nextPos.y}): ${isValid}`
      );

      return isValid;
    },
    [getNextPosition, isValidPosition]
  );

  // Set the movement direction
  const setDirection = useCallback(
    (newDirection: Direction) => {
      console.log(`Attempting to set direction to: ${newDirection}`);

      // Check if we can immediately move in the new direction
      if (canMove(position, newDirection)) {
        console.log(`Can move ${newDirection} immediately, changing direction`);
        setDirectionState(newDirection);
        setNextDirection(null);

        // Notify about direction change
        if (onDirectionChange && direction !== newDirection) {
          onDirectionChange(newDirection);
        }

        // Start moving if not already moving
        if (!isMoving) {
          setIsMoving(true);
        }
      } else {
        console.log(`Cannot move ${newDirection} now, queuing for later`);
        // Store the direction for later when it becomes possible
        setNextDirection(newDirection);
      }
    },
    [position, canMove, onDirectionChange, direction, isMoving]
  );

  // Movement loop effect
  useEffect(() => {
    if (!isMoving) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = window.setInterval(() => {
      setPosition((currentPos) => {
        let currentDirection = direction;

        // Check if we can change to the queued direction
        if (nextDirection && canMove(currentPos, nextDirection)) {
          console.log(
            `Switching from ${currentDirection} to queued direction ${nextDirection}`
          );
          currentDirection = nextDirection;
          setDirectionState(nextDirection);
          setNextDirection(null);

          // Notify about direction change
          if (onDirectionChange) {
            onDirectionChange(nextDirection);
          }
        }

        // Try to move in the current direction
        if (canMove(currentPos, currentDirection)) {
          const nextPos = getNextPosition(currentPos, currentDirection);
          console.log(
            `Moving from (${currentPos.x},${currentPos.y}) to (${nextPos.x},${nextPos.y})`
          );

          // Notify about position change
          if (onPositionChange) {
            onPositionChange(nextPos);
          }

          return nextPos;
        } else {
          // Cannot move in current direction - stop moving
          console.log(
            `Cannot move ${currentDirection} from (${currentPos.x},${currentPos.y}), stopping`
          );
          setIsMoving(false);
          return currentPos;
        }
      });
    }, speed);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
    console.log('Starting movement');
    setIsMoving(true);
  }, []);

  // Stop moving
  const stopMoving = useCallback(() => {
    console.log('Stopping movement');
    setIsMoving(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Reset movement to initial state
  const resetMovement = useCallback(() => {
    console.log('Resetting movement');
    setPosition(initialPosition);
    setDirectionState(initialDirection);
    setIsMoving(false);
    setNextDirection(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [initialPosition, initialDirection]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
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
