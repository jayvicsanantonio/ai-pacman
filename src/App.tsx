import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameBoard, GameControls } from './components';

import { useCollectibles, useGhostAI, usePowerPelletSystem } from './hooks';
import { useSimpleMovement } from './hooks/useSimpleMovement';
import type { Direction, GhostColor, GhostState, Position } from './types';
import {
  generateInitialDots,
  generateInitialPowerPellets,
  sampleMaze,
} from './utils';

const GHOST_CONFIGS = [
  {
    id: 'blinky',
    color: 'red' as GhostColor,
    personality: 'aggressive' as const,
    initialPosition: { x: 10, y: 9 },
    initialDirection: 'up' as Direction,
  },
  {
    id: 'pinky',
    color: 'pink' as GhostColor,
    personality: 'ambush' as const,
    initialPosition: { x: 9, y: 9 },
    initialDirection: 'up' as Direction,
  },
  {
    id: 'inky',
    color: 'blue' as GhostColor,
    personality: 'random' as const,
    initialPosition: { x: 11, y: 9 },
    initialDirection: 'up' as Direction,
  },
  {
    id: 'clyde',
    color: 'orange' as GhostColor,
    personality: 'patrol' as const,
    initialPosition: { x: 10, y: 10 },
    initialDirection: 'up' as Direction,
  },
];

function App() {
  const initialDots = generateInitialDots(sampleMaze);
  const initialPowerPellets = generateInitialPowerPellets();

  // State for eating animation
  const [isEating, setIsEating] = useState(false);
  const eatingTimeoutRef = useRef<number | null>(null);

  // Game state
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameStatus, setGameStatus] = useState<
    'playing' | 'paused' | 'game-over'
  >('playing');
  const [ghosts, setGhosts] = useState<GhostState[]>([]);

  // Collectibles management
  const {
    dots,
    powerPellets,
    collectDot,
    collectPowerPellet,
    resetCollectibles,
    getTotalDotsRemaining,
    getTotalPowerPelletsRemaining,
  } = useCollectibles(initialDots, initialPowerPellets);
  // Memoized power pellet system callbacks to prevent unnecessary re-renders
  const powerPelletCallbacks = useMemo(
    () => ({
      onPowerPelletCollected: (position: Position, points: number) => {
        console.log(
          `Power pellet collected at ${position.x}, ${position.y} for ${points} points`
        );
        setScore((prev) => prev + points);
      },
      onPowerModeStart: () => {
        console.log('Power mode activated!');
      },
      onPowerModeEnd: () => {
        console.log('Power mode ended!');
      },
      onGhostConsumed: (ghost: GhostState, points: number) => {
        console.log(`Ghost ${ghost.id} consumed for ${points} points!`);
        setScore((prev) => prev + points);
      },
      onScoreUpdate: (points: number) => {
        setScore((prev) => prev + points);
      },
      powerModeDuration: 8000, // 8 seconds
    }),
    []
  );

  // Power pellet system
  const powerPelletSystem = usePowerPelletSystem(powerPelletCallbacks);

  // Initialize Pacman movement
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
    initialPosition: { x: 10, y: 15 }, // Starting position in the maze
    initialDirection: 'right',
    speed: 200, // Movement speed in milliseconds
    onPositionChange: (position) => {
      console.log(`Pacman moved to ${position.x}, ${position.y}`);

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
      console.log(`Pacman direction changed to ${direction}`);
    },
  });

  // Memoized ghost update handlers for smooth movement
  const handleGhostPositionChange = useCallback(
    (ghostId: string, position: { x: number; y: number }) => {
      // Update visual position for smooth rendering
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

  // Memoized ghost AI configuration to prevent unnecessary re-creation
  const ghostAIConfig = useMemo(
    () => ({
      maze: sampleMaze,
      speed: 200, // Base speed, will be overridden dynamically
      onPositionChange: handleGhostPositionChange,
      onDirectionChange: handleGhostDirectionChange,
    }),
    [handleGhostPositionChange, handleGhostDirectionChange]
  );

  // Individual ghost AI hooks with optimized configuration
  const blinkyAI = useGhostAI({
    ghostId: 'blinky',
    ...ghostAIConfig,
    speed: powerPelletSystem.powerMode.isActive ? 450 : 200, // Moderately slow during power mode
    initialPosition: GHOST_CONFIGS[0].initialPosition,
    initialDirection: GHOST_CONFIGS[0].initialDirection,
    personality: GHOST_CONFIGS[0].personality,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
  });

  const pinkyAI = useGhostAI({
    ghostId: 'pinky',
    ...ghostAIConfig,
    speed: powerPelletSystem.powerMode.isActive ? 450 : 200, // Moderately slow during power mode
    initialPosition: GHOST_CONFIGS[1].initialPosition,
    initialDirection: GHOST_CONFIGS[1].initialDirection,
    personality: GHOST_CONFIGS[1].personality,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
  });

  const inkyAI = useGhostAI({
    ghostId: 'inky',
    ...ghostAIConfig,
    speed: powerPelletSystem.powerMode.isActive ? 450 : 200, // Moderately slow during power mode
    initialPosition: GHOST_CONFIGS[2].initialPosition,
    initialDirection: GHOST_CONFIGS[2].initialDirection,
    personality: GHOST_CONFIGS[2].personality,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
  });

  const clydeAI = useGhostAI({
    ghostId: 'clyde',
    ...ghostAIConfig,
    speed: powerPelletSystem.powerMode.isActive ? 450 : 200, // Moderately slow during power mode
    initialPosition: GHOST_CONFIGS[3].initialPosition,
    initialDirection: GHOST_CONFIGS[3].initialDirection,
    personality: GHOST_CONFIGS[3].personality,
    pacmanPosition,
    pacmanDirection,
    isVulnerable: powerPelletSystem.powerMode.isActive,
  });

  // Collect all ghost AIs for easier management
  const ghostAIs = [blinkyAI, pinkyAI, inkyAI, clydeAI];

  // Initialize ghost states
  useEffect(() => {
    const initialGhosts: GhostState[] = GHOST_CONFIGS.map((config) => ({
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

  // Handle ghost collisions
  const handleGhostCollisions = useCallback(
    (pacmanPos: { x: number; y: number }) => {
      const collisionResult = powerPelletSystem.checkAndHandleGhostConsumption(
        pacmanPos,
        ghosts
      );

      if (collisionResult.consumedGhosts.length > 0) {
        // Ghosts were consumed
        setGhosts(collisionResult.updatedGhosts);
      } else {
        // Check for regular collision (game over)
        const collidingGhost = ghosts.find(
          (ghost) =>
            ghost.x === pacmanPos.x &&
            ghost.y === pacmanPos.y &&
            !powerPelletSystem.isGhostVulnerable(ghost)
        );

        if (collidingGhost) {
          console.log('Game Over - Pacman caught by ghost!');
          setLives((prev) => {
            const newLives = prev - 1;
            if (newLives <= 0) {
              setGameStatus('game-over');
              stopMoving();
              // Stop all ghost AIs
              ghostAIs.forEach((ai) => ai.stopAI());
            } else {
              // Reset positions but continue game
              resetMovement();
              ghostAIs.forEach((ai) => ai.resetAI());
              // Restart movement after a brief delay
              setTimeout(() => {
                startMoving();
                ghostAIs.forEach((ai) => ai.startAI());
              }, 500);
            }
            return newLives;
          });
        }
      }
    },
    [ghosts, powerPelletSystem, stopMoving, resetMovement, ghostAIs]
  );

  const handleDotCollect = (x: number, y: number) => {
    console.log(`Collected dot at ${x}, ${y}`);
    collectDot(x, y);
    setScore((prev) => prev + 10); // 10 points per dot

    // Trigger eating animation
    setIsEating(true);

    // Clear existing timeout if any
    if (eatingTimeoutRef.current) {
      clearTimeout(eatingTimeoutRef.current);
    }

    // Reset eating animation after 200ms
    eatingTimeoutRef.current = window.setTimeout(() => {
      setIsEating(false);
    }, 200);

    // Check for victory condition
    if (getTotalDotsRemaining() - 1 === 0) {
      console.log('Victory! All dots collected!');
      setGameStatus('game-over');
      stopMoving();
      ghostAIs.forEach((ai) => ai.stopAI());
    }
  };

  const handlePowerPelletCollect = (x: number, y: number) => {
    console.log(`Collected power pellet at ${x}, ${y}`);
    collectPowerPellet(x, y);
    powerPelletSystem.handlePowerPelletCollection({ x, y });

    // Trigger eating animation (longer for power pellets)
    setIsEating(true);

    // Clear existing timeout if any
    if (eatingTimeoutRef.current) {
      clearTimeout(eatingTimeoutRef.current);
    }

    // Reset eating animation after 400ms (longer for power pellets)
    eatingTimeoutRef.current = window.setTimeout(() => {
      setIsEating(false);
    }, 400);
  };

  const handleDirectionChange = (direction: Direction) => {
    console.log('🎮 Direction change requested:', direction, {
      gameStatus,
      pacmanIsMoving,
    });
    if (gameStatus === 'playing') {
      setDirection(direction);
      console.log('🎮 Direction set to:', direction);
      // Start moving if not already moving
      if (!pacmanIsMoving) {
        console.log('🎮 Starting movement...');
        startMoving();
      } else {
        console.log('🎮 Already moving, just changed direction');
      }
    } else {
      console.log('🎮 Game not playing, ignoring direction change');
    }
  };

  const handlePause = () => {
    if (gameStatus === 'game-over') return;

    if (gameStatus === 'playing') {
      setGameStatus('paused');
      stopMoving();
      ghostAIs.forEach((ai) => ai.stopAI());
      console.log('Game paused');
    } else {
      setGameStatus('playing');
      startMoving();
      ghostAIs.forEach((ai) => ai.startAI());
      console.log('Game resumed');
    }
  };

  const handleRestart = () => {
    console.log('🔄 Starting game restart...');
    
    // 1. Reset all game state
    setScore(0);
    setLives(3);
    setGameStatus('playing');
    setIsEating(false);
    
    console.log('🔄 Game state reset');

    // 2. Stop all movement first
    stopMoving();
    ghostAIs.forEach((ai) => ai.stopAI());
    
    console.log('🔄 Movement stopped');

    // 3. Reset movement to initial positions
    resetMovement();
    
    console.log('🔄 Pacman position reset');

    // 4. Reset ghost AIs to initial positions
    ghostAIs.forEach((ai) => ai.resetAI());
    
    // 5. Reset ghost states to initial configuration
    const resetGhosts: GhostState[] = GHOST_CONFIGS.map((config) => ({
      id: config.id,
      x: config.initialPosition.x,
      y: config.initialPosition.y,
      direction: config.initialDirection,
      color: config.color,
      isVulnerable: false,
      isFlashing: false,
    }));
    setGhosts(resetGhosts);
    
    console.log('🔄 Ghost states reset');

    // 6. Reset power system
    powerPelletSystem.resetPowerSystem();
    
    console.log('🔄 Power system reset');

    // 7. Reset all collectibles to initial state
    const freshDots = generateInitialDots(sampleMaze);
    const freshPowerPellets = generateInitialPowerPellets();
    resetCollectibles(freshDots, freshPowerPellets);
    
    console.log('🔄 Collectibles reset - Dots:', freshDots.size, 'Power Pellets:', freshPowerPellets.size);

    // 8. Clear eating timeout
    if (eatingTimeoutRef.current) {
      clearTimeout(eatingTimeoutRef.current);
      eatingTimeoutRef.current = null;
    }
    
    // 9. Start all movement again (after a small delay to ensure reset is complete)
    setTimeout(() => {
      console.log('🔄 Restarting all movement...');
      startMoving(); // Start Pacman movement
      ghostAIs.forEach((ai) => ai.startAI()); // Start ghost AIs
      console.log('🔄 All AIs restarted!');
    }, 100);
    
    console.log('🔄 Game restart complete!');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          React Pacman Game
        </h1>
        <p className="text-white text-lg">
          Complete Game with Ghosts & Power Mode
        </p>

        {/* Game Stats */}
        <div className="mt-4 flex gap-6 justify-center text-lg font-semibold">
          <span className="text-yellow-400">
            Score: {score.toLocaleString()}
          </span>
          <span className="text-red-400">Lives: {lives}</span>
          <span className="text-green-400">Status: {gameStatus}</span>
        </div>
      </div>

      <>
        <div className="w-full max-w-4xl relative">
          <GameBoard
            maze={sampleMaze}
            dots={dots}
            powerPellets={powerPellets}
            onCellClick={(x, y) => console.log(`Clicked cell at ${x}, ${y}`)}
            onDotCollect={handleDotCollect}
            onPowerPelletCollect={handlePowerPelletCollect}
            pacman={{
              x: pacmanPosition.x,
              y: pacmanPosition.y,
              direction: pacmanDirection,
              isMoving: pacmanIsMoving,
              isEating: isEating,
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
              {lives <= 0 && (
                <p className="text-red-400 mb-4">Better luck next time!</p>
              )}
              {lives > 0 && (
                <p className="text-green-400 mb-4">
                  Congratulations! You collected all the dots!
                </p>
              )}
              <button
                onClick={handleRestart}
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-2 rounded-lg font-bold transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

export default App;
