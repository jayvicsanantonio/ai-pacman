import { useCallback } from 'react';
import type { GhostState, Position } from '../types';

interface UseGhostConsumptionOptions {
  onGhostConsumed?: (ghost: GhostState, points: number) => void;
  onScoreUpdate?: (points: number) => void;
}

interface UseGhostConsumptionReturn {
  checkGhostConsumption: (
    pacmanPosition: Position,
    ghosts: GhostState[],
    isPowerModeActive: boolean,
    eatGhost: () => number
  ) => {
    consumedGhosts: string[];
    pointsEarned: number;
    updatedGhosts: GhostState[];
  };
  isGhostVulnerable: (ghost: GhostState, isPowerModeActive: boolean) => boolean;
  updateGhostVulnerability: (
    ghosts: GhostState[],
    isPowerModeActive: boolean,
    isFlashingPhase: boolean
  ) => GhostState[];
}

export const useGhostConsumption = (
  options: UseGhostConsumptionOptions = {}
): UseGhostConsumptionReturn => {
  const { onGhostConsumed, onScoreUpdate } = options;

  // Check if a ghost is vulnerable based on power mode state
  const isGhostVulnerable = useCallback(
    (ghost: GhostState, isPowerModeActive: boolean): boolean => {
      return isPowerModeActive && ghost.isVulnerable;
    },
    []
  );

  // Update ghost vulnerability states based on power mode
  const updateGhostVulnerability = useCallback(
    (
      ghosts: GhostState[],
      isPowerModeActive: boolean,
      isFlashingPhase: boolean
    ): GhostState[] => {
      return ghosts.map((ghost) => {
        // Eaten ghosts are never vulnerable and don't flash
        if (ghost.mode === 'eaten') {
          return {
            ...ghost,
            isVulnerable: false,
            isFlashing: false,
          };
        }
        
        // Other ghosts follow normal power mode rules
        return {
          ...ghost,
          isVulnerable: isPowerModeActive,
          isFlashing: isPowerModeActive && isFlashingPhase,
        };
      });
    },
    []
  );

  // Check for ghost consumption and handle the logic
  const checkGhostConsumption = useCallback(
    (
      pacmanPosition: Position,
      ghosts: GhostState[],
      isPowerModeActive: boolean,
      eatGhost: () => number
    ) => {
      const consumedGhosts: string[] = [];
      let totalPointsEarned = 0;
      const updatedGhosts: GhostState[] = [];

      ghosts.forEach((ghost) => {
        // Check collision with tolerance for speed differences
        // Allow slight position tolerance to handle 200ms vs 450ms movement timing
        const deltaX = Math.abs(pacmanPosition.x - ghost.x);
        const deltaY = Math.abs(pacmanPosition.y - ghost.y);
        const isColliding = deltaX <= 0.5 && deltaY <= 0.5;

        if (isColliding && isGhostVulnerable(ghost, isPowerModeActive)) {
          // Ghost is consumed
          consumedGhosts.push(ghost.id);

          // Get points from power mode hook
          const points = eatGhost();
          totalPointsEarned += points;

          // Call consumption callback
          if (onGhostConsumed) {
            onGhostConsumed(ghost, points);
          }

          // Transport ghost to ghost house center (classic Pacman behavior)
          updatedGhosts.push({
            ...ghost,
            x: 10, // Ghost house center x
            y: 9, // Ghost house center y 
            isVulnerable: false,
            isFlashing: false,
            direction: 'up', // Will exit upward
            mode: 'eaten', // Special mode for exiting ghost house
          });
        } else {
          // Ghost remains unchanged
          updatedGhosts.push(ghost);
        }
      });

      // Update score if points were earned
      if (totalPointsEarned > 0 && onScoreUpdate) {
        onScoreUpdate(totalPointsEarned);
      }

      return {
        consumedGhosts,
        pointsEarned: totalPointsEarned,
        updatedGhosts,
      };
    },
    [isGhostVulnerable, onGhostConsumed, onScoreUpdate]
  );

  return {
    checkGhostConsumption,
    isGhostVulnerable,
    updateGhostVulnerability,
  };
};
