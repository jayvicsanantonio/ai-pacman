// Utility functions for the Pacman game

/**
 * Converts grid coordinates to a string key for Set operations
 */
export const coordsToKey = (x: number, y: number): string => `${x},${y}`;

/**
 * Converts a string key back to grid coordinates
 */
export const keyToCoords = (key: string): { x: number; y: number } => {
  const [x, y] = key.split(',').map(Number);
  return { x, y };
};

/**
 * Clamps a value between min and max
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.min(Math.max(value, min), max);
};

/**
 * Calculates distance between two points
 */
export const distance = (
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number => {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
};

/**
 * Checks if two positions are equal
 */
export const positionsEqual = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};
export {
  generateInitialDots,
  generateInitialPowerPellets,
  getMazeStatistics,
  isHorizontallySymmetrical,
  sampleMaze,
  validateAndReportMaze,
  validateMazeAccessibility,
} from './mazeData';
