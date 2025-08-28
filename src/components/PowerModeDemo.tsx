import React, { useState } from 'react';
import { usePowerPelletSystem } from '../hooks';
import { Ghost } from './Ghost';
import type { GhostState } from '../types';

// Demo component to showcase power pellet mechanics
export const PowerModeDemo: React.FC = () => {
  const [score, setScore] = useState(0);
  const [ghosts, setGhosts] = useState<GhostState[]>([
    {
      id: 'red',
      x: 5,
      y: 5,
      direction: 'right',
      color: 'red',
      isVulnerable: false,
      isFlashing: false,
    },
    {
      id: 'pink',
      x: 7,
      y: 5,
      direction: 'left',
      color: 'pink',
      isVulnerable: false,
      isFlashing: false,
    },
  ]);

  const powerPelletSystem = usePowerPelletSystem({
    onPowerPelletCollected: (position, points) => {
      console.log(
        `Power pellet collected at (${position.x}, ${position.y}) for ${points} points`
      );
    },
    onPowerModeStart: () => {
      console.log('Power mode activated!');
    },
    onPowerModeEnd: () => {
      console.log('Power mode ended');
    },
    onGhostConsumed: (ghost, points) => {
      console.log(`Ghost ${ghost.id} consumed for ${points} points`);
    },
    onScoreUpdate: (points) => {
      setScore((prev) => prev + points);
    },
    powerModeDuration: 8000, // 8 seconds for demo
  });

  // Update ghost states based on power mode
  const updatedGhosts = powerPelletSystem.updateGhostStates(ghosts);

  const handlePowerPelletClick = () => {
    powerPelletSystem.handlePowerPelletCollection({ x: 10, y: 10 });
  };

  const handleGhostClick = (ghostId: string) => {
    const targetGhost = updatedGhosts.find((g) => g.id === ghostId);

    if (targetGhost && powerPelletSystem.isGhostVulnerable(targetGhost)) {
      // Simulate ghost consumption by placing Pacman at ghost position
      const result = powerPelletSystem.checkAndHandleGhostConsumption(
        { x: targetGhost.x, y: targetGhost.y },
        updatedGhosts
      );

      setGhosts(result.updatedGhosts);
    }
  };

  const resetDemo = () => {
    setScore(0);
    setGhosts([
      {
        id: 'red',
        x: 5,
        y: 5,
        direction: 'right',
        color: 'red',
        isVulnerable: false,
        isFlashing: false,
      },
      {
        id: 'pink',
        x: 7,
        y: 5,
        direction: 'left',
        color: 'pink',
        isVulnerable: false,
        isFlashing: false,
      },
    ]);
    powerPelletSystem.resetPowerSystem();
  };

  return (
    <div className="p-8 bg-black min-h-screen text-white">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Power Pellet System Demo
      </h1>

      {/* Score Display */}
      <div className="mb-6 p-4 bg-blue-900 rounded-lg">
        <h2 className="text-xl font-bold text-yellow-400">Score: {score}</h2>
      </div>

      {/* Power Mode Status */}
      <div className="mb-6 p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2">Power Mode Status</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-gray-400">Active:</span>
            <span
              className={`ml-2 font-bold ${powerPelletSystem.powerMode.isActive ? 'text-green-400' : 'text-red-400'}`}
            >
              {powerPelletSystem.powerMode.isActive ? 'YES' : 'NO'}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Time Remaining:</span>
            <span className="ml-2 font-bold text-blue-400">
              {(powerPelletSystem.powerMode.timeRemaining / 1000).toFixed(1)}s
            </span>
          </div>
          <div>
            <span className="text-gray-400">Ghosts Eaten:</span>
            <span className="ml-2 font-bold text-purple-400">
              {powerPelletSystem.powerMode.ghostsEaten}
            </span>
          </div>
          <div>
            <span className="text-gray-400">Flashing:</span>
            <span
              className={`ml-2 font-bold ${powerPelletSystem.isFlashingPhase ? 'text-yellow-400' : 'text-gray-500'}`}
            >
              {powerPelletSystem.isFlashingPhase ? 'YES' : 'NO'}
            </span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="mb-6 flex gap-4">
        <button
          onClick={handlePowerPelletClick}
          className="px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-400 transition-colors"
        >
          Collect Power Pellet
        </button>
        <button
          onClick={resetDemo}
          className="px-6 py-3 bg-red-600 text-white font-bold rounded-lg hover:bg-red-500 transition-colors"
        >
          Reset Demo
        </button>
      </div>

      {/* Ghost Display */}
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-4">
          Ghosts (Click to consume when vulnerable)
        </h3>
        <div
          className="relative bg-gray-900 p-8 rounded-lg"
          style={{ width: '400px', height: '200px' }}
        >
          {updatedGhosts.map((ghost) => (
            <div
              key={ghost.id}
              onClick={() => handleGhostClick(ghost.id)}
              className="cursor-pointer"
            >
              <Ghost {...ghost} />
            </div>
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-4 bg-gray-800 rounded-lg">
        <h3 className="text-lg font-bold mb-2 text-yellow-400">Instructions</h3>
        <ul className="list-disc list-inside space-y-1 text-gray-300">
          <li>Click "Collect Power Pellet" to activate power mode</li>
          <li>Watch ghosts turn blue and vulnerable</li>
          <li>Click on vulnerable ghosts to consume them for points</li>
          <li>Notice the flashing effect when power mode is about to end</li>
          <li>Points increase exponentially: 200, 400, 800, 1600...</li>
        </ul>
      </div>
    </div>
  );
};
