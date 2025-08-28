import React, { useCallback, useEffect, useState } from 'react';
import { useGhostAI, usePowerPelletSystem } from '../hooks';
import type { Direction, GhostColor, GhostState, Position } from '../types';
import { Ghost, Pacman, PowerPellet } from './';

// Simplified maze for demo (smaller 11x11 grid)
const demoMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const DEMO_GHOST_CONFIGS = [
  {
    id: 'blinky',
    color: 'red' as GhostColor,
    personality: 'aggressive' as const,
    initialPosition: { x: 3, y: 3 },
    initialDirection: 'right' as Direction,
  },
  {
    id: 'pinky',
    color: 'pink' as GhostColor,
    personality: 'ambush' as const,
    initialPosition: { x: 7, y: 3 },
    initialDirection: 'left' as Direction,
  },
  {
    id: 'inky',
    color: 'blue' as GhostColor,
    personality: 'random' as const,
    initialPosition: { x: 3, y: 7 },
    initialDirection: 'up' as Direction,
  },
  {
    id: 'clyde',
    color: 'orange' as GhostColor,
    personality: 'patrol' as const,
    initialPosition: { x: 7, y: 7 },
    initialDirection: 'down' as Direction,
  },
];

export const GhostIntegrationDemo: React.FC = () => {
  const [pacmanPosition, setPacmanPosition] = useState<Position>({
    x: 5,
    y: 9,
  });
  const [pacmanDirection, setPacmanDirection] = useState<Direction>('up');
  const [ghosts, setGhosts] = useState<GhostState[]>([]);
  const [score, setScore] = useState(0);
  const [powerPelletPosition] = useState<Position>({
    x: 5,
    y: 1,
  });
  const [showPowerPellet, setShowPowerPellet] = useState(true);
  const [gameSpeed, setGameSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);

  // Power pellet system
  const powerPelletSystem = usePowerPelletSystem({
    onPowerPelletCollected: (position, points) => {
      console.log(
        `Demo: Power pellet collected at ${position.x}, ${position.y} for ${points} points`
      );
      setScore((prev) => prev + points);
      setShowPowerPellet(false);
    },
    onPowerModeStart: () => {
      console.log('Demo: Power mode activated!');
    },
    onPowerModeEnd: () => {
      console.log('Demo: Power mode ended!');
    },
    onGhostConsumed: (ghost, points) => {
      console.log(`Demo: Ghost ${ghost.id} consumed for ${points} points!`);
      setScore((prev) => prev + points);
    },
    onScoreUpdate: (points) => {
      setScore((prev) => prev + points);
    },
    powerModeDuration: 6000, // 6 seconds for demo
  });

  // Ghost position update handler
  const handleGhostPositionChange = useCallback(
    (ghostId: string, position: Position) => {
      setGhosts((prev) =>
        prev.map((ghost) =>
          ghost.id === ghostId
            ? { ...ghost, x: position.x, y: position.y }
            : ghost
        )
      );
    },
    []
  );

  // Ghost direction update handler
  const handleGhostDirectionChange = useCallback(
    (ghostId: string, direction: Direction) => {
      setGhosts((prev) =>
        prev.map((ghost) =>
          ghost.id === ghostId ? { ...ghost, direction } : ghost
        )
      );
    },
    []
  );

  // Individual ghost AI hooks (must be called at top level)
  const blinkyAI = useGhostAI({
    ghostId: 'blinky',
    maze: demoMaze,
    initialPosition: DEMO_GHOST_CONFIGS[0].initialPosition,
    initialDirection: DEMO_GHOST_CONFIGS[0].initialDirection,
    personality: DEMO_GHOST_CONFIGS[0].personality,
    speed: gameSpeed,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
  });

  const pinkyAI = useGhostAI({
    ghostId: 'pinky',
    maze: demoMaze,
    initialPosition: DEMO_GHOST_CONFIGS[1].initialPosition,
    initialDirection: DEMO_GHOST_CONFIGS[1].initialDirection,
    personality: DEMO_GHOST_CONFIGS[1].personality,
    speed: gameSpeed,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
  });

  const inkyAI = useGhostAI({
    ghostId: 'inky',
    maze: demoMaze,
    initialPosition: DEMO_GHOST_CONFIGS[2].initialPosition,
    initialDirection: DEMO_GHOST_CONFIGS[2].initialDirection,
    personality: DEMO_GHOST_CONFIGS[2].personality,
    speed: gameSpeed,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
  });

  const clydeAI = useGhostAI({
    ghostId: 'clyde',
    maze: demoMaze,
    initialPosition: DEMO_GHOST_CONFIGS[3].initialPosition,
    initialDirection: DEMO_GHOST_CONFIGS[3].initialDirection,
    personality: DEMO_GHOST_CONFIGS[3].personality,
    speed: gameSpeed,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
  });

  // Collect all ghost AIs for easier management
  const ghostAIs = [blinkyAI, pinkyAI, inkyAI, clydeAI];

  // Initialize ghost states
  useEffect(() => {
    const initialGhosts: GhostState[] = DEMO_GHOST_CONFIGS.map((config) => ({
      id: config.id,
      x: config.initialPosition.x,
      y: config.initialPosition.y,
      direction: config.initialDirection,
      color: config.color,
      isVulnerable: false,
      isFlashing: false,
    }));
    setGhosts(initialGhosts);
  }, []);

  // Update ghost vulnerability based on power mode
  useEffect(() => {
    setGhosts((prev) => powerPelletSystem.updateGhostStates(prev));
  }, [powerPelletSystem.powerMode.isActive, powerPelletSystem.isFlashingPhase]);

  // Handle power pellet collection
  const handlePowerPelletClick = () => {
    if (showPowerPellet) {
      powerPelletSystem.handlePowerPelletCollection(powerPelletPosition);
    }
  };

  // Manual Pacman movement for demo
  const movePacman = (direction: Direction) => {
    setPacmanDirection(direction);
    setPacmanPosition((prev) => {
      const newPos = { ...prev };
      switch (direction) {
        case 'up':
          newPos.y = Math.max(1, prev.y - 1);
          break;
        case 'down':
          newPos.y = Math.min(9, prev.y + 1);
          break;
        case 'left':
          newPos.x = Math.max(1, prev.x - 1);
          break;
        case 'right':
          newPos.x = Math.min(9, prev.x + 1);
          break;
      }

      // Check for wall collision
      if (demoMaze[newPos.y][newPos.x] === 1) {
        return prev; // Don't move if hitting wall
      }

      // Check for power pellet collection
      if (
        showPowerPellet &&
        newPos.x === powerPelletPosition.x &&
        newPos.y === powerPelletPosition.y
      ) {
        handlePowerPelletClick();
      }

      return newPos;
    });
  };

  // Check for ghost collisions
  useEffect(() => {
    const collisionResult = powerPelletSystem.checkAndHandleGhostConsumption(
      pacmanPosition,
      ghosts
    );

    if (collisionResult.consumedGhosts.length > 0) {
      setGhosts(collisionResult.updatedGhosts);
    }
  }, [pacmanPosition, ghosts, powerPelletSystem]);

  // Control AI running state
  const toggleAI = () => {
    if (isRunning) {
      ghostAIs.forEach((ai) => ai.stopAI());
      setIsRunning(false);
    } else {
      ghostAIs.forEach((ai) => ai.startAI());
      setIsRunning(true);
    }
  };

  const resetDemo = () => {
    // Stop all AIs
    ghostAIs.forEach((ai) => ai.stopAI());
    setIsRunning(false);

    // Reset positions
    setPacmanPosition({ x: 5, y: 9 });
    setPacmanDirection('up');
    setScore(0);
    setShowPowerPellet(true);

    // Reset ghosts
    const resetGhosts: GhostState[] = DEMO_GHOST_CONFIGS.map((config) => ({
      id: config.id,
      x: config.initialPosition.x,
      y: config.initialPosition.y,
      direction: config.initialDirection,
      color: config.color,
      isVulnerable: false,
      isFlashing: false,
    }));
    setGhosts(resetGhosts);

    // Reset power system
    powerPelletSystem.resetPowerSystem();

    // Reset AIs
    setTimeout(() => {
      ghostAIs.forEach((ai) => ai.resetAI());
    }, 100);
  };

  const cellSize = 32;

  return (
    <div className="p-6 bg-gray-900 text-white rounded-lg">
      <div className="text-center mb-6">
        <h2 className="text-3xl font-bold text-yellow-400 mb-2">
          Ghost AI & Power Mode Demo
        </h2>
        <p className="text-gray-300">
          Interactive demonstration of ghost AI and power pellet mechanics
        </p>
      </div>

      {/* Game Stats */}
      <div className="flex gap-6 justify-center mb-4 text-lg">
        <span className="text-yellow-400">Score: {score}</span>
        <span className="text-green-400">
          AI Status: {isRunning ? 'Running' : 'Stopped'}
        </span>
        <span className="text-blue-400">Speed: {gameSpeed}ms</span>
      </div>

      {/* Power Mode Status */}
      {powerPelletSystem.powerMode.isActive && (
        <div className="text-center mb-4">
          <div className="text-blue-400 text-xl font-bold animate-pulse">
            🔥 POWER MODE ACTIVE 🔥
          </div>
          <div className="text-white">
            Time Remaining:{' '}
            {Math.ceil(powerPelletSystem.powerMode.timeRemaining / 1000)}s
          </div>
          <div className="text-purple-400">
            Ghosts Eaten: {powerPelletSystem.powerMode.ghostsEaten}
          </div>
          {powerPelletSystem.isFlashingPhase && (
            <div className="text-yellow-400 animate-bounce">
              ⚠️ Power Mode Ending Soon! ⚠️
            </div>
          )}
        </div>
      )}

      {/* Game Board */}
      <div className="flex justify-center mb-6">
        <div
          className="relative bg-black border-2 border-blue-500 p-2"
          style={{
            width: 11 * cellSize + 16,
            height: 11 * cellSize + 16,
          }}
        >
          {/* Render maze */}
          {demoMaze.map((row, y) =>
            row.map((cell, x) => (
              <div
                key={`${x}-${y}`}
                className={`absolute ${
                  cell === 1 ? 'bg-blue-600' : 'bg-black'
                }`}
                style={{
                  left: x * cellSize + 8,
                  top: y * cellSize + 8,
                  width: cellSize - 2,
                  height: cellSize - 2,
                }}
              />
            ))
          )}

          {/* Power Pellet */}
          {showPowerPellet && (
            <div
              style={{
                position: 'absolute',
                left: powerPelletPosition.x * cellSize + 8,
                top: powerPelletPosition.y * cellSize + 8,
              }}
            >
              <PowerPellet
                x={powerPelletPosition.x}
                y={powerPelletPosition.y}
                isCollected={false}
                onCollect={handlePowerPelletClick}
              />
            </div>
          )}

          {/* Pacman */}
          <div
            style={{
              position: 'absolute',
              left: pacmanPosition.x * cellSize + 8,
              top: pacmanPosition.y * cellSize + 8,
            }}
          >
            <Pacman
              x={pacmanPosition.x}
              y={pacmanPosition.y}
              direction={pacmanDirection}
              isMoving={true}
              isEating={false}
            />
          </div>

          {/* Ghosts */}
          {ghosts.map((ghost) => (
            <div
              key={ghost.id}
              style={{
                position: 'absolute',
                left: ghost.x * cellSize + 8,
                top: ghost.y * cellSize + 8,
              }}
            >
              <Ghost {...ghost} />
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-4">
        {/* Movement Controls */}
        <div className="text-center">
          <p className="text-gray-300 mb-2">Move Pacman:</p>
          <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
            <div></div>
            <button
              onClick={() => movePacman('up')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded font-bold"
            >
              ↑
            </button>
            <div></div>
            <button
              onClick={() => movePacman('left')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded font-bold"
            >
              ←
            </button>
            <div></div>
            <button
              onClick={() => movePacman('right')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded font-bold"
            >
              →
            </button>
            <div></div>
            <button
              onClick={() => movePacman('down')}
              className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-3 rounded font-bold"
            >
              ↓
            </button>
            <div></div>
          </div>
        </div>

        {/* Game Controls */}
        <div className="flex gap-4 justify-center">
          <button
            onClick={toggleAI}
            className={`px-4 py-2 rounded font-bold ${
              isRunning
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-green-500 hover:bg-green-600 text-white'
            }`}
          >
            {isRunning ? 'Stop AI' : 'Start AI'}
          </button>

          <button
            onClick={handlePowerPelletClick}
            disabled={!showPowerPellet}
            className={`px-4 py-2 rounded font-bold ${
              showPowerPellet
                ? 'bg-purple-500 hover:bg-purple-600 text-white'
                : 'bg-gray-500 text-gray-300 cursor-not-allowed'
            }`}
          >
            Activate Power Mode
          </button>

          <button
            onClick={resetDemo}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold"
          >
            Reset Demo
          </button>
        </div>

        {/* Speed Control */}
        <div className="text-center">
          <label className="text-gray-300 mr-2">AI Speed:</label>
          <input
            type="range"
            min="100"
            max="1000"
            step="50"
            value={gameSpeed}
            onChange={(e) => setGameSpeed(Number(e.target.value))}
            className="mr-2"
          />
          <span className="text-white">{gameSpeed}ms</span>
        </div>
      </div>

      {/* Ghost AI Status */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {ghosts.map((ghost, index) => (
          <div
            key={ghost.id}
            className="bg-gray-800 p-3 rounded border"
            style={{ borderColor: ghost.color }}
          >
            <h4
              className="text-lg font-bold mb-1"
              style={{ color: ghost.color }}
            >
              {ghost.id.toUpperCase()}
            </h4>
            <p className="text-sm text-gray-300">
              Personality: {DEMO_GHOST_CONFIGS[index].personality}
            </p>
            <p className="text-sm text-gray-300">
              Position: ({ghost.x}, {ghost.y})
            </p>
            <p className="text-sm text-gray-300">
              Direction: {ghost.direction}
            </p>
            <p className="text-sm">
              Status:{' '}
              <span
                className={
                  ghost.isVulnerable
                    ? ghost.isFlashing
                      ? 'text-yellow-400 animate-pulse'
                      : 'text-blue-400'
                    : 'text-green-400'
                }
              >
                {ghost.isVulnerable
                  ? ghost.isFlashing
                    ? 'Vulnerable (Ending)'
                    : 'Vulnerable'
                  : 'Normal'}
              </span>
            </p>
          </div>
        ))}
      </div>

      {/* Instructions */}
      <div className="mt-6 text-center text-gray-300">
        <h3 className="text-lg font-bold mb-2">Instructions:</h3>
        <ul className="text-sm space-y-1">
          <li>• Use arrow buttons to move Pacman around the demo maze</li>
          <li>• Click "Start AI" to activate autonomous ghost behavior</li>
          <li>
            • Each ghost has a different personality (aggressive, ambush,
            random, patrol)
          </li>
          <li>
            • Collect the power pellet (purple dot) to make ghosts vulnerable
          </li>
          <li>
            • During power mode, collide with blue ghosts to eat them for points
          </li>
          <li>
            • Watch the flashing animation when power mode is about to end
          </li>
          <li>• Adjust AI speed to see different behaviors more clearly</li>
        </ul>
      </div>
    </div>
  );
};

export default GhostIntegrationDemo;
