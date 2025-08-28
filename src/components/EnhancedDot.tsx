import React, { useState, useEffect } from 'react';
import ParticleEffect from './ParticleEffect';

interface EnhancedDotProps {
  x: number;
  y: number;
  isCollected?: boolean;
  onCollect?: (x: number, y: number) => void;
  glowIntensity?: 'low' | 'medium' | 'high';
  pulseSpeed?: 'slow' | 'normal' | 'fast';
  showCollectionEffect?: boolean;
}

export const EnhancedDot: React.FC<EnhancedDotProps> = ({
  x,
  y,
  isCollected = false,
  onCollect,
  glowIntensity = 'medium',
  pulseSpeed = 'normal',
  showCollectionEffect = true,
}) => {
  const [isBeingCollected, setIsBeingCollected] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Handle collection with animation
  const handleCollect = () => {
    if (isCollected || isBeingCollected) return;
    
    setIsBeingCollected(true);
    
    if (showCollectionEffect) {
      setShowParticles(true);
    }
    
    // Trigger collection after brief animation
    setTimeout(() => {
      onCollect?.(x, y);
    }, 150);
  };

  // Keyboard interaction
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCollect();
    }
  };

  // Glow intensity styles
  const getGlowStyles = () => {
    const baseGlow = 'shadow-yellow-400';
    switch (glowIntensity) {
      case 'low':
        return `${baseGlow} drop-shadow-sm`;
      case 'high':
        return `${baseGlow} drop-shadow-lg shadow-lg`;
      case 'medium':
      default:
        return `${baseGlow} drop-shadow-md shadow-md`;
    }
  };

  // Pulse animation speed
  const getPulseSpeed = () => {
    switch (pulseSpeed) {
      case 'slow':
        return 'animate-pulse [animation-duration:3s]';
      case 'fast':
        return 'animate-pulse [animation-duration:1s]';
      case 'normal':
      default:
        return 'animate-pulse';
    }
  };

  // Don't render if collected and not being collected
  if (isCollected && !isBeingCollected) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
      onClick={handleCollect}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`Dot at position ${x}, ${y}`}
      onKeyDown={handleKeyDown}
    >
      {/* Main dot */}
      <div 
        className={`
          relative transition-all duration-200 ease-out
          ${isBeingCollected ? 'scale-150 opacity-0' : isHovered ? 'scale-125' : 'scale-100'}
          ${getPulseSpeed()}
        `}
      >
        {/* Dot body */}
        <div 
          className={`
            w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full
            bg-gradient-radial from-yellow-200 via-yellow-400 to-yellow-500
            ${getGlowStyles()}
            transition-all duration-200
          `}
          style={{
            boxShadow: isHovered 
              ? '0 0 8px #facc15, 0 0 16px #facc15, 0 0 24px #facc15'
              : '0 0 4px #facc15, 0 0 8px #facc15',
          }}
        />

        {/* Hover glow ring */}
        {isHovered && (
          <div 
            className="absolute inset-0 -m-1 rounded-full animate-ping"
            style={{
              background: 'radial-gradient(circle, rgba(250, 204, 21, 0.4) 0%, transparent 70%)',
            }}
          />
        )}

        {/* Collection shockwave */}
        {isBeingCollected && (
          <div 
            className="absolute inset-0 -m-2 rounded-full bg-yellow-300 opacity-60"
            style={{
              animation: 'ping 0.3s ease-out',
              transform: 'scale(3)',
            }}
          />
        )}

        {/* Floating sparkles */}
        {isHovered && (
          <>
            <div 
              className="absolute -top-1 -left-1 w-0.5 h-0.5 bg-yellow-200 rounded-full animate-bounce opacity-80"
              style={{ animationDelay: '0s', animationDuration: '2s' }}
            />
            <div 
              className="absolute -bottom-1 -right-1 w-0.5 h-0.5 bg-yellow-300 rounded-full animate-bounce opacity-60"
              style={{ animationDelay: '0.5s', animationDuration: '2.5s' }}
            />
            <div 
              className="absolute -top-1 -right-1 w-0.5 h-0.5 bg-yellow-100 rounded-full animate-bounce opacity-70"
              style={{ animationDelay: '1s', animationDuration: '2.2s' }}
            />
          </>
        )}
      </div>

      {/* Particle effect */}
      {showParticles && (
        <ParticleEffect
          x={0}
          y={0}
          type="dot-collect"
          isActive={showParticles}
          particleCount={4}
          duration={600}
          colors={['#facc15', '#fbbf24', '#f59e0b']}
          onComplete={() => setShowParticles(false)}
        />
      )}
    </div>
  );
};

export default EnhancedDot;
