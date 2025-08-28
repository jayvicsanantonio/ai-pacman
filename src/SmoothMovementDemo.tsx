// @ts-nocheck
import React, { useCallback, useEffect, useState } from 'react';
// GameBoard import removed - unused
import { SmoothPacman } from './components/SmoothPacman';
import { SmoothGhost } from './components/SmoothGhost';
import { Pacman } from './components/Pacman';
import { Ghost } from './components/Ghost';
import {
  useSmoothMovement,
  useSimpleMovement,
  useSmoothGhostAI,
  useGhostAI,
  usePowerPelletSystem,
  // useCollectibles - unused
} from './hooks';
import type { Direction, GhostColor } from './types';
// import { sampleMaze } from './utils';

// Simplified maze for comparison demo
const demoMaze = [
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
];

const DEMO_GHOST_CONFIG = {
  id: 'demo-ghost',
  color: 'red' as GhostColor,
  personality: 'aggressive' as const,
  initialPosition: { x: 7, y: 2 },
  initialDirection: 'down' as Direction,
};

export const SmoothMovementDemo: React.FC = () => {
  const [speed, setSpeed] = useState(300);
  const [isRunning, setIsRunning] = useState(false);
  const [showComparison, setShowComparison] = useState(true);

  // Power pellet system
  // const _powerPelletSystem = usePowerPelletSystem({
  //   onPowerPelletCollected: () => {},
  //   onPowerModeStart: () => {},
  //   onPowerModeEnd: () => {},
  //   onGhostConsumed: () => {},
  //   onScoreUpdate: () => {},
  //   powerModeDuration: 5000,
  // });

  // Smooth movement system
  const smoothMovement = useSmoothMovement({
    maze: demoMaze,
    initialPosition: { x: 2, y: 8 },
    initialDirection: 'right',
    speed,
    onPositionChange: () => {},
    onDirectionChange: () => {},
  });

  // Traditional movement system (for comparison)
  const traditionalMovement = useSimpleMovement({
    maze: demoMaze,
    initialPosition: { x: 2, y: 8 },
    initialDirection: 'right',
    speed,
    onPositionChange: () => {},
    onDirectionChange: () => {},
  });

  // Ghost AI handlers
  const handleGhostPositionChange = useCallback(() => {}, []);
  const handleGhostDirectionChange = useCallback(() => {}, []);

  // Smooth Ghost AI
  const smoothGhostAI = useSmoothGhostAI({
    ghostId: DEMO_GHOST_CONFIG.id,
    maze: demoMaze,
    initialPosition: DEMO_GHOST_CONFIG.initialPosition,
    initialDirection: DEMO_GHOST_CONFIG.initialDirection,
    personality: DEMO_GHOST_CONFIG.personality,
    speed,
    pacmanPosition: smoothMovement.gridPosition,
    pacmanDirection: smoothMovement.direction,
    isVulnerable: false,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
  });

  // Traditional Ghost AI
  const traditionalGhostAI = useGhostAI({
    ghostId: DEMO_GHOST_CONFIG.id,
    maze: demoMaze,
    initialPosition: DEMO_GHOST_CONFIG.initialPosition,
    initialDirection: DEMO_GHOST_CONFIG.initialDirection,
    personality: DEMO_GHOST_CONFIG.personality,
    speed,
    pacmanPosition: traditionalMovement.position,
    pacmanDirection: traditionalMovement.direction,
    isVulnerable: false,
    onPositionChange: handleGhostPositionChange,
    onDirectionChange: handleGhostDirectionChange,
  });

  // Control functions
  const toggleMovement = () => {
    if (isRunning) {
      smoothMovement.stopMoving();
      traditionalMovement.stopMoving();
      smoothGhostAI.stopAI();
      traditionalGhostAI.stopAI();
      setIsRunning(false);
    } else {
      smoothMovement.startMoving();
      traditionalMovement.startMoving();
      smoothGhostAI.startAI();
      traditionalGhostAI.startAI();
      setIsRunning(true);
    }
  };

  const resetDemo = () => {
    smoothMovement.resetMovement();
    traditionalMovement.resetMovement();
    smoothGhostAI.resetAI();
    traditionalGhostAI.resetAI();
    setIsRunning(false);
  };

  const handleDirectionChange = (direction: Direction) => {
    smoothMovement.setDirection(direction);
    traditionalMovement.setDirection(direction);
  };

  // Auto-demo mode
  useEffect(() => {
    if (!isRunning) return;

    const directions: Direction[] = ['right', 'down', 'left', 'up'];
    let directionIndex = 0;

    const interval = setInterval(() => {
      const newDirection = directions[directionIndex];
      handleDirectionChange(newDirection);
      directionIndex = (directionIndex + 1) % directions.length;
    }, speed * 2);

    return () => clearInterval(interval);
  }, [isRunning, speed]);

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-4">
            Smooth Movement Demo
          </h1>
          <p className="text-gray-300 text-lg mb-6">
            Compare traditional grid-based movement vs smooth interpolated movement
          </p>
          
          {/* Controls */}
          <div className="flex flex-wrap gap-4 justify-center items-center mb-8">
            <button
              onClick={toggleMovement}
              className={`px-6 py-3 rounded-lg font-bold transition-all duration-200 ${
                isRunning
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isRunning ? 'Stop Demo' : 'Start Demo'}
            </button>

            <button
              onClick={resetDemo}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-bold transition-all duration-200"
            >
              Reset
            </button>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={showComparison}
                onChange={(e) => setShowComparison(e.target.checked)}
                className="rounded"
              />
              <span>Show Side-by-Side Comparison</span>
            </label>
          </div>

          {/* Speed Control */}
          <div className="flex items-center gap-4 justify-center mb-8">
            <label className="text-gray-300">Speed:</label>
            <input
              type="range"
              min="100"
              max="800"
              step="50"
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="w-48"
            />
            <span className="text-white w-16 text-left">{speed}ms</span>
          </div>

          {/* Manual Controls */}
          <div className="mb-8">
            <p className="text-gray-300 mb-4">Manual Controls:</p>
            <div className="flex justify-center">
              <div className="grid grid-cols-3 gap-2 w-40">
                <div></div>
                <button
                  onClick={() => handleDirectionChange('up')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded font-bold transition-colors"
                  disabled={isRunning}
                >
                  ↑
                </button>
                <div></div>
                
                <button
                  onClick={() => handleDirectionChange('left')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded font-bold transition-colors"
                  disabled={isRunning}
                >
                  ←
                </button>
                <div></div>
                <button
                  onClick={() => handleDirectionChange('right')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded font-bold transition-colors"
                  disabled={isRunning}
                >
                  →
                </button>
                
                <div></div>
                <button
                  onClick={() => handleDirectionChange('down')}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded font-bold transition-colors"
                  disabled={isRunning}
                >
                  ↓
                </button>
                <div></div>
              </div>
            </div>
          </div>
        </div>

        {showComparison ? (
          /* Side-by-side comparison */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Traditional Movement */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center text-red-400">
                Traditional Movement
              </h2>
              <div className="text-center text-sm text-gray-400 mb-4">
                Grid-based discrete steps
              </div>
              
              <div className="flex justify-center">
                <div className="relative bg-black border-2 border-blue-500 p-2 rounded-lg">
                  {/* Render maze */}
                  {demoMaze.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`traditional-${x}-${y}`}
                        className={`absolute ${
                          cell === 1 ? 'bg-blue-600' : 'bg-black'
                        }`}
                        style={{
                          left: x * 24 + 8,
                          top: y * 24 + 8,
                          width: 22,
                          height: 22,
                        }}
                      />
                    ))
                  )}

                  {/* Traditional Pacman */}
                  <Pacman
                    x={traditionalMovement.position.x}
                    y={traditionalMovement.position.y}
                    direction={traditionalMovement.direction}
                    isMoving={traditionalMovement.isMoving}
                    isEating={false}
                  />

                  {/* Traditional Ghost */}
                  <Ghost
                    id={DEMO_GHOST_CONFIG.id}
                    x={traditionalGhostAI.position.x}
                    y={traditionalGhostAI.position.y}
                    direction={traditionalGhostAI.direction}
                    color={DEMO_GHOST_CONFIG.color}
                    isVulnerable={false}
                    isFlashing={false}
                  />
                </div>
              </div>
              
              <div className="text-center text-sm space-y-1">
                <div className="text-yellow-400">
                  Pacman: ({traditionalMovement.position.x}, {traditionalMovement.position.y})
                </div>
                <div className="text-red-400">
                  Ghost: ({traditionalGhostAI.position.x}, {traditionalGhostAI.position.y})
                </div>
              </div>
            </div>

            {/* Smooth Movement */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center text-green-400">
                Smooth Movement
              </h2>
              <div className="text-center text-sm text-gray-400 mb-4">
                Interpolated smooth transitions
              </div>
              
              <div className="flex justify-center">
                <div className="relative bg-black border-2 border-green-500 p-2 rounded-lg">
                  {/* Render maze */}
                  {demoMaze.map((row, y) =>
                    row.map((cell, x) => (
                      <div
                        key={`smooth-${x}-${y}`}
                        className={`absolute ${
                          cell === 1 ? 'bg-blue-600' : 'bg-black'
                        }`}
                        style={{
                          left: x * 24 + 8,
                          top: y * 24 + 8,
                          width: 22,
                          height: 22,
                        }}
                      />
                    ))
                  )}

                  {/* Smooth Pacman */}
                  <SmoothPacman
                    x={smoothMovement.visualPosition.x}
                    y={smoothMovement.visualPosition.y}
                    direction={smoothMovement.direction}
                    isMoving={smoothMovement.isMoving}
                    isEating={false}
                    isAnimating={smoothMovement.isAnimating}
                  />

                  {/* Smooth Ghost */}
                  <SmoothGhost
                    id={DEMO_GHOST_CONFIG.id}
                    x={smoothGhostAI.visualPosition.x}
                    y={smoothGhostAI.visualPosition.y}
                    direction={smoothGhostAI.direction}
                    color={DEMO_GHOST_CONFIG.color}
                    isVulnerable={false}
                    isFlashing={false}
                    isAnimating={smoothGhostAI.isAnimating}
                  />
                </div>
              </div>
              
              <div className="text-center text-sm space-y-1">
                <div className="text-yellow-400">
                  Pacman: ({smoothMovement.visualPosition.x.toFixed(2)}, {smoothMovement.visualPosition.y.toFixed(2)})
                </div>
                <div className="text-red-400">
                  Ghost: ({smoothGhostAI.visualPosition.x.toFixed(2)}, {smoothGhostAI.visualPosition.y.toFixed(2)})
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Single smooth demo */
          <div className="flex justify-center mb-8">
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-center text-green-400">
                Smooth Movement
              </h2>
              
              <div className="relative bg-black border-2 border-green-500 p-4 rounded-lg">
                {/* Render maze */}
                {demoMaze.map((row, y) =>
                  row.map((cell, x) => (
                    <div
                      key={`single-${x}-${y}`}
                      className={`absolute ${
                        cell === 1 ? 'bg-blue-600' : 'bg-black'
                      }`}
                      style={{
                        left: x * 32 + 8,
                        top: y * 32 + 8,
                        width: 30,
                        height: 30,
                      }}
                    />
                  ))
                )}

                {/* Smooth Pacman */}
                <div style={{ transform: 'scale(1.33)' }}>
                  <SmoothPacman
                    x={smoothMovement.visualPosition.x}
                    y={smoothMovement.visualPosition.y}
                    direction={smoothMovement.direction}
                    isMoving={smoothMovement.isMoving}
                    isEating={false}
                    isAnimating={smoothMovement.isAnimating}
                  />
                </div>

                {/* Smooth Ghost */}
                <div style={{ transform: 'scale(1.33)' }}>
                  <SmoothGhost
                    id={DEMO_GHOST_CONFIG.id}
                    x={smoothGhostAI.visualPosition.x}
                    y={smoothGhostAI.visualPosition.y}
                    direction={smoothGhostAI.direction}
                    color={DEMO_GHOST_CONFIG.color}
                    isVulnerable={false}
                    isFlashing={false}
                    isAnimating={smoothGhostAI.isAnimating}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Feature Comparison */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-center mb-6">Feature Comparison</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-red-400 mb-3">Traditional Movement</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ Simple implementation</li>
                <li>✅ Predictable timing</li>
                <li>✅ Lower computational overhead</li>
                <li>❌ Choppy, discrete movement</li>
                <li>❌ Less engaging visually</li>
                <li>❌ Harder to create smooth animations</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-green-400 mb-3">Smooth Movement</h3>
              <ul className="space-y-2 text-sm">
                <li>✅ Fluid, natural movement</li>
                <li>✅ Enhanced visual appeal</li>
                <li>✅ Better user experience</li>
                <li>✅ Supports advanced animations</li>
                <li>❌ More complex implementation</li>
                <li>❌ Slightly higher performance cost</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Implementation Notes */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-center mb-4">Implementation Details</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">Key Improvements</h3>
              <ul className="space-y-1">
                <li>• <strong>Interpolated Positioning:</strong> Characters move smoothly between grid cells</li>
                <li>• <strong>RequestAnimationFrame:</strong> Uses browser's animation loop for optimal performance</li>
                <li>• <strong>Easing Functions:</strong> EaseOutQuart/Cubic for natural deceleration</li>
                <li>• <strong>Visual Effects:</strong> Enhanced glow and trail effects during movement</li>
                <li>• <strong>Dual Position System:</strong> Grid position for logic, visual position for rendering</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-purple-400 mb-2">Technical Features</h3>
              <ul className="space-y-1">
                <li>• <strong>Animation Synchronization:</strong> Movement timing synced with visual transitions</li>
                <li>• <strong>State Management:</strong> Separate tracking of animation and movement states</li>
                <li>• <strong>Performance Optimization:</strong> Efficient cleanup of animation frames</li>
                <li>• <strong>Responsive Design:</strong> Adapts to different screen sizes</li>
                <li>• <strong>Backward Compatibility:</strong> Game logic remains unchanged</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
