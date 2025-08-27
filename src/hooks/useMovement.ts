import { useState, useEffect, useCallback, useRef } from 'react';
import type { Direction, Position } from '../types';
import { CellType } from '../types';

interface UseMovementOptions {
  maze: number[][];
  initialPosition: Position;
  initialDirection: Direction;
  speed?: number; // Movement speed in milliseconds
  onPositionChange?: (position: Position) => void;
  onDirectionChange?: (direction: Direction) => void;
}

interface MovementState {
  position: Position;
  direction: Direction;
  isMoving: boolean;
  nextDirection: Direction | null;
}

export const useMovement = ({
  maze,
  initialPosition,
  initialDirection,
  speed = 200,
  onPositionChange,
  onDirectionChange,
}: UseMovementOptions) => {
  const [movementState, setMovementState] = useState<MovementState>({
    position: initialPosition,
    direction: initialDirection,
    nextDirection: null,
    isMoving: false,
  });

  const intervalRef = useRef<number | null>(null);
  const isMovingRef = useRef(false);
  const optionsRef = useRef({
    maze,
    speed,
    onPositionChange,
    onDirectionChange,
  });

  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = { maze, speed, onPositionChange, onDirectionChange };
  }, [maze, speed, onPositionChange, onDirectionChange]);

  // Validate if a position is valid for movement
  const isValidPosition = useCallback((x: number, y: number): boolean => {
    const currentMaze = optionsRef.current.maze;

    // Check bounds
    if (
      x < 0 ||
      y < 0 ||
      y >= currentMaze.length ||
      x >= currentMaze[0].length
    ) {
      return false;
    }

    const cellType = currentMaze[y][x];

    // Allow movement on paths, dots (handled separately), power pellets (handled separately)
    // Disallow movement on walls and ghost house (unless it's the tunnel area)
    if (cellType === CellType.WALL) {
      return false;
    }

    // Special case: Allow movement through tunnel areas (sides of the maze)
    if (y === 9 && (x === 0 || x === 20)) {
      return true;
    }

    // Disallow movement into ghost house for Pacman
    if (cellType === CellType.GHOST_HOUSE) {
      return false;
    }

    return true;
  }, []);

  // Get next position based on direction
  const getNextPosition = useCallback(
    (currentPos: Position, direction: Direction): Position => {
      const currentMaze = optionsRef.current.maze;
      let { x, y } = currentPos;

      switch (direction) {
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
            x = currentMaze[0].length - 1;
          }
          break;
        case 'right':
          x += 1;
          // Handle tunnel on right side
          if (x >= currentMaze[0].length && y === 9) {
            x = 0;
          }
          break;
      }

      return { x, y };
    },
    []
  );

  // Check if movement in a direction is possible
  const canMove = useCallback(
    (position: Position, direction: Direction): boolean => {
      const nextPos = getNextPosition(position, direction);
      return isValidPosition(nextPos.x, nextPos.y);
    },
    [getNextPosition, isValidPosition]
  );

  // Set the desired direction (will be applied when possible)
  const setDirection = useCallback(
    (newDirection: Direction) => {
      setMovementState((prev) => {
        // If we can immediately move in the new direction, change direction now
        if (canMove(prev.position, newDirection)) {
          // Notify about direction change
          if (
            optionsRef.current.onDirectionChange &&
            prev.direction !== newDirection
          ) {
            optionsRef.current.onDirectionChange(newDirection);
          }

          return {
            ...prev,
            direction: newDirection,
            nextDirection: null,
          };
        } else {
          // Store the direction for later when it becomes possible
          return {
            ...prev,
            nextDirection: newDirection,
          };
        }
      });
    },
    [canMove]
  );

  // Start movement
  const startMoving = useCallback(() => {
    if (isMovingRef.current) return;

    isMovingRef.current = true;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    intervalRef.current = setInterval(() => {
      setMovementState((prev) => {
        let newDirection = prev.direction;
        let newNextDirection = prev.nextDirection;

        // Check if we can change to the queued direction
        if (prev.nextDirection && canMove(prev.position, prev.nextDirection)) {
          newDirection = prev.nextDirection;
          newNextDirection = null;

          // Notify about direction change
          if (
            optionsRef.current.onDirectionChange &&
            prev.direction !== newDirection
          ) {
            optionsRef.current.onDirectionChange(newDirection);
          }
        }

        // Try to move in the current/new direction
        if (canMove(prev.position, newDirection)) {
          const nextPos = getNextPosition(prev.position, newDirection);

          // Notify about position change
          if (optionsRef.current.onPositionChange) {
            optionsRef.current.onPositionChange(nextPos);
          }

          return {
            ...prev,
            position: nextPos,
            direction: newDirection,
            nextDirection: newNextDirection,
            isMoving: true,
          };
        } else {
          // Can't move, stop moving
          return {
            ...prev,
            direction: newDirection,
            nextDirection: newNextDirection,
            isMoving: false,
          };
        }
      });
    }, optionsRef.current.speed);
  }, [canMove, getNextPosition]);

  // Stop movement
  const stopMoving = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isMovingRef.current = false;

    setMovementState((prev) => ({
      ...prev,
      isMoving: false,
    }));
  }, []);

  // Reset position and direction
  const resetMovement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    isMovingRef.current = false;

    setMovementState({
      position: initialPosition,
      direction: initialDirection,
      nextDirection: null,
      isMoving: false,
    });
  }, [initialPosition, initialDirection]);

  // Auto-start movement when component mounts and handle cleanup
  useEffect(() => {
    // Start the movement interval
    const startInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      intervalRef.current = setInterval(() => {
        setMovementState((prev) => {
          let newDirection = prev.direction;
          let newNextDirection = prev.nextDirection;

          // Check if we can change to the queued direction
          if (
            prev.nextDirection &&
            canMove(prev.position, prev.nextDirection)
          ) {
            newDirection = prev.nextDirection;
            newNextDirection = null;

            // Notify about direction change
            if (
              optionsRef.current.onDirectionChange &&
              prev.direction !== newDirection
            ) {
              optionsRef.current.onDirectionChange(newDirection);
            }
          }

          // Try to move in the current/new direction
          if (canMove(prev.position, newDirection)) {
            const nextPos = getNextPosition(prev.position, newDirection);

            // Notify about position change
            if (optionsRef.current.onPositionChange) {
              optionsRef.current.onPositionChange(nextPos);
            }

            return {
              ...prev,
              position: nextPos,
              direction: newDirection,
              nextDirection: newNextDirection,
              isMoving: true,
            };
          } else {
            // Can't move, stop moving
            return {
              ...prev,
              direction: newDirection,
              nextDirection: newNextDirection,
              isMoving: false,
            };
          }
        });
      }, optionsRef.current.speed);
    };

    // Start movement
    isMovingRef.current = true;
    startInterval();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isMovingRef.current = false;
    };
  }, []); // Empty dependency array to run only once

  return {
    position: movementState.position,
    direction: movementState.direction,
    isMoving: movementState.isMoving,
    setDirection,
    startMoving,
    stopMoving,
    resetMovement,
    canMove: (direction: Direction) =>
      canMove(movementState.position, direction),
  };
};
