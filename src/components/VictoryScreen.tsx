import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { useGameState } from '../hooks/useGameState';
import { formatScore, formatTime, calculateBonusPoints } from '../utils/gameUtils';

interface VictoryScreenProps {
  onNextRound?: () => void;
  onRestart?: () => void;
  onMainMenu?: () => void;
  showAnimation?: boolean;
  autoFocus?: boolean;
  type?: 'round-complete' | 'game-complete';
}

export const VictoryScreen: React.FC<VictoryScreenProps> = ({
  onNextRound,
  onRestart,
  onMainMenu,
  showAnimation = true,
  autoFocus = true,
  type = 'round-complete',
}) => {
  const { state } = useGameContext();
  const gameState = useGameState();
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'entering' | 'visible' | 'celebrating'>('hidden');
  const [showStats, setShowStats] = useState(false);
  const [showBonusAnimation, setShowBonusAnimation] = useState(false);

  const isGameComplete = type === 'game-complete' || state.gameStatus === 'game-complete';
  const isRoundComplete = type === 'round-complete' || state.gameStatus === 'round-complete';

  // Animation sequence
  useEffect(() => {
    if (showAnimation && (isGameComplete || isRoundComplete)) {
      const timer1 = setTimeout(() => setAnimationPhase('entering'), 100);
      const timer2 = setTimeout(() => setAnimationPhase('visible'), 600);
      const timer3 = setTimeout(() => setAnimationPhase('celebrating'), 1000);
      const timer4 = setTimeout(() => setShowStats(true), 1400);
      const timer5 = setTimeout(() => setShowBonusAnimation(true), 1800);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
        clearTimeout(timer4);
        clearTimeout(timer5);
      };
    }
  }, [showAnimation, isGameComplete, isRoundComplete]);

  // Keyboard controls
  useEffect(() => {
    if (!autoFocus || (!isGameComplete && !isRoundComplete)) return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case ' ':
        case 'enter':
          event.preventDefault();
          if (isGameComplete) {
            handleRestart();
          } else {
            handleNextRound();
          }
          break;
        case 'escape':
          event.preventDefault();
          handleMainMenu();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [autoFocus, isGameComplete, isRoundComplete]);

  const handleNextRound = () => {
    onNextRound?.() || gameState.nextRound();
  };

  const handleRestart = () => {
    onRestart?.() || gameState.startGame();
  };

  const handleMainMenu = () => {
    onMainMenu?.() || gameState.restartGame();
  };

  // Calculate bonus points
  const bonusPoints = calculateBonusPoints({
    remainingTime: gameState.getRoundDuration(),
    livesRemaining: state.lives,
    perfectRound: state.lives === 3, // No lives lost this round
    speedBonus: gameState.getRoundDuration() < 120000, // Completed in under 2 minutes
  });

  const isNewHighScore = state.score.current >= state.score.high;
  const gameTime = gameState.getGameDuration();
  const roundTime = gameState.getRoundDuration();
  
  const statistics = {
    currentScore: state.score.current,
    highScore: state.score.high,
    roundsCompleted: isGameComplete ? state.round.max : state.round.current,
    totalTime: gameTime,
    roundTime: roundTime,
    dotsEaten: 244 - state.dots.size,
    ghostsEaten: state.powerMode.ghostsEaten,
    livesRemaining: state.lives,
    bonusPoints,
  };

  // Don't render if not in victory state
  if (!isGameComplete && !isRoundComplete) {
    return null;
  }

  return (
    <div 
      className={`
        fixed inset-0 z-50 flex items-center justify-center 
        bg-black transition-opacity duration-500
        ${animationPhase === 'hidden' ? 'opacity-0' : 'opacity-90'}
      `}
    >
      <div 
        className={`
          relative max-w-lg w-full mx-4 p-8 
          ${isGameComplete 
            ? 'bg-gradient-to-br from-yellow-600 to-yellow-700' 
            : 'bg-gradient-to-br from-green-700 to-green-800'
          }
          border-4 ${isGameComplete ? 'border-yellow-300' : 'border-green-400'} 
          rounded-xl shadow-2xl
          transform transition-all duration-500 ease-out
          ${animationPhase === 'hidden' 
            ? 'scale-50 opacity-0 translate-y-20' 
            : animationPhase === 'entering'
            ? 'scale-75 opacity-70 translate-y-10'
            : animationPhase === 'visible'
            ? 'scale-100 opacity-100 translate-y-0'
            : 'scale-105 opacity-100 translate-y-0'
          }
        `}
      >
        {/* Animated Border Effect */}
        <div className={`
          absolute inset-0 rounded-xl border-4 
          ${isGameComplete ? 'border-yellow-200' : 'border-green-300'} 
          animate-pulse opacity-75
        `}></div>
        
        {/* Victory Title */}
        <div className="text-center mb-6">
          {isGameComplete ? (
            <>
              <div className="text-6xl mb-4">🏆</div>
              <h1 className={`
                text-5xl font-bold text-yellow-100 mb-2
                transition-all duration-1000 ease-out
                ${animationPhase === 'celebrating' ? 'animate-bounce' : ''}
              `}>
                VICTORY!
              </h1>
              <h2 className="text-2xl font-bold text-yellow-200">
                Game Completed!
              </h2>
            </>
          ) : (
            <>
              <div className="text-6xl mb-4">🎉</div>
              <h1 className={`
                text-5xl font-bold text-green-100 mb-2
                transition-all duration-1000 ease-out
                ${animationPhase === 'celebrating' ? 'animate-pulse' : ''}
              `}>
                ROUND
              </h1>
              <h1 className={`
                text-5xl font-bold text-green-100
                transition-all duration-1000 ease-out delay-200
                ${animationPhase === 'celebrating' ? 'animate-bounce' : ''}
              `}>
                COMPLETE!
              </h1>
            </>
          )}
        </div>

        {/* High Score Alert */}
        {isNewHighScore && (
          <div className={`
            text-center mb-6 p-3 rounded-lg
            bg-gradient-to-r from-yellow-400 to-yellow-300
            border-2 border-yellow-500 text-black font-bold
            transform transition-all duration-700 ease-out delay-500
            ${showStats ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
            animate-pulse
          `}>
            🎉 NEW HIGH SCORE! 🎉
          </div>
        )}

        {/* Bonus Points Animation */}
        {bonusPoints > 0 && showBonusAnimation && (
          <div className={`
            text-center mb-6 p-4 rounded-lg
            bg-gradient-to-r from-purple-500 to-purple-600
            border-2 border-purple-300 text-white font-bold
            transform transition-all duration-1000 ease-out
            ${showBonusAnimation ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}
            animate-bounce
          `}>
            <div className="text-lg">BONUS POINTS!</div>
            <div className="text-2xl">+{formatScore(bonusPoints)}</div>
          </div>
        )}

        {/* Statistics */}
        <div className={`
          space-y-4 mb-8 
          transform transition-all duration-700 ease-out delay-700
          ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}>
          <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-3">
            <h3 className={`
              text-xl font-bold text-center mb-3 border-b pb-2
              ${isGameComplete ? 'text-yellow-200 border-yellow-400' : 'text-green-200 border-green-400'}
            `}>
              {isGameComplete ? 'Final Statistics' : 'Round Statistics'}
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                Current Score:
              </div>
              <div className="text-white font-bold text-right">
                {formatScore(statistics.currentScore)}
              </div>
              
              {!isNewHighScore && (
                <>
                  <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                    High Score:
                  </div>
                  <div className="text-yellow-300 font-bold text-right">
                    {formatScore(statistics.highScore)}
                  </div>
                </>
              )}
              
              <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                {isGameComplete ? 'Rounds Completed:' : 'Current Round:'}
              </div>
              <div className="text-white font-bold text-right">
                {statistics.roundsCompleted}
              </div>
              
              <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                {isGameComplete ? 'Total Time:' : 'Round Time:'}
              </div>
              <div className="text-white font-bold text-right">
                {formatTime(isGameComplete ? statistics.totalTime : statistics.roundTime)}
              </div>
              
              <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                Dots Eaten:
              </div>
              <div className="text-white font-bold text-right">
                {statistics.dotsEaten}
              </div>
              
              <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                Ghosts Eaten:
              </div>
              <div className="text-white font-bold text-right">
                {statistics.ghostsEaten}
              </div>
              
              <div className={isGameComplete ? 'text-yellow-300' : 'text-green-300'}>
                Lives Remaining:
              </div>
              <div className="text-white font-bold text-right">
                {statistics.livesRemaining}
              </div>
              
              {bonusPoints > 0 && (
                <>
                  <div className="text-purple-300">
                    Bonus Points:
                  </div>
                  <div className="text-purple-200 font-bold text-right">
                    +{formatScore(bonusPoints)}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`
          space-y-3
          transform transition-all duration-700 ease-out delay-1000
          ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}>
          {isGameComplete ? (
            <>
              <button
                onClick={handleRestart}
                className="
                  w-full py-4 px-6 rounded-lg font-bold text-lg
                  bg-gradient-to-r from-green-600 to-green-500 
                  hover:from-green-500 hover:to-green-400
                  border-2 border-green-400 text-white
                  transform hover:scale-105 active:scale-95
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-green-300
                  shadow-lg hover:shadow-xl
                "
                autoFocus={autoFocus}
              >
                🎮 PLAY AGAIN (SPACE)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={handleNextRound}
                className="
                  w-full py-4 px-6 rounded-lg font-bold text-lg
                  bg-gradient-to-r from-blue-600 to-blue-500 
                  hover:from-blue-500 hover:to-blue-400
                  border-2 border-blue-400 text-white
                  transform hover:scale-105 active:scale-95
                  transition-all duration-200 ease-in-out
                  focus:outline-none focus:ring-2 focus:ring-blue-300
                  shadow-lg hover:shadow-xl
                "
                autoFocus={autoFocus}
              >
                ➡️ NEXT ROUND (SPACE)
              </button>
            </>
          )}
          
          <button
            onClick={handleMainMenu}
            className="
              w-full py-3 px-6 rounded-lg font-bold
              bg-gradient-to-r from-gray-600 to-gray-500 
              hover:from-gray-500 hover:to-gray-400
              border-2 border-gray-400 text-white
              transform hover:scale-105 active:scale-95
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-gray-300
              shadow-lg hover:shadow-xl
            "
          >
            🏠 MAIN MENU (ESC)
          </button>
        </div>

        {/* Congratulations Message */}
        <div className={`
          text-center text-sm mt-6 opacity-70
          ${isGameComplete ? 'text-yellow-200' : 'text-green-200'}
          transform transition-all duration-700 ease-out delay-1200
          ${showStats ? 'translate-y-0 opacity-70' : 'translate-y-6 opacity-0'}
        `}>
          {isGameComplete ? (
            <>
              <p>🎊 Congratulations! You completed all rounds!</p>
              <p className="mt-1">🏆 You are a Pacman champion!</p>
            </>
          ) : (
            <>
              <p>🎯 Great job! Ready for the next challenge?</p>
              <p className="mt-1">⚡ The ghosts are getting faster!</p>
            </>
          )}
        </div>

        {/* Floating Celebration Elements */}
        <div className="absolute -top-6 -right-6 text-4xl animate-spin opacity-60">
          ⭐
        </div>
        <div className="absolute -top-4 -left-4 text-3xl animate-bounce opacity-50 animation-delay-300">
          🎊
        </div>
        <div className="absolute -bottom-6 -right-4 text-5xl animate-pulse opacity-40 animation-delay-700">
          🏆
        </div>
        <div className="absolute -bottom-4 -left-6 text-3xl animate-bounce opacity-50 animation-delay-1000">
          🎉
        </div>
      </div>

      {/* Background Effect */}
      <div className={`
        absolute inset-0 opacity-20 animate-pulse
        ${isGameComplete 
          ? 'bg-gradient-radial from-yellow-600 via-transparent to-transparent' 
          : 'bg-gradient-radial from-green-600 via-transparent to-transparent'
        }
      `}></div>
    </div>
  );
};

export default VictoryScreen;
