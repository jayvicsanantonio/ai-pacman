import { CellType } from '../types';

export interface Position {
  x: number;
  y: number;
}

export interface MazeAnalysisResult {
  isAccessible: boolean;
  isSymmetrical: boolean;
  inaccessibleDots: Position[];
  inaccessiblePowerPellets: Position[];
  symmetryIssues: string[];
}

/**
 * Checks if a position is valid and walkable in the maze
 */
export const isWalkable = (maze: number[][], x: number, y: number): boolean => {
  if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) {
    return false;
  }
  return maze[y][x] === CellType.PATH || maze[y][x] === CellType.DOT || maze[y][x] === CellType.POWER_PELLET;
};

/**
 * Breadth-First Search to find all reachable positions from a starting point
 */
export const findReachablePositions = (
  maze: number[][],
  startX: number,
  startY: number
): Set<string> => {
  const reachable = new Set<string>();
  const queue: Position[] = [{ x: startX, y: startY }];
  const visited = new Set<string>();

  while (queue.length > 0) {
    const current = queue.shift()!;
    const key = `${current.x},${current.y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    if (isWalkable(maze, current.x, current.y)) {
      reachable.add(key);

      // Add adjacent positions to queue
      const directions = [
        { x: current.x + 1, y: current.y },
        { x: current.x - 1, y: current.y },
        { x: current.x, y: current.y + 1 },
        { x: current.x, y: current.y - 1 }
      ];

      for (const dir of directions) {
        const dirKey = `${dir.x},${dir.y}`;
        if (!visited.has(dirKey) && isWalkable(maze, dir.x, dir.y)) {
          queue.push(dir);
        }
      }
    }
  }

  return reachable;
};

/**
 * Checks if the maze is horizontally symmetrical
 */
export const isHorizontallySymmetrical = (maze: number[][]): boolean => {
  const height = maze.length;
  const width = maze[0].length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const mirrorX = width - 1 - x;
      if (maze[y][x] !== maze[y][mirrorX]) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Checks if the maze is vertically symmetrical
 */
export const isVerticallySymmetrical = (maze: number[][]): boolean => {
  const height = maze.length;

  for (let y = 0; y < height; y++) {
    const mirrorY = height - 1 - y;
    for (let x = 0; x < maze[0].length; x++) {
      if (maze[y][x] !== maze[mirrorY][x]) {
        return false;
      }
    }
  }

  return true;
};

/**
 * Gets all positions where dots should be placed
 */
export const getDotPositions = (maze: number[][]): Position[] => {
  const positions: Position[] = [];
  const powerPelletPositions = new Set(['1,3', '19,3', '1,17', '19,17']);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === CellType.PATH) {
        const position = `${x},${y}`;

        // Skip certain positions (like Pacman starting position, near ghost house, and power pellets)
        if (
          !(x === 10 && y === 15) && // Pacman starting position
          !(x >= 9 && x <= 11 && y >= 8 && y <= 11) && // Near ghost house
          !powerPelletPositions.has(position) // Power pellet positions
        ) {
          positions.push({ x, y });
        }
      }
    }
  }

  return positions;
};

/**
 * Gets all power pellet positions
 */
export const getPowerPelletPositions = (): Position[] => {
  return [
    { x: 1, y: 3 },   // Top-left
    { x: 19, y: 3 },  // Top-right
    { x: 1, y: 17 },  // Bottom-left
    { x: 19, y: 17 }  // Bottom-right
  ];
};

/**
 * Analyzes the maze for accessibility and symmetry
 */
export const analyzeMaze = (
  maze: number[][],
  pacmanStartX: number = 10,
  pacmanStartY: number = 15
): MazeAnalysisResult => {
  const reachablePositions = findReachablePositions(maze, pacmanStartX, pacmanStartY);
  const dotPositions = getDotPositions(maze);
  const powerPelletPositions = getPowerPelletPositions();

  // Check accessibility
  const inaccessibleDots = dotPositions.filter(pos =>
    !reachablePositions.has(`${pos.x},${pos.y}`)
  );

  const inaccessiblePowerPellets = powerPelletPositions.filter(pos =>
    !reachablePositions.has(`${pos.x},${pos.y}`)
  );

  const isAccessible = inaccessibleDots.length === 0 && inaccessiblePowerPellets.length === 0;

  // Check symmetry
  const isHorizSymm = isHorizontallySymmetrical(maze);
  const isVertSymm = isVerticallySymmetrical(maze);
  const isSymmetrical = isHorizSymm; // For Pacman, we typically want horizontal symmetry

  const symmetryIssues: string[] = [];
  if (!isHorizSymm) {
    symmetryIssues.push('Maze is not horizontally symmetrical');
  }
  if (!isVertSymm) {
    symmetryIssues.push('Maze is not vertically symmetrical');
  }

  return {
    isAccessible,
    isSymmetrical,
    inaccessibleDots,
    inaccessiblePowerPellets,
    symmetryIssues
  };
};

/**
 * Creates a path between two positions by removing walls
 */
export const createPath = (
  maze: number[][],
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): number[][] => {
  const newMaze = maze.map(row => [...row]);

  // Simple pathfinding: create L-shaped path (horizontal then vertical)
  let currentX = fromX;
  let currentY = fromY;

  // Move horizontally first
  while (currentX !== toX) {
    if (currentX < toX) currentX++;
    else currentX--;

    if (newMaze[currentY][currentX] === CellType.WALL) {
      newMaze[currentY][currentX] = CellType.PATH;
    }
  }

  // Then move vertically
  while (currentY !== toY) {
    if (currentY < toY) currentY++;
    else currentY--;

    if (newMaze[currentY][currentX] === CellType.WALL) {
      newMaze[currentY][currentX] = CellType.PATH;
    }
  }

  return newMaze;
};

/**
 * Makes the maze horizontally symmetrical
 */
export const makeHorizontallySymmetrical = (maze: number[][]): number[][] => {
  const newMaze = maze.map(row => [...row]);
  const width = maze[0].length;
  const height = maze.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.floor(width / 2); x++) {
      const mirrorX = width - 1 - x;

      // Skip the center column for odd-width mazes
      if (x === mirrorX) continue;

      // Copy left side to right side
      newMaze[y][mirrorX] = newMaze[y][x];
    }
  }

  return newMaze;
};

/**
 * Fixes accessibility issues by creating paths to inaccessible areas
 */
export const fixAccessibility = (
  maze: number[][],
  pacmanStartX: number = 10,
  pacmanStartY: number = 15
): number[][] => {
  let fixedMaze = maze.map(row => [...row]);
  const analysis = analyzeMaze(fixedMaze, pacmanStartX, pacmanStartY);

  // Create paths to inaccessible dots
  for (const dot of analysis.inaccessibleDots) {
    fixedMaze = createPath(fixedMaze, pacmanStartX, pacmanStartY, dot.x, dot.y);
  }

  // Create paths to inaccessible power pellets
  for (const pellet of analysis.inaccessiblePowerPellets) {
    fixedMaze = createPath(fixedMaze, pacmanStartX, pacmanStartY, pellet.x, pellet.y);
  }

  return fixedMaze;
};

/**
 * Fixes both accessibility and symmetry issues
 */
export const fixMaze = (
  maze: number[][],
  pacmanStartX: number = 10,
  pacmanStartY: number = 15
): number[][] => {
  // First fix accessibility
  let fixedMaze = fixAccessibility(maze, pacmanStartX, pacmanStartY);

  // Then make it symmetrical
  fixedMaze = makeHorizontallySymmetrical(fixedMaze);

  // Check if making it symmetrical broke accessibility
  const finalAnalysis = analyzeMaze(fixedMaze, pacmanStartX, pacmanStartY);
  if (!finalAnalysis.isAccessible) {
    // If symmetry broke accessibility, fix it again
    fixedMaze = fixAccessibility(fixedMaze, pacmanStartX, pacmanStartY);
    // And make symmetrical again (this might create a cycle, but usually converges)
    fixedMaze = makeHorizontallySymmetrical(fixedMaze);
  }

  return fixedMaze;
};
