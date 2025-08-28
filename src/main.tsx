import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import TestApp from './TestApp.tsx';

/**
 * DEVELOPMENT MODE SWITCHER
 *
 * DEVELOPMENT_MODE: Comprehensive test application for Tasks 6 & 7
 * - Full Game: Complete Pacman game with ghosts and power mechanics
 * - Power Demo: Isolated power pellet system testing
 * - Ghost Demo: Interactive ghost AI demonstration with controls
 * - AI Showcase: Debug view with real-time AI state information
 * - Maze Analysis: NEW - Moved from main App, visualizes maze structure
 *
 * Set to false to run the standard game application.
 *
 * Test Features Available in Development Mode:
 * • 5 Test modes including new Maze Analysis
 * • 4 Ghost AI personalities (Aggressive, Ambush, Random, Patrol)
 * • Complete power pellet mechanics with timed vulnerability
 * • Real-time AI debugging and controls
 * • Interactive demos with manual controls
 * • Maze structure visualization and analysis
 */
const DEVELOPMENT_MODE = false;

createRoot(document.getElementById('root')!).render(
  <StrictMode>{DEVELOPMENT_MODE ? <TestApp /> : <App />}</StrictMode>
);
