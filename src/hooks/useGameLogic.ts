import { useCallback, useEffect, useRef } from 'react';
import { useGameContext } from '../context/GameContext';
import { useGameState } from './useGameState';
import { calculateGhostPoints } from '../utils/gameUtils';
import type { Position, GhostState, GameStatus } from '../types';

interface UseGameLogicOptions {
  onPacmanGhostCollision?: (ghost: GhostState, pacmanPos: Position) => void;
  onGhostEaten?: (ghost: GhostState, points: number) => void;
  onRoundComplete?: () => void;
  onGameComplete?: () => void;
  onGameOver?: () => void;
  onLifeLost?: () => void;
}

interface UseGameLogicReturn {
  // Collision detection
  checkPacmanGhostCollisions: (pacmanPos: Position, ghosts: GhostState[]) => {
    hasCollision: boolean;
    collidedGhost?: GhostState;
  };
  
  // Victory conditions
  checkVictoryCondition: () => boolean;
  checkRoundCompleteCondition: () => boolean;
  checkGameCompleteCondition: () => boolean;
  
  // Game state management
  handleGameOver: (reason?: 'collision' | 'no-lives') => void;
  handleRoundComplete: () => void;
  handleGameComplete: () => void;
  handleLifeLost: (reason?: string) => void;
  
  // Ghost interactions
  handleGhostCollision: (ghost: GhostState, pacmanPos: Position) => void;
  eatGhost: (ghost: GhostState, pacmanPos: Position) => number;
  
  // Game flow control
  processGameTick: (pacmanPos: Position, ghosts: GhostState[]) => void;
  resetGameLogic: () => void;
  
  // Game statistics
  getGameStatistics: () => {
    totalDotsCollected: number;
    totalGhostsEaten: number;
    totalScore: number;
    roundsCompleted: number;
    livesUsed: number;
    gameTime: number;
  };
}

const COLLISION_THRESHOLD = 0.6; // How close characters need to be for collision
const INVINCIBILITY_DURATION = 1000; // 1 second invincibility after life lost
const LIFE_LOST_DELAY = 500; // Delay before respawn after life lost

export const useGameLogic = (options: UseGameLogicOptions = {}): UseGameLogicReturn => {
  const { state, actions } = useGameContext();
  const gameState = useGameState();
  
  const invincibilityRef = useRef<boolean>(false);
  const invincibilityTimerRef = useRef<number | null>(null);
  const lifeRespawnTimerRef = useRef<number | null>(null);

  // Collision detection between Pacman and ghosts
  const checkPacmanGhostCollisions = useCallback((pacmanPos: Position, ghosts: GhostState[]) => {
    for (const ghost of ghosts) {
      const distance = Math.sqrt(
        Math.pow(pacmanPos.x - ghost.x, 2) + Math.pow(pacmanPos.y - ghost.y, 2)
      );
      
      if (distance <= COLLISION_THRESHOLD) {
        return {
          hasCollision: true,
          collidedGhost: ghost,
        };
      }
    }
    
    return { hasCollision: false };
  }, []);

  // Victory condition checks
  const checkVictoryCondition = useCallback(() => {
    return state.dots.size === 0 && state.powerPellets.size === 0;
  }, [state.dots.size, state.powerPellets.size]);

  const checkRoundCompleteCondition = useCallback(() => {
    return checkVictoryCondition() && state.round.current < state.round.max;
  }, [checkVictoryCondition, state.round.current, state.round.max]);

  const checkGameCompleteCondition = useCallback(() => {
    return checkVictoryCondition() && state.round.current >= state.round.max;
  }, [checkVictoryCondition, state.round.current, state.round.max]);

  // Handle ghost collision based on power mode
  const handleGhostCollision = useCallback((ghost: GhostState, pacmanPos: Position) => {
    // Skip collision if invincible
    if (invincibilityRef.current) {
      return;
    }

    if (state.powerMode.isActive && ghost.isVulnerable) {
      // Ghost is vulnerable - eat it
      const points = eatGhost(ghost, pacmanPos);
      options.onGhostEaten?.(ghost, points);
      
      // Update ghost state to eaten/fleeing
      const updatedGhosts = state.ghosts.map(g => 
        g.id === ghost.id 
          ? { ...g, isVulnerable: false, isFlashing: false }
          : g
      );
      actions.updateGhosts(updatedGhosts);
    } else {
      // Normal collision - lose life
      handleLifeLost('ghost-collision');
      options.onPacmanGhostCollision?.(ghost, pacmanPos);
    }
  }, [state.powerMode.isActive, state.ghosts, actions, options]);

  // Eat a vulnerable ghost
  const eatGhost = useCallback((ghost: GhostState, pacmanPos: Position): number => {
    const ghostIndex = state.powerMode.ghostsEaten;
    const points = calculateGhostPoints(ghostIndex);
    
    // Add score
    gameState.addScore(points, `Ate ${ghost.color} ghost`);
    
    // Update power mode ghost count
    actions.updatePowerMode({ ghostsEaten: ghostIndex + 1 });
    
    return points;
  }, [state.powerMode.ghostsEaten, gameState, actions]);

  // Handle life lost
  const handleLifeLost = useCallback((reason?: string) => {
    if (invincibilityRef.current) {
      return; // Already processing life loss
    }

    // Set invincibility
    invincibilityRef.current = true;
    
    // Clear existing timers
    if (invincibilityTimerRef.current) {
      clearTimeout(invincibilityTimerRef.current);
    }
    if (lifeRespawnTimerRef.current) {
      clearTimeout(lifeRespawnTimerRef.current);
    }

    // Pause game temporarily
    if (state.gameStatus === 'playing') {
      actions.pauseGame();
    }

    // Process life loss after delay
    lifeRespawnTimerRef.current = window.setTimeout(() => {
      gameState.loseLife();
      options.onLifeLost?.();
      
      // Check for game over
      if (state.lives - 1 <= 0) {
        handleGameOver('no-lives');
      } else {
        // Resume game and set invincibility
        if (state.gameStatus === 'paused') {
          actions.resumeGame();
        }
        
        // Reset positions (would need to be implemented in actual game)
        // This would typically reset Pacman and ghost positions
        
        // Set invincibility timer
        invincibilityTimerRef.current = window.setTimeout(() => {
          invincibilityRef.current = false;
        }, INVINCIBILITY_DURATION);
      }
      
      lifeRespawnTimerRef.current = null;
    }, LIFE_LOST_DELAY);
  }, [state.gameStatus, state.lives, gameState, actions, options]);

  // Handle game over
  const handleGameOver = useCallback((reason: 'collision' | 'no-lives' = 'no-lives') => {
    gameState.endGame('game-over');
    invincibilityRef.current = false;
    
    // Clear timers
    if (invincibilityTimerRef.current) {
      clearTimeout(invincibilityTimerRef.current);
      invincibilityTimerRef.current = null;
    }
    if (lifeRespawnTimerRef.current) {
      clearTimeout(lifeRespawnTimerRef.current);
      lifeRespawnTimerRef.current = null;
    }
    
    options.onGameOver?.();
  }, [gameState, options]);

  // Handle round completion
  const handleRoundComplete = useCallback(() => {
    if (checkGameCompleteCondition()) {
      handleGameComplete();
    } else {
      actions.endGame('round-complete');
      
      // Advance to next round after delay
      setTimeout(() => {
        gameState.nextRound();
        // Reset collectibles would happen in the next round initialization
      }, 2000);
      
      options.onRoundComplete?.();
    }
  }, [checkGameCompleteCondition, actions, gameState, options]);

  // Handle game completion
  const handleGameComplete = useCallback(() => {
    gameState.endGame('victory');
    
    // Calculate bonus points for completion
    const bonusPoints = gameState.gameState.lives * 1000; // Bonus for remaining lives
    if (bonusPoints > 0) {
      gameState.addScore(bonusPoints, 'Completion bonus');
    }
    
    options.onGameComplete?.();
  }, [gameState, options]);

  // Main game tick processing
  const processGameTick = useCallback((pacmanPos: Position, ghosts: GhostState[]) => {
    // Skip processing if game is not playing
    if (state.gameStatus !== 'playing') {
      return;
    }

    // Check for ghost collisions
    const collisionResult = checkPacmanGhostCollisions(pacmanPos, ghosts);
    if (collisionResult.hasCollision && collisionResult.collidedGhost) {
      handleGhostCollision(collisionResult.collidedGhost, pacmanPos);
    }

    // Check for victory conditions
    if (checkVictoryCondition()) {
      if (checkGameCompleteCondition()) {
        handleGameComplete();
      } else if (checkRoundCompleteCondition()) {
        handleRoundComplete();
      }
    }
  }, [
    state.gameStatus,
    checkPacmanGhostCollisions,
    handleGhostCollision,
    checkVictoryCondition,
    checkGameCompleteCondition,
    checkRoundCompleteCondition,
    handleGameComplete,
    handleRoundComplete,
  ]);

  // Reset game logic state
  const resetGameLogic = useCallback(() => {
    invincibilityRef.current = false;
    
    if (invincibilityTimerRef.current) {
      clearTimeout(invincibilityTimerRef.current);
      invincibilityTimerRef.current = null;
    }
    if (lifeRespawnTimerRef.current) {
      clearTimeout(lifeRespawnTimerRef.current);
      lifeRespawnTimerRef.current = null;
    }
  }, []);

  // Get game statistics
  const getGameStatistics = useCallback(() => {
    const totalDots = 244; // Standard Pacman maze dot count
    const totalDotsCollected = totalDots - state.dots.size;
    
    return {
      totalDotsCollected,
      totalGhostsEaten: state.powerMode.ghostsEaten,
      totalScore: state.score.current,
      roundsCompleted: state.round.current - 1,
      livesUsed: 3 - state.lives, // Assuming 3 starting lives
      gameTime: gameState.getGameDuration(),
    };
  }, [state, gameState]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (invincibilityTimerRef.current) {
        clearTimeout(invincibilityTimerRef.current);
      }
      if (lifeRespawnTimerRef.current) {
        clearTimeout(lifeRespawnTimerRef.current);
      }
    };
  }, []);

  return {
    // Collision detection
    checkPacmanGhostCollisions,
    
    // Victory conditions
    checkVictoryCondition,
    checkRoundCompleteCondition,
    checkGameCompleteCondition,
    
    // Game state management
    handleGameOver,
    handleRoundComplete,
    handleGameComplete,
    handleLifeLost,
    
    // Ghost interactions
    handleGhostCollision,
    eatGhost,
    
    // Game flow control
    processGameTick,
    resetGameLogic,
    
    // Game statistics
    getGameStatistics,
  };
};
