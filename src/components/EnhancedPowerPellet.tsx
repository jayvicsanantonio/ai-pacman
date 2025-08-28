import React, { useState, useEffect, useRef } from 'react';
import ParticleEffect from './ParticleEffect';

interface EnhancedPowerPelletProps {
  x: number;
  y: number;
  isCollected?: boolean;
  onCollect?: (x: number, y: number) => void;
  glowIntensity?: 'low' | 'medium' | 'high' | 'extreme';
  pulseSpeed?: 'slow' | 'normal' | 'fast';
  showCollectionEffect?: boolean;
  energyLevel?: number; // 0-1, affects glow and size
}

export const EnhancedPowerPellet: React.FC<EnhancedPowerPelletProps> = ({
  x,
  y,
  isCollected = false,
  onCollect,
  glowIntensity = 'high',
  pulseSpeed = 'normal',
  showCollectionEffect = true,
  energyLevel = 1,
}) => {
  const [isBeingCollected, setIsBeingCollected] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);
  const [energyWaves, setEnergyWaves] = useState<number[]>([]);
  const animationRef = useRef<number>(0);

  // Continuous rotation animation
  useEffect(() => {
    const animate = () => {
      setRotationAngle(prev => (prev + 1) % 360);
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Energy wave generation
  useEffect(() => {
    if (isCollected || isBeingCollected) return;
    
    const generateWave = () => {
      const newWave = Date.now();
      setEnergyWaves(prev => [...prev.slice(-3), newWave]); // Keep only last 4 waves
    };
    
    const interval = setInterval(generateWave, pulseSpeed === 'fast' ? 800 : pulseSpeed === 'slow' ? 2000 : 1200);
    
    return () => clearInterval(interval);
  }, [isCollected, isBeingCollected, pulseSpeed]);

  // Clean up old waves
  useEffect(() => {
    const cleanupWaves = () => {
      const now = Date.now();
      setEnergyWaves(prev => prev.filter(wave => now - wave < 3000));
    };
    
    const interval = setInterval(cleanupWaves, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle collection with enhanced animation
  const handleCollect = () => {
    if (isCollected || isBeingCollected) return;
    
    setIsBeingCollected(true);
    
    if (showCollectionEffect) {
      setShowParticles(true);
    }
    
    // Trigger collection after animation
    setTimeout(() => {
      onCollect?.(x, y);
    }, 200);
  };

  // Keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCollect();
    }
  };

  // Get glow styles based on intensity and energy level
  const getGlowStyles = () => {
    const baseIntensity = energyLevel * 0.8 + 0.2; // Min 20% intensity
    
    switch (glowIntensity) {
      case 'low':
        return {
          boxShadow: `0 0 ${4 * baseIntensity}px #facc15, 0 0 ${8 * baseIntensity}px #facc15`,
          filter: `brightness(${1 + baseIntensity * 0.2})`,
        };
      case 'medium':
        return {
          boxShadow: `0 0 ${6 * baseIntensity}px #facc15, 0 0 ${12 * baseIntensity}px #facc15, 0 0 ${18 * baseIntensity}px #f59e0b`,
          filter: `brightness(${1 + baseIntensity * 0.3})`,
        };
      case 'extreme':
        return {
          boxShadow: `0 0 ${16 * baseIntensity}px #facc15, 0 0 ${32 * baseIntensity}px #f59e0b, 0 0 ${48 * baseIntensity}px #d97706, 0 0 ${64 * baseIntensity}px #ff6b00`,
          filter: `brightness(${1 + baseIntensity * 0.6}) saturate(${1 + baseIntensity * 0.4})`,
        };
      case 'high':
      default:
        return {
          boxShadow: `0 0 ${8 * baseIntensity}px #facc15, 0 0 ${16 * baseIntensity}px #f59e0b, 0 0 ${24 * baseIntensity}px #d97706`,
          filter: `brightness(${1 + baseIntensity * 0.4}) saturate(${1 + baseIntensity * 0.2})`,
        };
    }
  };

  // Pulse animation speed
  const getPulseSpeed = () => {
    switch (pulseSpeed) {
      case 'slow':
        return 'animate-pulse [animation-duration:4s]';
      case 'fast':
        return 'animate-pulse [animation-duration:1.5s]';
      case 'normal':
      default:
        return 'animate-pulse [animation-duration:2s]';
    }
  };

  // Don't render if collected and not being collected
  if (isCollected && !isBeingCollected) return null;

  const glowStyles = getGlowStyles();
  const scaleFactor = 0.8 + (energyLevel * 0.4); // Scale from 80% to 120% based on energy

  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer group z-50"
      onClick={handleCollect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Power pellet at position ${x}, ${y}`}
      onKeyDown={handleKeyDown}
    >
      {/* Energy waves */}
      {energyWaves.map((waveTime) => {
        const age = Date.now() - waveTime;
        const progress = age / 3000; // 3 second wave lifecycle
        const opacity = Math.max(0, 1 - progress);
        const scale = 1 + progress * 3;
        
        return (
          <div
            key={waveTime}
            className="absolute inset-0 rounded-full border-2 border-yellow-400 pointer-events-none"
            style={{
              opacity: opacity * 0.3,
              transform: `scale(${scale})`,
              transition: 'none',
              borderColor: `rgba(250, 204, 21, ${opacity * 0.5})`,
            }}
          />
        );
      })}

      {/* Main power pellet */}
      <div 
        className={`
          relative transition-all duration-300 ease-out
          ${isBeingCollected ? 'scale-200 opacity-0' : isHovered ? 'scale-125' : 'scale-100'}
          ${getPulseSpeed()}
        `}
        style={{
          transform: `scale(${scaleFactor}) rotate(${rotationAngle * 0.5}deg)`,
        }}
      >
        {/* Power pellet core */}
        <div 
          className={`
            w-2 h-2 sm:w-3 sm:h-3 rounded-full relative
            transition-all duration-200
          `}
          style={{
            background: `conic-gradient(
              from ${rotationAngle}deg,
              #fef3c7 0deg,
              #facc15 60deg,
              #f59e0b 120deg,
              #d97706 180deg,
              #f59e0b 240deg,
              #facc15 300deg,
              #fef3c7 360deg
            )`,
            ...glowStyles,
          }}
        >
          {/* Inner glow core */}
          <div 
            className="absolute inset-0.5 rounded-full"
            style={{
              background: 'radial-gradient(circle, #fef9c3 0%, #facc15 70%, transparent 100%)',
              animation: `pulse ${pulseSpeed === 'fast' ? '1s' : '2s'} ease-in-out infinite`,
            }}
          />
          
          {/* Energy ring */}
          <div 
            className="absolute -inset-1 rounded-full border border-yellow-300 opacity-60"
            style={{
              transform: `rotate(${-rotationAngle}deg)`,
              borderColor: `rgba(250, 204, 21, ${0.4 + energyLevel * 0.4})`,
            }}
          />
        </div>

        {/* Hover enhancement */}
        {isHovered && (
          <>
            {/* Intense glow ring */}
            <div 
              className="absolute -inset-2 rounded-full animate-ping opacity-40"
              style={{
                background: 'radial-gradient(circle, rgba(250, 204, 21, 0.6) 0%, transparent 70%)',
              }}
            />
            
            {/* Orbiting sparkles */}
            <div 
              className="absolute inset-0"
              style={{ transform: `rotate(${rotationAngle * 2}deg)` }}
            >
              <div className="absolute -top-2 left-1/2 w-1 h-1 bg-yellow-200 rounded-full transform -translate-x-1/2" />
              <div className="absolute top-1/2 -right-2 w-0.5 h-0.5 bg-yellow-300 rounded-full transform -translate-y-1/2" />
              <div className="absolute -bottom-2 left-1/2 w-1 h-1 bg-yellow-100 rounded-full transform -translate-x-1/2" />
              <div className="absolute top-1/2 -left-2 w-0.5 h-0.5 bg-yellow-400 rounded-full transform -translate-y-1/2" />
            </div>
          </>
        )}

        {/* Collection explosion */}
        {isBeingCollected && (
          <>
            <div 
              className="absolute inset-0 -m-4 rounded-full bg-yellow-300 opacity-70"
              style={{
                animation: 'ping 0.4s ease-out',
                transform: 'scale(4)',
              }}
            />
            <div 
              className="absolute inset-0 -m-6 rounded-full bg-orange-400 opacity-50"
              style={{
                animation: 'ping 0.6s ease-out',
                animationDelay: '0.1s',
                transform: 'scale(6)',
              }}
            />
          </>
        )}

        {/* Energy lightning */}
        {energyLevel > 0.7 && (
          <div className="absolute inset-0 pointer-events-none">
            <div 
              className="absolute top-0 left-1/2 w-0.5 h-4 bg-gradient-to-t from-yellow-400 to-transparent transform -translate-x-1/2 opacity-60"
              style={{
                animation: 'pulse 0.5s ease-in-out infinite',
                animationDelay: `${Math.random() * 0.5}s`,
              }}
            />
            <div 
              className="absolute bottom-0 left-1/2 w-0.5 h-4 bg-gradient-to-b from-yellow-400 to-transparent transform -translate-x-1/2 opacity-60"
              style={{
                animation: 'pulse 0.7s ease-in-out infinite',
                animationDelay: `${Math.random() * 0.7}s`,
              }}
            />
          </div>
        )}
      </div>

      {/* Particle effect */}
      {showParticles && (
        <ParticleEffect
          x={0}
          y={0}
          type="power-pellet"
          isActive={showParticles}
          particleCount={12}
          duration={1000}
          colors={['#facc15', '#f59e0b', '#d97706', '#ff6b00']}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </div>
  );
};

export default EnhancedPowerPellet;
