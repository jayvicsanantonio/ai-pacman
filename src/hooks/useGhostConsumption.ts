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
      return ghosts.map((ghost) => ({
        ...ghost,
        isVulnerable: isPowerModeActive,
        isFlashing: isPowerModeActive && isFlashingPhase,
      }));
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
        // Check if Pacman and ghost are at the same position
        const isColliding =
          pacmanPosition.x === ghost.x && pacmanPosition.y === ghost.y;

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

          // Temporarily remove ghost (or move to ghost house)
          // For now, we'll move the ghost back to the ghost house
          updatedGhosts.push({
            ...ghost,
            x: 10, // Ghost house x position
            y: 9, // Ghost house y position
            isVulnerable: false,
            isFlashing: false,
            direction: 'up', // Reset direction
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
