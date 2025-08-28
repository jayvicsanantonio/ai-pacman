import { useCallback } from 'react';
import { usePowerMode } from './usePowerMode';
import { useGhostConsumption } from './useGhostConsumption';
import type { Position, GhostState } from '../types';

interface UsePowerPelletSystemOptions {
  onPowerPelletCollected?: (position: Position, points: number) => void;
  onPowerModeStart?: () => void;
  onPowerModeEnd?: () => void;
  onGhostConsumed?: (ghost: GhostState, points: number) => void;
  onScoreUpdate?: (points: number) => void;
  powerModeDuration?: number;
}

interface UsePowerPelletSystemReturn {
  // Power mode state
  powerMode: ReturnType<typeof usePowerMode>['powerMode'];
  isFlashingPhase: boolean;

  // Actions
  handlePowerPelletCollection: (position: Position) => void;
  checkAndHandleGhostConsumption: (
    pacmanPosition: Position,
    ghosts: GhostState[]
  ) => {
    consumedGhosts: string[];
    pointsEarned: number;
    updatedGhosts: GhostState[];
  };
  updateGhostStates: (ghosts: GhostState[]) => GhostState[];
  resetPowerSystem: () => void;

  // Utilities
  isGhostVulnerable: (ghost: GhostState) => boolean;
}

export const usePowerPelletSystem = (
  options: UsePowerPelletSystemOptions = {}
): UsePowerPelletSystemReturn => {
  const {
    onPowerPelletCollected,
    onPowerModeStart,
    onPowerModeEnd,
    onGhostConsumed,
    onScoreUpdate,
    powerModeDuration,
  } = options;

  // Initialize power mode hook
  const {
    powerMode,
    activatePowerMode,
    eatGhost,
    resetPowerMode,
    isFlashingPhase,
  } = usePowerMode({
    duration: powerModeDuration,
    onPowerModeStart,
    onPowerModeEnd,
    onGhostEaten: (_ghostsEaten, points) => {
      // This callback is handled by the ghost consumption logic
      if (onScoreUpdate) {
        onScoreUpdate(points);
      }
    },
  });

  // Initialize ghost consumption hook
  const {
    checkGhostConsumption,
    isGhostVulnerable: checkGhostVulnerable,
    updateGhostVulnerability,
  } = useGhostConsumption({
    onGhostConsumed,
    onScoreUpdate,
  });

  // Handle power pellet collection
  const handlePowerPelletCollection = useCallback(
    (position: Position) => {
      // Award points for power pellet
      const powerPelletPoints = 50;
      if (onScoreUpdate) {
        onScoreUpdate(powerPelletPoints);
      }

      // Call collection callback
      if (onPowerPelletCollected) {
        onPowerPelletCollected(position, powerPelletPoints);
      }

      // Activate power mode
      activatePowerMode();
    },
    [onPowerPelletCollected, onScoreUpdate, activatePowerMode]
  );

  // Check and handle ghost consumption
  const checkAndHandleGhostConsumption = useCallback(
    (pacmanPosition: Position, ghosts: GhostState[]) => {
      return checkGhostConsumption(
        pacmanPosition,
        ghosts,
        powerMode.isActive,
        eatGhost
      );
    },
    [checkGhostConsumption, powerMode.isActive, eatGhost]
  );

  // Update ghost states based on power mode
  const updateGhostStates = useCallback(
    (ghosts: GhostState[]): GhostState[] => {
      return updateGhostVulnerability(
        ghosts,
        powerMode.isActive,
        isFlashingPhase
      );
    },
    [updateGhostVulnerability, powerMode.isActive, isFlashingPhase]
  );

  // Check if a specific ghost is vulnerable
  const isGhostVulnerable = useCallback(
    (ghost: GhostState): boolean => {
      return checkGhostVulnerable(ghost, powerMode.isActive);
    },
    [checkGhostVulnerable, powerMode.isActive]
  );

  // Reset the entire power system
  const resetPowerSystem = useCallback(() => {
    resetPowerMode();
  }, [resetPowerMode]);

  return {
    // State
    powerMode,
    isFlashingPhase,

    // Actions
    handlePowerPelletCollection,
    checkAndHandleGhostConsumption,
    updateGhostStates,
    resetPowerSystem,

    // Utilities
    isGhostVulnerable,
  };
};
