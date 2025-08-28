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

    console.log(`Checking position validity: (${x}, ${y})`);

    // Check bounds
    if (
      x < 0 ||
      y < 0 ||
      y >= currentMaze.length ||
      x >= currentMaze[0].length
    ) {
      console.log(`Position (${x}, ${y}) is out of bounds`);
      return false;
    }

    const cellType = currentMaze[y][x];
    console.log(`Cell type at (${x}, ${y}): ${cellType}`);

    // Allow movement on paths, dots (handled separately), power pellets (handled separately)
    // Disallow movement on walls and ghost house (unless it's the tunnel area)
    if (cellType === CellType.WALL) {
      console.log(`Position (${x}, ${y}) is a wall`);
      return false;
    }

    // Special case: Allow movement through tunnel areas (sides of the maze)
    if (y === 9 && (x === 0 || x === 20)) {
      console.log(`Position (${x}, ${y}) is tunnel area`);
      return true;
    }

    // Disallow movement into ghost house for Pacman
    if (cellType === CellType.GHOST_HOUSE) {
      console.log(`Position (${x}, ${y}) is ghost house`);
      return false;
    }

    console.log(`Position (${x}, ${y}) is valid`);
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
      console.log(`Setting direction to: ${newDirection}`);
      setMovementState((prev) => {
        console.log(`Current position: ${prev.position.x}, ${prev.position.y}`);
        const canMoveInDirection = canMove(prev.position, newDirection);
        console.log(`Can move ${newDirection}: ${canMoveInDirection}`);

        // If we can immediately move in the new direction, change direction now
        if (canMoveInDirection) {
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
          console.log(`Storing direction ${newDirection} for later`);
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
        const canMoveNow = canMove(prev.position, newDirection);
        console.log(
          `Movement tick - Position: ${prev.position.x},${prev.position.y}, Direction: ${newDirection}, Can move: ${canMoveNow}`
        );

        if (canMoveNow) {
          const nextPos = getNextPosition(prev.position, newDirection);
          console.log(`Moving to: ${nextPos.x},${nextPos.y}`);

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
          console.log(`Cannot move in direction ${newDirection}, stopping`);
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
    // Don't auto-start movement - let the user control it
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      isMovingRef.current = false;
    };
  }, []);

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
