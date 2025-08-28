import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, Position } from '../types';
import { CellType } from '../types';

interface SmoothPosition {
  x: number;
  y: number;
}

interface UseSmoothMovementOptions {
  maze: number[][];
  initialPosition: Position;
  initialDirection: Direction;
  speed?: number;
  onPositionChange?: (position: Position) => void;
  onDirectionChange?: (direction: Direction) => void;
}

interface MovementState {
  gridPosition: Position;
  visualPosition: SmoothPosition;
  direction: Direction;
  isMoving: boolean;
  nextDirection: Direction | null;
  isAnimating: boolean;
}

export const useSmoothMovementFixed = ({
  maze,
  initialPosition,
  initialDirection,
  speed = 300,
  onPositionChange,
  onDirectionChange,
}: UseSmoothMovementOptions) => {
  const [movementState, setMovementState] = useState<MovementState>({
    gridPosition: initialPosition,
    visualPosition: { x: initialPosition.x, y: initialPosition.y },
    direction: initialDirection,
    nextDirection: null,
    isMoving: false,
    isAnimating: false,
  });

  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);

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
        if (x === -1) return true;
        if (x === maze[0].length) return true;
      }

      if (!isWithinBounds(x, y)) {
        return false;
      }

      const cellType = maze[y][x];
      return cellType !== CellType.WALL && cellType !== CellType.GHOST_HOUSE;
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
          if (x < 0 && y === 9) {
            x = maze[0].length - 1;
          }
          break;
        case 'right':
          x += 1;
          if (x >= maze[0].length && y === 9) {
            x = 0;
          }
          break;
      }

      return { x, y };
    },
    [maze]
  );

  // Check if movement in a specific direction is possible
  const canMove = useCallback(
    (pos: Position, dir: Direction): boolean => {
      const nextPos = getNextPosition(pos, dir);
      return isValidPosition(nextPos.x, nextPos.y);
    },
    [getNextPosition, isValidPosition]
  );

  // Smooth animation between grid positions
  const animateToPosition = useCallback(
    (fromPos: SmoothPosition, toPos: Position, duration: number) => {
      const startTime = Date.now();
      const startX = fromPos.x;
      const startY = fromPos.y;
      const deltaX = toPos.x - fromPos.x;
      const deltaY = toPos.y - fromPos.y;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Use easeOutQuart for smooth deceleration
        const easeProgress = 1 - Math.pow(1 - progress, 4);

        const currentX = startX + deltaX * easeProgress;
        const currentY = startY + deltaY * easeProgress;

        setMovementState(prev => ({
          ...prev,
          visualPosition: { x: currentX, y: currentY },
          isAnimating: progress < 1,
        }));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete - sync grid and visual positions
          setMovementState(prev => ({
            ...prev,
            gridPosition: toPos,
            visualPosition: { x: toPos.x, y: toPos.y },
            isAnimating: false,
          }));
          
          // Notify about position change
          if (onPositionChange) {
            onPositionChange(toPos);
          }
        }
      };

      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      animationRef.current = requestAnimationFrame(animate);
    },
    [onPositionChange]
  );

  // Set the movement direction
  const setDirection = useCallback(
    (newDirection: Direction) => {
      setMovementState(prev => {
        // If we can immediately move in the new direction and not animating
        if (canMove(prev.gridPosition, newDirection) && !prev.isAnimating) {
          // Notify about direction change
          if (onDirectionChange && prev.direction !== newDirection) {
            onDirectionChange(newDirection);
          }

          return {
            ...prev,
            direction: newDirection,
            nextDirection: null,
          };
        } else {
          // Queue the direction for later
          return {
            ...prev,
            nextDirection: newDirection,
          };
        }
      });
    },
    [canMove, onDirectionChange]
  );

  // Movement loop with smooth animation
  useEffect(() => {
    if (!movementState.isMoving) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const moveInterval = setInterval(() => {
      setMovementState(prev => {
        // Don't start new movement while animating
        if (prev.isAnimating) {
          return prev;
        }

        let currentDirection = prev.direction;

        // Check if we can change to the queued direction
        if (prev.nextDirection && canMove(prev.gridPosition, prev.nextDirection)) {
          currentDirection = prev.nextDirection;
          
          // Notify about direction change
          if (onDirectionChange && prev.direction !== currentDirection) {
            onDirectionChange(currentDirection);
          }
        }

        // Try to move in the current direction
        if (canMove(prev.gridPosition, currentDirection)) {
          const nextGridPos = getNextPosition(prev.gridPosition, currentDirection);
          
          // Start smooth animation to next position
          animateToPosition(prev.visualPosition, nextGridPos, speed * 0.8);

          return {
            ...prev,
            direction: currentDirection,
            nextDirection: prev.nextDirection === currentDirection ? null : prev.nextDirection,
            isAnimating: true,
          };
        } else {
          // Cannot move - keep trying or stop
          return prev;
        }
      });
    }, speed);

    intervalRef.current = moveInterval;

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    movementState.isMoving,
    canMove,
    getNextPosition,
    animateToPosition,
    speed,
    onDirectionChange,
  ]);

  // Start moving
  const startMoving = useCallback(() => {
    setMovementState(prev => ({ ...prev, isMoving: true }));
  }, []);

  // Stop moving
  const stopMoving = useCallback(() => {
    setMovementState(prev => ({ ...prev, isMoving: false }));
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Reset movement to initial state
  const resetMovement = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    setMovementState({
      gridPosition: initialPosition,
      visualPosition: { x: initialPosition.x, y: initialPosition.y },
      direction: initialDirection,
      nextDirection: null,
      isMoving: false,
      isAnimating: false,
    });
  }, [initialPosition, initialDirection]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, []);

  return {
    gridPosition: movementState.gridPosition,
    visualPosition: movementState.visualPosition,
    direction: movementState.direction,
    isMoving: movementState.isMoving,
    isAnimating: movementState.isAnimating,
    setDirection,
    startMoving,
    stopMoving,
    resetMovement,
    canMove: (dir: Direction) => canMove(movementState.gridPosition, dir),
  };
};
