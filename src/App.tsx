import { GameBoard, GameControls } from './components';
import { useCollectibles, useMovement } from './hooks';
import {
  sampleMaze,
  generateInitialDots,
  generateInitialPowerPellets,
} from './utils';
import type { Direction } from './types';

function App() {
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

  // Initialize Pacman movement
  const {
    position: pacmanPosition,
    direction: pacmanDirection,
    isMoving: pacmanIsMoving,
    setDirection,
    startMoving,
    stopMoving,
    resetMovement,
  } = useMovement({
    maze: sampleMaze,
    initialPosition: { x: 10, y: 15 }, // Starting position in the maze
    initialDirection: 'right',
    speed: 300, // Movement speed in milliseconds
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
    },
    onDirectionChange: (direction) => {
      console.log(`Pacman direction changed to ${direction}`);
    },
  });

  const handleDotCollect = (x: number, y: number) => {
    console.log(`Collected dot at ${x}, ${y}`);
    collectDot(x, y);
  };

  const handlePowerPelletCollect = (x: number, y: number) => {
    console.log(`Collected power pellet at ${x}, ${y}`);
    collectPowerPellet(x, y);
  };

  const handleDirectionChange = (direction: Direction) => {
    setDirection(direction);
  };

  const handlePause = () => {
    if (pacmanIsMoving) {
      stopMoving();
      console.log('Game paused');
    } else {
      startMoving();
      console.log('Game resumed');
    }
  };

  const handleRestart = () => {
    resetMovement();
    console.log('Game restarted');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">
          React Pacman Game
        </h1>
        <p className="text-white text-lg">GameBoard Component Implementation</p>
        <div className="flex gap-4 justify-center mt-4 text-sm">
          <span className="text-yellow-400">
            Dots Remaining: {getTotalDotsRemaining()}
          </span>
          <span className="text-orange-400">
            Power Pellets: {getTotalPowerPelletsRemaining()}
          </span>
        </div>
      </div>

      <div className="w-full max-w-4xl">
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
            isEating: false, // Will be implemented in later tasks
          }}
        />
      </div>

      {/* Game Controls */}
      <GameControls
        onDirectionChange={handleDirectionChange}
        onPause={handlePause}
        onRestart={handleRestart}
        disabled={false}
      />
    </div>
  );
}

export default App;
