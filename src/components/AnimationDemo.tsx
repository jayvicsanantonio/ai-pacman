import React, { useState, useEffect } from 'react';
import { GameProvider } from '../context/GameContext';
import EnhancedPacman from './EnhancedPacman';
import EnhancedGhost from './EnhancedGhost';
import EnhancedDot from './EnhancedDot';
import EnhancedPowerPellet from './EnhancedPowerPellet';
import ParticleEffect from './ParticleEffect';
import ScreenShake from './ScreenShake';
import type { Direction, GhostState } from '../types';

const AnimationDemo: React.FC = () => {
  const [pacmanPos, setPacmanPos] = useState({ x: 10, y: 10 });
  const [pacmanDir, setPacmanDir] = useState<Direction>('right');
  const [pacmanMoving, setPacmanMoving] = useState(false);
  const [pacmanEating, setPacmanEating] = useState(false);
  const [pacmanPowerMode, setPacmanPowerMode] = useState(false);
  const [pacmanInvincible, setPacmanInvincible] = useState(false);
  const [pacmanSpeed, setPacmanSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const [ghost, setGhost] = useState<GhostState>({
    id: 'demo-ghost',
    x: 8,
    y: 8,
    direction: 'down',
    color: 'red',
    isVulnerable: false,
    isFlashing: false,
  });

  const [ghostChasing, setGhostChasing] = useState(false);
  const [ghostSpeed, setGhostSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');

  const [particleEffect, setParticleEffect] = useState<{
    active: boolean;
    type: 'dot-collect' | 'power-pellet' | 'ghost-eaten' | 'celebration' | 'explosion';
    x: number;
    y: number;
  }>({ active: false, type: 'dot-collect', x: 200, y: 200 });

  const [screenShake, setScreenShake] = useState({ active: false, intensity: 'medium' as const });

  const [dots, setDots] = useState([
    { x: 5, y: 5, collected: false },
    { x: 15, y: 5, collected: false },
    { x: 5, y: 15, collected: false },
    { x: 15, y: 15, collected: false },
  ]);

  const [powerPellets, setPowerPellets] = useState([
    { x: 3, y: 3, collected: false, energy: 1 },
    { x: 17, y: 17, collected: false, energy: 0.7 },
  ]);

  // Auto-movement demo
  const [autoMovement, setAutoMovement] = useState(false);

  useEffect(() => {
    if (!autoMovement) return;

    const interval = setInterval(() => {
      setPacmanPos(prev => {
        const directions: Direction[] = ['up', 'down', 'left', 'right'];
        const newDir = directions[Math.floor(Math.random() * directions.length)];
        setPacmanDir(newDir);

        let newX = prev.x;
        let newY = prev.y;

        switch (newDir) {
          case 'up':
            newY = Math.max(1, prev.y - 1);
            break;
          case 'down':
            newY = Math.min(19, prev.y + 1);
            break;
          case 'left':
            newX = Math.max(1, prev.x - 1);
            break;
          case 'right':
            newX = Math.min(19, prev.x + 1);
            break;
        }

        return { x: newX, y: newY };
      });
    }, 800);

    return () => clearInterval(interval);
  }, [autoMovement]);

  const handleDotCollect = (x: number, y: number) => {
    setDots(prev => 
      prev.map(dot => 
        dot.x === x && dot.y === y ? { ...dot, collected: true } : dot
      )
    );
  };

  const handlePowerPelletCollect = (x: number, y: number) => {
    setPowerPellets(prev =>
      prev.map(pellet =>
        pellet.x === x && pellet.y === y ? { ...pellet, collected: true } : pellet
      )
    );
    setPacmanPowerMode(true);
    setTimeout(() => setPacmanPowerMode(false), 3000);
  };

  const triggerParticleEffect = (type: typeof particleEffect.type) => {
    setParticleEffect({ active: true, type, x: 200, y: 200 });
    setTimeout(() => setParticleEffect(prev => ({ ...prev, active: false })), 2000);
  };

  const triggerScreenShake = (intensity: 'light' | 'medium' | 'strong' | 'extreme') => {
    setScreenShake({ active: true, intensity });
    setTimeout(() => setScreenShake({ active: false, intensity }), 500);
  };

  return (
    <GameProvider>
      <ScreenShake 
        isActive={screenShake.active} 
        intensity={screenShake.intensity}
        onComplete={() => setScreenShake(prev => ({ ...prev, active: false }))}
      >
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black text-white p-8">
          <div className="max-w-6xl mx-auto">
            <h1 className="text-4xl font-bold text-center mb-8 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              🎮 Enhanced Pacman Animations Demo
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Game Board */}
              <div className="bg-black rounded-lg p-4 border-2 border-blue-500">
                <h2 className="text-2xl font-bold mb-4 text-center">Game Board</h2>
                <div 
                  className="relative bg-blue-900 rounded-lg mx-auto border-4 border-blue-400"
                  style={{ width: '400px', height: '400px' }}
                >
                  {/* Grid overlay */}
                  <div className="absolute inset-0 opacity-20">
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={`h-${i}`} className="absolute w-full h-px bg-white" style={{ top: `${(i / 20) * 100}%` }} />
                    ))}
                    {Array.from({ length: 21 }, (_, i) => (
                      <div key={`v-${i}`} className="absolute h-full w-px bg-white" style={{ left: `${(i / 20) * 100}%` }} />
                    ))}
                  </div>

                  {/* Enhanced Pacman */}
                  <EnhancedPacman
                    x={pacmanPos.x}
                    y={pacmanPos.y}
                    direction={pacmanDir}
                    isMoving={pacmanMoving}
                    isEating={pacmanEating}
                    isPowerMode={pacmanPowerMode}
                    isInvincible={pacmanInvincible}
                    speed={pacmanSpeed}
                  />

                  {/* Enhanced Ghost */}
                  <EnhancedGhost
                    {...ghost}
                    isChasing={ghostChasing}
                    speed={ghostSpeed}
                  />

                  {/* Enhanced Dots */}
                  {dots.map((dot, index) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${(dot.x / 20) * 100}%`,
                        top: `${(dot.y / 20) * 100}%`,
                        width: '5%',
                        height: '5%',
                      }}
                    >
                      <EnhancedDot
                        x={dot.x}
                        y={dot.y}
                        isCollected={dot.collected}
                        onCollect={handleDotCollect}
                      />
                    </div>
                  ))}

                  {/* Enhanced Power Pellets */}
                  {powerPellets.map((pellet, index) => (
                    <div
                      key={index}
                      className="absolute"
                      style={{
                        left: `${(pellet.x / 20) * 100}%`,
                        top: `${(pellet.y / 20) * 100}%`,
                        width: '5%',
                        height: '5%',
                      }}
                    >
                      <EnhancedPowerPellet
                        x={pellet.x}
                        y={pellet.y}
                        isCollected={pellet.collected}
                        onCollect={handlePowerPelletCollect}
                        energyLevel={pellet.energy}
                      />
                    </div>
                  ))}

                  {/* Particle Effect */}
                  {particleEffect.active && (
                    <ParticleEffect
                      x={particleEffect.x}
                      y={particleEffect.y}
                      type={particleEffect.type}
                      isActive={particleEffect.active}
                      onComplete={() => setParticleEffect(prev => ({ ...prev, active: false }))}
                    />
                  )}
                </div>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-3">Pacman Controls</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => { setPacmanMoving(!pacmanMoving); }}
                        className={`px-3 py-1 rounded ${pacmanMoving ? 'bg-green-600' : 'bg-gray-600'}`}
                      >
                        {pacmanMoving ? 'Stop' : 'Move'}
                      </button>
                      <button 
                        onClick={() => setPacmanEating(!pacmanEating)}
                        className={`px-3 py-1 rounded ${pacmanEating ? 'bg-green-600' : 'bg-gray-600'}`}
                      >
                        {pacmanEating ? 'Stop Eating' : 'Eat'}
                      </button>
                      <button 
                        onClick={() => setPacmanPowerMode(!pacmanPowerMode)}
                        className={`px-3 py-1 rounded ${pacmanPowerMode ? 'bg-orange-600' : 'bg-gray-600'}`}
                      >
                        Power Mode
                      </button>
                      <button 
                        onClick={() => setPacmanInvincible(!pacmanInvincible)}
                        className={`px-3 py-1 rounded ${pacmanInvincible ? 'bg-purple-600' : 'bg-gray-600'}`}
                      >
                        Invincible
                      </button>
                    </div>
                    
                    <div className="flex gap-2">
                      {(['slow', 'normal', 'fast'] as const).map(speed => (
                        <button
                          key={speed}
                          onClick={() => setPacmanSpeed(speed)}
                          className={`px-3 py-1 rounded capitalize ${pacmanSpeed === speed ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-2 w-32 mx-auto">
                      <div></div>
                      <button onClick={() => setPacmanDir('up')} className="px-3 py-1 bg-yellow-600 rounded">↑</button>
                      <div></div>
                      <button onClick={() => setPacmanDir('left')} className="px-3 py-1 bg-yellow-600 rounded">←</button>
                      <button onClick={() => setPacmanDir('down')} className="px-3 py-1 bg-yellow-600 rounded">↓</button>
                      <button onClick={() => setPacmanDir('right')} className="px-3 py-1 bg-yellow-600 rounded">→</button>
                    </div>

                    <button
                      onClick={() => setAutoMovement(!autoMovement)}
                      className={`w-full py-2 rounded ${autoMovement ? 'bg-red-600' : 'bg-green-600'}`}
                    >
                      {autoMovement ? 'Stop Auto Movement' : 'Start Auto Movement'}
                    </button>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-3">Ghost Controls</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2 flex-wrap">
                      <button 
                        onClick={() => setGhost(prev => ({ ...prev, isVulnerable: !prev.isVulnerable }))}
                        className={`px-3 py-1 rounded ${ghost.isVulnerable ? 'bg-blue-600' : 'bg-gray-600'}`}
                      >
                        Vulnerable
                      </button>
                      <button 
                        onClick={() => setGhost(prev => ({ ...prev, isFlashing: !prev.isFlashing }))}
                        className={`px-3 py-1 rounded ${ghost.isFlashing ? 'bg-purple-600' : 'bg-gray-600'}`}
                      >
                        Flashing
                      </button>
                      <button 
                        onClick={() => setGhostChasing(!ghostChasing)}
                        className={`px-3 py-1 rounded ${ghostChasing ? 'bg-red-600' : 'bg-gray-600'}`}
                      >
                        Chasing
                      </button>
                    </div>

                    <div className="flex gap-2">
                      {(['red', 'pink', 'blue', 'orange'] as const).map(color => (
                        <button
                          key={color}
                          onClick={() => setGhost(prev => ({ ...prev, color }))}
                          className={`px-3 py-1 rounded capitalize ${ghost.color === color ? `bg-${color}-600` : 'bg-gray-600'}`}
                          style={{ 
                            backgroundColor: ghost.color === color 
                              ? color === 'red' ? '#dc2626' 
                                : color === 'pink' ? '#db2777'
                                : color === 'blue' ? '#2563eb'
                                : '#ea580c'
                              : '#4b5563'
                          }}
                        >
                          {color}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      {(['slow', 'normal', 'fast'] as const).map(speed => (
                        <button
                          key={speed}
                          onClick={() => setGhostSpeed(speed)}
                          className={`px-3 py-1 rounded capitalize ${ghostSpeed === speed ? 'bg-blue-600' : 'bg-gray-600'}`}
                        >
                          {speed}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-lg p-4">
                  <h3 className="text-xl font-bold mb-3">Effects</h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      {(['dot-collect', 'power-pellet', 'ghost-eaten', 'celebration'] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => triggerParticleEffect(type)}
                          className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm"
                        >
                          {type.replace('-', ' ')}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {(['light', 'medium', 'strong', 'extreme'] as const).map(intensity => (
                        <button
                          key={intensity}
                          onClick={() => triggerScreenShake(intensity)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-500 rounded text-sm"
                        >
                          Shake {intensity}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => {
                        setDots(prev => prev.map(dot => ({ ...dot, collected: false })));
                        setPowerPellets(prev => prev.map(pellet => ({ ...pellet, collected: false })));
                      }}
                      className="w-full py-2 bg-green-600 hover:bg-green-500 rounded"
                    >
                      Reset Collectibles
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center text-sm text-gray-400">
              <p>✨ Enhanced animations featuring smooth movements, particle effects, screen shake, and visual feedback!</p>
              <p>🎮 Try different combinations of effects to see how they work together.</p>
            </div>
          </div>
        </div>
      </ScreenShake>
    </GameProvider>
  );
};

export default AnimationDemo;
