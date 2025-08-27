import { GameBoard } from './components';
import { useCollectibles } from './hooks';
import {
  sampleMaze,
  generateInitialDots,
  generateInitialPowerPellets,
} from './utils';

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

  const handleDotCollect = (x: number, y: number) => {
    console.log(`Collected dot at ${x}, ${y}`);
    collectDot(x, y);
  };

  const handlePowerPelletCollect = (x: number, y: number) => {
    console.log(`Collected power pellet at ${x}, ${y}`);
    collectPowerPellet(x, y);
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
        />
      </div>
    </div>
  );
}

export default App;
