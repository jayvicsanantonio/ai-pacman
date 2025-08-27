import { useState, useCallback } from 'react';

interface UseCollectiblesReturn {
  dots: Set<string>;
  powerPellets: Set<string>;
  collectDot: (x: number, y: number) => void;
  collectPowerPellet: (x: number, y: number) => void;
  resetCollectibles: (
    initialDots: Set<string>,
    initialPowerPellets: Set<string>
  ) => void;
  getTotalDotsRemaining: () => number;
  getTotalPowerPelletsRemaining: () => number;
}

export const useCollectibles = (
  initialDots: Set<string> = new Set(),
  initialPowerPellets: Set<string> = new Set()
): UseCollectiblesReturn => {
  const [dots, setDots] = useState<Set<string>>(new Set(initialDots));
  const [powerPellets, setPowerPellets] = useState<Set<string>>(
    new Set(initialPowerPellets)
  );

  const collectDot = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    setDots((prev) => {
      const newDots = new Set(prev);
      newDots.delete(key);
      return newDots;
    });
  }, []);

  const collectPowerPellet = useCallback((x: number, y: number) => {
    const key = `${x},${y}`;
    setPowerPellets((prev) => {
      const newPowerPellets = new Set(prev);
      newPowerPellets.delete(key);
      return newPowerPellets;
    });
  }, []);

  const resetCollectibles = useCallback(
    (newInitialDots: Set<string>, newInitialPowerPellets: Set<string>) => {
      setDots(new Set(newInitialDots));
      setPowerPellets(new Set(newInitialPowerPellets));
    },
    []
  );

  const getTotalDotsRemaining = useCallback(() => {
    return dots.size;
  }, [dots]);

  const getTotalPowerPelletsRemaining = useCallback(() => {
    return powerPellets.size;
  }, [powerPellets]);

  return {
    dots,
    powerPellets,
    collectDot,
    collectPowerPellet,
    resetCollectibles,
    getTotalDotsRemaining,
    getTotalPowerPelletsRemaining,
  };
};
