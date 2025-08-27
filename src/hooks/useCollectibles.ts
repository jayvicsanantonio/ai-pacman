import { useState, useCallback } from 'react';
import type { Position } from '../types';

interface CollectionResult {
  collected: boolean;
  points: number;
  itemType: 'dot' | 'powerPellet' | 'none';
}

interface UseCollectiblesOptions {
  onDotCollected?: (position: Position, points: number) => void;
  onPowerPelletCollected?: (position: Position, points: number) => void;
  onAllDotsCollected?: () => void;
}

interface UseCollectiblesReturn {
  dots: Set<string>;
  powerPellets: Set<string>;
  collectDot: (x: number, y: number) => boolean;
  collectPowerPellet: (x: number, y: number) => boolean;
  checkAndCollectAt: (position: Position) => CollectionResult;
  resetCollectibles: (
    initialDots: Set<string>,
    initialPowerPellets: Set<string>
  ) => void;
  getTotalDotsRemaining: () => number;
  getTotalPowerPelletsRemaining: () => number;
  getTotalCollectiblesRemaining: () => number;
  isAllDotsCollected: () => boolean;
  hasDotAt: (x: number, y: number) => boolean;
  hasPowerPelletAt: (x: number, y: number) => boolean;
  hasCollectibleAt: (x: number, y: number) => boolean;
}

export const useCollectibles = (
  initialDots: Set<string> = new Set(),
  initialPowerPellets: Set<string> = new Set(),
  options: UseCollectiblesOptions = {}
): UseCollectiblesReturn => {
  const [dots, setDots] = useState<Set<string>>(new Set(initialDots));
  const [powerPellets, setPowerPellets] = useState<Set<string>>(
    new Set(initialPowerPellets)
  );

  const { onDotCollected, onPowerPelletCollected, onAllDotsCollected } =
    options;

  // Check if there's a dot at the given position
  const hasDotAt = useCallback(
    (x: number, y: number): boolean => {
      const key = `${x},${y}`;
      return dots.has(key);
    },
    [dots]
  );

  // Check if there's a power pellet at the given position
  const hasPowerPelletAt = useCallback(
    (x: number, y: number): boolean => {
      const key = `${x},${y}`;
      return powerPellets.has(key);
    },
    [powerPellets]
  );

  // Check if there's any collectible at the given position
  const hasCollectibleAt = useCallback(
    (x: number, y: number): boolean => {
      return hasDotAt(x, y) || hasPowerPelletAt(x, y);
    },
    [hasDotAt, hasPowerPelletAt]
  );

  // Collect a dot at the given position
  const collectDot = useCallback(
    (x: number, y: number): boolean => {
      const key = `${x},${y}`;
      if (dots.has(key)) {
        setDots((prev) => {
          const newDots = new Set(prev);
          newDots.delete(key);
          return newDots;
        });

        // Notify about dot collection
        if (onDotCollected) {
          onDotCollected({ x, y }, 10); // Default dot points
        }

        // Check if all dots are collected
        if (dots.size === 1) {
          // This was the last dot
          if (onAllDotsCollected) {
            onAllDotsCollected();
          }
        }

        return true;
      }
      return false;
    },
    [dots, onDotCollected, onAllDotsCollected]
  );

  // Collect a power pellet at the given position
  const collectPowerPellet = useCallback(
    (x: number, y: number): boolean => {
      const key = `${x},${y}`;
      if (powerPellets.has(key)) {
        setPowerPellets((prev) => {
          const newPowerPellets = new Set(prev);
          newPowerPellets.delete(key);
          return newPowerPellets;
        });

        // Notify about power pellet collection
        if (onPowerPelletCollected) {
          onPowerPelletCollected({ x, y }, 50); // Default power pellet points
        }

        return true;
      }
      return false;
    },
    [powerPellets, onPowerPelletCollected]
  );

  // Check and collect any collectible at the given position
  const checkAndCollectAt = useCallback(
    (position: Position): CollectionResult => {
      const { x, y } = position;

      // Check for power pellet first (higher priority)
      if (hasPowerPelletAt(x, y)) {
        const collected = collectPowerPellet(x, y);
        return {
          collected,
          points: collected ? 50 : 0,
          itemType: 'powerPellet',
        };
      }

      // Check for dot
      if (hasDotAt(x, y)) {
        const collected = collectDot(x, y);
        return {
          collected,
          points: collected ? 10 : 0,
          itemType: 'dot',
        };
      }

      return {
        collected: false,
        points: 0,
        itemType: 'none',
      };
    },
    [hasPowerPelletAt, hasDotAt, collectPowerPellet, collectDot]
  );

  // Reset collectibles to initial state
  const resetCollectibles = useCallback(
    (newInitialDots: Set<string>, newInitialPowerPellets: Set<string>) => {
      setDots(new Set(newInitialDots));
      setPowerPellets(new Set(newInitialPowerPellets));
    },
    []
  );

  // Get total dots remaining
  const getTotalDotsRemaining = useCallback(() => {
    return dots.size;
  }, [dots]);

  // Get total power pellets remaining
  const getTotalPowerPelletsRemaining = useCallback(() => {
    return powerPellets.size;
  }, [powerPellets]);

  // Get total collectibles remaining
  const getTotalCollectiblesRemaining = useCallback(() => {
    return dots.size + powerPellets.size;
  }, [dots, powerPellets]);

  // Check if all dots are collected (victory condition)
  const isAllDotsCollected = useCallback(() => {
    return dots.size === 0;
  }, [dots]);

  return {
    dots,
    powerPellets,
    collectDot,
    collectPowerPellet,
    checkAndCollectAt,
    resetCollectibles,
    getTotalDotsRemaining,
    getTotalPowerPelletsRemaining,
    getTotalCollectiblesRemaining,
    isAllDotsCollected,
    hasDotAt,
    hasPowerPelletAt,
    hasCollectibleAt,
  };
};
