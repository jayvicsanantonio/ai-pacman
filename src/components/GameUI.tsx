import React from 'react';
import { ScoreBoard } from './ScoreBoard';
import { GameStatus } from './GameStatus';
import { useGameContext } from '../hooks/useGameContext';
import styles from '../styles/GameUI.module.css';

interface GameUIProps {
  className?: string;
  layout?: 'top' | 'bottom' | 'sides' | 'overlay';
  showScoreBoard?: boolean;
  showGameStatus?: boolean;
  showPowerMode?: boolean;
  compact?: boolean;
}

export const GameUI: React.FC<GameUIProps> = ({
  className,
  layout = 'top',
  showScoreBoard = true,
  showGameStatus = true,
  showPowerMode = true,
  compact = false,
}) => {
  const { state } = useGameContext();

  const gameUIClass = `
    ${styles.gameUI} 
    ${styles[layout]} 
    ${compact ? styles.compact : ''} 
    ${className || ''}
  `.trim();

  // Don't show UI during gameplay for clean experience
  const shouldShowOverlay = state.gameStatus !== 'playing' || state.powerMode.isActive;

  return (
    <div className={gameUIClass}>
      {/* Top UI Section */}
      {(layout === 'top' || layout === 'overlay') && (
        <div className={styles.topSection}>
          {showScoreBoard && (
            <ScoreBoard
              layout="horizontal"
              showPowerMode={showPowerMode}
              compact={compact}
              className={styles.topScoreBoard}
            />
          )}
        </div>
      )}

      {/* Bottom UI Section */}
      {(layout === 'bottom' || layout === 'overlay') && (
        <div className={styles.bottomSection}>
          {showGameStatus && (
            <GameStatus
              showMessages={shouldShowOverlay}
              className={styles.bottomGameStatus}
            />
          )}
        </div>
      )}

      {/* Side UI Sections */}
      {(layout === 'sides' || layout === 'overlay') && (
        <>
          <div className={styles.leftSection}>
            {showScoreBoard && (
              <ScoreBoard
                layout="vertical"
                showPowerMode={showPowerMode}
                compact={compact}
                className={styles.sideScoreBoard}
              />
            )}
          </div>
          
          <div className={styles.rightSection}>
            {showGameStatus && (
              <GameStatus
                showMessages={shouldShowOverlay}
                className={styles.sideGameStatus}
              />
            )}
          </div>
        </>
      )}

      {/* Center Status Overlay */}
      {shouldShowOverlay && state.gameStatus !== 'playing' && (
        <div className={styles.centerOverlay}>
          <GameStatus
            showMessages={true}
            autoHideDelay={0} // Don't auto-hide center messages
            className={styles.centerGameStatus}
          />
        </div>
      )}

      {/* Power Mode Overlay */}
      {state.powerMode.isActive && (
        <div className={styles.powerModeOverlay}>
          <div className={styles.powerModeIndicator}>
            <span className={styles.powerModeText}>POWER MODE!</span>
            <div className={styles.powerModeTimer}>
              <div 
                className={styles.powerModeBar}
                style={{
                  width: `${Math.max(0, (
                    (state.powerMode.endTime - Date.now()) / 
                    state.powerMode.duration
                  ) * 100)}%`
                }}
              />
            </div>
            {state.powerMode.ghostsEaten > 0 && (
              <span className={styles.ghostsEatenText}>
                Ghosts Eaten: {state.powerMode.ghostsEaten}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Game Over Overlay */}
      {state.gameStatus === 'game-over' && (
        <div className={styles.gameOverOverlay}>
          <div className={styles.gameOverContent}>
            <h2 className={styles.gameOverTitle}>Game Over</h2>
            <div className={styles.finalStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Final Score:</span>
                <span className={styles.statValue}>{state.score.current.toLocaleString()}</span>
              </div>
              {state.score.current >= state.score.high && (
                <div className={styles.statItem}>
                  <span className={styles.newHighScore}>New High Score! 🎉</span>
                </div>
              )}
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Round Reached:</span>
                <span className={styles.statValue}>{state.round.current}</span>
              </div>
            </div>
            <div className={styles.gameOverActions}>
              <span className={styles.actionHint}>Press SPACE to play again</span>
            </div>
          </div>
        </div>
      )}

      {/* Victory Overlay */}
      {state.gameStatus === 'game-complete' && (
        <div className={styles.victoryOverlay}>
          <div className={styles.victoryContent}>
            <h2 className={styles.victoryTitle}>Congratulations!</h2>
            <div className={styles.victoryMessage}>
              You completed all {state.round.max} rounds!
            </div>
            <div className={styles.finalStats}>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Final Score:</span>
                <span className={styles.statValue}>{state.score.current.toLocaleString()}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statLabel}>Lives Remaining:</span>
                <span className={styles.statValue}>{state.lives}</span>
              </div>
            </div>
            <div className={styles.victoryActions}>
              <span className={styles.actionHint}>Press SPACE to play again</span>
            </div>
          </div>
        </div>
      )}

      {/* Pause Overlay */}
      {state.gameStatus === 'paused' && (
        <div className={styles.pauseOverlay}>
          <div className={styles.pauseContent}>
            <h2 className={styles.pauseTitle}>Game Paused</h2>
            <div className={styles.pauseIcon}>
              <div className={styles.pauseBar}></div>
              <div className={styles.pauseBar}></div>
            </div>
            <div className={styles.pauseActions}>
              <span className={styles.actionHint}>Press P or ESC to resume</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameUI;
