import { CellType } from '../types';

// Perfectly symmetrical 21x21 maze layout
// 0 = PATH, 1 = WALL, 2 = DOT (handled by dots Set), 3 = POWER_PELLET (handled by powerPellets Set), 4 = GHOST_HOUSE
export const sampleMaze: number[][] = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 4, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 4, 4, 4, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Generate initial dots for all path cells (excluding ghost house and power pellet positions)
export const generateInitialDots = (maze: number[][]): Set<string> => {
  const dots = new Set<string>();

  // Get power pellet positions to exclude them from dots
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
          dots.add(position);
        }
      }
    }
  }

  return dots;
};

// Generate initial power pellets at the four corners
export const generateInitialPowerPellets = (): Set<string> => {
  const powerPellets = new Set<string>();

  // Four corner positions for power pellets (all accessible)
  powerPellets.add('1,3'); // Top-left
  powerPellets.add('19,3'); // Top-right
  powerPellets.add('1,17'); // Bottom-left
  powerPellets.add('19,17'); // Bottom-right

  return powerPellets;
};

// Utility function to validate maze accessibility
export const validateMazeAccessibility = (maze: number[][]): boolean => {
  const visited = new Set<string>();
  const queue = [{ x: 10, y: 15 }]; // Start from Pacman's position

  // BFS to find all reachable positions
  while (queue.length > 0) {
    const { x, y } = queue.shift()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    visited.add(key);

    // Check all four directions
    const directions = [
      { x: x + 1, y: y },
      { x: x - 1, y: y },
      { x: x, y: y + 1 },
      { x: x, y: y - 1 },
    ];

    for (const next of directions) {
      if (
        next.x >= 0 &&
        next.x < maze[0].length &&
        next.y >= 0 &&
        next.y < maze.length &&
        (maze[next.y][next.x] === CellType.PATH ||
          maze[next.y][next.x] === CellType.GHOST_HOUSE) &&
        !visited.has(`${next.x},${next.y}`)
      ) {
        queue.push(next);
      }
    }

    // Handle tunnel connections
    if (y === 7 || y === 11) {
      if (x === 0) {
        const tunnelExit = { x: 20, y: y };
        if (!visited.has(`${tunnelExit.x},${tunnelExit.y}`)) {
          queue.push(tunnelExit);
        }
      } else if (x === 20) {
        const tunnelExit = { x: 0, y: y };
        if (!visited.has(`${tunnelExit.x},${tunnelExit.y}`)) {
          queue.push(tunnelExit);
        }
      }
    }
  }

  // Check if all power pellet positions are reachable
  const powerPelletPositions = ['1,3', '19,3', '1,17', '19,17'];
  return powerPelletPositions.every((pos) => visited.has(pos));
};

// Utility function to check horizontal symmetry
export const isHorizontallySymmetrical = (maze: number[][]): boolean => {
  const width = maze[0].length;
  const height = maze.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.floor(width / 2); x++) {
      const mirrorX = width - 1 - x;
      if (maze[y][x] !== maze[y][mirrorX]) {
        return false;
      }
    }
  }

  return true;
};

// Run validation checks on module load
export const validateAndReportMaze = () => {
  const isAccessible = validateMazeAccessibility(sampleMaze);
  const isSymmetrical = isHorizontallySymmetrical(sampleMaze);

  const report = {
    isAccessible,
    isSymmetrical,
    message: '',
  };

  if (!isAccessible) {
    report.message +=
      '⚠️ Warning: Some pellets may not be accessible to Pacman. ';
  }

  if (!isSymmetrical) {
    report.message += '⚠️ Warning: Maze is not horizontally symmetrical. ';
  }

  if (isAccessible && isSymmetrical) {
    report.message =
      '✅ Maze validation passed: All pellets accessible and maze is symmetrical';
    console.log(report.message);
  } else {
    console.warn(report.message);
  }

  return report;
};

// Auto-validate when module is loaded
validateAndReportMaze();
