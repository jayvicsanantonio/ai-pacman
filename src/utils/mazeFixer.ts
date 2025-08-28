import { CellType } from '../types';
import type { MazeAnalysisResult } from './mazeAnalysis';
import {
  analyzeMaze,
  findReachablePositions,
  fixMaze,
  getDotPositions,
  getPowerPelletPositions,
  isWalkable,
} from './mazeAnalysis';
import { sampleMaze } from './mazeData';

/**
 * Prints a visual representation of the maze
 */
export const printMaze = (maze: number[][]): string => {
  const symbols: { [key: number]: string } = {
    [CellType.WALL]: '█',
    [CellType.PATH]: ' ',
    [CellType.DOT]: '·',
    [CellType.POWER_PELLET]: 'o',
    [CellType.GHOST_HOUSE]: '#',
  };

  return maze
    .map((row) => row.map((cell) => symbols[cell] || '?').join(''))
    .join('\n');
};

/**
 * Prints analysis results in a readable format
 */
export const printAnalysisResults = (analysis: MazeAnalysisResult): string => {
  let report = '=== MAZE ANALYSIS REPORT ===\n\n';

  report += `✓ Accessibility: ${analysis.isAccessible ? 'PASS' : 'FAIL'}\n`;
  report += `✓ Symmetry: ${analysis.isSymmetrical ? 'PASS' : 'FAIL'}\n\n`;

  if (analysis.inaccessibleDots.length > 0) {
    report += `Inaccessible Dots (${analysis.inaccessibleDots.length}):\n`;
    analysis.inaccessibleDots.forEach((dot) => {
      report += `  - Position (${dot.x}, ${dot.y})\n`;
    });
    report += '\n';
  }

  if (analysis.inaccessiblePowerPellets.length > 0) {
    report += `Inaccessible Power Pellets (${analysis.inaccessiblePowerPellets.length}):\n`;
    analysis.inaccessiblePowerPellets.forEach((pellet) => {
      report += `  - Position (${pellet.x}, ${pellet.y})\n`;
    });
    report += '\n';
  }

  if (analysis.symmetryIssues.length > 0) {
    report += `Symmetry Issues:\n`;
    analysis.symmetryIssues.forEach((issue) => {
      report += `  - ${issue}\n`;
    });
    report += '\n';
  }

  return report;
};

/**
 * Validates that all essential positions are accessible
 */
export const validateMaze = (
  maze: number[][],
  pacmanStartX: number = 10,
  pacmanStartY: number = 15
): boolean => {
  const reachable = findReachablePositions(maze, pacmanStartX, pacmanStartY);
  const dotPositions = getDotPositions(maze);
  const powerPelletPositions = getPowerPelletPositions();

  // Check if Pacman starting position is valid
  if (!isWalkable(maze, pacmanStartX, pacmanStartY)) {
    console.error('❌ Pacman starting position is not walkable!');
    return false;
  }

  // Check dot accessibility
  const inaccessibleDots = dotPositions.filter(
    (pos) => !reachable.has(`${pos.x},${pos.y}`)
  );
  if (inaccessibleDots.length > 0) {
    console.error(`❌ ${inaccessibleDots.length} dots are inaccessible!`);
    return false;
  }

  // Check power pellet accessibility
  const inaccessiblePellets = powerPelletPositions.filter(
    (pos) => !reachable.has(`${pos.x},${pos.y}`)
  );
  if (inaccessiblePellets.length > 0) {
    console.error(
      `❌ ${inaccessiblePellets.length} power pellets are inaccessible!`
    );
    return false;
  }

  return true;
};

/**
 * Creates an improved maze with better connectivity and symmetry
 */
export const createImprovedMaze = (): number[][] => {
  // Start with a 21x21 maze template that ensures good connectivity
  const improvedMaze: number[][] = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], // Power pellet row
    [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // Tunnel row
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 4, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 1, 4, 4, 4, 1, 0, 0, 0, 0, 0, 0, 0, 0], // Ghost house row
    [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // Tunnel row
    [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1], // Pacman start row
    [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1], // Power pellet row
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  return improvedMaze;
};

/**
 * Main function to analyze and fix the maze
 */
export const analyzePacmanMaze = (): {
  originalAnalysis: MazeAnalysisResult;
  fixedMaze: number[][];
  fixedAnalysis: MazeAnalysisResult;
  report: string;
} => {
  console.log('🔍 Analyzing original maze...');

  // Analyze original maze
  const originalAnalysis = analyzeMaze(sampleMaze);
  console.log('📊 Original maze analysis complete');

  // Generate report
  let report = '=== PACMAN MAZE ANALYSIS & FIX REPORT ===\n\n';
  report += 'ORIGINAL MAZE:\n';
  report += printAnalysisResults(originalAnalysis);

  // Fix the maze if needed
  let fixedMaze = sampleMaze;
  if (!originalAnalysis.isAccessible || !originalAnalysis.isSymmetrical) {
    console.log('🔧 Fixing maze issues...');
    fixedMaze = fixMaze(sampleMaze);
  }

  // Analyze fixed maze
  const fixedAnalysis = analyzeMaze(fixedMaze);

  report += 'FIXED MAZE:\n';
  report += printAnalysisResults(fixedAnalysis);

  // Validation
  const isValid = validateMaze(fixedMaze);
  report += `VALIDATION: ${isValid ? 'PASS ✅' : 'FAIL ❌'}\n\n`;

  // Statistics
  const dotPositions = getDotPositions(fixedMaze);
  const powerPelletPositions = getPowerPelletPositions();
  report += 'STATISTICS:\n';
  report += `- Total dots: ${dotPositions.length}\n`;
  report += `- Total power pellets: ${powerPelletPositions.length}\n`;
  report += `- Total collectibles: ${dotPositions.length + powerPelletPositions.length}\n`;

  console.log('✅ Maze analysis and fixing complete!');

  return {
    originalAnalysis,
    fixedMaze,
    fixedAnalysis,
    report,
  };
};

// Export the fixed maze for use in the application
export const getFixedMaze = (): number[][] => {
  const { fixedMaze } = analyzePacmanMaze();
  return fixedMaze;
};

// Immediately analyze when this module is imported
if (typeof window !== 'undefined') {
  // Browser environment - run analysis
  setTimeout(() => {
    const results = analyzePacmanMaze();
    console.log(results.report);
  }, 100);
}
