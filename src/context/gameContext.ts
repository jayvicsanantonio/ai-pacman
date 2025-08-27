import { createContext } from "react";
import type { GameState } from "../types";

interface GameContextType {
  gameState: GameState;
  // Additional context methods will be added in later tasks
}

export const GameContext = createContext<GameContextType | undefined>(
  undefined,
);
