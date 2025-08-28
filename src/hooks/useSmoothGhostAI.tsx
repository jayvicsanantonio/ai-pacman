import { useCallback, useEffect, useRef, useState } from 'react';
import type { Direction, Position } from '../types/index';
import { CellType } from '../types/index';

type AIMode = 'chase' | 'scatter' | 'flee' | 'eaten';
type GhostPersonality = 'aggressive' | 'ambush' | 'random' | 'patrol';

interface SmoothPosition {
  x: number;
  y: number;
}

interface UseSmoothGhostAIOptions {
  ghostId: string;
  maze: number[][];
  initialPosition: Position;
  initialDirection: Direction;
  personality: GhostPersonality;
  speed?: number;
  pacmanPosition: Position;
  pacmanDirection: Direction;
  isVulnerable: boolean;
  onPositionChange?: (ghostId: string, position: Position) => void;
  onDirectionChange?: (ghostId: string, direction: Direction) => void;
  onModeChange?: (ghostId: string, mode: AIMode) => void;
}

interface GhostAIState {
  gridPosition: Position;
  visualPosition: SmoothPosition;
  direction: Direction;
  mode: AIMode;
  targetPosition: Position;
  lastDirectionChange: number;
  isAnimating: boolean;
}

export const useSmoothGhostAI = ({
  ghostId,
  maze,
  initialPosition,
  initialDirection,
  personality,
  speed = 300,
  pacmanPosition,
  pacmanDirection,
  isVulnerable,
  onPositionChange,
  onDirectionChange,
  onModeChange,
}: UseSmoothGhostAIOptions) => {
  const [aiState, setAIState] = useState<GhostAIState>({
    gridPosition: initialPosition,
    visualPosition: { x: initialPosition.x, y: initialPosition.y },
    direction: initialDirection,
    mode: 'scatter',
    targetPosition: initialPosition,
    lastDirectionChange: 0,
    isAnimating: false,
  });

  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const optionsRef = useRef({
    maze,
    speed,
    pacmanPosition,
    pacmanDirection,
    isVulnerable,
    onPositionChange,
    onDirectionChange,
    onModeChange,
  });

  // Update options ref when they change
  useEffect(() => {
    optionsRef.current = {
      maze,
      speed,
      pacmanPosition,
      pacmanDirection,
      isVulnerable,
      onPositionChange,
      onDirectionChange,
      onModeChange,
    };
  }, [
    maze,
    speed,
    pacmanPosition,
    pacmanDirection,
    isVulnerable,
    onPositionChange,
    onDirectionChange,
    onModeChange,
  ]);

  // Check if a position is valid for ghost movement
  const isValidPosition = useCallback((x: number, y: number): boolean => {
    const currentMaze = optionsRef.current.maze;

    if (
      x < 0 ||
      y < 0 ||
      y >= currentMaze.length ||
      x >= currentMaze[0].length
    ) {
      // Special case: Allow tunnel movement on row 9
      if (y === 9 && (x === -1 || x === currentMaze[0].length)) {
        return true;
      }
      return false;
    }

    const cellType = currentMaze[y][x];
    return cellType !== CellType.WALL;
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
          if (x < 0 && y === 9) {
            x = currentMaze[0].length - 1;
          }
          break;
        case 'right':
          x += 1;
          if (x >= currentMaze[0].length && y === 9) {
            x = 0;
          }
          break;
      }

      return { x, y };
    },
    []
  );

  // Get all valid directions from current position
  const getValidDirections = useCallback(
    (position: Position): Direction[] => {
      const directions: Direction[] = ['up', 'down', 'left', 'right'];
      return directions.filter((direction) => {
        const nextPos = getNextPosition(position, direction);
        return isValidPosition(nextPos.x, nextPos.y);
      });
    },
    [getNextPosition, isValidPosition]
  );

  // Calculate Manhattan distance between two positions
  const getManhattanDistance = useCallback(
    (pos1: Position, pos2: Position): number => {
      return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
    },
    []
  );

  // Simple pathfinding
  const findPathToTarget = useCallback(
    (start: Position, target: Position): Direction | null => {
      const validDirections = getValidDirections(start);
      if (validDirections.length === 0) return null;

      let bestDirection: Direction | null = null;
      let bestDistance = Infinity;

      for (const direction of validDirections) {
        const nextPos = getNextPosition(start, direction);
        const distance = getManhattanDistance(nextPos, target);

        if (distance < bestDistance) {
          bestDistance = distance;
          bestDirection = direction;
        }
      }

      return bestDirection;
    },
    [getValidDirections, getNextPosition, getManhattanDistance]
  );

  // Get target position based on AI mode and personality
  const getTargetPosition = useCallback(
    (currentMode: AIMode, currentPos: Position): Position => {
      const { pacmanPosition: pacmanPos, pacmanDirection } = optionsRef.current;

      switch (currentMode) {
        case 'chase':
          switch (personality) {
            case 'aggressive':
              return pacmanPos;

            case 'ambush': {
              const ambushTarget = { ...pacmanPos };
              switch (pacmanDirection) {
                case 'up':
                  ambushTarget.y -= 4;
                  break;
                case 'down':
                  ambushTarget.y += 4;
                  break;
                case 'left':
                  ambushTarget.x -= 4;
                  break;
                case 'right':
                  ambushTarget.x += 4;
                  break;
              }
              return ambushTarget;
            }

            case 'random':
              if (Math.random() < 0.7) {
                return pacmanPos;
              } else {
                return {
                  x: pacmanPos.x + (Math.random() - 0.5) * 8,
                  y: pacmanPos.y + (Math.random() - 0.5) * 8,
                };
              }

            case 'patrol':
              return {
                x: pacmanPos.x + Math.sin(Date.now() / 2000) * 3,
                y: pacmanPos.y + Math.cos(Date.now() / 2000) * 3,
              };
          }
          break;

        case 'scatter':
          switch (personality) {
            case 'aggressive':
              return { x: 19, y: 1 };
            case 'ambush':
              return { x: 1, y: 1 };
            case 'random':
              return { x: 1, y: 19 };
            case 'patrol':
              return { x: 19, y: 19 };
          }
          break;

        case 'flee': {
          const fleeX = currentPos.x + (currentPos.x - pacmanPos.x) * 2;
          const fleeY = currentPos.y + (currentPos.y - pacmanPos.y) * 2;
          return { x: fleeX, y: fleeY };
        }

        case 'eaten':
          return { x: 10, y: 9 };
      }

      return currentPos;
    },
    [personality]
  );

  // Determine AI mode based on game state
  const determineAIMode = useCallback((currentMode: AIMode): AIMode => {
    const { isVulnerable } = optionsRef.current;

    if (isVulnerable && currentMode !== 'flee') {
      return 'flee';
    }

    if (!isVulnerable && currentMode === 'flee') {
      return 'chase';
    }

    const now = Date.now();
    const modeTime = now % 20000;

    if (modeTime < 7000) {
      return 'scatter';
    } else if (modeTime < 14000) {
      return 'chase';
    } else {
      return 'scatter';
    }
  }, []);

  // Choose next direction based on AI logic
  const chooseNextDirection = useCallback(
    (currentState: GhostAIState): Direction => {
      const validDirections = getValidDirections(currentState.gridPosition);

      if (validDirections.length === 0) {
        return currentState.direction;
      }

      const oppositeDirection = {
        up: 'down',
        down: 'up',
        left: 'right',
        right: 'left',
      }[currentState.direction] as Direction;

      const preferredDirections = validDirections.filter(
        (dir) => dir !== oppositeDirection
      );
      const directionsToConsider =
        preferredDirections.length > 0 ? preferredDirections : validDirections;

      const pathDirection = findPathToTarget(
        currentState.gridPosition,
        currentState.targetPosition
      );

      if (pathDirection && directionsToConsider.includes(pathDirection)) {
        return pathDirection;
      }

      return directionsToConsider[
        Math.floor(Math.random() * directionsToConsider.length)
      ];
    },
    [getValidDirections, findPathToTarget]
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
        
        // Use easeOutCubic for smooth movement
        const easeProgress = 1 - Math.pow(1 - progress, 3);

        const currentX = startX + deltaX * easeProgress;
        const currentY = startY + deltaY * easeProgress;

        setAIState(prev => ({
          ...prev,
          visualPosition: { x: currentX, y: currentY },
          isAnimating: progress < 1,
        }));

        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete
          setAIState(prev => ({
            ...prev,
            gridPosition: toPos,
            visualPosition: { x: toPos.x, y: toPos.y },
            isAnimating: false,
          }));
          
          // Notify about position change
          if (optionsRef.current.onPositionChange) {
            optionsRef.current.onPositionChange(ghostId, toPos);
          }
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    },
    [ghostId]
  );

  // Update AI state
  const updateAI = useCallback(() => {
    setAIState((prevState) => {
      // Don't update while animating
      if (prevState.isAnimating) {
        return prevState;
      }

      const now = Date.now();
      const newMode = determineAIMode(prevState.mode);
      const modeChanged = newMode !== prevState.mode;
      const newTarget = getTargetPosition(newMode, prevState.gridPosition);

      const shouldChangeDirection =
        modeChanged ||
        now - prevState.lastDirectionChange > 1000 ||
        !isValidPosition(
          getNextPosition(prevState.gridPosition, prevState.direction).x,
          getNextPosition(prevState.gridPosition, prevState.direction).y
        );

      let newDirection = prevState.direction;
      let newLastDirectionChange = prevState.lastDirectionChange;

      if (shouldChangeDirection) {
        newDirection = chooseNextDirection({
          ...prevState,
          mode: newMode,
          targetPosition: newTarget,
        });
        newLastDirectionChange = now;

        if (
          optionsRef.current.onDirectionChange &&
          newDirection !== prevState.direction
        ) {
          optionsRef.current.onDirectionChange(ghostId, newDirection);
        }
      }

      // Move to next position
      const nextPos = getNextPosition(prevState.gridPosition, newDirection);
      const canMove = isValidPosition(nextPos.x, nextPos.y);

      if (canMove) {
        // Start smooth animation to next position
        animateToPosition(prevState.visualPosition, nextPos, optionsRef.current.speed * 0.8);

        // Notify about mode change
        if (modeChanged && optionsRef.current.onModeChange) {
          optionsRef.current.onModeChange(ghostId, newMode);
        }

        return {
          ...prevState,
          direction: newDirection,
          mode: newMode,
          targetPosition: newTarget,
          lastDirectionChange: newLastDirectionChange,
          isAnimating: true,
        };
      }

      return prevState;
    });
  }, [
    determineAIMode,
    getTargetPosition,
    chooseNextDirection,
    getNextPosition,
    isValidPosition,
    animateToPosition,
    ghostId,
  ]);

  // Start AI movement
  const startAI = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(updateAI, optionsRef.current.speed);
  }, [updateAI]);

  // Stop AI movement
  const stopAI = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Reset AI to initial state
  const resetAI = useCallback(() => {
    stopAI();
    setAIState({
      gridPosition: initialPosition,
      visualPosition: { x: initialPosition.x, y: initialPosition.y },
      direction: initialDirection,
      mode: 'scatter',
      targetPosition: initialPosition,
      lastDirectionChange: 0,
      isAnimating: false,
    });
  }, [stopAI, initialPosition, initialDirection]);

  // Auto-start AI when component mounts
  useEffect(() => {
    startAI();

    return () => {
      stopAI();
    };
  }, [startAI, stopAI]);

  // Update mode when vulnerability changes
  useEffect(() => {
    setAIState((prevState) => {
      const newMode = determineAIMode(prevState.mode);
      if (newMode !== prevState.mode) {
        return {
          ...prevState,
          mode: newMode,
          targetPosition: getTargetPosition(newMode, prevState.gridPosition),
        };
      }
      return prevState;
    });
  }, [isVulnerable, determineAIMode, getTargetPosition]);

  return {
    gridPosition: aiState.gridPosition,
    visualPosition: aiState.visualPosition,
    direction: aiState.direction,
    mode: aiState.mode,
    targetPosition: aiState.targetPosition,
    isAnimating: aiState.isAnimating,
    startAI,
    stopAI,
    resetAI,
    isValidPosition: (x: number, y: number) => isValidPosition(x, y),
    getValidDirections: () => getValidDirections(aiState.gridPosition),
    getManhattanDistance,
  };
};
