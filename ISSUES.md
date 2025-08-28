Critical Race Conditions

  1. Ghost Speed Updates (App.tsx:177-220)

  BUG: Ghost AI hooks recreate with new speed on every render
   when powerMode.isActive changes, causing:
  - Multiple simultaneous setInterval() calls
  - Old intervals not properly cleared before new ones start
  - Potential memory leaks and erratic ghost movement

  2. Power Mode Timer Conflicts (usePowerMode.ts:81-115)

  BUG: Multiple power pellet collections can create
  overlapping timers:
  - activatePowerMode() clears existing timers but doesn't
  prevent race between timer expiration and new activation
  - eatGhost() reads stale powerMode.ghostsEaten during rapid
   ghost consumption

  3. State Update Batching Issues (App.tsx:239-242)

  BUG: Ghost vulnerability updates trigger on every
  powerMode.isActive change:
  useEffect(() => {
    setGhosts((prev) =>
  powerPelletSystem.updateGhostStates(prev));
  }, [powerPelletSystem.powerMode.isActive,
  powerPelletSystem.isFlashingPhase]);
  This can cause ghosts to flicker between
  vulnerable/invulnerable states.

  Edge Cases

  4. Collision Detection Timing
  (useGhostConsumption.ts:70-75)

  BUG: Collision check uses exact position matching:
  pacmanPosition.x === ghost.x && pacmanPosition.y ===
  ghost.y
  Ghosts moving at different speeds (200ms vs 450ms) can
  "pass through" Pacman between frames.

  5. Score Multiplier Overflow (usePowerMode.ts:152)

  BUG: Unlimited exponential scoring: 200 * Math.pow(2,
  ghostsEaten)
  - 5th ghost = 3200 points
  - 10th ghost = 102,400 points
  - No upper limit on ghostsEaten counter

  6. Game Restart Race (App.tsx:431-436)

  BUG: 100ms delay in restart can cause state
  inconsistencies:
  setTimeout(() => {
    startMoving();
    ghostAIs.forEach((ai) => ai.startAI());
  }, 100);
  Power pellet timers may still be running during reset.

  Memory Leaks

  - Proper cleanup: Most timer references correctly set to
  null after clearing
  - Missing cleanup: eatingTimeoutRef not cleared in unmount
  effect

  The most critical issues are the ghost speed recreation
  race condition and collision timing with different movement
   speeds.
