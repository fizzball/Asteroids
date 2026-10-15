import React, { useRef, useEffect, useState, useCallback } from 'react'

const WIDTH = 800
const HEIGHT = 600
const SHIP_SIZE = 15
/** Base speeds (~50% of the original [1, 2, 3]) so early play is readable. */
const ASTEROID_BASE_SPEEDS = [0.5, 0.75, 1.0]
/** Every SCORE_SPEED_STEP points, multiply spawn speed by +SPEED_STEP_AMOUNT (capped). */
const SCORE_SPEED_STEP = 100
const SPEED_STEP_AMOUNT = 0.15
const MAX_SPEED_MULT = 2.5
const MISSILE_SPEED = 7
const ROTATION_SPEED = 0.1
const MAX_MISSILES = 5

function asteroidSpeedMult(score: number): number {
  const steps = Math.floor(Math.max(0, score) / SCORE_SPEED_STEP)
  return Math.min(MAX_SPEED_MULT, 1 + steps * SPEED_STEP_AMOUNT)
}

interface Point {
  x: number
  y: number
}

interface Ship {
  x: number
  y: number
  rotation: number
  velocity: { x: number; y: number }
}

interface Asteroid {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  sides: number
  rotation: number
  rotationSpeed: number
}

interface Missile {
  x: number
  y: number
  vx: number
  vy: number
  life: number
}

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [keys, setKeys] = useState<{ [key: string]: boolean }>({})
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const scoreRef = useRef(0)

  const gameStateRef = useRef({
    ship: { x: WIDTH / 2, y: HEIGHT / 2, rotation: 0, velocity: { x: 0, y: 0 } } as Ship,
    asteroids: [] as Asteroid[],
    missiles: [] as Missile[],
    lastMissileTime: 0,
  })

  useEffect(() => {
    scoreRef.current = score
  }, [score])

  const spawnAsteroid = useCallback(() => {
    const side = Math.floor(Math.random() * 4)
    let x = 0, y = 0
    
    switch (side) {
      case 0: // top
        x = Math.random() * WIDTH
        y = -50
        break
      case 1: // right
        x = WIDTH + 50
        y = Math.random() * HEIGHT
        break
      case 2: // bottom
        x = Math.random() * WIDTH
        y = HEIGHT + 50
        break
      case 3: // left
        x = -50
        y = Math.random() * HEIGHT
        break
    }
    
    const angle = Math.atan2(HEIGHT / 2 - y, WIDTH / 2 - x)
    const base =
      ASTEROID_BASE_SPEEDS[Math.floor(Math.random() * ASTEROID_BASE_SPEEDS.length)]
    const speed = base * asteroidSpeedMult(scoreRef.current)
    
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius: 20 + Math.random() * 20,
      sides: 6 + Math.floor(Math.random() * 4),
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.05,
    }
  }, [])

  const resetGame = useCallback(() => {
    gameStateRef.current = {
      ship: { x: WIDTH / 2, y: HEIGHT / 2, rotation: 0, velocity: { x: 0, y: 0 } },
      asteroids: [],
      missiles: [],
      lastMissileTime: 0,
    }
    
    for (let i = 0; i < 5; i++) {
      gameStateRef.current.asteroids.push(spawnAsteroid())
    }
    
    setScore(0)
    setLives(3)
    setGameOver(false)
  }, [spawnAsteroid])

  useEffect(() => {
    resetGame()
  }, [resetGame])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault()
      }
      setKeys(k => ({ ...k, [e.code]: true }))
      
      if (e.code === 'KeyR' && gameOver) {
        resetGame()
      }
    }
    
    function handleKeyUp(e: KeyboardEvent) {
      if (['ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
        e.preventDefault()
      }
      setKeys(k => ({ ...k, [e.code]: false }))
    }
    
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameOver, resetGame])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    function drawShip(ship: Ship) {
      if (!ctx) return
      ctx.save()
      ctx.translate(ship.x, ship.y)
      ctx.rotate(ship.rotation)
      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(SHIP_SIZE, 0)
      ctx.lineTo(-SHIP_SIZE, SHIP_SIZE / 2)
      ctx.lineTo(-SHIP_SIZE / 2, 0)
      ctx.lineTo(-SHIP_SIZE, -SHIP_SIZE / 2)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    }

    function drawAsteroid(asteroid: Asteroid) {
      if (!ctx) return
      ctx.save()
      ctx.translate(asteroid.x, asteroid.y)
      ctx.rotate(asteroid.rotation)
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < asteroid.sides; i++) {
        const angle = (i / asteroid.sides) * Math.PI * 2
        const r = asteroid.radius * (0.8 + Math.random() * 0.4)
        const x = Math.cos(angle) * r
        const y = Math.sin(angle) * r
        if (i === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      }
      ctx.closePath()
      ctx.stroke()
      ctx.restore()
    }

    function drawMissile(missile: Missile) {
      if (!ctx) return
      ctx.fillStyle = '#ff0000'
      ctx.beginPath()
      ctx.arc(missile.x, missile.y, 3, 0, Math.PI * 2)
      ctx.fill()
    }

    function checkCollision(x1: number, y1: number, r1: number, x2: number, y2: number, r2: number): boolean {
      const dx = x1 - x2
      const dy = y1 - y2
      const distance = Math.sqrt(dx * dx + dy * dy)
      return distance < r1 + r2
    }

    function gameLoop() {
      if (!ctx) return
      
      if (gameOver) {
        animationFrameId = requestAnimationFrame(gameLoop)
        return
      }

      const state = gameStateRef.current
      const now = Date.now()

      // Handle rotation
      if (keys['ArrowLeft']) {
        state.ship.rotation -= ROTATION_SPEED
      }
      if (keys['ArrowRight']) {
        state.ship.rotation += ROTATION_SPEED
      }

      // Handle firing
      if (keys['Space'] && state.missiles.length < MAX_MISSILES && now - state.lastMissileTime > 250) {
        state.missiles.push({
          x: state.ship.x,
          y: state.ship.y,
          vx: Math.cos(state.ship.rotation) * MISSILE_SPEED,
          vy: Math.sin(state.ship.rotation) * MISSILE_SPEED,
          life: 60,
        })
        state.lastMissileTime = now
      }

      // Update missiles
      state.missiles = state.missiles.filter(m => {
        m.x += m.vx
        m.y += m.vy
        m.life--
        return m.life > 0 && m.x >= 0 && m.x <= WIDTH && m.y >= 0 && m.y <= HEIGHT
      })

      // Update asteroids
      state.asteroids.forEach(a => {
        a.x += a.vx
        a.y += a.vy
        a.rotation += a.rotationSpeed

        // Wrap around screen
        if (a.x < -50) a.x = WIDTH + 50
        if (a.x > WIDTH + 50) a.x = -50
        if (a.y < -50) a.y = HEIGHT + 50
        if (a.y > HEIGHT + 50) a.y = -50
      })

      // Check missile-asteroid collisions
      for (let i = state.asteroids.length - 1; i >= 0; i--) {
        for (let j = state.missiles.length - 1; j >= 0; j--) {
          if (checkCollision(
            state.asteroids[i].x, state.asteroids[i].y, state.asteroids[i].radius,
            state.missiles[j].x, state.missiles[j].y, 3
          )) {
            state.asteroids.splice(i, 1)
            state.missiles.splice(j, 1)
            setScore(s => s + 10)
            
            // Spawn new asteroid
            state.asteroids.push(spawnAsteroid())
            break
          }
        }
      }

      // Check ship-asteroid collisions
      for (const asteroid of state.asteroids) {
        if (checkCollision(
          state.ship.x, state.ship.y, SHIP_SIZE,
          asteroid.x, asteroid.y, asteroid.radius
        )) {
          setLives(l => {
            const newLives = l - 1
            if (newLives <= 0) {
              setGameOver(true)
            } else {
              // Reset ship position
              state.ship.x = WIDTH / 2
              state.ship.y = HEIGHT / 2
              state.ship.rotation = 0
              state.ship.velocity = { x: 0, y: 0 }
            }
            return newLives
          })
          break
        }
      }

      // Clear and draw
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, WIDTH, HEIGHT)

      drawShip(state.ship)
      state.asteroids.forEach(drawAsteroid)
      state.missiles.forEach(drawMissile)

      // Draw HUD
      ctx.fillStyle = '#ffffff'
      ctx.font = '20px monospace'
      ctx.fillText(`Score: ${score}`, 10, 30)
      ctx.fillText(`Lives: ${lives}`, 10, 60)

      if (gameOver) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)
        ctx.fillStyle = '#ff0000'
        ctx.font = '48px monospace'
        ctx.textAlign = 'center'
        ctx.fillText('GAME OVER', WIDTH / 2, HEIGHT / 2 - 30)
        ctx.font = '24px monospace'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(`Final Score: ${score}`, WIDTH / 2, HEIGHT / 2 + 20)
        ctx.fillText('Press R to restart', WIDTH / 2, HEIGHT / 2 + 60)
        ctx.textAlign = 'left'
      }

      animationFrameId = requestAnimationFrame(gameLoop)
    }

    animationFrameId = requestAnimationFrame(gameLoop)
    return () => cancelAnimationFrame(animationFrameId)
  }, [keys, score, lives, gameOver, spawnAsteroid])

  return (
    <canvas
      ref={canvasRef}
      width={WIDTH}
      height={HEIGHT}
      style={{ border: '2px solid #00ff00', display: 'block', margin: '0 auto' }}
      tabIndex={0}
    />
  )
}
