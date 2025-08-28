import { createContext } from "react";
// Provide a minimal context shape compatible with hooks expecting state/actions.
export interface GameContextType {
  state: any;
  actions: any;
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

