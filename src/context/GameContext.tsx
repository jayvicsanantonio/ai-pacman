import React from "react";
import type { ReactNode } from "react";
import type { GameState } from "../types";
import { GameContext } from "./gameContext";

interface GameContextType {
  gameState: GameState;
  // Additional context methods will be added in later tasks
}

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  // Initial game state - will be implemented in later tasks
  const initialGameState: GameState = {
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
    dots: new Set(),
    powerPellets: new Set(),
  };

  const value: GameContextType = {
    gameState: initialGameState,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};
