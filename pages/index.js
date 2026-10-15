import { useEffect, useRef, useState } from 'react'
import styles from '../styles/Home.module.css'

export default function Home() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [lives, setLives] = useState(3)
  const [gameOver, setGameOver] = useState(false)
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!gameStarted || gameOver) return

    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    canvas.width = 800
    canvas.height = 600

    // Asteroid velocity parameters
    const BASE_ASTEROID_SPEED = 1.5 // Reduced to ~50% of a typical base speed
    const SPEED_INCREMENT = 0.3     // Speed increase per 100 points
    const MAX_ASTEROID_SPEED = BASE_ASTEROID_SPEED * 2.5

    function getAsteroidSpeed(currentScore) {
      const increments = Math.floor(currentScore / 100)
      const speed = BASE_ASTEROID_SPEED + increments * SPEED_INCREMENT
      return Math.min(speed, MAX_ASTEROID_SPEED)
    }

    // Game state
    const ship = {
      x: canvas.width / 2,
      y: canvas.height / 2,
      angle: -Math.PI / 2,
      rotation: 0,
      radius: 15,
      velocityX: 0,
      velocityY: 0
    }

    const keys = {}
    const bullets = []
    const asteroids = []
    const particles = []
    let currentScore = 0
    let currentLives = 3
    let invulnerable = false
    let invulnerableTimer = 0

    // Keyboard controls
    const handleKeyDown = (e) => {
      keys[e.key] = true
      if (e.key === ' ') {
        e.preventDefault()
        fireBullet()
      }
    }

    const handleKeyUp = (e) => {
      keys[e.key] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    function fireBullet() {
      bullets.push({
        x: ship.x + Math.cos(ship.angle) * ship.radius,
        y: ship.y + Math.sin(ship.angle) * ship.radius,
        velocityX: Math.cos(ship.angle) * 7,
        velocityY: Math.sin(ship.angle) * 7,
        life: 60
      })
    }

    function spawnAsteroid() {
      const speed = getAsteroidSpeed(currentScore)
      const side = Math.floor(Math.random() * 4)
      let x, y, vx, vy

      switch (side) {
        case 0: // Top
          x = Math.random() * canvas.width
          y = -30
          break
        case 1: // Right
          x = canvas.width + 30
          y = Math.random() * canvas.height
          break
        case 2: // Bottom
          x = Math.random() * canvas.width
          y = canvas.height + 30
          break
        case 3: // Left
          x = -30
          y = Math.random() * canvas.height
          break
      }

      const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x) + (Math.random() - 0.5) * 0.5
      vx = Math.cos(angle) * speed
      vy = Math.sin(angle) * speed

      asteroids.push({
        x,
        y,
        velocityX: vx,
        velocityY: vy,
        radius: 20 + Math.random() * 20,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.1,
        sides: Math.floor(Math.random() * 4) + 6
      })
    }

    function createParticles(x, y) {
      for (let i = 0; i < 8; i++) {
        const angle = (Math.PI * 2 * i) / 8
        particles.push({
          x,
          y,
          velocityX: Math.cos(angle) * 2,
          velocityY: Math.sin(angle) * 2,
          life: 30
        })
      }
    }

    function updateShip() {
      if (keys['ArrowLeft'] || keys['a'] || keys['A']) {
        ship.angle -= 0.08
      }
      if (keys['ArrowRight'] || keys['d'] || keys['D']) {
        ship.angle += 0.08
      }
      if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        ship.velocityX += Math.cos(ship.angle) * 0.1
        ship.velocityY += Math.sin(ship.angle) * 0.1
      }

      ship.velocityX *= 0.99
      ship.velocityY *= 0.99

      ship.x += ship.velocityX
      ship.y += ship.velocityY

      if (ship.x < 0) ship.x = canvas.width
      if (ship.x > canvas.width) ship.x = 0
      if (ship.y < 0) ship.y = canvas.height
      if (ship.y > canvas.height) ship.y = 0

      if (invulnerable) {
        invulnerableTimer--
        if (invulnerableTimer <= 0) {
          invulnerable = false
        }
      }
    }

    function updateBullets() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]
        bullet.x += bullet.velocityX
        bullet.y += bullet.velocityY
        bullet.life--

        if (bullet.life <= 0 || bullet.x < 0 || bullet.x > canvas.width || bullet.y < 0 || bullet.y > canvas.height) {
          bullets.splice(i, 1)
        }
      }
    }

    function updateAsteroids() {
      for (let i = asteroids.length - 1; i >= 0; i--) {
        const asteroid = asteroids[i]
        asteroid.x += asteroid.velocityX
        asteroid.y += asteroid.velocityY
        asteroid.rotation += asteroid.rotationSpeed

        if (asteroid.x < -50 || asteroid.x > canvas.width + 50 || asteroid.y < -50 || asteroid.y > canvas.height + 50) {
          asteroids.splice(i, 1)
        }
      }
    }

    function updateParticles() {
      for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i]
        particle.x += particle.velocityX
        particle.y += particle.velocityY
        particle.life--

        if (particle.life <= 0) {
          particles.splice(i, 1)
        }
      }
    }

    function checkCollisions() {
      for (let i = bullets.length - 1; i >= 0; i--) {
        const bullet = bullets[i]

        for (let j = asteroids.length - 1; j >= 0; j--) {
          const asteroid = asteroids[j]
          const dx = bullet.x - asteroid.x
          const dy = bullet.y - asteroid.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < asteroid.radius) {
            bullets.splice(i, 1)
            asteroids.splice(j, 1)
            createParticles(asteroid.x, asteroid.y)
            currentScore += 10
            setScore(currentScore)
            break
          }
        }
      }

      if (!invulnerable) {
        for (let i = asteroids.length - 1; i >= 0; i--) {
          const asteroid = asteroids[i]
          const dx = ship.x - asteroid.x
          const dy = ship.y - asteroid.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < ship.radius + asteroid.radius) {
            asteroids.splice(i, 1)
            createParticles(asteroid.x, asteroid.y)
            currentLives--
            setLives(currentLives)
            invulnerable = true
            invulnerableTimer = 90

            if (currentLives <= 0) {
              setGameOver(true)
              return
            }
          }
        }
      }
    }

    function drawShip() {
      ctx.save()
      ctx.translate(ship.x, ship.y)
      ctx.rotate(ship.angle)

      if (invulnerable && Math.floor(invulnerableTimer / 10) % 2 === 0) {
        ctx.globalAlpha = 0.5
      }

      ctx.strokeStyle = '#00ff00'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(15, 0)
      ctx.lineTo(-10, -8)
      ctx.lineTo(-7, 0)
      ctx.lineTo(-10, 8)
      ctx.closePath()
      ctx.stroke()

      if (keys['ArrowUp'] || keys['w'] || keys['W']) {
        ctx.fillStyle = '#ffaa00'
        ctx.beginPath()
        ctx.moveTo(-7, 0)
        ctx.lineTo(-12, -4)
        ctx.lineTo(-12, 4)
        ctx.closePath()
        ctx.fill()
      }

      ctx.restore()
    }

    function drawBullets() {
      ctx.fillStyle = '#ffffff'
      bullets.forEach(bullet => {
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
        ctx.fill()
      })
    }

    function drawAsteroids() {
      ctx.strokeStyle = '#888888'
      ctx.lineWidth = 2

      asteroids.forEach(asteroid => {
        ctx.save()
        ctx.translate(asteroid.x, asteroid.y)
        ctx.rotate(asteroid.rotation)

        ctx.beginPath()
        for (let i = 0; i < asteroid.sides; i++) {
          const angle = (Math.PI * 2 * i) / asteroid.sides
          const radius = asteroid.radius + (Math.sin(i) * asteroid.radius * 0.2)
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.closePath()
        ctx.stroke()

        ctx.restore()
      })
    }

    function drawParticles() {
      ctx.fillStyle = '#ffaa00'
      particles.forEach(particle => {
        ctx.globalAlpha = particle.life / 30
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2)
        ctx.fill()
        ctx.globalAlpha = 1
      })
    }

    function gameLoop() {
      ctx.fillStyle = '#000000'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      updateShip()
      updateBullets()
      updateAsteroids()
      updateParticles()
      checkCollisions()

      drawShip()
      drawBullets()
      drawAsteroids()
      drawParticles()

      if (Math.random() < 0.02) {
        spawnAsteroid()
      }

      if (!gameOver) {
        requestAnimationFrame(gameLoop)
      }
    }

    // Spawn initial asteroids
    for (let i = 0; i < 3; i++) {
      setTimeout(() => spawnAsteroid(), i * 1000)
    }

    gameLoop()

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [gameStarted, gameOver])

  const startGame = () => {
    setScore(0)
    setLives(3)
    setGameOver(false)
    setGameStarted(true)
  }

  const restartGame = () => {
    setScore(0)
    setLives(3)
    setGameOver(false)
    setGameStarted(false)
    setTimeout(() => setGameStarted(true), 50)
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>ASTEROIDS</h1>
        <div className={styles.stats}>
          <div className={styles.stat}>Score: {score}</div>
          <div className={styles.stat}>Lives: {lives}</div>
        </div>
      </div>

      {!gameStarted && !gameOver && (
        <div className={styles.startScreen}>
          <h2>ASTEROIDS</h2>
          <div className={styles.instructions}>
            <p><strong>Controls:</strong></p>
            <p>← → or A D: Rotate ship</p>
            <p>↑ or W: Thrust</p>
            <p>SPACE: Fire</p>
          </div>
          <button className={styles.button} onClick={startGame}>
            START GAME
          </button>
        </div>
      )}

      {gameOver && (
        <div className={styles.gameOverScreen}>
          <h2>GAME OVER</h2>
          <p className={styles.finalScore}>Final Score: {score}</p>
          <button className={styles.button} onClick={restartGame}>
            PLAY AGAIN
          </button>
        </div>
      )}

      <canvas
        ref={canvasRef}
        className={styles.canvas}
        style={{ display: gameStarted && !gameOver ? 'block' : 'none' }}
      />

      <div className={styles.footer}>
        <p>Press SPACE to fire • Arrow keys or WASD to move</p>
      </div>
    </div>
  )
}
