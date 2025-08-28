import React, { useEffect, useCallback, useRef } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import { useGameLogic } from '../hooks/useGameLogic';
import { useGameState } from '../hooks/useGameState';
import GameOverScreen from './GameOverScreen';
import VictoryScreen from './VictoryScreen';
import GameUI from './GameUI';
import type { Position, GhostState } from '../types';

interface GameEngineProps {
  // Game components
  children?: React.ReactNode;
  
  // Game configuration
  enableCollisionDetection?: boolean;
  enableVictoryConditions?: boolean;
  enableGameOverConditions?: boolean;
  
  // Callback handlers
  onGameStart?: () => void;
  onGamePause?: () => void;
  onGameResume?: () => void;
  onGameOver?: (reason?: 'collision' | 'no-lives') => void;
  onRoundComplete?: () => void;
  onGameComplete?: () => void;
  onLifeLost?: (reason?: string) => void;
  onScoreChange?: (newScore: number, reason?: string) => void;
  onGhostEaten?: (ghost: GhostState, points: number) => void;
  
  // Position tracking (these would be provided by the main game loop)
  pacmanPosition?: Position;
  ghostPositions?: GhostState[];
  
  // Game loop control
  gameTickInterval?: number;
  autoProcessTicks?: boolean;
}

export const GameEngine: React.FC<GameEngineProps> = ({
  children,
  enableCollisionDetection = true,
  enableVictoryConditions = true,
  enableGameOverConditions = true,
  onGameStart,
  onGamePause,
  onGameResume: _onGameResume,
  onGameOver,
  onRoundComplete,
  onGameComplete,
  onLifeLost,
  onScoreChange,
  onGhostEaten,
  pacmanPosition = { x: 10, y: 15 }, // Default starting position
  ghostPositions = [],
  gameTickInterval = 16, // ~60fps
  autoProcessTicks = true,
}) => {
  const { state } = useGameContext();
  const gameState = useGameState();
  const gameTickRef = useRef<number | null>(null);
  const lastTickTimeRef = useRef<number>(0);

  // Initialize game logic
  const gameLogic = useGameLogic({
    onPacmanGhostCollision: (ghost, pacmanPos) => {
      console.log(`Pacman collided with ${ghost.color} ghost at (${pacmanPos.x}, ${pacmanPos.y})`);
    },
    onGhostEaten: (ghost, points) => {
      console.log(`Ate ${ghost.color} ghost for ${points} points!`);
      onGhostEaten?.(ghost, points);
    },
    onRoundComplete: () => {
      console.log('Round completed!');
      onRoundComplete?.();
    },
    onGameComplete: () => {
      console.log('Game completed!');
      onGameComplete?.();
    },
    onGameOver: () => {
      console.log('Game over!');
      onGameOver?.();
    },
    onLifeLost: () => {
      console.log('Life lost!');
      onLifeLost?.();
    },
  });

  // Main game tick processing
  const processGameTick = useCallback((currentTime: number) => {
    const deltaTime = currentTime - lastTickTimeRef.current;
    
    // Only process if enough time has passed
    if (deltaTime >= gameTickInterval) {
      lastTickTimeRef.current = currentTime;
      
      // Only process game logic if game is actively playing
      if (state.gameStatus === 'playing') {
        // Process collision detection
        if (enableCollisionDetection) {
          gameLogic.processGameTick(pacmanPosition, ghostPositions);
        }
        
        // Check victory conditions
        if (enableVictoryConditions) {
          if (gameLogic.checkVictoryCondition()) {
            if (gameLogic.checkGameCompleteCondition()) {
              gameLogic.handleGameComplete();
            } else if (gameLogic.checkRoundCompleteCondition()) {
              gameLogic.handleRoundComplete();
            }
          }
        }
      }
    }
    
    // Continue the game loop if auto-processing is enabled
    if (autoProcessTicks && state.gameStatus === 'playing') {
      gameTickRef.current = requestAnimationFrame(processGameTick);
    }
  }, [
    gameTickInterval,
    state.gameStatus,
    enableCollisionDetection,
    enableVictoryConditions,
    gameLogic,
    pacmanPosition,
    ghostPositions,
    autoProcessTicks,
  ]);

  // Start/stop game loop based on game status
  useEffect(() => {
    if (autoProcessTicks) {
      if (state.gameStatus === 'playing') {
        // Start game loop
        lastTickTimeRef.current = performance.now();
        gameTickRef.current = requestAnimationFrame(processGameTick);
      } else {
        // Stop game loop
        if (gameTickRef.current) {
          cancelAnimationFrame(gameTickRef.current);
          gameTickRef.current = null;
        }
      }
    }

    return () => {
      if (gameTickRef.current) {
        cancelAnimationFrame(gameTickRef.current);
        gameTickRef.current = null;
      }
    };
  }, [state.gameStatus, autoProcessTicks, processGameTick]);

  // Handle game state changes
  useEffect(() => {
    switch (state.gameStatus) {
      case 'playing':
        onGameStart?.();
        break;
      case 'paused':
        onGamePause?.();
        break;
      case 'game-over':
        if (enableGameOverConditions) {
          onGameOver?.();
        }
        break;
      case 'round-complete':
        if (enableVictoryConditions) {
          onRoundComplete?.();
        }
        break;
      case 'game-complete':
        if (enableVictoryConditions) {
          onGameComplete?.();
        }
        break;
      default:
        break;
    }
  }, [
    state.gameStatus,
    onGameStart,
    onGamePause,
    onGameOver,
    onRoundComplete,
    onGameComplete,
    enableGameOverConditions,
    enableVictoryConditions,
  ]);

  // Handle score changes
  useEffect(() => {
    onScoreChange?.(state.score.current);
  }, [state.score.current, onScoreChange]);

  // Manual game tick trigger (for external game loops)
  const manualGameTick = useCallback(() => {
    if (!autoProcessTicks) {
      processGameTick(performance.now());
    }
  }, [autoProcessTicks, processGameTick]);

  // Expose game logic methods for external use
  const gameEngineAPI = {
    // Manual controls
    manualGameTick,
    
    // Game logic access
    gameLogic,
    gameState,
    
    // Direct collision checks (for external game loops)
    checkPacmanGhostCollisions: gameLogic.checkPacmanGhostCollisions,
    checkVictoryCondition: gameLogic.checkVictoryCondition,
    
    // Game statistics
    getGameStatistics: gameLogic.getGameStatistics,
    
    // Manual event triggers
    triggerGameOver: (reason?: 'collision' | 'no-lives') => gameLogic.handleGameOver(reason),
    triggerRoundComplete: () => gameLogic.handleRoundComplete(),
    triggerGameComplete: () => gameLogic.handleGameComplete(),
    triggerLifeLost: (reason?: string) => gameLogic.handleLifeLost(reason),
    
    // Reset functionality
    resetGame: () => {
      gameLogic.resetGameLogic();
      gameState.restartGame();
    },
  };

  // Attach API to window for external access (development only)
  useEffect(() => {
    if (import.meta.env.DEV) {
      (window as any).gameEngine = gameEngineAPI;
    }
    
    return () => {
      if (import.meta.env.DEV) {
        delete (window as any).gameEngine;
      }
    };
  }, [gameEngineAPI]);

  return (
    <div className="relative w-full h-full">
      {/* Main game content */}
      <div className="relative z-10">
        {children}
      </div>
      
      {/* Game UI Overlay */}
      <GameUI 
        layout="overlay"
        showScoreBoard={true}
        showGameStatus={true}
        showPowerMode={true}
      />
      
      {/* Game Over Screen */}
      {state.gameStatus === 'game-over' && (
        <GameOverScreen
          onRestart={() => gameState.startGame()}
          onMainMenu={() => gameState.restartGame()}
          showAnimation={true}
          autoFocus={true}
        />
      )}
      
      {/* Round Complete Screen */}
      {state.gameStatus === 'round-complete' && (
        <VictoryScreen
          type="round-complete"
          onNextRound={() => gameState.nextRound()}
          onMainMenu={() => gameState.restartGame()}
          showAnimation={true}
          autoFocus={true}
        />
      )}
      
      {/* Game Complete Screen */}
      {state.gameStatus === 'game-complete' && (
        <VictoryScreen
          type="game-complete"
          onRestart={() => gameState.startGame()}
          onMainMenu={() => gameState.restartGame()}
          showAnimation={true}
          autoFocus={true}
        />
      )}
      
      {/* Development Debug Info */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs z-50">
          <div>Status: {state.gameStatus}</div>
          <div>Score: {state.score.current}</div>
          <div>Lives: {state.lives}</div>
          <div>Round: {state.round.current}/{state.round.max}</div>
          <div>Dots: {state.dots.size}</div>
          <div>Power: {state.powerMode.isActive ? 'Active' : 'Inactive'}</div>
          <div>Pacman: ({pacmanPosition.x.toFixed(1)}, {pacmanPosition.y.toFixed(1)})</div>
          <div>Ghosts: {ghostPositions.length}</div>
        </div>
      )}
    </div>
  );
};

export default GameEngine;
