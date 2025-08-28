import { useState, useEffect, useCallback, useRef } from 'react';
import type { PowerModeState } from '../types';

interface UsePowerModeOptions {
  duration?: number; // Duration in milliseconds (default: 10 seconds)
  onPowerModeStart?: () => void;
  onPowerModeEnd?: () => void;
  onGhostEaten?: (ghostsEaten: number, points: number) => void;
}

interface UsePowerModeReturn {
  powerMode: PowerModeState;
  activatePowerMode: () => void;
  deactivatePowerMode: () => void;
  eatGhost: () => number; // Returns points earned
  resetPowerMode: () => void;
  isFlashingPhase: boolean; // True when power mode is about to end
}

const POWER_MODE_DURATION = 10000; // 10 seconds in milliseconds
const FLASHING_THRESHOLD = 3000; // Start flashing 3 seconds before end
const GHOST_BASE_POINTS = 200; // Base points for eating a ghost

export const usePowerMode = (
  options: UsePowerModeOptions = {}
): UsePowerModeReturn => {
  const {
    duration = POWER_MODE_DURATION,
    onPowerModeStart,
    onPowerModeEnd,
    onGhostEaten,
  } = options;

  const [powerMode, setPowerMode] = useState<PowerModeState>({
    isActive: false,
    timeRemaining: 0,
    ghostsEaten: 0,
  });

  const [isFlashingPhase, setIsFlashingPhase] = useState(false);
  const timerRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);

  // Clear timers on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Activate power mode
  const activatePowerMode = useCallback(() => {
    // Clear any existing timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Set power mode active
    setPowerMode({
      isActive: true,
      timeRemaining: duration,
      ghostsEaten: 0,
    });

    setIsFlashingPhase(false);

    // Call start callback
    if (onPowerModeStart) {
      onPowerModeStart();
    }

    // Set up countdown interval (update every 100ms for smooth countdown)
    intervalRef.current = window.setInterval(() => {
      setPowerMode((prev) => {
        const newTimeRemaining = Math.max(0, prev.timeRemaining - 100);

        // Check if we should start flashing
        if (newTimeRemaining <= FLASHING_THRESHOLD && newTimeRemaining > 0) {
          setIsFlashingPhase(true);
        }

        // If time is up, deactivate power mode
        if (newTimeRemaining <= 0) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          setIsFlashingPhase(false);

          // Call end callback
          if (onPowerModeEnd) {
            onPowerModeEnd();
          }

          return {
            isActive: false,
            timeRemaining: 0,
            ghostsEaten: prev.ghostsEaten,
          };
        }

        return {
          ...prev,
          timeRemaining: newTimeRemaining,
        };
      });
    }, 100);
  }, [duration, onPowerModeStart, onPowerModeEnd]);

  // Deactivate power mode manually
  const deactivatePowerMode = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setPowerMode((prev) => ({
      isActive: false,
      timeRemaining: 0,
      ghostsEaten: prev.ghostsEaten,
    }));

    setIsFlashingPhase(false);

    // Call end callback
    if (onPowerModeEnd) {
      onPowerModeEnd();
    }
  }, [onPowerModeEnd]);

  // Eat a ghost and calculate points
  const eatGhost = useCallback(() => {
    let pointsEarned = 0;
    let newGhostsEaten = 0;
    
    setPowerMode((prev) => {
      if (!prev.isActive) {
        return prev;
      }

      newGhostsEaten = prev.ghostsEaten + 1;

      // Points double for each ghost eaten in sequence: 200, 400, 800, 1600
      // Cap at 1600 points (4 ghosts maximum multiplier)
      const multiplier = Math.min(prev.ghostsEaten, 3);
      pointsEarned = GHOST_BASE_POINTS * Math.pow(2, multiplier);

      return {
        ...prev,
        ghostsEaten: newGhostsEaten,
      };
    });

    // Call ghost eaten callback
    if (onGhostEaten) {
      onGhostEaten(newGhostsEaten, pointsEarned);
    }

    return pointsEarned;
  }, [onGhostEaten]);

  // Reset power mode to initial state
  const resetPowerMode = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    setPowerMode({
      isActive: false,
      timeRemaining: 0,
      ghostsEaten: 0,
    });

    setIsFlashingPhase(false);
  }, []);

  return {
    powerMode,
    activatePowerMode,
    deactivatePowerMode,
    eatGhost,
    resetPowerMode,
    isFlashingPhase,
  };
};
