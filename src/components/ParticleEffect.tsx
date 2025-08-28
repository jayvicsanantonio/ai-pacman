import React, { useEffect, useState, useRef } from 'react';

interface Particle {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  life: number;
  maxLife: number;
  type: 'spark' | 'dot' | 'star' | 'circle' | 'square';
}

interface ParticleEffectProps {
  x: number;
  y: number;
  type?: 'dot-collect' | 'power-pellet' | 'ghost-eaten' | 'score-popup' | 'celebration' | 'explosion';
  isActive: boolean;
  onComplete?: () => void;
  particleCount?: number;
  duration?: number;
  colors?: string[];
  size?: 'small' | 'medium' | 'large';
}

export const ParticleEffect: React.FC<ParticleEffectProps> = ({
  x,
  y,
  type = 'dot-collect',
  isActive,
  onComplete,
  particleCount = 8,
  duration = 1000,
}) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Particle configurations for different effect types
  const getParticleConfig = (type: string) => {
    switch (type) {
      case 'dot-collect':
        return {
          count: 6,
          baseSize: 2,
          speed: 2,
          spread: 1.5,
          colors: ['#facc15', '#fbbf24', '#f59e0b'],
          life: 800,
          gravity: 0.1,
          types: ['circle', 'spark'] as const,
        };
      case 'power-pellet':
        return {
          count: 12,
          baseSize: 3,
          speed: 3,
          spread: 2.5,
          colors: ['#facc15', '#f59e0b', '#d97706', '#ff6b00'],
          life: 1200,
          gravity: 0.05,
          types: ['star', 'circle', 'spark'] as const,
        };
      case 'ghost-eaten':
        return {
          count: 15,
          baseSize: 4,
          speed: 4,
          spread: 3,
          colors: ['#60a5fa', '#3b82f6', '#2563eb', '#ffffff'],
          life: 1000,
          gravity: -0.1,
          types: ['star', 'circle'] as const,
        };
      case 'score-popup':
        return {
          count: 8,
          baseSize: 1.5,
          speed: 1.5,
          spread: 1,
          colors: ['#10b981', '#34d399', '#6ee7b7'],
          life: 1500,
          gravity: -0.05,
          types: ['dot', 'circle'] as const,
        };
      case 'celebration':
        return {
          count: 20,
          baseSize: 3,
          speed: 5,
          spread: 4,
          colors: ['#facc15', '#f59e0b', '#ef4444', '#3b82f6', '#10b981', '#f97316'],
          life: 2000,
          gravity: 0.15,
          types: ['star', 'circle', 'square'] as const,
        };
      case 'explosion':
        return {
          count: 25,
          baseSize: 2,
          speed: 6,
          spread: 5,
          colors: ['#ff6b00', '#ff8500', '#ffaa00', '#ffdd00', '#ffffff'],
          life: 1500,
          gravity: 0.2,
          types: ['spark', 'circle'] as const,
        };
      default:
        return {
          count: 8,
          baseSize: 2,
          speed: 2,
          spread: 2,
          colors: ['#facc15', '#fbbf24'],
          life: 1000,
          gravity: 0.1,
          types: ['circle'] as const,
        };
    }
  };

  // Create initial particles
  useEffect(() => {
    if (isActive) {
      const config = getParticleConfig(type);
      const newParticles: Particle[] = [];
      
      for (let i = 0; i < (particleCount || config.count); i++) {
        const angle = (Math.PI * 2 * i) / (particleCount || config.count) + Math.random() * 0.5;
        const speed = config.speed * (0.5 + Math.random() * 0.5);
        const particleSize = config.baseSize * (0.7 + Math.random() * 0.6);
        const color = config.colors[Math.floor(Math.random() * config.colors.length)];
        const particleType = config.types[Math.floor(Math.random() * config.types.length)];
        
        newParticles.push({
          id: `particle-${i}-${Date.now()}`,
          x: x,
          y: y,
          vx: Math.cos(angle) * speed * config.spread,
          vy: Math.sin(angle) * speed * config.spread,
          size: particleSize,
          color: color,
          opacity: 1,
          life: config.life * (0.8 + Math.random() * 0.4),
          maxLife: config.life,
          type: particleType,
        });
      }
      
      setParticles(newParticles);
      startTimeRef.current = Date.now();
    } else {
      setParticles([]);
    }
  }, [isActive, type, particleCount, x, y]);

  // Animation loop
  useEffect(() => {
    if (!isActive || particles.length === 0) return;

    const config = getParticleConfig(type);
    
    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - (startTimeRef.current || currentTime);
      
      if (elapsed >= (duration || config.life)) {
        setParticles([]);
        onComplete?.();
        return;
      }

      setParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => {
            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Apply gravity
            particle.vy += config.gravity;
            
            // Apply air resistance
            particle.vx *= 0.98;
            particle.vy *= 0.98;
            
            // Update life and opacity
            particle.life -= 16; // Assume 60fps
            particle.opacity = Math.max(0, particle.life / particle.maxLife);
            
            return particle;
          })
          .filter(particle => particle.life > 0);
        
        if (updatedParticles.length === 0) {
          onComplete?.();
        }
        
        return updatedParticles;
      });
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, particles.length, type, duration, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  // Render particle based on type
  const renderParticle = (particle: Particle) => {
    const baseStyle = {
      position: 'absolute' as const,
      left: particle.x - particle.size / 2,
      top: particle.y - particle.size / 2,
      width: particle.size,
      height: particle.size,
      opacity: particle.opacity,
      pointerEvents: 'none' as const,
      zIndex: 100,
    };

    switch (particle.type) {
      case 'spark':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              background: `linear-gradient(45deg, ${particle.color}, transparent)`,
              borderRadius: '50% 0%',
              transform: `rotate(${Math.atan2(particle.vy, particle.vx)}rad)`,
            }}
          />
        );
      case 'star':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              clipPath: 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)',
              transform: `rotate(${Date.now() * 0.01}deg)`,
            }}
          />
        );
      case 'square':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              transform: `rotate(${particle.life * 0.01}deg)`,
              boxShadow: `0 0 ${particle.size}px ${particle.color}`,
            }}
          />
        );
      case 'dot':
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
            }}
          />
        );
      case 'circle':
      default:
        return (
          <div
            key={particle.id}
            style={{
              ...baseStyle,
              backgroundColor: particle.color,
              borderRadius: '50%',
              boxShadow: `0 0 ${particle.size}px ${particle.color}66`,
              transform: `scale(${0.5 + particle.opacity * 0.5})`,
            }}
          />
        );
    }
  };

  if (!isActive || particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(renderParticle)}
    </div>
  );
};

export default ParticleEffect;
