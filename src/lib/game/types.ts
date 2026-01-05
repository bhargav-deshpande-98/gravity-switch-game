// Game state types
export type GameState = 'idle' | 'playing' | 'gameover'

// Game configuration
export interface GameConfig {
  width: number
  height: number
  // Play area
  floorY: number
  ceilingY: number
  // Player
  playerSize: number
  playerX: number
  // Physics
  gravity: number
  maxFallSpeed: number
  flipSpeed: number
  // Game speed
  baseSpeed: number
  maxSpeed: number
  speedIncrement: number
  // Obstacles
  obstacleWidth: number
  spikeSize: number
  minGap: number
  maxGap: number
}

// Obstacle types
export enum ObstacleType {
  SPIKE_FLOOR = 'spike_floor',
  SPIKE_CEILING = 'spike_ceiling',
  SPIKE_BOTH = 'spike_both',
  BLOCK_FLOOR = 'block_floor',
  BLOCK_CEILING = 'block_ceiling',
  BLOCK_GAP = 'block_gap',
}

// Obstacle
export interface Obstacle {
  x: number
  type: ObstacleType
  passed: boolean
  width: number
}

// Player
export interface Player {
  y: number
  vy: number
  gravityDir: number // 1 = down (floor), -1 = up (ceiling)
  rotation: number
  targetRotation: number
}

// Particle
export interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  alpha: number
  color: string
}

// Trail point
export interface TrailPoint {
  x: number
  y: number
  alpha: number
}

// Complete game state
export interface GameData {
  state: GameState
  config: GameConfig
  player: Player
  obstacles: Obstacle[]
  particles: Particle[]
  trail: TrailPoint[]
  score: number
  highScore: number
  distance: number
  speed: number
  nextObstacleIn: number
}
