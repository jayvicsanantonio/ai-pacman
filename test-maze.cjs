// Simple maze test script
const fs = require('fs');
const path = require('path');

// Mock the types module for Node.js
const CellType = {
  WALL: 1,
  PATH: 0,
  DOT: 2,
  POWER_PELLET: 3,
  GHOST_HOUSE: 4,
};

// Sample maze data (copied from mazeData.ts)
const sampleMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 4, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 0, 0, 0, 0, 0, 1, 0, 1, 4, 4, 4, 1, 0, 1, 0, 0, 0, 0, 0, 0],
  [1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
  [1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

// Test functions
function isWalkable(maze, x, y) {
  if (y < 0 || y >= maze.length || x < 0 || x >= maze[0].length) {
    return false;
  }
  return (
    maze[y][x] === CellType.PATH ||
    maze[y][x] === CellType.DOT ||
    maze[y][x] === CellType.POWER_PELLET ||
    maze[y][x] === CellType.GHOST_HOUSE
  );
}

function findReachablePositions(maze, startX, startY) {
  const reachable = new Set();
  const queue = [{ x: startX, y: startY }];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
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
        { x: current.x, y: current.y - 1 },
      ];

      for (const dir of directions) {
        const dirKey = `${dir.x},${dir.y}`;
        if (!visited.has(dirKey) && isWalkable(maze, dir.x, dir.y)) {
          queue.push(dir);
        }
      }
    }

    // Handle tunnel connections
    if (
      (current.y === 7 || current.y === 11) &&
      (current.x === 0 || current.x === 20)
    ) {
      const tunnelExit = { x: current.x === 0 ? 20 : 0, y: current.y };
      const tunnelKey = `${tunnelExit.x},${tunnelExit.y}`;
      if (
        !visited.has(tunnelKey) &&
        maze[tunnelExit.y][tunnelExit.x] === CellType.PATH
      ) {
        queue.push(tunnelExit);
      }
    }
  }

  return reachable;
}

function isHorizontallySymmetrical(maze) {
  const width = maze[0].length;
  const height = maze.length;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < Math.floor(width / 2); x++) {
      const mirrorX = width - 1 - x;
      if (maze[y][x] !== maze[y][mirrorX]) {
        console.log(
          `❌ Asymmetry found at (${x}, ${y}) vs (${mirrorX}, ${y}): ${maze[y][x]} !== ${maze[y][mirrorX]}`
        );
        return false;
      }
    }
  }
  return true;
}

function getDotPositions(maze) {
  const positions = [];
  const powerPelletPositions = new Set(['1,3', '19,3', '1,17', '19,17']);

  // Tunnel entrance positions to exclude from dots
  const tunnelEntrances = new Set(['0,7', '20,7', '0,11', '20,11']);

  for (let y = 0; y < maze.length; y++) {
    for (let x = 0; x < maze[y].length; x++) {
      if (maze[y][x] === CellType.PATH) {
        const position = `${x},${y}`;

        // Skip certain positions (like Pacman starting position, near ghost house, power pellets, and tunnel entrances)
        if (
          !(x === 10 && y === 15) && // Pacman starting position
          !(x >= 9 && x <= 11 && y >= 8 && y <= 11) && // Near ghost house
          !powerPelletPositions.has(position) && // Power pellet positions
          !tunnelEntrances.has(position) // Tunnel entrance positions
        ) {
          positions.push({ x, y });
        }
      }
    }
  }

  return positions;
}

function getPowerPelletPositions() {
  return [
    { x: 1, y: 3 }, // Top-left
    { x: 19, y: 3 }, // Top-right
    { x: 1, y: 17 }, // Bottom-left
    { x: 19, y: 17 }, // Bottom-right
  ];
}

function printMaze(maze) {
  const symbols = {
    [CellType.WALL]: '█',
    [CellType.PATH]: ' ',
    [CellType.DOT]: '·',
    [CellType.POWER_PELLET]: 'o',
    [CellType.GHOST_HOUSE]: '#',
  };

  console.log('\nMaze Layout:');
  console.log('='.repeat(maze[0].length + 2));

  for (let y = 0; y < maze.length; y++) {
    let row = '';
    for (let x = 0; x < maze[y].length; x++) {
      if (x === 10 && y === 15) {
        row += 'P'; // Pacman position
      } else if (
        getPowerPelletPositions().some((p) => p.x === x && p.y === y)
      ) {
        row += 'O'; // Power pellet
      } else {
        row += symbols[maze[y][x]] || '?';
      }
    }
    console.log(`|${row}|`);
  }
  console.log('='.repeat(maze[0].length + 2));
}

// Run tests
function runTests() {
  console.log('🧪 PACMAN MAZE TEST SUITE');
  console.log('========================\n');

  // Print maze
  printMaze(sampleMaze);

  // Test 1: Symmetry
  console.log('🔄 Testing horizontal symmetry...');
  const isSymmetrical = isHorizontallySymmetrical(sampleMaze);
  console.log(`   Result: ${isSymmetrical ? '✅ PASS' : '❌ FAIL'}`);

  // Test 2: Accessibility
  console.log('\n🎯 Testing pellet accessibility...');
  const pacmanStartX = 10;
  const pacmanStartY = 15;
  const reachablePositions = findReachablePositions(
    sampleMaze,
    pacmanStartX,
    pacmanStartY
  );

  // Check power pellets
  const powerPellets = getPowerPelletPositions();
  const inaccessiblePowerPellets = powerPellets.filter(
    (pos) => !reachablePositions.has(`${pos.x},${pos.y}`)
  );

  console.log(`   Reachable positions: ${reachablePositions.size}`);
  console.log(
    `   Power pellets accessibility: ${inaccessiblePowerPellets.length === 0 ? '✅ PASS' : '❌ FAIL'}`
  );

  if (inaccessiblePowerPellets.length > 0) {
    console.log(
      `   ❌ Inaccessible power pellets: ${inaccessiblePowerPellets.map((p) => `(${p.x},${p.y})`).join(', ')}`
    );
  } else {
    console.log(
      `   ✅ All ${powerPellets.length} power pellets are accessible`
    );
  }

  // Check dots
  const dotPositions = getDotPositions(sampleMaze);
  const inaccessibleDots = dotPositions.filter(
    (pos) => !reachablePositions.has(`${pos.x},${pos.y}`)
  );

  console.log(`   Total dots: ${dotPositions.length}`);
  console.log(
    `   Dots accessibility: ${inaccessibleDots.length === 0 ? '✅ PASS' : '❌ FAIL'}`
  );

  if (inaccessibleDots.length > 0) {
    console.log(
      `   ❌ Inaccessible dots (${inaccessibleDots.length}): ${inaccessibleDots
        .slice(0, 5)
        .map((p) => `(${p.x},${p.y})`)
        .join(', ')}${inaccessibleDots.length > 5 ? '...' : ''}`
    );
  } else {
    console.log(`   ✅ All ${dotPositions.length} dots are accessible`);
  }

  // Test 3: Basic maze properties
  console.log('\n📊 Maze Statistics:');
  console.log(`   Dimensions: ${sampleMaze[0].length}x${sampleMaze.length}`);
  console.log(`   Total dots: ${dotPositions.length}`);
  console.log(`   Total power pellets: ${powerPellets.length}`);
  console.log(
    `   Total collectibles: ${dotPositions.length + powerPellets.length}`
  );
  console.log(`   Pacman start position: (${pacmanStartX}, ${pacmanStartY})`);

  // Final result
  const allTestsPassed =
    isSymmetrical &&
    inaccessibleDots.length === 0 &&
    inaccessiblePowerPellets.length === 0;

  console.log('\n🏆 FINAL RESULT:');
  console.log(
    `   ${allTestsPassed ? '✅ ALL TESTS PASSED! 🎉' : '❌ SOME TESTS FAILED 😞'}`
  );

  if (allTestsPassed) {
    console.log(
      '   The maze is perfectly symmetrical and all pellets are accessible to Pacman!'
    );
  } else {
    console.log('   The maze needs adjustments to pass all tests.');
  }

  return allTestsPassed;
}

// Run the tests
if (require.main === module) {
  runTests();
}

module.exports = {
  sampleMaze,
  runTests,
  isHorizontallySymmetrical,
  findReachablePositions,
  getDotPositions,
  getPowerPelletPositions,
};
