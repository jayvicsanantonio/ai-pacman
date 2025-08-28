import React, { useCallback, useEffect, useState } from 'react';
import {
  GameBoard,
  GameControls,
  GhostIntegrationDemo,
  PowerModeDemo,
} from './components';
import MazeVisualization from './components/MazeVisualization';
import {
  useCollectibles,
  useGhostAI,
  usePowerPelletSystem,
  useSimpleMovement,
} from './hooks';
import type { Direction, GhostColor, GhostState, Position } from './types';
import {
  generateInitialDots,
  generateInitialPowerPellets,
  sampleMaze,
} from './utils';

const COMPREHENSIVE_GHOST_CONFIGS = [
  {
    id: 'blinky',
    color: 'red' as GhostColor,
    personality: 'aggressive' as const,
    initialPosition: { x: 10, y: 9 },
    initialDirection: 'up' as Direction,
    description: 'Blinky - Aggressive chaser, directly targets Pacman',
  },
  {
    id: 'pinky',
    color: 'pink' as GhostColor,
    personality: 'ambush' as const,
    initialPosition: { x: 9, y: 9 },
    initialDirection: 'up' as Direction,
    description: 'Pinky - Ambusher, targets 4 cells ahead of Pacman',
  },
  {
    id: 'inky',
    color: 'blue' as GhostColor,
    personality: 'random' as const,
    initialPosition: { x: 11, y: 9 },
    initialDirection: 'up' as Direction,
    description: 'Inky - Unpredictable, mixes chase with random movement',
  },
  {
    id: 'clyde',
    color: 'orange' as GhostColor,
    personality: 'patrol' as const,
    initialPosition: { x: 10, y: 10 },
    initialDirection: 'up' as Direction,
    description: 'Clyde - Patroller, uses predictable patterns with delays',
  },
];

type TestMode =
  | 'full-game'
  | 'power-demo'
  | 'ghost-demo'
  | 'ai-showcase'
  | 'maze-analysis';

export const TestApp: React.FC = () => {
  const [testMode, setTestMode] = useState<TestMode>('full-game');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<
    'playing' | 'paused' | 'game-over'
  >('playing');
  const [ghosts, setGhosts] = useState<GhostState[]>([]);
  const [isEating, setIsEating] = useState(false);
  const [showAIDebugInfo, setShowAIDebugInfo] = useState(false);

  // Initialize collectibles
  const initialDots = generateInitialDots(sampleMaze);
  const initialPowerPellets = generateInitialPowerPellets();

  const {
    dots,
    powerPellets,
    collectDot,
    collectPowerPellet,
    getTotalDotsRemaining,
    getTotalPowerPelletsRemaining,
  } = useCollectibles(initialDots, initialPowerPellets);

  // Power pellet system with comprehensive callbacks
  const powerPelletSystem = usePowerPelletSystem({
    onPowerPelletCollected: (position, points) => {
      console.log(
        `🟣 Power pellet collected at (${position.x}, ${position.y}) for ${points} points`
      );
      setScore((prev) => prev + points);
    },
    onPowerModeStart: () => {
      console.log('🔥 POWER MODE ACTIVATED!');
    },
    onPowerModeEnd: () => {
      console.log('💨 Power mode ended');
    },
    onGhostConsumed: (ghost, points) => {
      console.log(`👻 Ghost ${ghost.id} consumed for ${points} points!`);
      setScore((prev) => prev + points);
    },
    onScoreUpdate: (points) => {
      setScore((prev) => prev + points);
    },
    powerModeDuration: 10000, // 10 seconds
  });

  // Pacman movement system
  const {
    position: pacmanPosition,
    direction: pacmanDirection,
    isMoving: pacmanIsMoving,
    setDirection,
    startMoving,
    stopMoving,
    resetMovement,
  } = useSimpleMovement({
    maze: sampleMaze,
    initialPosition: { x: 10, y: 15 },
    initialDirection: 'right',
    speed: 200,
    onPositionChange: (position) => {
      // Check for dot collection
      const dotKey = `${position.x},${position.y}`;
      if (dots.has(dotKey)) {
        handleDotCollect(position.x, position.y);
      }

      // Check for power pellet collection
      if (powerPellets.has(dotKey)) {
        handlePowerPelletCollect(position.x, position.y);
      }

      // Check for ghost collisions
      handleGhostCollisions(position);
    },
    onDirectionChange: (direction) => {
      console.log(`🟡 Pacman direction: ${direction}`);
    },
  });

  // Ghost position and direction handlers
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
    maze: sampleMaze,
    initialPosition: COMPREHENSIVE_GHOST_CONFIGS[0].initialPosition,
    initialDirection: COMPREHENSIVE_GHOST_CONFIGS[0].initialDirection,
    personality: COMPREHENSIVE_GHOST_CONFIGS[0].personality,
    speed: 250,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
    onModeChange: (ghostId, mode) => {
      console.log(`👻 ${ghostId} AI mode changed to: ${mode}`);
    },
  });

  const pinkyAI = useGhostAI({
    ghostId: 'pinky',
    maze: sampleMaze,
    initialPosition: COMPREHENSIVE_GHOST_CONFIGS[1].initialPosition,
    initialDirection: COMPREHENSIVE_GHOST_CONFIGS[1].initialDirection,
    personality: COMPREHENSIVE_GHOST_CONFIGS[1].personality,
    speed: 250,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
    onModeChange: (ghostId, mode) => {
      console.log(`👻 ${ghostId} AI mode changed to: ${mode}`);
    },
  });

  const inkyAI = useGhostAI({
    ghostId: 'inky',
    maze: sampleMaze,
    initialPosition: COMPREHENSIVE_GHOST_CONFIGS[2].initialPosition,
    initialDirection: COMPREHENSIVE_GHOST_CONFIGS[2].initialDirection,
    personality: COMPREHENSIVE_GHOST_CONFIGS[2].personality,
    speed: 250,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
    onModeChange: (ghostId, mode) => {
      console.log(`👻 ${ghostId} AI mode changed to: ${mode}`);
    },
  });

  const clydeAI = useGhostAI({
    ghostId: 'clyde',
    maze: sampleMaze,
    initialPosition: COMPREHENSIVE_GHOST_CONFIGS[3].initialPosition,
    initialDirection: COMPREHENSIVE_GHOST_CONFIGS[3].initialDirection,
    personality: COMPREHENSIVE_GHOST_CONFIGS[3].personality,
    speed: 250,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
    onModeChange: (ghostId, mode) => {
      console.log(`👻 ${ghostId} AI mode changed to: ${mode}`);
    },
  });

  // Collect all ghost AIs for easier management
  const ghostAIs = [blinkyAI, pinkyAI, inkyAI, clydeAI];

  // Initialize ghosts
  useEffect(() => {
    const initialGhosts: GhostState[] = COMPREHENSIVE_GHOST_CONFIGS.map(
      (config) => ({
        id: config.id,
        x: config.initialPosition.x,
        y: config.initialPosition.y,
        direction: config.initialDirection,
        color: config.color,
        isVulnerable: false,
        isFlashing: false,
      })
    );
    setGhosts(initialGhosts);
  }, []);

  // Update ghost vulnerability states
  useEffect(() => {
    setGhosts((prev) => powerPelletSystem.updateGhostStates(prev));
  }, [powerPelletSystem.powerMode.isActive, powerPelletSystem.isFlashingPhase]);

  // Handle collectibles
  const handleDotCollect = (x: number, y: number) => {
    collectDot(x, y);
    setScore((prev) => prev + 10);
    setIsEating(true);
    setTimeout(() => setIsEating(false), 200);

    if (getTotalDotsRemaining() - 1 === 0) {
      console.log('🎉 Victory! All dots collected!');
      setGameStatus('game-over');
      stopMoving();
      ghostAIs.forEach((ai) => ai.stopAI());
    }
  };

  const handlePowerPelletCollect = (x: number, y: number) => {
    collectPowerPellet(x, y);
    powerPelletSystem.handlePowerPelletCollection({ x, y });
    setIsEating(true);
    setTimeout(() => setIsEating(false), 400);
  };

  // Handle ghost collisions
  const handleGhostCollisions = useCallback(
    (pacmanPos: Position) => {
      const collisionResult = powerPelletSystem.checkAndHandleGhostConsumption(
        pacmanPos,
        ghosts
      );

      if (collisionResult.consumedGhosts.length > 0) {
        setGhosts(collisionResult.updatedGhosts);
      } else {
        // Check for game over collision
        const collidingGhost = ghosts.find(
          (ghost) =>
            ghost.x === pacmanPos.x &&
            ghost.y === pacmanPos.y &&
            !powerPelletSystem.isGhostVulnerable(ghost)
        );

        if (collidingGhost) {
          console.log(`💀 Game Over - Caught by ${collidingGhost.id}!`);
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameStatus('game-over');
              stopMoving();
              ghostAIs.forEach((ai) => ai.stopAI());
            } else {
              resetMovement();
              ghostAIs.forEach((ai) => ai.resetAI());
            }
            return newLives;
          });
        }
      }
    },
    [ghosts, powerPelletSystem, stopMoving, resetMovement, ghostAIs]
  );

  // Game controls
  const handleDirectionChange = (direction: Direction) => {
    if (gameStatus === 'playing') {
      setDirection(direction);
      // Start moving if not already moving
      if (!pacmanIsMoving) {
        startMoving();
      }
    }
  };

  const handlePause = () => {
    if (gameStatus === 'game-over') return;

    if (gameStatus === 'playing') {
      setGameStatus('paused');
      stopMoving();
      ghostAIs.forEach((ai) => ai.stopAI());
    } else {
      setGameStatus('playing');
      startMoving();
      ghostAIs.forEach((ai) => ai.startAI());
    }
  };

  const handleRestart = () => {
    setScore(0);
    setLives(3);
    setGameStatus('playing');
    setIsEating(false);
    resetMovement();
    powerPelletSystem.resetPowerSystem();
    ghostAIs.forEach((ai) => ai.resetAI());
  };

  const handleTestPowerMode = () => {
    powerPelletSystem.handlePowerPelletCollection({
      x: pacmanPosition.x,
      y: pacmanPosition.y,
    });
  };

  const renderModeContent = () => {
    switch (testMode) {
      case 'power-demo':
        return <PowerModeDemo />;

      case 'ghost-demo':
        return <GhostIntegrationDemo />;

      case 'maze-analysis':
        return (
          <div className="w-full">
            <MazeVisualization />
          </div>
        );

      case 'ai-showcase':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-yellow-400 mb-4">
                Ghost AI Showcase
              </h2>
              <p className="text-gray-300 mb-4">
                Watch different ghost AI behaviors in action
              </p>
            </div>

            {/* AI Debug Controls */}
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => setShowAIDebugInfo(!showAIDebugInfo)}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded"
              >
                {showAIDebugInfo ? 'Hide' : 'Show'} AI Debug Info
              </button>
              <button
                onClick={handleTestPowerMode}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Test Power Mode
              </button>
            </div>

            {/* AI Debug Information */}
            {showAIDebugInfo && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {COMPREHENSIVE_GHOST_CONFIGS.map((config, index) => {
                  const ghost = ghosts.find((g) => g.id === config.id);
                  const ai = ghostAIs[index];

                  return (
                    <div
                      key={config.id}
                      className="bg-gray-800 p-4 rounded border"
                      style={{ borderColor: config.color }}
                    >
                      <h3
                        className="font-bold text-lg mb-2"
                        style={{ color: config.color }}
                      >
                        {config.id.toUpperCase()}
                      </h3>
                      <div className="text-sm space-y-1">
                        <p className="text-gray-300">{config.description}</p>
                        {ghost && (
                          <>
                            <p>
                              Position: ({ghost.x}, {ghost.y})
                            </p>
                            <p>Direction: {ghost.direction}</p>
                            <p
                              className={
                                ghost.isVulnerable
                                  ? 'text-blue-400'
                                  : 'text-green-400'
                              }
                            >
                              Status:{' '}
                              {ghost.isVulnerable
                                ? ghost.isFlashing
                                  ? 'Vulnerable (Ending)'
                                  : 'Vulnerable'
                                : 'Normal'}
                            </p>
                            <p>
                              Target: ({Math.round(ai.targetPosition?.x || 0)},{' '}
                              {Math.round(ai.targetPosition?.y || 0)})
                            </p>
                            <p>Mode: {ai.mode}</p>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );

      case 'full-game':
      default:
        return (
          <>
            <div className="w-full max-w-4xl relative">
              <GameBoard
                maze={sampleMaze}
                dots={dots}
                powerPellets={powerPellets}
                onCellClick={(x, y) =>
                  console.log(`Cell clicked: (${x}, ${y})`)
                }
                onDotCollect={handleDotCollect}
                onPowerPelletCollect={handlePowerPelletCollect}
                pacman={{
                  x: pacmanPosition.x,
                  y: pacmanPosition.y,
                  direction: pacmanDirection,
                  isMoving: pacmanIsMoving,
                  isEating,
                }}
                ghosts={ghosts}
              />
            </div>

            {/* Game Controls */}
            <GameControls
              onDirectionChange={handleDirectionChange}
              onPause={handlePause}
              onRestart={handleRestart}
              disabled={gameStatus === 'game-over'}
            />

            {/* Test Controls */}
            <div className="flex gap-4 justify-center mt-4">
              <button
                onClick={handleTestPowerMode}
                disabled={powerPelletSystem.powerMode.isActive}
                className={`px-4 py-2 rounded font-bold ${
                  powerPelletSystem.powerMode.isActive
                    ? 'bg-gray-500 text-gray-300 cursor-not-allowed'
                    : 'bg-purple-500 hover:bg-purple-600 text-white'
                }`}
              >
                Test Power Mode
              </button>
              <button
                onClick={() => setShowAIDebugInfo(!showAIDebugInfo)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                {showAIDebugInfo ? 'Hide' : 'Show'} AI Info
              </button>
            </div>

            {/* AI Debug Info in Full Game */}
            {showAIDebugInfo && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {COMPREHENSIVE_GHOST_CONFIGS.map((config, index) => {
                  const ghost = ghosts.find((g) => g.id === config.id);
                  const ai = ghostAIs[index];

                  return (
                    <div
                      key={config.id}
                      className="bg-gray-800 p-3 rounded text-sm"
                    >
                      <h4
                        className="font-bold mb-1"
                        style={{ color: config.color }}
                      >
                        {config.id.toUpperCase()}
                      </h4>
                      {ghost && (
                        <>
                          <p>
                            Pos: ({ghost.x}, {ghost.y})
                          </p>
                          <p>Dir: {ghost.direction}</p>
                          <p>Mode: {ai.mode}</p>
                          <p
                            className={
                              ghost.isVulnerable
                                ? 'text-blue-400'
                                : 'text-green-400'
                            }
                          >
                            {ghost.isVulnerable ? 'Vulnerable' : 'Normal'}
                          </p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Game Over Screen */}
            {gameStatus === 'game-over' && (
              <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
                <div className="bg-gray-800 rounded-lg p-8 text-center border-2 border-yellow-400">
                  <h2 className="text-3xl font-bold text-yellow-400 mb-4">
                    {lives <= 0 ? 'Game Over!' : 'Victory!'}
                  </h2>
                  <p className="text-white text-xl mb-2">
                    Final Score: {score.toLocaleString()}
                  </p>
                  {lives <= 0 ? (
                    <p className="text-red-400 mb-4">The ghosts got you!</p>
                  ) : (
                    <p className="text-green-400 mb-4">All dots collected!</p>
                  )}
                  <button
                    onClick={handleRestart}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-bold"
                  >
                    Play Again
                  </button>
                </div>
              </div>
            )}
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          Tasks 6 & 7 - Ghost AI & Power Mechanics Test
        </h1>
        <p className="text-gray-300 mb-4">
          Comprehensive testing of ghost components and power pellet system
        </p>

        {/* Mode Selection */}
        <div className="flex gap-2 justify-center mb-4 flex-wrap">
          {[
            { mode: 'full-game', label: 'Full Game' },
            { mode: 'power-demo', label: 'Power Demo' },
            { mode: 'ghost-demo', label: 'Ghost Demo' },
            { mode: 'ai-showcase', label: 'AI Showcase' },
            { mode: 'maze-analysis', label: 'Maze Analysis' },
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setTestMode(mode as TestMode)}
              className={`px-4 py-2 rounded font-bold transition-colors ${
                testMode === mode
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Game Stats (only show in full game mode) */}
        {testMode === 'full-game' && (
          <div className="flex gap-6 justify-center text-lg font-semibold mb-4">
            <span className="text-yellow-400">
              Score: {score.toLocaleString()}
            </span>
            <span className="text-red-400">Lives: {lives}</span>
            <span className="text-green-400">Status: {gameStatus}</span>
            <span className="text-blue-400">
              Dots: {getTotalDotsRemaining()}
            </span>
            <span className="text-purple-400">
              Pellets: {getTotalPowerPelletsRemaining()}
            </span>
          </div>
        )}

        {/* Power Mode Indicator */}
        {powerPelletSystem.powerMode.isActive && (
          <div className="mb-4">
            <div className="text-blue-400 text-xl font-bold animate-pulse">
              🔥 POWER MODE ACTIVE 🔥
            </div>
            <div className="flex gap-4 justify-center text-sm">
              <span>
                Time:{' '}
                {Math.ceil(powerPelletSystem.powerMode.timeRemaining / 1000)}s
              </span>
              <span>
                Ghosts Eaten: {powerPelletSystem.powerMode.ghostsEaten}
              </span>
              {powerPelletSystem.isFlashingPhase && (
                <span className="text-yellow-400 animate-bounce">
                  ⚠️ Ending Soon!
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mode Content */}
      <div className="flex flex-col items-center">{renderModeContent()}</div>

      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-sm">
        <h3 className="font-bold mb-2">Features Demonstrated:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <div>
            <h4 className="text-yellow-400 font-bold">Task 6 - Ghost AI:</h4>
            <ul className="text-left space-y-1">
              <li>• Ghost component with TailwindCSS styling</li>
              <li>• Four ghost colors with unique personalities</li>
              <li>• Autonomous AI with pathfinding</li>
              <li>• Chase, scatter, flee, and eaten modes</li>
              <li>• Collision detection and wall avoidance</li>
              <li>• Real-time position and direction updates</li>
            </ul>
          </div>
          <div>
            <h4 className="text-purple-400 font-bold">
              Task 7 - Power Mechanics:
            </h4>
            <ul className="text-left space-y-1">
              <li>• Power pellet collection system</li>
              <li>• Timed power mode with countdown</li>
              <li>• Ghost vulnerability states</li>
              <li>• Flashing animation before power end</li>
              <li>• Progressive scoring for eaten ghosts</li>
              <li>• Visual feedback and state management</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApp;
