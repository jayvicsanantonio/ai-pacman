import { useState, useCallback, useEffect } from 'react';
import type { Position } from '../types';

interface ScoreState {
  current: number;
  high: number;
}

interface ScoreConfig {
  dotPoints: number;
  powerPelletPoints: number;
  ghostPoints: number;
  bonusGhostMultiplier: number; // Multiplier for consecutive ghost eating
}

interface UseScoreOptions {
  initialScore?: number;
  initialHighScore?: number;
  config?: Partial<ScoreConfig>;
  onScoreChange?: (score: number) => void;
  onHighScoreChange?: (highScore: number) => void;
  onNewHighScore?: () => void;
}

interface DotCollectionResult {
  collected: boolean;
  points: number;
  newScore: number;
}

const DEFAULT_CONFIG: ScoreConfig = {
  dotPoints: 10,
  powerPelletPoints: 50,
  ghostPoints: 200,
  bonusGhostMultiplier: 2,
};

export const useScore = ({
  initialScore = 0,
  initialHighScore = 0,
  config = {},
  onScoreChange,
  onHighScoreChange,
  onNewHighScore,
}: UseScoreOptions = {}) => {
  const [scoreState, setScoreState] = useState<ScoreState>({
    current: initialScore,
    high: initialHighScore,
  });

  const [consecutiveGhosts, setConsecutiveGhosts] = useState(0);
  const scoreConfig = { ...DEFAULT_CONFIG, ...config };

  // Update high score when current score changes
  useEffect(() => {
    if (scoreState.current > scoreState.high) {
      setScoreState((prev) => ({
        ...prev,
        high: prev.current,
      }));

      // Notify about new high score
      if (onNewHighScore) {
        onNewHighScore();
      }

      if (onHighScoreChange) {
        onHighScoreChange(scoreState.current);
      }
    }
  }, [scoreState.current, scoreState.high, onNewHighScore, onHighScoreChange]);

  // Notify about score changes
  useEffect(() => {
    if (onScoreChange) {
      onScoreChange(scoreState.current);
    }
  }, [scoreState.current, onScoreChange]);

  // Add points to the current score
  const addPoints = useCallback(
    (points: number): number => {
      setScoreState((prev) => ({
        ...prev,
        current: prev.current + points,
      }));
      return scoreState.current + points;
    },
    [scoreState.current]
  );

  // Collect a dot and add points
  const collectDot = useCallback(
    (position: Position, dots: Set<string>): DotCollectionResult => {
      const positionKey = `${position.x},${position.y}`;

      if (dots.has(positionKey)) {
        const points = scoreConfig.dotPoints;
        const newScore = addPoints(points);

        return {
          collected: true,
          points,
          newScore,
        };
      }

      return {
        collected: false,
        points: 0,
        newScore: scoreState.current,
      };
    },
    [addPoints, scoreConfig.dotPoints, scoreState.current]
  );

  // Collect a power pellet and add points
  const collectPowerPellet = useCallback(
    (position: Position, powerPellets: Set<string>): DotCollectionResult => {
      const positionKey = `${position.x},${position.y}`;

      if (powerPellets.has(positionKey)) {
        const points = scoreConfig.powerPelletPoints;
        const newScore = addPoints(points);

        // Reset consecutive ghost counter when power pellet is collected
        setConsecutiveGhosts(0);

        return {
          collected: true,
          points,
          newScore,
        };
      }

      return {
        collected: false,
        points: 0,
        newScore: scoreState.current,
      };
    },
    [addPoints, scoreConfig.powerPelletPoints, scoreState.current]
  );

  // Collect a ghost and add points with multiplier
  const collectGhost = useCallback((): DotCollectionResult => {
    const basePoints = scoreConfig.ghostPoints;
    const multiplier = Math.pow(
      scoreConfig.bonusGhostMultiplier,
      consecutiveGhosts
    );
    const points = basePoints * multiplier;
    const newScore = addPoints(points);

    // Increment consecutive ghost counter
    setConsecutiveGhosts((prev) => prev + 1);

    return {
      collected: true,
      points,
      newScore,
    };
  }, [
    addPoints,
    scoreConfig.ghostPoints,
    scoreConfig.bonusGhostMultiplier,
    consecutiveGhosts,
    scoreState.current,
  ]);

  // Reset consecutive ghost counter (called when power mode ends)
  const resetGhostMultiplier = useCallback(() => {
    setConsecutiveGhosts(0);
  }, []);

  // Reset score to initial values
  const resetScore = useCallback(() => {
    setScoreState({
      current: initialScore,
      high: scoreState.high, // Keep high score
    });
    setConsecutiveGhosts(0);
  }, [initialScore, scoreState.high]);

  // Set high score manually (for loading from storage)
  const setHighScore = useCallback((highScore: number) => {
    setScoreState((prev) => ({
      ...prev,
      high: Math.max(prev.high, highScore),
    }));
  }, []);

  // Check if current score is a new high score
  const isNewHighScore = useCallback(() => {
    return scoreState.current > scoreState.high;
  }, [scoreState.current, scoreState.high]);

  // Get score statistics
  const getScoreStats = useCallback(() => {
    return {
      current: scoreState.current,
      high: scoreState.high,
      consecutiveGhosts,
      isNewHigh: isNewHighScore(),
    };
  }, [scoreState.current, scoreState.high, consecutiveGhosts, isNewHighScore]);

  return {
    // Score state
    score: scoreState.current,
    highScore: scoreState.high,
    consecutiveGhosts,

    // Score actions
    addPoints,
    collectDot,
    collectPowerPellet,
    collectGhost,
    resetGhostMultiplier,
    resetScore,
    setHighScore,

    // Score utilities
    isNewHighScore,
    getScoreStats,

    // Configuration
    config: scoreConfig,
  };
};
