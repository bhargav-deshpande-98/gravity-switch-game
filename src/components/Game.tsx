import { useRef, useEffect } from 'react'
import { useGame } from '@/hooks/useGame'

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { dimensions, handleTap } = useGame(canvasRef)
  const lastTapTimeRef = useRef<number>(0)

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'ArrowDown') {
        e.preventDefault()
        handleTap()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTap])

  // Single unified touch/click handler using native event listener
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const handleInput = (e: Event) => {
      e.preventDefault()
      e.stopPropagation()

      const now = Date.now()
      // Strict debounce - ignore any input within 200ms
      if (now - lastTapTimeRef.current < 200) {
        return
      }
      lastTapTimeRef.current = now
      handleTap()
    }

    // Only use touchstart on touch devices, mousedown on non-touch
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0

    if (isTouchDevice) {
      canvas.addEventListener('touchstart', handleInput, { passive: false })
    } else {
      canvas.addEventListener('mousedown', handleInput)
    }

    // Prevent scrolling
    const preventScroll = (e: Event) => e.preventDefault()
    canvas.addEventListener('touchmove', preventScroll, { passive: false })

    return () => {
      if (isTouchDevice) {
        canvas.removeEventListener('touchstart', handleInput)
      } else {
        canvas.removeEventListener('mousedown', handleInput)
      }
      canvas.removeEventListener('touchmove', preventScroll)
    }
  }, [handleTap])

  return (
    <div className="game-container w-full h-full flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="game-canvas touch-none select-none rounded-lg shadow-2xl cursor-pointer"
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          touchAction: 'none',
        }}
      />
    </div>
  )
}

export default Game
