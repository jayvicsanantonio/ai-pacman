import React, { createContext, useContext, useReducer, useCallback } from "react";
import type { ReactNode } from "react";
import type { GameState, Direction, GhostState, Position } from "../types";

// Enhanced Game Status Types
export type GameStatus = 
  | 'ready' 
  | 'playing' 
  | 'paused' 
  | 'game-over' 
  | 'victory' 
  | 'round-complete'
  | 'game-complete';

// Game Action Types
export type GameAction =
  | { type: 'START_GAME' }
  | { type: 'PAUSE_GAME' }
  | { type: 'RESUME_GAME' }
  | { type: 'END_GAME'; reason: 'game-over' | 'victory' | 'quit' }
  | { type: 'RESTART_GAME' }
  | { type: 'NEXT_ROUND' }
  | { type: 'UPDATE_SCORE'; payload: { points: number; reason?: string } }
  | { type: 'UPDATE_HIGH_SCORE'; payload: { score: number } }
  | { type: 'UPDATE_LIVES'; payload: { lives: number } }
  | { type: 'UPDATE_PACMAN'; payload: Partial<GameState['pacman']> }
  | { type: 'UPDATE_GHOSTS'; payload: { ghosts: GhostState[] } }
  | { type: 'ACTIVATE_POWER_MODE'; payload: { duration: number } }
  | { type: 'DEACTIVATE_POWER_MODE' }
  | { type: 'UPDATE_POWER_MODE'; payload: Partial<GameState['powerMode']> }
  | { type: 'COLLECT_DOT'; payload: { position: Position; points: number } }
  | { type: 'COLLECT_POWER_PELLET'; payload: { position: Position; points: number } }
  | { type: 'RESET_COLLECTIBLES'; payload: { dots: Set<string>; powerPellets: Set<string> } }
  | { type: 'UPDATE_GAME_TIME'; payload: { time: number } };

// Enhanced GameState interface
interface EnhancedGameState extends GameState {
  gameTime: number;
  roundStartTime: number;
}

// Initial game state
const initialGameState: EnhancedGameState = {
  pacman: {
    x: 10,
    y: 15,
    direction: "right",
    isMoving: false,
    isEating: false,
  },
  ghosts: [],
  gameStatus: "ready",
  powerMode: {
    isActive: false,
    timeRemaining: 0,
    ghostsEaten: 0,
  },
  score: {
    current: 0,
    high: 0,
  },
  lives: 3,
  round: {
    current: 1,
    max: 20,
  },
  maze: [],
  dots: new Set<string>(),
  powerPellets: new Set<string>(),
  gameTime: 0,
  roundStartTime: 0,
};

// Game reducer function
function gameReducer(state: EnhancedGameState, action: GameAction): EnhancedGameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        gameStatus: 'playing',
        gameTime: Date.now(),
        roundStartTime: Date.now(),
      };

    case 'PAUSE_GAME':
      return {
        ...state,
        gameStatus: state.gameStatus === 'playing' ? 'paused' : state.gameStatus,
      };

    case 'RESUME_GAME':
      return {
        ...state,
        gameStatus: state.gameStatus === 'paused' ? 'playing' : state.gameStatus,
      };

    case 'END_GAME':
      return {
        ...state,
        gameStatus: action.reason === 'victory' ? 'victory' : 'game-over',
      };

    case 'RESTART_GAME':
      return {
        ...initialGameState,
        score: {
          current: 0,
          high: state.score.high,
        },
        gameStatus: 'ready',
      };

    case 'NEXT_ROUND':
      const nextRound = state.round.current + 1;
      return {
        ...state,
        round: {
          ...state.round,
          current: nextRound,
        },
        gameStatus: nextRound > state.round.max ? 'game-complete' : 'playing',
        roundStartTime: Date.now(),
        pacman: {
          ...state.pacman,
          x: 10,
          y: 15,
          direction: 'right',
          isMoving: false,
          isEating: false,
        },
        powerMode: {
          isActive: false,
          timeRemaining: 0,
          ghostsEaten: 0,
        },
      };

    case 'UPDATE_SCORE':
      const newScore = Math.max(0, state.score.current + action.payload.points);
      return {
        ...state,
        score: {
          current: newScore,
          high: Math.max(state.score.high, newScore),
        },
      };

    case 'UPDATE_HIGH_SCORE':
      return {
        ...state,
        score: {
          ...state.score,
          high: Math.max(state.score.high, action.payload.score),
        },
      };

    case 'UPDATE_LIVES':
      const newLives = Math.max(0, action.payload.lives);
      return {
        ...state,
        lives: newLives,
        gameStatus: newLives === 0 ? 'game-over' : state.gameStatus,
      };

    case 'UPDATE_PACMAN':
      return {
        ...state,
        pacman: {
          ...state.pacman,
          ...action.payload,
        },
      };

    case 'UPDATE_GHOSTS':
      return {
        ...state,
        ghosts: action.payload.ghosts,
      };

    case 'ACTIVATE_POWER_MODE':
      return {
        ...state,
        powerMode: {
          ...state.powerMode,
          isActive: true,
          timeRemaining: action.payload.duration,
          ghostsEaten: 0,
        },
      };

    case 'DEACTIVATE_POWER_MODE':
      return {
        ...state,
        powerMode: {
          ...state.powerMode,
          isActive: false,
          timeRemaining: 0,
          ghostsEaten: 0,
        },
      };

    case 'UPDATE_POWER_MODE':
      return {
        ...state,
        powerMode: {
          ...state.powerMode,
          ...action.payload,
        },
      };

    case 'COLLECT_DOT':
      const dotKey = `${action.payload.position.x},${action.payload.position.y}`;
      const updatedDots = new Set(state.dots);
      updatedDots.delete(dotKey);
      
      const newDotScore = state.score.current + action.payload.points;
      const dotsRemaining = updatedDots.size;
      const pelletsRemaining = state.powerPellets.size;
      
      return {
        ...state,
        score: {
          current: newDotScore,
          high: Math.max(state.score.high, newDotScore),
        },
        dots: updatedDots,
        gameStatus: dotsRemaining === 0 && pelletsRemaining === 0 
          ? 'round-complete' 
          : state.gameStatus,
        pacman: {
          ...state.pacman,
          isEating: true,
        },
      };

    case 'COLLECT_POWER_PELLET':
      const pelletKey = `${action.payload.position.x},${action.payload.position.y}`;
      const updatedPowerPellets = new Set(state.powerPellets);
      updatedPowerPellets.delete(pelletKey);
      
      const newPelletScore = state.score.current + action.payload.points;
      const dotsLeft = state.dots.size;
      const pelletsLeft = updatedPowerPellets.size;
      
      return {
        ...state,
        score: {
          current: newPelletScore,
          high: Math.max(state.score.high, newPelletScore),
        },
        powerPellets: updatedPowerPellets,
        gameStatus: dotsLeft === 0 && pelletsLeft === 0 
          ? 'round-complete' 
          : state.gameStatus,
        pacman: {
          ...state.pacman,
          isEating: true,
        },
      };

    case 'RESET_COLLECTIBLES':
      return {
        ...state,
        dots: action.payload.dots,
        powerPellets: action.payload.powerPellets,
      };

    case 'UPDATE_GAME_TIME':
      return {
        ...state,
        gameTime: action.payload.time,
      };

    default:
      return state;
  }
}

// Context type
interface GameContextType {
  state: EnhancedGameState;
  dispatch: React.Dispatch<GameAction>;
  // Action creators for convenience
  actions: {
    startGame: () => void;
    pauseGame: () => void;
    resumeGame: () => void;
    endGame: (reason: 'game-over' | 'victory' | 'quit') => void;
    restartGame: () => void;
    nextRound: () => void;
    updateScore: (points: number, reason?: string) => void;
    updateHighScore: (score: number) => void;
    updateLives: (lives: number) => void;
    updatePacman: (updates: Partial<GameState['pacman']>) => void;
    updateGhosts: (ghosts: GhostState[]) => void;
    activatePowerMode: (duration: number) => void;
    deactivatePowerMode: () => void;
    updatePowerMode: (updates: Partial<GameState['powerMode']>) => void;
    collectDot: (position: Position, points?: number) => void;
    collectPowerPellet: (position: Position, points?: number) => void;
    resetCollectibles: (dots: Set<string>, powerPellets: Set<string>) => void;
    updateGameTime: (time: number) => void;
  };
}

// Create context
const GameContext = createContext<GameContextType | undefined>(undefined);

// GameProvider component
interface GameProviderProps {
  children: ReactNode;
  initialState?: Partial<EnhancedGameState>;
}

export const GameProvider: React.FC<GameProviderProps> = ({ 
  children, 
  initialState = {} 
}) => {
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialGameState,
    ...initialState,
  });

  // Action creators for convenience
  const actions = {
    startGame: useCallback(() => dispatch({ type: 'START_GAME' }), []),
    pauseGame: useCallback(() => dispatch({ type: 'PAUSE_GAME' }), []),
    resumeGame: useCallback(() => dispatch({ type: 'RESUME_GAME' }), []),
    endGame: useCallback((reason: 'game-over' | 'victory' | 'quit') => 
      dispatch({ type: 'END_GAME', reason }), []),
    restartGame: useCallback(() => dispatch({ type: 'RESTART_GAME' }), []),
    nextRound: useCallback(() => dispatch({ type: 'NEXT_ROUND' }), []),
    updateScore: useCallback((points: number, reason?: string) => 
      dispatch({ type: 'UPDATE_SCORE', payload: { points, reason } }), []),
    updateHighScore: useCallback((score: number) =>
      dispatch({ type: 'UPDATE_HIGH_SCORE', payload: { score } }), []),
    updateLives: useCallback((lives: number) => 
      dispatch({ type: 'UPDATE_LIVES', payload: { lives } }), []),
    updatePacman: useCallback((updates: Partial<GameState['pacman']>) =>
      dispatch({ type: 'UPDATE_PACMAN', payload: updates }), []),
    updateGhosts: useCallback((ghosts: GhostState[]) =>
      dispatch({ type: 'UPDATE_GHOSTS', payload: { ghosts } }), []),
    activatePowerMode: useCallback((duration: number) =>
      dispatch({ type: 'ACTIVATE_POWER_MODE', payload: { duration } }), []),
    deactivatePowerMode: useCallback(() => dispatch({ type: 'DEACTIVATE_POWER_MODE' }), []),
    updatePowerMode: useCallback((updates: Partial<GameState['powerMode']>) =>
      dispatch({ type: 'UPDATE_POWER_MODE', payload: updates }), []),
    collectDot: useCallback((position: Position, points: number = 10) =>
      dispatch({ type: 'COLLECT_DOT', payload: { position, points } }), []),
    collectPowerPellet: useCallback((position: Position, points: number = 50) =>
      dispatch({ type: 'COLLECT_POWER_PELLET', payload: { position, points } }), []),
    resetCollectibles: useCallback((dots: Set<string>, powerPellets: Set<string>) =>
      dispatch({ type: 'RESET_COLLECTIBLES', payload: { dots, powerPellets } }), []),
    updateGameTime: useCallback((time: number) =>
      dispatch({ type: 'UPDATE_GAME_TIME', payload: { time } }), []),
  };

  return (
    <GameContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </GameContext.Provider>
  );
};

// Custom hook to use game context
export const useGameContext = (): GameContextType => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
};

// Convenience hooks for specific game state parts
export const useGameStatus = () => {
  const { state } = useGameContext();
  return state.gameStatus;
};

export const useGameScore = () => {
  const { state, actions } = useGameContext();
  return {
    score: state.score.current,
    highScore: state.score.high,
    updateScore: actions.updateScore,
    updateHighScore: actions.updateHighScore,
  };
};

export const useGameLives = () => {
  const { state, actions } = useGameContext();
  return {
    lives: state.lives,
    updateLives: actions.updateLives,
  };
};

export const useGameRound = () => {
  const { state, actions } = useGameContext();
  return {
    round: state.round.current,
    maxRounds: state.round.max,
    nextRound: actions.nextRound,
  };
};

export const useGameControls = () => {
  const { state, actions } = useGameContext();
  return {
    status: state.gameStatus,
    startGame: actions.startGame,
    pauseGame: actions.pauseGame,
    resumeGame: actions.resumeGame,
    endGame: actions.endGame,
    restartGame: actions.restartGame,
  };
};

export const usePacmanState = () => {
  const { state, actions } = useGameContext();
  return {
    pacman: state.pacman,
    updatePacman: actions.updatePacman,
  };
};

export const useGhostState = () => {
  const { state, actions } = useGameContext();
  return {
    ghosts: state.ghosts,
    updateGhosts: actions.updateGhosts,
  };
};

export const usePowerModeState = () => {
  const { state, actions } = useGameContext();
  return {
    powerMode: state.powerMode,
    activatePowerMode: actions.activatePowerMode,
    deactivatePowerMode: actions.deactivatePowerMode,
    updatePowerMode: actions.updatePowerMode,
  };
};

export const useCollectiblesState = () => {
  const { state, actions } = useGameContext();
  return {
    dots: state.dots,
    powerPellets: state.powerPellets,
    dotsRemaining: state.dots.size,
    powerPelletsRemaining: state.powerPellets.size,
    collectDot: actions.collectDot,
    collectPowerPellet: actions.collectPowerPellet,
    resetCollectibles: actions.resetCollectibles,
  };
};
