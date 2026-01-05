import type { GameConfig, Obstacle, Player } from './types'
import { ObstacleType } from './types'

// Generate an obstacle
export function generateObstacle(x: number, config: GameConfig, score: number): Obstacle {
  const types = Object.values(ObstacleType)
  
  // Adjust difficulty based on score
  let weights: number[]
  if (score < 5) {
    // Easy: mostly single spikes
    weights = [3, 3, 0, 1, 1, 0]
  } else if (score < 15) {
    // Medium: introduce both and blocks
    weights = [2, 2, 2, 2, 2, 1]
  } else {
    // Hard: more challenging patterns
    weights = [1, 1, 3, 2, 2, 2]
  }
  
  const totalWeight = weights.reduce((a, b) => a + b, 0)
  let random = Math.random() * totalWeight
  let typeIndex = 0
  
  for (let i = 0; i < weights.length; i++) {
    random -= weights[i]
    if (random <= 0) {
      typeIndex = i
      break
    }
  }
  
  const type = types[typeIndex]
  
  return {
    x,
    type,
    passed: false,
    width: type.includes('block') ? config.obstacleWidth : config.spikeSize,
  }
}

// Check collision between player and obstacle
export function checkCollision(player: Player, obstacle: Obstacle, config: GameConfig): boolean {
  const playerLeft = config.playerX - config.playerSize / 2
  const playerRight = config.playerX + config.playerSize / 2
  const playerTop = player.y - config.playerSize / 2
  const playerBottom = player.y + config.playerSize / 2
  
  const obstacleLeft = obstacle.x - obstacle.width / 2
  const obstacleRight = obstacle.x + obstacle.width / 2
  
  // Check horizontal overlap first
  if (playerRight < obstacleLeft || playerLeft > obstacleRight) {
    return false
  }
  
  const { type } = obstacle
  const spikeHeight = config.spikeSize
  const blockHeight = config.obstacleWidth * 1.5
  
  switch (type) {
    case ObstacleType.SPIKE_FLOOR:
      if (playerBottom > config.floorY - spikeHeight) {
        return true
      }
      break
      
    case ObstacleType.SPIKE_CEILING:
      if (playerTop < config.ceilingY + spikeHeight) {
        return true
      }
      break
      
    case ObstacleType.SPIKE_BOTH:
      if (playerBottom > config.floorY - spikeHeight || 
          playerTop < config.ceilingY + spikeHeight) {
        return true
      }
      break
      
    case ObstacleType.BLOCK_FLOOR:
      if (playerBottom > config.floorY - blockHeight) {
        return true
      }
      break
      
    case ObstacleType.BLOCK_CEILING:
      if (playerTop < config.ceilingY + blockHeight) {
        return true
      }
      break
      
    case ObstacleType.BLOCK_GAP:
      const gapTop = config.ceilingY + blockHeight
      const gapBottom = config.floorY - blockHeight
      if (playerTop < gapTop || playerBottom > gapBottom) {
        return true
      }
      break
  }
  
  return false
}

// Update trail
export function updateTrail(
  trail: { x: number; y: number; alpha: number }[],
  x: number,
  y: number,
  maxLength = 15
): { x: number; y: number; alpha: number }[] {
  const newTrail = [{ x, y, alpha: 1 }, ...trail]
  return newTrail.slice(0, maxLength).map((p, i) => ({
    ...p,
    alpha: 1 - (i / maxLength),
  }))
}
