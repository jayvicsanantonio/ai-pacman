// @ts-nocheck
import React, { useState, useEffect } from 'react';
// import { GameProvider } from '../context/GameContext';
import GameEngine from './GameEngine';
import { useGameState } from '../hooks/useGameState';
import type { Position, GhostState } from '../types';

const DemoControls: React.FC = () => {
  const gameState = useGameState();
  const [pacmanPos, setPacmanPos] = useState<Position>({ x: 10, y: 15 });
  const [ghosts, setGhosts] = useState<GhostState[]>([
    { id: 'red', x: 9, y: 9, direction: 'right', color: 'red', isVulnerable: false, isFlashing: false },
    { id: 'pink', x: 10, y: 9, direction: 'left', color: 'pink', isVulnerable: false, isFlashing: false },
    { id: 'blue', x: 11, y: 9, direction: 'up', color: 'blue', isVulnerable: false, isFlashing: false },
    { id: 'orange', x: 12, y: 9, direction: 'down', color: 'orange', isVulnerable: false, isFlashing: false },
  ]);

  // Simulate automatic ghost movement
  useEffect(() => {
    const interval = setInterval(() => {
      setGhosts(prevGhosts => 
        prevGhosts.map(ghost => ({
          ...ghost,
          x: ghost.x + (Math.random() - 0.5) * 0.2,
          y: ghost.y + (Math.random() - 0.5) * 0.2,
        }))
      );
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleMovePacman = (direction: 'up' | 'down' | 'left' | 'right') => {
    setPacmanPos(prev => {
      const newPos = { ...prev };
      switch (direction) {
        case 'up':
          newPos.y = Math.max(0, prev.y - 1);
          break;
        case 'down':
          newPos.y = Math.min(20, prev.y + 1);
          break;
        case 'left':
          newPos.x = Math.max(0, prev.x - 1);
          break;
        case 'right':
          newPos.x = Math.min(20, prev.x + 1);
          break;
      }
      return newPos;
    });
  };

  const moveGhostTowardsPacman = (ghostId: string) => {
    setGhosts(prevGhosts =>
      prevGhosts.map(ghost => {
        if (ghost.id === ghostId) {
          const dx = pacmanPos.x - ghost.x;
          const dy = pacmanPos.y - ghost.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > 0) {
            return {
              ...ghost,
              x: ghost.x + (dx / distance) * 2, // Move 2 units toward Pacman
              y: ghost.y + (dy / distance) * 2,
            };
          }
        }
        return ghost;
      })
    );
  };

  const makeGhostsVulnerable = () => {
    setGhosts(prevGhosts =>
      prevGhosts.map(ghost => ({
        ...ghost,
        isVulnerable: true,
        isFlashing: false,
      }))
    );
    gameState.activatePowerMode();
  };

  return (
    <GameEngine
      pacmanPosition={pacmanPos}
      ghostPositions={ghosts}
      enableCollisionDetection={true}
      enableVictoryConditions={true}
      enableGameOverConditions={true}
      onGameStart={() => console.log('Game started!')}
      onGameOver={() => console.log('Game over detected!')}
      onRoundComplete={() => console.log('Round complete detected!')}
      onGameComplete={() => console.log('Game complete detected!')}
      onGhostEaten={(ghost, points) => console.log(`Ate ${ghost.color} ghost for ${points} points!`)}
    >
      <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-8">
        <h1 className="text-4xl font-bold mb-8 text-yellow-400">
          🟡 Game Logic Demo
        </h1>
        
        {/* Game Board Visualization */}
        <div className="relative w-96 h-96 bg-blue-900 border-4 border-blue-400 rounded-lg mb-8 overflow-hidden">
          {/* Grid overlay */}
          <div className="absolute inset-0 opacity-20">
            {Array.from({ length: 21 }, (_, i) => (
              <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${(i / 20) * 100}%` }} />
            ))}
            {Array.from({ length: 21 }, (_, i) => (
              <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${(i / 20) * 100}%` }} />
            ))}
          </div>
          
          {/* Pacman */}
          <div 
            className="absolute w-4 h-4 bg-yellow-400 rounded-full z-20 transition-all duration-100"
            style={{
              left: `${(pacmanPos.x / 20) * 100}%`,
              top: `${(pacmanPos.y / 20) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            🟡
          </div>
          
          {/* Ghosts */}
          {ghosts.map(ghost => (
            <div 
              key={ghost.id}
              className={`
                absolute w-4 h-4 rounded-full z-10 transition-all duration-100
                ${ghost.isVulnerable ? 'bg-blue-400' : 
                  ghost.color === 'red' ? 'bg-red-500' :
                  ghost.color === 'pink' ? 'bg-pink-500' :
                  ghost.color === 'blue' ? 'bg-blue-500' :
                  'bg-orange-500'
                }
              `}
              style={{
                left: `${(ghost.x / 20) * 100}%`,
                top: `${(ghost.y / 20) * 100}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              👻
            </div>
          ))}
        </div>

        {/* Controls */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {/* Movement Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-center">Move Pacman</h3>
            <div className="grid grid-cols-3 gap-2">
              <div></div>
              <button
                onClick={() => handleMovePacman('up')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold"
              >
                ↑
              </button>
              <div></div>
              <button
                onClick={() => handleMovePacman('left')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold"
              >
                ←
              </button>
              <button
                onClick={() => handleMovePacman('down')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold"
              >
                ↓
              </button>
              <button
                onClick={() => handleMovePacman('right')}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold"
              >
                →
              </button>
            </div>
          </div>

          {/* Ghost Controls */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold text-center">Control Ghosts</h3>
            <div className="space-y-2">
              {ghosts.map(ghost => (
                <button
                  key={ghost.id}
                  onClick={() => moveGhostTowardsPacman(ghost.id)}
                  className={`
                    px-3 py-1 rounded text-sm font-bold w-full
                    ${ghost.color === 'red' ? 'bg-red-600 hover:bg-red-500' :
                      ghost.color === 'pink' ? 'bg-pink-600 hover:bg-pink-500' :
                      ghost.color === 'blue' ? 'bg-blue-600 hover:bg-blue-500' :
                      'bg-orange-600 hover:bg-orange-500'
                    }
                  `}
                >
                  Move {ghost.color} → Pacman
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Test Actions */}
        <div className="flex flex-wrap gap-3 justify-center">
          <button
            onClick={makeGhostsVulnerable}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 rounded font-bold"
          >
            🟣 Activate Power Mode
          </button>
          
          <button
            onClick={() => gameState.collectDot({ x: 10, y: 10 })}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 rounded font-bold"
          >
            🟡 Collect Dot (+10)
          </button>
          
          <button
            onClick={() => {
              // Simulate collecting all dots
              gameState.gameState.dots.clear();
              gameState.gameState.powerPellets.clear();
            }}
            className="px-4 py-2 bg-green-600 hover:bg-green-500 rounded font-bold"
          >
            🎯 Clear All Collectibles
          </button>
          
          <button
            onClick={() => gameState.loseLife()}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded font-bold"
          >
            💔 Lose Life
          </button>
          
          <button
            onClick={() => gameState.addScore(1000, 'Test bonus')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded font-bold"
          >
            💎 Add 1000 Points
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-8 text-center text-sm text-gray-400 max-w-2xl">
          <p className="mb-2">
            <strong>Instructions:</strong> Use the controls above to test game logic.
          </p>
          <p className="mb-2">
            Move Pacman close to ghosts to trigger collisions. Activate power mode first to eat ghosts safely!
          </p>
          <p>
            Clear all collectibles to trigger victory conditions. Lose all lives to trigger game over.
          </p>
        </div>
      </div>
    </GameEngine>
  );
};

export const GameLogicDemo: React.FC = () => {
  return (
    <GameProvider>
      <DemoControls />
    </GameProvider>
  );
};

export default GameLogicDemo;
