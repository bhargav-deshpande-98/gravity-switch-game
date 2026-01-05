// Web Audio API sound effects

let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioContext
}

export function playSound(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3
) {
  try {
    const ctx = getAudioContext()
    
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
    
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()
    
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    
    gainNode.gain.setValueAtTime(volume, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)
    
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)
    
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Audio not available
  }
}

export function playFlipSound() {
  playSound(400, 0.08, 'sine', 0.2)
  setTimeout(() => playSound(600, 0.08, 'sine', 0.15), 40)
}

export function playScoreSound() {
  playSound(800, 0.1, 'sine', 0.15)
}

export function playDeathSound() {
  playSound(200, 0.15, 'sawtooth', 0.3)
  setTimeout(() => playSound(150, 0.2, 'sawtooth', 0.25), 80)
  setTimeout(() => playSound(100, 0.25, 'sawtooth', 0.2), 160)
}

// Resume audio context on user interaction
export function initAudio() {
  try {
    const ctx = getAudioContext()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }
  } catch {
    // Audio not available
  }
}
