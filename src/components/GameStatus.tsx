import React, { useEffect, useState } from 'react';
import { useGameContext } from '../hooks/useGameContext';
import styles from '../styles/GameStatus.module.css';

interface GameStatusProps {
  className?: string;
  showMessages?: boolean;
  autoHideDelay?: number;
}

export const GameStatus: React.FC<GameStatusProps> = ({
  className,
  showMessages = true,
  autoHideDelay = 3000,
}) => {
  const { state } = useGameContext();
  const [displayMessage, setDisplayMessage] = useState<string>('');
  const [messageType, setMessageType] = useState<'info' | 'success' | 'warning' | 'error'>('info');
  const [isVisible, setIsVisible] = useState(false);

  const getStatusMessage = (): { message: string; type: 'info' | 'success' | 'warning' | 'error' } => {
    switch (state.gameStatus) {
      case 'menu':
        return { message: 'Press SPACE to Start Game', type: 'info' };
      case 'playing':
        return { message: '', type: 'info' };
      case 'paused':
        return { message: 'Game Paused - Press P to Resume', type: 'warning' };
      case 'round-complete':
        return { message: `Round ${state.round.current} Complete!`, type: 'success' };
      case 'game-over':
        return { message: 'Game Over!', type: 'error' };
      case 'game-complete':
        return { message: 'Congratulations! You Won!', type: 'success' };
      default:
        return { message: '', type: 'info' };
    }
  };

  useEffect(() => {
    const { message, type } = getStatusMessage();
    
    if (message && showMessages) {
      setDisplayMessage(message);
      setMessageType(type);
      setIsVisible(true);
      
      // Auto-hide message for certain status types
      if (type === 'success' && autoHideDelay > 0) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, autoHideDelay);
        
        return () => clearTimeout(timer);
      }
    } else if (!message) {
      setIsVisible(false);
    }
  }, [state.gameStatus, state.round.current, showMessages, autoHideDelay]);

  // Show power mode status
  const powerModeMessage = state.powerMode.isActive ? 'POWER MODE ACTIVE!' : '';
  const isPowerModeVisible = state.powerMode.isActive;

  const gameStatusClass = `
    ${styles.gameStatus} 
    ${className || ''}
  `.trim();

  return (
    <div className={gameStatusClass}>
      {/* Main Status Message */}
      {isVisible && displayMessage && (
        <div className={`${styles.statusMessage} ${styles[messageType]}`}>
          <span className={styles.messageText}>{displayMessage}</span>
          {state.gameStatus === 'paused' && (
            <div className={styles.pauseIndicator}>
              <div className={styles.pauseBar}></div>
              <div className={styles.pauseBar}></div>
            </div>
          )}
        </div>
      )}

      {/* Power Mode Indicator */}
      {isPowerModeVisible && (
        <div className={`${styles.powerModeMessage} ${styles.success}`}>
          <span className={styles.messageText}>{powerModeMessage}</span>
          <div className={styles.powerModeFlash}></div>
        </div>
      )}

      {/* Game Instructions for Menu State */}
      {state.gameStatus === 'menu' && (
        <div className={styles.instructions}>
          <div className={styles.instructionItem}>
            <span className={styles.key}>↑↓←→</span>
            <span className={styles.description}>Move Pacman</span>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.key}>SPACE</span>
            <span className={styles.description}>Start/Restart Game</span>
          </div>
          <div className={styles.instructionItem}>
            <span className={styles.key}>P</span>
            <span className={styles.description}>Pause/Resume</span>
          </div>
        </div>
      )}

      {/* Ready Countdown */}
      {state.gameStatus === 'playing' && state.round.current === 1 && (
        <ReadyCountdown />
      )}
    </div>
  );
};

// Sub-component for ready countdown
const ReadyCountdown: React.FC = () => {
  const [countdown, setCountdown] = useState<number>(3);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      const hideTimer = setTimeout(() => {
        setIsVisible(false);
      }, 500);
      
      return () => clearTimeout(hideTimer);
    }
  }, [countdown]);

  if (!isVisible) return null;

  return (
    <div className={styles.readyCountdown}>
      {countdown > 0 ? (
        <span className={styles.countdownNumber}>{countdown}</span>
      ) : (
        <span className={styles.readyText}>GO!</span>
      )}
    </div>
  );
};

export default GameStatus;
