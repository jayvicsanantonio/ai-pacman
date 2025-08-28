import React from 'react';
import { formatScore, formatTime } from '../utils/gameUtils';
import { useGameContext } from '../hooks/useGameContext';
import styles from '../styles/ScoreBoard.module.css';

interface ScoreBoardProps {
  className?: string;
  showGameTime?: boolean;
  showRound?: boolean;
  showPowerMode?: boolean;
  layout?: 'horizontal' | 'vertical';
  compact?: boolean;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  className,
  showGameTime = true,
  showRound = true,
  showPowerMode = true,
  layout = 'horizontal',
  compact = false,
}) => {
  const { state } = useGameContext();

  const getGameTime = () => {
    if (state.gameTime === 0) return 0;
    return Date.now() - state.gameTime;
  };

  const getPowerModeTimeLeft = () => {
    if (!state.powerMode.isActive) return 0;
    return Math.max(0, state.powerMode.endTime - Date.now());
  };

  const scoreBoardClass = `
    ${styles.scoreBoard} 
    ${styles[layout]} 
    ${compact ? styles.compact : ''} 
    ${className || ''}
  `.trim();

  return (
    <div className={scoreBoardClass}>
      {/* Score Section */}
      <div className={styles.scoreSection}>
        <div className={styles.scoreItem}>
          <span className={styles.label}>Score</span>
          <span className={styles.value}>{formatScore(state.score.current)}</span>
        </div>
        
        {state.score.high > 0 && (
          <div className={styles.scoreItem}>
            <span className={styles.label}>High</span>
            <span className={styles.value}>{formatScore(state.score.high)}</span>
          </div>
        )}
      </div>

      {/* Lives Section */}
      <div className={styles.livesSection}>
        <span className={styles.label}>Lives</span>
        <div className={styles.livesDisplay}>
          {Array.from({ length: Math.max(0, state.lives) }, (_, i) => (
            <div key={i} className={styles.life} />
          ))}
          {state.lives === 0 && (
            <span className={styles.noLives}>Game Over</span>
          )}
        </div>
      </div>

      {/* Round Section */}
      {showRound && (
        <div className={styles.roundSection}>
          <span className={styles.label}>Round</span>
          <span className={styles.value}>
            {state.round.current} / {state.round.max}
          </span>
        </div>
      )}

      {/* Game Time Section */}
      {showGameTime && state.gameStatus !== 'menu' && (
        <div className={styles.timeSection}>
          <span className={styles.label}>Time</span>
          <span className={styles.value}>{formatTime(getGameTime())}</span>
        </div>
      )}

      {/* Power Mode Section */}
      {showPowerMode && state.powerMode.isActive && (
        <div className={styles.powerModeSection}>
          <div className={styles.powerModeIndicator}>
            <span className={styles.label}>Power Mode</span>
            <div className={styles.powerModeTimer}>
              <div 
                className={styles.powerModeBar}
                style={{
                  width: `${Math.max(0, (getPowerModeTimeLeft() / state.powerMode.duration) * 100)}%`
                }}
              />
              <span className={styles.powerModeTime}>
                {Math.ceil(getPowerModeTimeLeft() / 1000)}s
              </span>
            </div>
          </div>
          
          {state.powerMode.ghostsEaten > 0 && (
            <div className={styles.ghostsEaten}>
              <span className={styles.label}>Ghosts</span>
              <span className={styles.value}>{state.powerMode.ghostsEaten}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreBoard;
