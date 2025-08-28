import { useCallback } from 'react';
import type { Position, GhostState } from '../types';
import { useCollisionDetection } from './useCollisionDetection';
import { useCollectibles } from './useCollectibles';
import { useScore } from './useScore';

interface GameCollisionOptions {
  maze: number[][];
  initialDots: Set<string>;
  initialPowerPellets: Set<string>;
  onDotCollected?: (position: Position, points: number) => void;
  onPowerPelletCollected?: (position: Position, points: number) => void;
  onGhostCollision?: (ghost: GhostState, position: Position) => void;
  onAllDotsCollected?: () => void;
  onScoreChange?: (score: number) => void;
  onHighScoreChange?: (highScore: number) => void;
  onNewHighScore?: () => void;
}

interface CollisionCheckResult {
  canMove: boolean;
  collectedItem?: {
    type: 'dot' | 'powerPellet';
    points: number;
    position: Position;
  };
  ghostCollision?: {
    ghost: GhostState;
    position: Position;
  };
}

export const useGameCollision = ({
  maze,
  initialDots,
  initialPowerPellets,
  onDotCollected,
  onPowerPelletCollected,
  onGhostCollision,
  onAllDotsCollected,
  onScoreChange,
  onHighScoreChange,
  onNewHighScore,
}: GameCollisionOptions) => {
  // Initialize collision detection
  const collisionDetection = useCollisionDetection({ maze });

  // Initialize collectibles management
  const collectibles = useCollectibles(initialDots, initialPowerPellets, {
    onDotCollected: (position, points) => {
      score.collectDot(position, collectibles.dots);
      if (onDotCollected) {
        onDotCollected(position, points);
      }
    },
    onPowerPelletCollected: (position, points) => {
      score.collectPowerPellet(position, collectibles.powerPellets);
      if (onPowerPelletCollected) {
        onPowerPelletCollected(position, points);
      }
    },
    onAllDotsCollected,
  });

  // Initialize score management
  const score = useScore({
    onScoreChange,
    onHighScoreChange,
    onNewHighScore,
  });

  // Check if Pacman can move to a position and handle collections
  const checkPacmanMovement = useCallback(
    (targetPos: Position, ghosts: GhostState[]): CollisionCheckResult => {
      // Check wall collision first
      const wallCollision = collisionDetection.checkWallCollision(targetPos);
      if (wallCollision.hasCollision) {
        return { canMove: false };
      }

      // Check ghost collision
      const ghostCollision = collisionDetection.checkPacmanGhostCollisions(
        targetPos,
        ghosts
      );
      if (ghostCollision.hasCollision) {
        const ghost = (ghostCollision.collisionData as { ghost: GhostState })
          ?.ghost;
        if (ghost && onGhostCollision) {
          onGhostCollision(ghost, targetPos);
        }
        return {
          canMove: true, // Pacman can move to the position, but collision occurred
          ghostCollision: {
            ghost,
            position: targetPos,
          },
        };
      }

      // Check for collectibles at the target position
      const collectionResult = collectibles.checkAndCollectAt(targetPos);

      let collectedItem;
      if (collectionResult.collected) {
        collectedItem = {
          type: collectionResult.itemType as 'dot' | 'powerPellet',
          points: collectionResult.points,
          position: targetPos,
        };
      }

      return {
        canMove: true,
        collectedItem,
      };
    },
    [collisionDetection, collectibles, onGhostCollision]
  );

  // Check if a ghost can move to a position
  const checkGhostMovement = useCallback(
    (targetPos: Position): boolean => {
      return collisionDetection.canMoveTo(targetPos, 'ghost');
    },
    [collisionDetection]
  );

  // Handle Pacman eating a vulnerable ghost
  const eatGhost = useCallback(() => {
    const result = score.collectGhost();
    return {
      points: result.points,
      newScore: result.newScore,
      consecutiveGhosts: score.consecutiveGhosts,
    };
  }, [score]);

  // Reset game collision state
  const resetGameCollision = useCallback(() => {
    collectibles.resetCollectibles(initialDots, initialPowerPellets);
    score.resetScore();
  }, [collectibles, score, initialDots, initialPowerPellets]);

  // Get current game state
  const getGameState = useCallback(() => {
    return {
      score: score.score,
      highScore: score.highScore,
      dotsRemaining: collectibles.getTotalDotsRemaining(),
      powerPelletsRemaining: collectibles.getTotalPowerPelletsRemaining(),
      totalCollectiblesRemaining: collectibles.getTotalCollectiblesRemaining(),
      isAllDotsCollected: collectibles.isAllDotsCollected(),
      consecutiveGhosts: score.consecutiveGhosts,
      isNewHighScore: score.isNewHighScore(),
    };
  }, [score, collectibles]);

  return {
    // Collision detection
    checkPacmanMovement,
    checkGhostMovement,
    eatGhost,

    // Collectibles
    dots: collectibles.dots,
    powerPellets: collectibles.powerPellets,
    hasDotAt: collectibles.hasDotAt,
    hasPowerPelletAt: collectibles.hasPowerPelletAt,
    hasCollectibleAt: collectibles.hasCollectibleAt,

    // Score
    score: score.score,
    highScore: score.highScore,
    addPoints: score.addPoints,
    setHighScore: score.setHighScore,

    // Game state
    getGameState,
    resetGameCollision,

    // Utilities
    isWithinBounds: collisionDetection.isWithinBounds,
    isValidPosition: collisionDetection.isValidPosition,
    getValidAdjacentPositions: collisionDetection.getValidAdjacentPositions,
  };
};
