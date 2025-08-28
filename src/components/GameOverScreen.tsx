import React, { useState, useEffect } from 'react';
import { useGameContext } from '../context/GameContext';
import { useGameState } from '../hooks/useGameState';
import { formatScore, formatTime } from '../utils/gameUtils';

interface GameOverScreenProps {
  onRestart?: () => void;
  onContinue?: () => void;
  onMainMenu?: () => void;
  showAnimation?: boolean;
  autoFocus?: boolean;
}

export const GameOverScreen: React.FC<GameOverScreenProps> = ({
  onRestart,
  onContinue,
  onMainMenu,
  showAnimation = true,
  autoFocus = true,
}) => {
  const { state } = useGameContext();
  const gameState = useGameState();
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'entering' | 'visible'>('hidden');
  const [showStats, setShowStats] = useState(false);

  // Animation sequence
  useEffect(() => {
    if (showAnimation && state.gameStatus === 'game-over') {
      const timer1 = setTimeout(() => setAnimationPhase('entering'), 100);
      const timer2 = setTimeout(() => setAnimationPhase('visible'), 600);
      const timer3 = setTimeout(() => setShowStats(true), 1200);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
        clearTimeout(timer3);
      };
    }
  }, [showAnimation, state.gameStatus]);

  // Keyboard controls
  useEffect(() => {
    if (!autoFocus || state.gameStatus !== 'game-over') return;

    const handleKeyPress = (event: KeyboardEvent) => {
      switch (event.key.toLowerCase()) {
        case ' ':
        case 'enter':
          event.preventDefault();
          handleRestart();
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
  }, [autoFocus, state.gameStatus]);

  const handleRestart = () => {
    onRestart?.() || gameState.startGame();
  };

  const handleContinue = () => {
    onContinue?.();
  };

  const handleMainMenu = () => {
    onMainMenu?.() || gameState.restartGame();
  };

  const isNewHighScore = state.score.current >= state.score.high;
  const gameTime = gameState.getGameDuration();
  const statistics = {
    finalScore: state.score.current,
    highScore: state.score.high,
    roundReached: state.round.current,
    totalTime: gameTime,
    dotsEaten: 244 - state.dots.size, // Approximate
    ghostsEaten: state.powerMode.ghostsEaten,
    livesUsed: 3 - state.lives,
  };

  // Don't render if not in game over state
  if (state.gameStatus !== 'game-over') {
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
          relative max-w-md w-full mx-4 p-8 
          bg-gradient-to-br from-red-900 to-red-800 
          border-4 border-red-500 rounded-xl shadow-2xl
          transform transition-all duration-500 ease-out
          ${animationPhase === 'hidden' 
            ? 'scale-50 opacity-0 -translate-y-20' 
            : animationPhase === 'entering'
            ? 'scale-75 opacity-70 -translate-y-10'
            : 'scale-100 opacity-100 translate-y-0'
          }
        `}
      >
        {/* Animated Border Effect */}
        <div className="absolute inset-0 rounded-xl border-4 border-red-400 animate-pulse opacity-75"></div>
        
        {/* Game Over Title */}
        <div className="text-center mb-6">
          <h1 className={`
            text-6xl font-bold text-red-300 mb-2
            transition-all duration-1000 ease-out
            ${animationPhase === 'visible' ? 'animate-pulse' : ''}
          `}>
            GAME
          </h1>
          <h1 className={`
            text-6xl font-bold text-red-200
            transition-all duration-1000 ease-out delay-200
            ${animationPhase === 'visible' ? 'animate-bounce' : ''}
          `}>
            OVER
          </h1>
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

        {/* Final Statistics */}
        <div className={`
          space-y-4 mb-8 
          transform transition-all duration-700 ease-out delay-700
          ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}>
          <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-3">
            <h3 className="text-xl font-bold text-red-200 text-center mb-3 border-b border-red-400 pb-2">
              Final Statistics
            </h3>
            
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="text-red-300">Final Score:</div>
              <div className="text-white font-bold text-right">
                {formatScore(statistics.finalScore)}
              </div>
              
              {!isNewHighScore && (
                <>
                  <div className="text-red-300">High Score:</div>
                  <div className="text-yellow-300 font-bold text-right">
                    {formatScore(statistics.highScore)}
                  </div>
                </>
              )}
              
              <div className="text-red-300">Round Reached:</div>
              <div className="text-white font-bold text-right">
                {statistics.roundReached}
              </div>
              
              <div className="text-red-300">Time Played:</div>
              <div className="text-white font-bold text-right">
                {formatTime(statistics.totalTime)}
              </div>
              
              <div className="text-red-300">Dots Eaten:</div>
              <div className="text-white font-bold text-right">
                {statistics.dotsEaten}
              </div>
              
              <div className="text-red-300">Ghosts Eaten:</div>
              <div className="text-white font-bold text-right">
                {statistics.ghostsEaten}
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`
          space-y-3
          transform transition-all duration-700 ease-out delay-1000
          ${showStats ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'}
        `}>
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

        {/* Tips */}
        <div className={`
          text-center text-xs text-red-300 mt-6 opacity-70
          transform transition-all duration-700 ease-out delay-1200
          ${showStats ? 'translate-y-0 opacity-70' : 'translate-y-6 opacity-0'}
        `}>
          <p>💡 Tip: Eat power pellets to make ghosts vulnerable!</p>
          <p className="mt-1">🎯 Try to beat your high score!</p>
        </div>

        {/* Floating Ghosts Animation */}
        <div className="absolute -top-8 -right-8 text-6xl animate-bounce opacity-30">
          👻
        </div>
        <div className="absolute -bottom-8 -left-8 text-4xl animate-pulse opacity-20 animation-delay-500">
          🟡
        </div>
      </div>

      {/* Background Effect */}
      <div className="absolute inset-0 bg-gradient-radial from-red-900 via-transparent to-transparent opacity-30 animate-pulse"></div>
    </div>
  );
};

export default GameOverScreen;
