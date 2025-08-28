import { useCallback, useEffect, useState } from 'react';
import { useGameContext } from '../context/GameContext';
import { useLocalStorage } from './useLocalStorage';
import type { GameState, GhostState, Position } from '../types';

interface UseGameStateOptions {
  autoSaveHighScore?: boolean;
  powerModeDuration?: number;
  maxLives?: number;
  pointsPerDot?: number;
  pointsPerPowerPellet?: number;
  ghostPoints?: number[];
}

interface UseGameStateReturn {
  // Core game state
  gameState: GameState & { gameTime: number; roundStartTime: number };
  
  // Game controls
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  restartGame: () => void;
  endGame: (reason: 'game-over' | 'victory' | 'quit') => void;
  
  // Round management
  nextRound: () => void;
  isRoundComplete: () => boolean;
  isGameComplete: () => boolean;
  
  // Score management
  addScore: (points: number, reason?: string) => void;
  
  // Life management
  loseLife: () => void;
  addLife: () => void;
  
  // Pacman state management
  updatePacmanPosition: (position: Position) => void;
  updatePacmanDirection: (direction: GameState['pacman']['direction']) => void;
  setPacmanMoving: (isMoving: boolean) => void;
  setPacmanEating: (isEating: boolean, duration?: number) => void;
  
  // Ghost state management
  updateGhosts: (ghosts: GhostState[]) => void;
  
  // Power mode management
  activatePowerMode: (duration?: number) => void;
  deactivatePowerMode: () => void;
  isInPowerMode: () => boolean;
  
  // Collectibles management
  collectDot: (position: Position) => void;
  collectPowerPellet: (position: Position) => void;
  resetCollectibles: (dots: Set<string>, powerPellets: Set<string>) => void;
  areAllCollectiblesCollected: () => boolean;
  
  // Game statistics
  getGameDuration: () => number;
  getRoundDuration: () => number;
  getScoreMultiplier: () => number;
}

const defaultOptions: UseGameStateOptions = {
  autoSaveHighScore: true,
  powerModeDuration: 8000,
  maxLives: 3,
  pointsPerDot: 10,
  pointsPerPowerPellet: 50,
  ghostPoints: [200, 400, 800, 1600],
};

export const useGameState = (options: UseGameStateOptions = {}): UseGameStateReturn => {
  const opts = { ...defaultOptions, ...options };
  const { state, actions } = useGameContext();
  const [highScore, setHighScore] = useLocalStorage<number>('pacman-high-score', 0);
  const [eatingTimeoutId, setEatingTimeoutId] = useState<number | null>(null);

  // Auto-save high score when it changes
  useEffect(() => {
    if (opts.autoSaveHighScore && state.score.current > highScore) {
      setHighScore(state.score.current);
      actions.updateHighScore(state.score.current);
    }
  }, [state.score.current, highScore, setHighScore, actions.updateHighScore, opts.autoSaveHighScore]);

  // Load saved high score on mount
  useEffect(() => {
    if (opts.autoSaveHighScore && highScore > state.score.high) {
      actions.updateHighScore(highScore);
    }
  }, []);

  // Game controls
  const startGame = useCallback(() => {
    actions.startGame();
  }, [actions]);

  const pauseGame = useCallback(() => {
    actions.pauseGame();
  }, [actions]);

  const resumeGame = useCallback(() => {
    actions.resumeGame();
  }, [actions]);

  const restartGame = useCallback(() => {
    actions.restartGame();
  }, [actions]);

  const endGame = useCallback((reason: 'game-over' | 'victory' | 'quit') => {
    actions.endGame(reason);
  }, [actions]);

  // Round management
  const nextRound = useCallback(() => {
    actions.nextRound();
  }, [actions]);

  const isRoundComplete = useCallback(() => {
    return state.gameStatus === 'round-complete' || 
           areAllCollectiblesCollected();
  }, [state.gameStatus, state.dots, state.powerPellets]);

  const isGameComplete = useCallback(() => {
    return state.gameStatus === 'game-complete' || 
           state.round.current >= state.round.max;
  }, [state.gameStatus, state.round.current, state.round.max]);

  // Score management
  const addScore = useCallback((points: number, reason?: string) => {
    const multiplier = getScoreMultiplier();
    const finalPoints = Math.floor(points * multiplier);
    actions.updateScore(finalPoints, reason);
  }, [actions, state.powerMode]);

  const getScoreMultiplier = useCallback(() => {
    if (state.powerMode.isActive) {
      return Math.min(4, 1 + (state.powerMode.ghostsEaten * 0.5));
    }
    return 1;
  }, [state.powerMode.isActive, state.powerMode.ghostsEaten]);

  // Life management
  const loseLife = useCallback(() => {
    const newLives = Math.max(0, state.lives - 1);
    actions.updateLives(newLives);
    
    if (newLives === 0) {
      endGame('game-over');
    }
  }, [state.lives, actions, endGame]);

  const addLife = useCallback(() => {
    const newLives = Math.min(opts.maxLives || 3, state.lives + 1);
    actions.updateLives(newLives);
  }, [state.lives, actions, opts.maxLives]);

  // Pacman state management
  const updatePacmanPosition = useCallback((position: Position) => {
    actions.updatePacman({ x: position.x, y: position.y });
  }, [actions]);

  const updatePacmanDirection = useCallback((direction: GameState['pacman']['direction']) => {
    actions.updatePacman({ direction });
  }, [actions]);

  const setPacmanMoving = useCallback((isMoving: boolean) => {
    actions.updatePacman({ isMoving });
  }, [actions]);

  const setPacmanEating = useCallback((isEating: boolean, duration: number = 300) => {
    actions.updatePacman({ isEating });
    
    // Clear existing timeout
    if (eatingTimeoutId) {
      clearTimeout(eatingTimeoutId);
    }
    
    if (isEating) {
      // Auto-stop eating after duration
      const timeoutId = window.setTimeout(() => {
        actions.updatePacman({ isEating: false });
        setEatingTimeoutId(null);
      }, duration);
      
      setEatingTimeoutId(timeoutId);
    }
  }, [actions, eatingTimeoutId]);

  // Ghost state management
  const updateGhosts = useCallback((ghosts: GhostState[]) => {
    actions.updateGhosts(ghosts);
  }, [actions]);

  // Power mode management
  const activatePowerMode = useCallback((duration: number = opts.powerModeDuration || 8000) => {
    actions.activatePowerMode(duration);
  }, [actions, opts.powerModeDuration]);

  const deactivatePowerMode = useCallback(() => {
    actions.deactivatePowerMode();
  }, [actions]);

  const isInPowerMode = useCallback(() => {
    return state.powerMode.isActive;
  }, [state.powerMode.isActive]);

  // Collectibles management
  const collectDot = useCallback((position: Position) => {
    const points = opts.pointsPerDot || 10;
    actions.collectDot(position, points);
    setPacmanEating(true, 200);
    
    // Check for round completion
    if (state.dots.size === 1 && state.powerPellets.size === 0) {
      // This was the last collectible
      setTimeout(() => {
        if (isGameComplete()) {
          endGame('victory');
        } else {
          nextRound();
        }
      }, 500); // Small delay for visual effect
    }
  }, [actions, opts.pointsPerDot, setPacmanEating, state.dots.size, state.powerPellets.size]);

  const collectPowerPellet = useCallback((position: Position) => {
    const points = opts.pointsPerPowerPellet || 50;
    actions.collectPowerPellet(position, points);
    setPacmanEating(true, 400);
    activatePowerMode();
    
    // Check for round completion
    if (state.powerPellets.size === 1 && state.dots.size === 0) {
      // This was the last collectible
      setTimeout(() => {
        if (isGameComplete()) {
          endGame('victory');
        } else {
          nextRound();
        }
      }, 500); // Small delay for visual effect
    }
  }, [actions, opts.pointsPerPowerPellet, setPacmanEating, activatePowerMode, state.dots.size, state.powerPellets.size]);

  const resetCollectibles = useCallback((dots: Set<string>, powerPellets: Set<string>) => {
    actions.resetCollectibles(dots, powerPellets);
  }, [actions]);

  const areAllCollectiblesCollected = useCallback(() => {
    return state.dots.size === 0 && state.powerPellets.size === 0;
  }, [state.dots.size, state.powerPellets.size]);

  // Game statistics
  const getGameDuration = useCallback(() => {
    if (state.gameTime === 0) return 0;
    return Date.now() - state.gameTime;
  }, [state.gameTime]);

  const getRoundDuration = useCallback(() => {
    if (state.roundStartTime === 0) return 0;
    return Date.now() - state.roundStartTime;
  }, [state.roundStartTime]);

  // Cleanup eating timeout on unmount
  useEffect(() => {
    return () => {
      if (eatingTimeoutId) {
        clearTimeout(eatingTimeoutId);
      }
    };
  }, [eatingTimeoutId]);

  return {
    gameState: state,
    
    // Game controls
    startGame,
    pauseGame,
    resumeGame,
    restartGame,
    endGame,
    
    // Round management
    nextRound,
    isRoundComplete,
    isGameComplete,
    
    // Score management
    addScore,
    
    // Life management
    loseLife,
    addLife,
    
    // Pacman state management
    updatePacmanPosition,
    updatePacmanDirection,
    setPacmanMoving,
    setPacmanEating,
    
    // Ghost state management
    updateGhosts,
    
    // Power mode management
    activatePowerMode,
    deactivatePowerMode,
    isInPowerMode,
    
    // Collectibles management
    collectDot,
    collectPowerPellet,
    resetCollectibles,
    areAllCollectiblesCollected,
    
    // Game statistics
    getGameDuration,
    getRoundDuration,
    getScoreMultiplier,
  };
};
