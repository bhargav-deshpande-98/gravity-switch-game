import type { Particle } from './types'
import { COLORS } from './constants'

// Create flip particles
export function createFlipParticles(x: number, y: number, direction: number): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 8; i++) {
    const angle = (Math.PI * i) / 4 + Math.random() * 0.3
    const speed = 2 + Math.random() * 3
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed * 0.5,
      vy: Math.sin(angle) * speed * direction,
      radius: 2 + Math.random() * 2,
      alpha: 1,
      color: COLORS.particle,
    })
  }
  
  return particles
}

// Create death particles
export function createDeathParticles(x: number, y: number): Particle[] {
  const particles: Particle[] = []
  
  for (let i = 0; i < 20; i++) {
    const angle = Math.random() * Math.PI * 2
    const speed = 3 + Math.random() * 5
    
    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 3 + Math.random() * 4,
      alpha: 1,
      color: Math.random() > 0.5 ? COLORS.player : COLORS.spike,
    })
  }
  
  return particles
}

// Update particles
export function updateParticles(particles: Particle[], dt: number): Particle[] {
  return particles
    .map(p => ({
      ...p,
      x: p.x + p.vx * dt,
      y: p.y + p.vy * dt,
      vy: p.vy + 0.1 * dt,
      alpha: p.alpha - 0.03 * dt,
    }))
    .filter(p => p.alpha > 0)
}
