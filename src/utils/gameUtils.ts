/**
 * Game utility functions for formatting and calculations
 */

/**
 * Format a score with commas for thousands separators
 * @param score - The score to format
 * @returns Formatted score string
 */
export const formatScore = (score: number): string => {
  return score.toLocaleString();
};

/**
 * Format time duration in milliseconds to MM:SS format
 * @param duration - Duration in milliseconds
 * @returns Formatted time string
 */
export const formatTime = (duration: number): string => {
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

/**
 * Format time duration in milliseconds to human-readable format
 * @param duration - Duration in milliseconds
 * @param includeMs - Whether to include milliseconds
 * @returns Formatted time string
 */
export const formatDuration = (duration: number, includeMs = false): string => {
  if (duration < 1000) {
    return includeMs ? `${duration}ms` : '0s';
  }
  
  const seconds = Math.floor(duration / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  
  const remainingMs = duration % 1000;
  const remainingSeconds = seconds % 60;
  const remainingMinutes = minutes % 60;
  
  let result = '';
  
  if (hours > 0) {
    result += `${hours}h `;
  }
  
  if (remainingMinutes > 0 || hours > 0) {
    result += `${remainingMinutes}m `;
  }
  
  result += `${remainingSeconds}s`;
  
  if (includeMs && hours === 0 && remainingMs > 0) {
    result += ` ${remainingMs}ms`;
  }
  
  return result.trim();
};

/**
 * Calculate points for eating a ghost based on the number of ghosts eaten in power mode
 * @param ghostIndex - The sequential index of the ghost eaten (0-based)
 * @returns Points awarded for eating the ghost
 */
export const calculateGhostPoints = (ghostIndex: number): number => {
  const basePoints = 200;
  return basePoints * Math.pow(2, Math.min(ghostIndex, 3)); // Max at 1600 points
};

/**
 * Calculate bonus points based on various game factors
 * @param params - Bonus calculation parameters
 * @returns Bonus points
 */
export const calculateBonusPoints = (params: {
  remainingTime?: number;
  livesRemaining?: number;
  perfectRound?: boolean;
  speedBonus?: boolean;
}): number => {
  let bonus = 0;
  
  if (params.remainingTime && params.remainingTime > 0) {
    // Time bonus: 1 point per second remaining
    bonus += Math.floor(params.remainingTime / 1000);
  }
  
  if (params.livesRemaining && params.livesRemaining > 0) {
    // Life bonus: 1000 points per life remaining
    bonus += params.livesRemaining * 1000;
  }
  
  if (params.perfectRound) {
    // Perfect round bonus (no lives lost)
    bonus += 5000;
  }
  
  if (params.speedBonus) {
    // Speed completion bonus
    bonus += 2000;
  }
  
  return bonus;
};

/**
 * Generate a position key for tracking collectibles
 * @param x - X coordinate
 * @param y - Y coordinate
 * @returns Position key string
 */
export const getPositionKey = (x: number, y: number): string => {
  return `${x},${y}`;
};

/**
 * Parse a position key back to coordinates
 * @param key - Position key string
 * @returns Position object or null if invalid
 */
export const parsePositionKey = (key: string): { x: number; y: number } | null => {
  const parts = key.split(',');
  if (parts.length !== 2) return null;
  
  const x = parseInt(parts[0], 10);
  const y = parseInt(parts[1], 10);
  
  if (isNaN(x) || isNaN(y)) return null;
  
  return { x, y };
};

/**
 * Check if two positions are equal
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns True if positions are equal
 */
export const arePositionsEqual = (
  pos1: { x: number; y: number }, 
  pos2: { x: number; y: number }
): boolean => {
  return pos1.x === pos2.x && pos1.y === pos2.y;
};

/**
 * Calculate Manhattan distance between two positions
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Manhattan distance
 */
export const getManhattanDistance = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
};

/**
 * Calculate Euclidean distance between two positions
 * @param pos1 - First position
 * @param pos2 - Second position
 * @returns Euclidean distance
 */
export const getEuclideanDistance = (
  pos1: { x: number; y: number },
  pos2: { x: number; y: number }
): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Clamp a value between min and max
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Clamped value
 */
export const clamp = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

/**
 * Linear interpolation between two values
 * @param start - Start value
 * @param end - End value
 * @param progress - Progress from 0 to 1
 * @returns Interpolated value
 */
export const lerp = (start: number, end: number, progress: number): number => {
  return start + (end - start) * clamp(progress, 0, 1);
};

/**
 * Easing function for smooth animations
 * @param t - Time parameter (0-1)
 * @returns Eased value
 */
export const easeInOutQuad = (t: number): number => {
  return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
};

/**
 * Easing function for smooth deceleration
 * @param t - Time parameter (0-1)
 * @returns Eased value
 */
export const easeOutQuad = (t: number): number => {
  return t * (2 - t);
};

/**
 * Easing function for smooth acceleration
 * @param t - Time parameter (0-1)
 * @returns Eased value
 */
export const easeInQuad = (t: number): number => {
  return t * t;
};

/**
 * Generate a random integer between min and max (inclusive)
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random integer
 */
export const randomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Generate a random float between min and max
 * @param min - Minimum value
 * @param max - Maximum value
 * @returns Random float
 */
export const randomFloat = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Choose a random element from an array
 * @param array - Array to choose from
 * @returns Random element or undefined if array is empty
 */
export const randomChoice = <T>(array: T[]): T | undefined => {
  if (array.length === 0) return undefined;
  return array[randomInt(0, array.length - 1)];
};

/**
 * Debounce a function call
 * @param func - Function to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced function
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: number | undefined;
  
  return (...args: Parameters<T>) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
    }
    
    timeoutId = window.setTimeout(() => {
      func(...args);
    }, delay);
  };
};

/**
 * Throttle a function call
 * @param func - Function to throttle
 * @param delay - Delay in milliseconds
 * @returns Throttled function
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
};
