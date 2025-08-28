import { useState, useEffect, useCallback, useRef } from 'react';
import type { Direction, Position } from '../types/index';
import { CellType } from '../types/index';

type AIMode = 'chase' | 'scatter' | 'flee' | 'eaten';
type GhostPersonality = 'aggressive' | 'ambush' | 'random' | 'patrol';

interface UseGhostAIOptions {
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
  position: Position;
  direction: Direction;
  mode: AIMode;
  targetPosition: Position;
  lastDirectionChange: number;
  pathfindingCooldown: number;
}

export const useGhostAI = ({
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
}: UseGhostAIOptions) => {
  const [aiState, setAIState] = useState<GhostAIState>({
    position: initialPosition,
    direction: initialDirection,
    mode: 'scatter',
    targetPosition: initialPosition,
    lastDirectionChange: 0,
    pathfindingCooldown: 0,
  });

  const intervalRef = useRef<number | null>(null);
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

    // Check bounds
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

    // Ghosts can move through paths, dots, power pellets, and ghost house
    // Only walls block ghost movement
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

  // Simple pathfinding using A* algorithm (simplified version)
  const findPathToTarget = useCallback(
    (start: Position, target: Position): Direction | null => {
      const validDirections = getValidDirections(start);
      if (validDirections.length === 0) return null;

      let bestDirection: Direction | null = null;
      let bestDistance = Infinity;

      // Choose direction that gets closest to target
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
          // Different chase behaviors based on personality
          switch (personality) {
            case 'aggressive':
              // Direct chase - target Pacman's current position
              return pacmanPos;

            case 'ambush':
              // Target 4 cells ahead of Pacman
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

            case 'random':
              // Mix of direct chase and random movement
              if (Math.random() < 0.7) {
                return pacmanPos;
              } else {
                // Random target near Pacman
                return {
                  x: pacmanPos.x + (Math.random() - 0.5) * 8,
                  y: pacmanPos.y + (Math.random() - 0.5) * 8,
                };
              }

            case 'patrol':
              // Target Pacman but with some delay/predictability
              return {
                x: pacmanPos.x + Math.sin(Date.now() / 2000) * 3,
                y: pacmanPos.y + Math.cos(Date.now() / 2000) * 3,
              };
          }
          break;

        case 'scatter':
          // Each ghost has a preferred corner based on personality
          switch (personality) {
            case 'aggressive':
              return { x: 19, y: 1 }; // Top-right corner
            case 'ambush':
              return { x: 1, y: 1 }; // Top-left corner
            case 'random':
              return { x: 1, y: 19 }; // Bottom-left corner
            case 'patrol':
              return { x: 19, y: 19 }; // Bottom-right corner
          }
          break;

        case 'flee': // Run away from Pacman
        {
          const fleeX = currentPos.x + (currentPos.x - pacmanPos.x) * 2;
          const fleeY = currentPos.y + (currentPos.y - pacmanPos.y) * 2;
          return { x: fleeX, y: fleeY };
        }

        case 'eaten':
          // Return to ghost house center
          return { x: 10, y: 9 };
      }

      return currentPos;
    },
    [personality]
  );

  // Determine AI mode based on game state
  const determineAIMode = useCallback((currentMode: AIMode): AIMode => {
    const { isVulnerable } = optionsRef.current;

    // If vulnerable, switch to flee mode
    if (isVulnerable && currentMode !== 'flee') {
      return 'flee';
    }

    // If not vulnerable and was fleeing, switch to chase
    if (!isVulnerable && currentMode === 'flee') {
      return 'chase';
    }

    // Mode switching logic (simplified)
    const now = Date.now();
    const modeTime = now % 20000; // 20 second cycle

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
      const validDirections = getValidDirections(currentState.position);

      if (validDirections.length === 0) {
        return currentState.direction;
      }

      // Avoid reversing direction unless necessary
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

      // Use pathfinding to target
      const pathDirection = findPathToTarget(
        currentState.position,
        currentState.targetPosition
      );

      if (pathDirection && directionsToConsider.includes(pathDirection)) {
        return pathDirection;
      }

      // Fallback to random valid direction
      return directionsToConsider[
        Math.floor(Math.random() * directionsToConsider.length)
      ];
    },
    [getValidDirections, findPathToTarget]
  );

  // Update AI state
  const updateAI = useCallback(() => {
    setAIState((prevState) => {
      const now = Date.now();

      // Determine current mode
      const newMode = determineAIMode(prevState.mode);
      const modeChanged = newMode !== prevState.mode;

      // Get target position for current mode
      const newTarget = getTargetPosition(newMode, prevState.position);

      // Check if we need to change direction
      const shouldChangeDirection =
        modeChanged ||
        now - prevState.lastDirectionChange > 1000 || // Change direction every second
        !isValidPosition(
          getNextPosition(prevState.position, prevState.direction).x,
          getNextPosition(prevState.position, prevState.direction).y
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

        // Notify about direction change
        if (
          optionsRef.current.onDirectionChange &&
          newDirection !== prevState.direction
        ) {
          optionsRef.current.onDirectionChange(ghostId, newDirection);
        }
      }

      // Move to next position
      const nextPos = getNextPosition(prevState.position, newDirection);
      const canMove = isValidPosition(nextPos.x, nextPos.y);

      let newPosition = prevState.position;
      if (canMove) {
        newPosition = nextPos;

        // Notify about position change
        if (optionsRef.current.onPositionChange) {
          optionsRef.current.onPositionChange(ghostId, newPosition);
        }
      }

      // Notify about mode change
      if (modeChanged && optionsRef.current.onModeChange) {
        optionsRef.current.onModeChange(ghostId, newMode);
      }

      return {
        position: newPosition,
        direction: newDirection,
        mode: newMode,
        targetPosition: newTarget,
        lastDirectionChange: newLastDirectionChange,
        pathfindingCooldown: Math.max(0, prevState.pathfindingCooldown - 1),
      };
    });
  }, [
    determineAIMode,
    getTargetPosition,
    chooseNextDirection,
    getNextPosition,
    isValidPosition,
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
  }, []);

  // Reset AI to initial state
  const resetAI = useCallback(() => {
    stopAI();
    setAIState({
      position: initialPosition,
      direction: initialDirection,
      mode: 'scatter',
      targetPosition: initialPosition,
      lastDirectionChange: 0,
      pathfindingCooldown: 0,
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
          targetPosition: getTargetPosition(newMode, prevState.position),
        };
      }
      return prevState;
    });
  }, [isVulnerable, determineAIMode, getTargetPosition]);

  return {
    position: aiState.position,
    direction: aiState.direction,
    mode: aiState.mode,
    targetPosition: aiState.targetPosition,
    startAI,
    stopAI,
    resetAI,
    // Utility functions for external use
    isValidPosition: (x: number, y: number) => isValidPosition(x, y),
    getValidDirections: () => getValidDirections(aiState.position),
    getManhattanDistance,
  };
};
