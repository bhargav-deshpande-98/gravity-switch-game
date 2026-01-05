import type { GameData, GameConfig, Obstacle, Particle, TrailPoint } from './types'
import { ObstacleType } from './types'
import { COLORS } from './constants'

// Draw background
export function drawBackground(ctx: CanvasRenderingContext2D, config: GameConfig, offset: number) {
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, config.height)
  gradient.addColorStop(0, COLORS.background)
  gradient.addColorStop(0.5, COLORS.backgroundAlt)
  gradient.addColorStop(1, COLORS.background)
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, config.width, config.height)
  
  // Moving grid lines for depth
  ctx.strokeStyle = 'rgba(255,255,255,0.03)'
  ctx.lineWidth = 1
  const gridSpacing = 50
  const gridOffset = offset % gridSpacing
  
  for (let x = -gridOffset; x < config.width + gridSpacing; x += gridSpacing) {
    ctx.beginPath()
    ctx.moveTo(x, config.ceilingY)
    ctx.lineTo(x, config.floorY)
    ctx.stroke()
  }
  
  // Floor and ceiling
  ctx.fillStyle = COLORS.floor
  ctx.fillRect(0, config.floorY, config.width, config.height - config.floorY)
  ctx.fillRect(0, 0, config.width, config.ceilingY)
  
  // Glow lines
  const glowGradientFloor = ctx.createLinearGradient(0, config.floorY - 10, 0, config.floorY)
  glowGradientFloor.addColorStop(0, 'rgba(77, 201, 240, 0)')
  glowGradientFloor.addColorStop(1, 'rgba(77, 201, 240, 0.3)')
  ctx.fillStyle = glowGradientFloor
  ctx.fillRect(0, config.floorY - 10, config.width, 10)
  
  const glowGradientCeiling = ctx.createLinearGradient(0, config.ceilingY, 0, config.ceilingY + 10)
  glowGradientCeiling.addColorStop(0, 'rgba(77, 201, 240, 0.3)')
  glowGradientCeiling.addColorStop(1, 'rgba(77, 201, 240, 0)')
  ctx.fillStyle = glowGradientCeiling
  ctx.fillRect(0, config.ceilingY, config.width, 10)
}

// Draw trail
export function drawTrail(ctx: CanvasRenderingContext2D, trail: TrailPoint[], config: GameConfig) {
  trail.forEach((point, index) => {
    const size = config.playerSize * (1 - index / trail.length) * 0.6
    ctx.fillStyle = `rgba(0, 255, 136, ${point.alpha * 0.3})`
    ctx.fillRect(
      point.x - size / 2,
      point.y - size / 2,
      size,
      size
    )
  })
}

// Draw player
export function drawPlayer(ctx: CanvasRenderingContext2D, player: GameData['player'], config: GameConfig) {
  const x = config.playerX
  const y = player.y
  const size = config.playerSize
  
  // Glow
  ctx.shadowColor = COLORS.playerGlow
  ctx.shadowBlur = 20
  
  // Rotation based on gravity
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(player.rotation)
  
  // Player cube
  ctx.fillStyle = COLORS.player
  ctx.fillRect(-size / 2, -size / 2, size, size)
  
  // Inner detail
  ctx.fillStyle = 'rgba(255,255,255,0.3)'
  ctx.fillRect(-size / 4, -size / 4, size / 2, size / 2)
  
  ctx.restore()
  ctx.shadowBlur = 0
}

// Draw spike
function drawSpike(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, pointingUp: boolean) {
  ctx.shadowColor = COLORS.spikeGlow
  ctx.shadowBlur = 10
  ctx.fillStyle = COLORS.spike
  
  ctx.beginPath()
  if (pointingUp) {
    ctx.moveTo(x, y - size)
    ctx.lineTo(x + size / 2, y)
    ctx.lineTo(x - size / 2, y)
  } else {
    ctx.moveTo(x, y + size)
    ctx.lineTo(x + size / 2, y)
    ctx.lineTo(x - size / 2, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.shadowBlur = 0
}

// Draw block
function drawBlock(ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) {
  ctx.shadowColor = COLORS.blockGlow
  ctx.shadowBlur = 10
  ctx.fillStyle = COLORS.block
  ctx.fillRect(x - width / 2, y, width, height)
  
  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.2)'
  ctx.fillRect(x - width / 2, y, width, height / 4)
  ctx.shadowBlur = 0
}

// Draw obstacle
export function drawObstacle(ctx: CanvasRenderingContext2D, obstacle: Obstacle, config: GameConfig) {
  const { x, type } = obstacle
  const spikeSize = config.spikeSize
  const blockWidth = config.obstacleWidth
  const blockHeight = config.obstacleWidth * 1.5
  
  switch (type) {
    case ObstacleType.SPIKE_FLOOR:
      drawSpike(ctx, x, config.floorY, spikeSize, true)
      break
      
    case ObstacleType.SPIKE_CEILING:
      drawSpike(ctx, x, config.ceilingY, spikeSize, false)
      break
      
    case ObstacleType.SPIKE_BOTH:
      drawSpike(ctx, x, config.floorY, spikeSize, true)
      drawSpike(ctx, x, config.ceilingY, spikeSize, false)
      break
      
    case ObstacleType.BLOCK_FLOOR:
      drawBlock(ctx, x, config.floorY - blockHeight, blockWidth, blockHeight)
      break
      
    case ObstacleType.BLOCK_CEILING:
      drawBlock(ctx, x, config.ceilingY, blockWidth, blockHeight)
      break
      
    case ObstacleType.BLOCK_GAP:
      drawBlock(ctx, x, config.ceilingY, blockWidth, blockHeight)
      drawBlock(ctx, x, config.floorY - blockHeight, blockWidth, blockHeight)
      break
  }
}

// Draw particles
export function drawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  particles.forEach(p => {
    ctx.save()
    ctx.globalAlpha = p.alpha
    ctx.fillStyle = p.color
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  })
}

// Draw UI
export function drawUI(
  ctx: CanvasRenderingContext2D,
  score: number,
  highScore: number,
  state: GameData['state'],
  config: GameConfig
) {
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  
  // Score
  ctx.font = `bold ${Math.min(config.width * 0.12, 48)}px Arial`
  ctx.fillStyle = 'rgba(0,0,0,0.3)'
  ctx.fillText(score.toString(), config.width / 2 + 2, 52)
  ctx.fillStyle = COLORS.scoreText
  ctx.fillText(score.toString(), config.width / 2, 50)
  
  // High score
  if (highScore > 0) {
    ctx.font = `bold ${Math.min(config.width * 0.035, 14)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText(`BEST: ${highScore}`, config.width / 2, 85)
  }
  
  // State messages
  if (state === 'idle') {
    ctx.font = `bold ${Math.min(config.width * 0.05, 20)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.fillText('TAP TO FLIP GRAVITY', config.width / 2, config.height / 2)
    
    ctx.font = `${Math.min(config.width * 0.035, 14)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.5)'
    ctx.fillText('Avoid the obstacles!', config.width / 2, config.height / 2 + 30)
  } else if (state === 'gameover') {
    ctx.fillStyle = 'rgba(0,0,0,0.6)'
    ctx.fillRect(0, 0, config.width, config.height)
    
    ctx.font = `bold ${Math.min(config.width * 0.1, 40)}px Arial`
    ctx.fillStyle = '#ff4757'
    ctx.fillText('GAME OVER', config.width / 2, config.height / 2 - 20)
    
    ctx.font = `bold ${Math.min(config.width * 0.06, 24)}px Arial`
    ctx.fillStyle = COLORS.player
    ctx.fillText(`SCORE: ${score}`, config.width / 2, config.height / 2 + 30)
    
    ctx.font = `bold ${Math.min(config.width * 0.04, 16)}px Arial`
    ctx.fillStyle = 'rgba(255,255,255,0.8)'
    ctx.fillText('TAP TO RESTART', config.width / 2, config.height / 2 + 75)
  }
}

// Main render function
export function renderGame(ctx: CanvasRenderingContext2D, game: GameData) {
  const { config, state, player, obstacles, particles, trail, score, highScore, distance } = game
  
  ctx.clearRect(0, 0, config.width, config.height)
  drawBackground(ctx, config, distance)
  drawTrail(ctx, trail, config)
  
  obstacles.forEach(obs => drawObstacle(ctx, obs, config))
  
  if (state !== 'gameover' || particles.length > 0) {
    if (state !== 'gameover') {
      drawPlayer(ctx, player, config)
    }
  }
  
  drawParticles(ctx, particles)
  drawUI(ctx, score, highScore, state, config)
}
