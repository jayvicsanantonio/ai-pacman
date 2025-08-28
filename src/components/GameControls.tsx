import React, { useEffect, useCallback } from 'react';
import type { Direction } from '../types';

interface GameControlsProps {
  onDirectionChange: (direction: Direction) => void;
  onPause: () => void;
  onRestart: () => void;
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onDirectionChange,
  onPause,
  onRestart,
  disabled = false,
}) => {
  // Handle keyboard input with proper cleanup
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Prevent default behavior for game keys
      const gameKeys = [
        'ArrowUp',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'w',
        'a',
        's',
        'd',
        ' ',
        'r',
      ];

      if (gameKeys.includes(event.key)) {
        event.preventDefault();
      }

      switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          onDirectionChange('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          onDirectionChange('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          onDirectionChange('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          onDirectionChange('right');
          break;
        case ' ':
          onPause();
          break;
        case 'r':
        case 'R':
          onRestart();
          break;
      }
    },
    [onDirectionChange, onPause, onRestart, disabled]
  );

  // Set up keyboard event listeners with proper cleanup
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);

    // Cleanup function to remove event listener
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleKeyPress]);

  // Handle touch/click direction changes
  const handleDirectionClick = useCallback(
    (direction: Direction) => {
      if (!disabled) {
        onDirectionChange(direction);
      }
    },
    [onDirectionChange, disabled]
  );

  const handlePauseClick = useCallback(() => {
    if (!disabled) {
      onPause();
    }
  }, [onPause, disabled]);

  const handleRestartClick = useCallback(() => {
    onRestart(); // Restart should work even when disabled
  }, [onRestart]);

  const buttonBaseClasses = `
    bg-blue-600 text-white p-3 rounded-lg font-bold text-lg
    transition-all duration-200 ease-in-out
    hover:bg-blue-700 hover:scale-105 active:scale-95
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
    shadow-lg hover:shadow-xl
    select-none touch-manipulation
  `;

  const disabledClasses = disabled
    ? 'opacity-50 cursor-not-allowed hover:bg-blue-600 hover:scale-100'
    : '';

  return (
    <>
      {/* Mobile/Touch Controls - Fixed position on mobile */}
      <div className="fixed bottom-4 right-4 flex flex-col gap-2 md:hidden z-10">
        {/* Up button */}
        <div className="flex justify-center">
          <button
            onClick={() => handleDirectionClick('up')}
            className={`${buttonBaseClasses} ${disabledClasses}`}
            disabled={disabled}
            aria-label="Move up"
          >
            ↑
          </button>
        </div>

        {/* Left, Down, Right buttons */}
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => handleDirectionClick('left')}
            className={`${buttonBaseClasses} ${disabledClasses}`}
            disabled={disabled}
            aria-label="Move left"
          >
            ←
          </button>
          <button
            onClick={() => handleDirectionClick('down')}
            className={`${buttonBaseClasses} ${disabledClasses}`}
            disabled={disabled}
            aria-label="Move down"
          >
            ↓
          </button>
          <button
            onClick={() => handleDirectionClick('right')}
            className={`${buttonBaseClasses} ${disabledClasses}`}
            disabled={disabled}
            aria-label="Move right"
          >
            →
          </button>
        </div>
      </div>

      {/* Desktop Controls - Visible on larger screens */}
      <div className="hidden md:flex fixed bottom-4 right-4 flex-col gap-3 z-10">
        {/* Directional controls */}
        <div className="glass-panel p-4">
          <div className="flex flex-col gap-2">
            {/* Up button */}
            <div className="flex justify-center">
              <button
                onClick={() => handleDirectionClick('up')}
                className={`${buttonBaseClasses} ${disabledClasses} w-12 h-12`}
                disabled={disabled}
                aria-label="Move up (Arrow Up or W)"
                title="Arrow Up or W"
              >
                ↑
              </button>
            </div>

            {/* Left, Down, Right buttons */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleDirectionClick('left')}
                className={`${buttonBaseClasses} ${disabledClasses} w-12 h-12`}
                disabled={disabled}
                aria-label="Move left (Arrow Left or A)"
                title="Arrow Left or A"
              >
                ←
              </button>
              <button
                onClick={() => handleDirectionClick('down')}
                className={`${buttonBaseClasses} ${disabledClasses} w-12 h-12`}
                disabled={disabled}
                aria-label="Move down (Arrow Down or S)"
                title="Arrow Down or S"
              >
                ↓
              </button>
              <button
                onClick={() => handleDirectionClick('right')}
                className={`${buttonBaseClasses} ${disabledClasses} w-12 h-12`}
                disabled={disabled}
                aria-label="Move right (Arrow Right or D)"
                title="Arrow Right or D"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Game control buttons */}
        <div className="glass-panel p-4 flex gap-2">
          <button
            onClick={handlePauseClick}
            className={`${buttonBaseClasses} ${disabledClasses} px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700`}
            disabled={disabled}
            aria-label="Pause game (Spacebar)"
            title="Spacebar"
          >
            Pause
          </button>
          <button
            onClick={handleRestartClick}
            className={`${buttonBaseClasses} px-4 py-2 text-sm bg-red-600 hover:bg-red-700`}
            aria-label="Restart game (R)"
            title="R"
          >
            Restart
          </button>
        </div>
      </div>

      {/* Keyboard instructions - Hidden on mobile */}
      <div className="hidden md:block fixed bottom-4 left-4 bg-gray-800 bg-opacity-90 p-4 rounded-lg border border-gray-600 text-white text-sm z-10">
        <h3 className="font-bold mb-2 text-yellow-400">Controls:</h3>
        <div className="space-y-1">
          <div>Arrow Keys or WASD: Move</div>
          <div>Spacebar: Pause</div>
          <div>R: Restart</div>
        </div>
      </div>
    </>
  );
};
