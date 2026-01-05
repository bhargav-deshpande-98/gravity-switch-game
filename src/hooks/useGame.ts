import { useCallback, useEffect, useRef, useState } from 'react'
import {
  type GameData,
  createGameConfig,
  generateObstacle,
  checkCollision,
  updateTrail,
  updateParticles,
  createFlipParticles,
  createDeathParticles,
  renderGame,
  playFlipSound,
  playScoreSound,
  playDeathSound,
  initAudio,
} from '@/lib/game'

const STORAGE_KEY = 'gravity-switch-highscore'

function loadHighScore(): number {
  try {
    return parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10)
  } catch {
    return 0
  }
}

function saveHighScore(score: number) {
  try {
    localStorage.setItem(STORAGE_KEY, score.toString())
  } catch {
    // Storage not available
  }
}

export function useGame(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  const [dimensions, setDimensions] = useState({ width: 360, height: 640 })
  const gameRef = useRef<GameData | null>(null)
  const animationRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)
  
  // Initialize game state
  const initGame = useCallback((width: number, height: number): GameData => {
    const config = createGameConfig(width, height)
    
    return {
      state: 'idle',
      config,
      player: {
        y: config.floorY - config.playerSize / 2 - 5,
        vy: 0,
        gravityDir: 1,
        rotation: 0,
        targetRotation: 0,
      },
      obstacles: [],
      particles: [],
      trail: [],
      score: 0,
      highScore: loadHighScore(),
      distance: 0,
      speed: config.baseSpeed,
      nextObstacleIn: config.minGap,
    }
  }, [])
  
  // Handle tap/click
  const handleTap = useCallback(() => {
    if (!gameRef.current) return
    const game = gameRef.current
    
    initAudio()
    
    if (game.state === 'idle') {
      game.state = 'playing'
      // Flip gravity on first tap
      game.player.gravityDir *= -1
      game.player.targetRotation += Math.PI
      game.particles = [
        ...game.particles,
        ...createFlipParticles(game.config.playerX, game.player.y, game.player.gravityDir),
      ]
      playFlipSound()
      return
    }
    
    if (game.state === 'gameover') {
      const { width, height } = game.config
      gameRef.current = initGame(width, height)
      return
    }
    
    if (game.state === 'playing') {
      // Flip gravity
      game.player.gravityDir *= -1
      game.player.vy = game.player.gravityDir * game.config.flipSpeed
      game.player.targetRotation += Math.PI
      
      game.particles = [
        ...game.particles,
        ...createFlipParticles(game.config.playerX, game.player.y, game.player.gravityDir),
      ]
      playFlipSound()
    }
  }, [initGame])
  
  // Main game loop
  const gameLoop = useCallback((timestamp: number) => {
    if (!gameRef.current || !canvasRef.current) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    const ctx = canvasRef.current.getContext('2d')
    if (!ctx) {
      animationRef.current = requestAnimationFrame(gameLoop)
      return
    }
    
    const deltaTime = lastTimeRef.current ? timestamp - lastTimeRef.current : 16.67
    lastTimeRef.current = timestamp
    const dt = deltaTime / 16.67
    
    const game = gameRef.current
    const { config, player } = game
    
    if (game.state === 'playing') {
      // Update distance and speed
      game.distance += game.speed * dt
      game.speed = Math.min(config.maxSpeed, game.speed + config.speedIncrement * dt)
      
      // Update player physics
      player.vy += config.gravity * player.gravityDir * dt
      player.vy = Math.max(-config.maxFallSpeed, Math.min(config.maxFallSpeed, player.vy))
      player.y += player.vy * dt
      
      // Smooth rotation
      const rotationDiff = player.targetRotation - player.rotation
      player.rotation += rotationDiff * 0.15 * dt
      
      // Clamp to floor/ceiling
      const halfSize = config.playerSize / 2
      if (player.gravityDir === 1) {
        // On floor
        if (player.y > config.floorY - halfSize - 2) {
          player.y = config.floorY - halfSize - 2
          player.vy = 0
        }
      } else {
        // On ceiling
        if (player.y < config.ceilingY + halfSize + 2) {
          player.y = config.ceilingY + halfSize + 2
          player.vy = 0
        }
      }
      
      // Update trail
      game.trail = updateTrail(game.trail, config.playerX, player.y)
      
      // Update obstacles
      game.obstacles = game.obstacles.filter(obs => {
        obs.x -= game.speed * dt
        
        // Check if passed
        if (!obs.passed && obs.x + obs.width / 2 < config.playerX - config.playerSize / 2) {
          obs.passed = true
          game.score += 1
          playScoreSound()
        }
        
        return obs.x > -obs.width
      })
      
      // Generate new obstacles
      game.nextObstacleIn -= game.speed * dt
      if (game.nextObstacleIn <= 0) {
        const newObs = generateObstacle(config.width + 50, config, game.score)
        game.obstacles.push(newObs)
        
        // Vary gap based on difficulty
        const gapVariation = Math.max(config.minGap, config.maxGap - game.score * 2)
        game.nextObstacleIn = config.minGap + Math.random() * (gapVariation - config.minGap)
      }
      
      // Check collisions
      for (const obs of game.obstacles) {
        if (checkCollision(player, obs, config)) {
          game.state = 'gameover'
          game.particles = [...game.particles, ...createDeathParticles(config.playerX, player.y)]
          playDeathSound()
          
          if (game.score > game.highScore) {
            game.highScore = game.score
            saveHighScore(game.score)
          }
          break
        }
      }
    }
    
    // Update particles
    game.particles = updateParticles(game.particles, dt)
    
    // Render
    renderGame(ctx, game)
    
    // Continue loop
    animationRef.current = requestAnimationFrame(gameLoop)
  }, [canvasRef])
  
  // Handle resize
  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(window.innerWidth, 400)
      const height = Math.min(window.innerHeight, 700)
      setDimensions({ width, height })
    }
    
    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])
  
  // Initialize game
  useEffect(() => {
    gameRef.current = initGame(dimensions.width, dimensions.height)
  }, [dimensions, initGame])
  
  // Start game loop
  useEffect(() => {
    animationRef.current = requestAnimationFrame(gameLoop)
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [gameLoop])
  
  return {
    dimensions,
    handleTap,
  }
}
