import React, { useEffect, useState, useRef } from 'react';

interface ScreenShakeProps {
  isActive: boolean;
  intensity?: 'light' | 'medium' | 'strong' | 'extreme';
  duration?: number;
  onComplete?: () => void;
  children: React.ReactNode;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  isActive,
  intensity = 'medium',
  duration = 300,
  onComplete,
  children,
}) => {
  const [shakeOffset, setShakeOffset] = useState({ x: 0, y: 0 });
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  // Shake intensity configurations
  const getIntensityConfig = (intensity: string) => {
    switch (intensity) {
      case 'light':
        return { maxOffset: 2, frequency: 20, decay: 0.9 };
      case 'medium':
        return { maxOffset: 4, frequency: 30, decay: 0.92 };
      case 'strong':
        return { maxOffset: 8, frequency: 40, decay: 0.88 };
      case 'extreme':
        return { maxOffset: 16, frequency: 50, decay: 0.85 };
      default:
        return { maxOffset: 4, frequency: 30, decay: 0.92 };
    }
  };

  // Screen shake animation
  useEffect(() => {
    if (isActive) {
      startTimeRef.current = Date.now();
      const config = getIntensityConfig(intensity);
      let currentIntensity = config.maxOffset;

      const shake = () => {
        const elapsed = Date.now() - (startTimeRef.current || 0);
        
        if (elapsed >= duration) {
          setShakeOffset({ x: 0, y: 0 });
          onComplete?.();
          return;
        }

        // Generate random offset with decreasing intensity
        const progress = elapsed / duration;
        currentIntensity = config.maxOffset * (1 - progress);
        
        const x = (Math.random() - 0.5) * currentIntensity * 2;
        const y = (Math.random() - 0.5) * currentIntensity * 2;
        
        setShakeOffset({ x, y });
        
        animationRef.current = requestAnimationFrame(shake);
      };

      animationRef.current = requestAnimationFrame(shake);
    } else {
      setShakeOffset({ x: 0, y: 0 });
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, intensity, duration, onComplete]);

  return (
    <div
      style={{
        transform: `translate(${shakeOffset.x}px, ${shakeOffset.y}px)`,
        transition: isActive ? 'none' : 'transform 0.1s ease-out',
      }}
    >
      {children}
    </div>
  );
};

export default ScreenShake;
