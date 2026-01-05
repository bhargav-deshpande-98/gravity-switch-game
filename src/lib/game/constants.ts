import type { GameConfig } from './types'

// Create game configuration based on screen size
export const createGameConfig = (width: number, height: number): GameConfig => {
  const scale = Math.min(width / 400, height / 700)
  
  return {
    width,
    height,
    // Play area
    floorY: height * 0.75,
    ceilingY: height * 0.25,
    // Player
    playerSize: 28 * scale,
    playerX: width * 0.2,
    // Physics
    gravity: 0.8 * scale,
    maxFallSpeed: 15 * scale,
    flipSpeed: 12 * scale,
    // Game speed
    baseSpeed: 4 * scale,
    maxSpeed: 10 * scale,
    speedIncrement: 0.0005 * scale,
    // Obstacles
    obstacleWidth: 30 * scale,
    spikeSize: 25 * scale,
    minGap: 180 * scale,
    maxGap: 280 * scale,
  }
}

// Colors
export const COLORS = {
  background: '#1a1a2e',
  backgroundAlt: '#16213e',
  floor: '#2d4059',
  ceiling: '#2d4059',
  player: '#00ff88',
  playerGlow: '#00ff8855',
  playerTrail: '#00ff8833',
  spike: '#ff4757',
  spikeGlow: '#ff475755',
  block: '#4cc9f0',
  blockGlow: '#4cc9f055',
  scoreText: '#ffffff',
  particle: '#00ff88',
}
