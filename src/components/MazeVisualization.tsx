import React, { useEffect, useState } from 'react';
import { CellType } from '../types';
import {
    generateInitialDots,
    generateInitialPowerPellets,
    getMazeStatistics,
    isHorizontallySymmetrical,
    sampleMaze,
    validateMazeAccessibility,
} from '../utils/mazeData';

interface MazeValidationResult {
  isAccessible: boolean;
  isSymmetrical: boolean;
  statistics: ReturnType<typeof getMazeStatistics>;
  accessibilityDetails: {
    reachablePositions: Set<string>;
    inaccessibleDots: string[];
    inaccessiblePowerPellets: string[];
  };
}

export const MazeVisualization: React.FC = () => {
  const [validationResult, setValidationResult] = useState<MazeValidationResult | null>(null);
  const [showGrid, setShowGrid] = useState(true);
  const [highlightInaccessible, setHighlightInaccessible] = useState(true);

  useEffect(() => {
    // Perform comprehensive maze validation
    const validateMaze = () => {
      const isAccessible = validateMazeAccessibility(sampleMaze);
      const isSymmetrical = isHorizontallySymmetrical(sampleMaze);
      const statistics = getMazeStatistics();

      // Find reachable positions using BFS
      const visited = new Set<string>();
      const queue = [{ x: 10, y: 15 }]; // Pacman's starting position

      while (queue.length > 0) {
        const { x, y } = queue.shift()!;
        const key = `${x},${y}`;

        if (visited.has(key)) continue;
        visited.add(key);

        const directions = [
          { x: x + 1, y: y },
          { x: x - 1, y: y },
          { x: x, y: y + 1 },
          { x: x, y: y - 1 },
        ];

        for (const next of directions) {
          if (
            next.x >= 0 &&
            next.x < sampleMaze[0].length &&
            next.y >= 0 &&
            next.y < sampleMaze.length &&
            (sampleMaze[next.y][next.x] === CellType.PATH ||
              sampleMaze[next.y][next.x] === CellType.GHOST_HOUSE) &&
            !visited.has(`${next.x},${next.y}`)
          ) {
            queue.push(next);
          }
        }

        // Handle tunnel connections
        if ((y === 7 || y === 11) && (x === 0 || x === 20)) {
          const tunnelExit = { x: x === 0 ? 20 : 0, y: y };
          const tunnelKey = `${tunnelExit.x},${tunnelExit.y}`;
          if (
            !visited.has(tunnelKey) &&
            sampleMaze[tunnelExit.y][tunnelExit.x] === CellType.PATH
          ) {
            queue.push(tunnelExit);
          }
        }
      }

      // Check which dots and power pellets are inaccessible
      const dots = generateInitialDots(sampleMaze);
      const powerPellets = generateInitialPowerPellets();

      const inaccessibleDots = Array.from(dots).filter((pos) => !visited.has(pos));
      const inaccessiblePowerPellets = Array.from(powerPellets).filter(
        (pos) => !visited.has(pos)
      );

      setValidationResult({
        isAccessible,
        isSymmetrical,
        statistics,
        accessibilityDetails: {
          reachablePositions: visited,
          inaccessibleDots,
          inaccessiblePowerPellets,
        },
      });
    };

    validateMaze();
  }, []);

  const getCellStyle = (cellType: number, x: number, y: number): string => {
    const baseStyle = 'w-4 h-4 border-0';
    const position = `${x},${y}`;

    // Check if this position is inaccessible
    const isInaccessible = validationResult && highlightInaccessible &&
      (validationResult.accessibilityDetails.inaccessibleDots.includes(position) ||
       validationResult.accessibilityDetails.inaccessiblePowerPellets.includes(position));

    switch (cellType) {
      case CellType.WALL:
        return `${baseStyle} bg-blue-600 border border-blue-400 shadow-inner`;
      case CellType.PATH:
        if (x === 10 && y === 15) {
          // Pacman starting position
          return `${baseStyle} bg-yellow-400 border-2 border-yellow-600`;
        }
        if (isInaccessible) {
          return `${baseStyle} bg-red-200 border border-red-400`;
        }
        return `${baseStyle} bg-black`;
      case CellType.GHOST_HOUSE:
        return `${baseStyle} bg-gray-800 border border-gray-600`;
      default:
        return `${baseStyle} bg-gray-500`;
    }
  };

  const getCellContent = (x: number, y: number): React.ReactNode => {
    const dots = generateInitialDots(sampleMaze);
    const powerPellets = generateInitialPowerPellets();
    const position = `${x},${y}`;

    if (x === 10 && y === 15) {
      return <span className="text-xs font-bold text-black">P</span>;
    }

    if (powerPellets.has(position)) {
      const isInaccessible = validationResult?.accessibilityDetails.inaccessiblePowerPellets.includes(position);
      return (
        <div className={`w-3 h-3 rounded-full ${isInaccessible ? 'bg-red-500' : 'bg-orange-400'} animate-pulse`} />
      );
    }

    if (dots.has(position)) {
      const isInaccessible = validationResult?.accessibilityDetails.inaccessibleDots.includes(position);
      return (
        <div className={`w-1 h-1 rounded-full ${isInaccessible ? 'bg-red-300' : 'bg-yellow-300'}`} />
      );
    }

    return null;
  };

  if (!validationResult) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Validating maze...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-center mb-2">Pacman Maze Analysis</h1>
        <div className="text-center text-gray-600">
          Interactive visualization and validation of the game maze
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 justify-center">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="rounded"
          />
          <span>Show Grid Lines</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={highlightInaccessible}
            onChange={(e) => setHighlightInaccessible(e.target.checked)}
            className="rounded"
          />
          <span>Highlight Inaccessible Areas</span>
        </label>
      </div>

      {/* Validation Results */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Validation Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-3 rounded ${validationResult.isAccessible ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{validationResult.isAccessible ? '✅' : '❌'}</span>
              <span className="font-medium">Accessibility</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {validationResult.isAccessible
                ? 'All pellets are accessible to Pacman'
                : `${validationResult.accessibilityDetails.inaccessibleDots.length + validationResult.accessibilityDetails.inaccessiblePowerPellets.length} inaccessible pellets`}
            </div>
          </div>

          <div className={`p-3 rounded ${validationResult.isSymmetrical ? 'bg-green-100 border-green-300' : 'bg-red-100 border-red-300'} border`}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{validationResult.isSymmetrical ? '✅' : '❌'}</span>
              <span className="font-medium">Symmetry</span>
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {validationResult.isSymmetrical
                ? 'Maze is horizontally symmetrical'
                : 'Maze is not horizontally symmetrical'}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="mb-6 bg-blue-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Maze Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div className="bg-white rounded p-3">
            <div className="text-2xl font-bold text-blue-600">{validationResult.statistics.totalDots}</div>
            <div className="text-sm text-gray-600">Total Dots</div>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-2xl font-bold text-orange-600">{validationResult.statistics.totalPowerPellets}</div>
            <div className="text-sm text-gray-600">Power Pellets</div>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-2xl font-bold text-purple-600">{validationResult.statistics.totalCollectibles}</div>
            <div className="text-sm text-gray-600">Total Collectibles</div>
          </div>
          <div className="bg-white rounded p-3">
            <div className="text-2xl font-bold text-green-600">{validationResult.statistics.dimensions}</div>
            <div className="text-sm text-gray-600">Dimensions</div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 bg-gray-50 rounded-lg p-4">
        <h2 className="text-xl font-semibold mb-3">Legend</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 border border-blue-400"></div>
            <span>Wall</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black"></div>
            <span>Path</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-400 border-2 border-yellow-600"></div>
            <span>Pacman Start</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-800 border border-gray-600"></div>
            <span>Ghost House</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-400"></div>
            <span>Power Pellet</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1 h-1 rounded-full bg-yellow-300"></div>
            <span>Dot</span>
          </div>
        </div>
        {highlightInaccessible && (
          <div className="mt-2 text-red-600 text-sm">
            🔴 Red highlighting indicates inaccessible areas
          </div>
        )}
      </div>

      {/* Maze Grid */}
      <div className="mb-6 flex justify-center">
        <div
          className={`inline-grid grid-cols-21 gap-0 p-4 bg-black rounded-lg shadow-lg ${
            showGrid ? 'border border-gray-300' : ''
          }`}
          style={{
            gridTemplateColumns: 'repeat(21, 1fr)',
          }}
        >
          {sampleMaze.map((row, y) =>
            row.map((cellType, x) => (
              <div
                key={`${x}-${y}`}
                className={`${getCellStyle(cellType, x, y)} flex items-center justify-center relative ${
                  showGrid ? 'border border-gray-800' : ''
                }`}
                title={`Position: (${x}, ${y}), Type: ${cellType}`}
              >
                {getCellContent(x, y)}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Issues Report */}
      {(!validationResult.isAccessible || !validationResult.isSymmetrical) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-3 text-red-800">Issues Found</h2>

          {!validationResult.isAccessible && (
            <div className="mb-4">
              <h3 className="font-medium text-red-700">Accessibility Issues:</h3>
              {validationResult.accessibilityDetails.inaccessibleDots.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-red-600">
                    Inaccessible dots ({validationResult.accessibilityDetails.inaccessibleDots.length}): {' '}
                    {validationResult.accessibilityDetails.inaccessibleDots.join(', ')}
                  </span>
                </div>
              )}
              {validationResult.accessibilityDetails.inaccessiblePowerPellets.length > 0 && (
                <div className="mt-1">
                  <span className="text-sm text-red-600">
                    Inaccessible power pellets ({validationResult.accessibilityDetails.inaccessiblePowerPellets.length}): {' '}
                    {validationResult.accessibilityDetails.inaccessiblePowerPellets.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}

          {!validationResult.isSymmetrical && (
            <div>
              <h3 className="font-medium text-red-700">Symmetry Issues:</h3>
              <div className="text-sm text-red-600 mt-1">
                The maze is not horizontally symmetrical. This may affect game balance and aesthetics.
              </div>
            </div>
          )}
        </div>
      )}

      {/* Success Message */}
      {validationResult.isAccessible && validationResult.isSymmetrical && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎉</span>
            <div>
              <h2 className="text-xl font-semibold text-green-800">Perfect Maze!</h2>
              <p className="text-green-700">
                The maze is perfectly symmetrical and all {validationResult.statistics.totalCollectibles} pellets
                are accessible to Pacman. Great job!
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MazeVisualization;
