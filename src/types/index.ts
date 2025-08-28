// Game types for the Pacman game
export type Direction = "up" | "down" | "left" | "right";

export type GameStatus =
  | "ready"
  | "playing"
  | "paused"
  | "game-over"
  | "victory"
  | "round-complete"
  | "game-complete";

export type GhostColor = "red" | "pink" | "blue" | "orange";

export const CellType = {
  WALL: 1,
  PATH: 0,
  DOT: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
} as const;

export type CellType = (typeof CellType)[keyof typeof CellType];

export interface Position {
  x: number;
  y: number;
}

export interface PacmanState {
  x: number;
  y: number;
  direction: Direction;
  isMoving: boolean;
  isEating: boolean;
  isAnimating?: boolean;
}

export interface GhostState {
  id: string;
  x: number;
  y: number;
  direction: Direction;
  color: GhostColor;
  isVulnerable: boolean;
  isFlashing: boolean;
}

export interface PowerModeState {
  isActive: boolean;
  timeRemaining: number;
  ghostsEaten: number;
}

export interface ScoreState {
  current: number;
  high: number;
}

export interface RoundState {
  current: number;
  max: number;
}

export interface GameState {
  pacman: PacmanState;
  ghosts: GhostState[];
  gameStatus: GameStatus;
  powerMode: PowerModeState;
  score: ScoreState;
  lives: number;
  round: RoundState;
  maze: number[][];
  dots: Set<string>; // Set of "x,y" coordinates
  powerPellets: Set<string>; // Set of "x,y" coordinates
}

export interface MazeCell {
  type: CellType;
  x: number;
  y: number;
  isCollected?: boolean;
}
