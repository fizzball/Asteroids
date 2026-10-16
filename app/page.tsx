'use client';

import { useEffect, useRef, useState } from 'react';

// Speed constants for difficulty scaling
const S0 = 0.8; // Base asteroid speed (manageable at game start)
const SPEED_STEP = 0.15; // Speed increment per 100 points
const S_MAX = 2.0; // Maximum speed (2.5× S0)

interface Vector2D {
  x: number;
  y: number;
}

interface Ship {
  pos: Vector2D;
  vel: Vector2D;
  angle: number;
  radius: number;
}

interface Asteroid {
  pos: Vector2D;
  vel: Vector2D;
  radius: number;
}

interface Missile {
  pos: Vector2D;
  vel: Vector2D;
  life: number;
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to window size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Game state
    let ship: Ship = {
      pos: { x: canvas.width / 2, y: canvas.height / 2 },
      vel: { x: 0, y: 0 },
      angle: -Math.PI / 2,
      radius: 15,
    };

    let asteroids: Asteroid[] = [];
    let missiles: Missile[] = [];
    let keys: { [key: string]: boolean } = {};
    let invulnerable = false;
    let invulnerableTime = 0;
    let currentScore = 0;
    let currentLives = 3;
    let isGameOver = false;
    let started = false;

    // Calculate asteroid speed based on current score
    const getAsteroidSpeed = (score: number): number => {
      const speedMultiplier = S0 + SPEED_STEP * Math.floor(score / 100);
      return Math.min(speedMultiplier, S_MAX);
    };

    // Spawn initial asteroids
    const spawnAsteroid = () => {
      const side = Math.floor(Math.random() * 4);
      let x, y, vx, vy;
      const speed = getAsteroidSpeed(currentScore);

      switch (side) {
        case 0: // top
          x = Math.random() * canvas.width;
          y = -30;
          vx = (Math.random() - 0.5) * speed;
          vy = Math.random() * speed + 0.5;
          break;
        case 1: // right
          x = canvas.width + 30;
          y = Math.random() * canvas.height;
          vx = -(Math.random() * speed + 0.5);
          vy = (Math.random() - 0.5) * speed;
          break;
        case 2: // bottom
          x = Math.random() * canvas.width;
          y = canvas.height + 30;
          vx = (Math.random() - 0.5) * speed;
          vy = -(Math.random() * speed + 0.5);
          break;
        default: // left
          x = -30;
          y = Math.random() * canvas.height;
          vx = Math.random() * speed + 0.5;
          vy = (Math.random() - 0.5) * speed;
      }

      asteroids.push({
        pos: { x, y },
        vel: { x: vx, y: vy },
        radius: 20 + Math.random() * 20,
      });
    };

    // Initialize asteroids
    for (let i = 0; i < 5; i++) {
      spawnAsteroid();
    }

    // Keyboard event handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      keys[e.key] = true;
      if (e.key === ' ') {
        e.preventDefault();
        if (!started && !isGameOver) {
          started = true;
          setGameStarted(true);
        } else if (isGameOver) {
          // Restart game
          resetGame();
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keys[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const resetGame = () => {
      ship = {
        pos: { x: canvas.width / 2, y: canvas.height / 2 },
        vel: { x: 0, y: 0 },
        angle: -Math.PI / 2,
        radius: 15,
      };
      asteroids = [];
      missiles = [];
      currentScore = 0;
      currentLives = 3;
      isGameOver = false;
      invulnerable = true;
      invulnerableTime = 120;
      started = true;
      setScore(0);
      setLives(3);
      setGameOver(false);
      setGameStarted(true);

      for (let i = 0; i < 5; i++) {
        spawnAsteroid();
      }
    };

    // Game loop
    let lastTime = Date.now();
    let lastMissileTime = 0;
    let asteroidSpawnTimer = 0;

    const gameLoop = () => {
      const now = Date.now();
      const dt = (now - lastTime) / 1000;
      lastTime = now;

      // Clear canvas
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!started) {
        // Show start screen
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('ASTEROIDS', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText('Press SPACE to start', canvas.width / 2, canvas.height / 2 + 20);
        ctx.font = '18px Arial';
        ctx.fillText('Arrow Keys: Rotate | Space: Fire', canvas.width / 2, canvas.height / 2 + 60);
        requestAnimationFrame(gameLoop);
        return;
      }

      if (isGameOver) {
        // Show game over screen
        ctx.fillStyle = '#fff';
        ctx.font = '48px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50);
        ctx.font = '24px Arial';
        ctx.fillText(`Final Score: ${currentScore}`, canvas.width / 2, canvas.height / 2 + 20);
        ctx.fillText('Press SPACE to restart', canvas.width / 2, canvas.height / 2 + 60);
        requestAnimationFrame(gameLoop);
        return;
      }

      // Handle invulnerability
      if (invulnerable) {
        invulnerableTime--;
        if (invulnerableTime <= 0) {
          invulnerable = false;
        }
      }

      // Ship controls
      if (keys['ArrowLeft']) {
        ship.angle -= 0.1;
      }
      if (keys['ArrowRight']) {
        ship.angle += 0.1;
      }
      if (keys['ArrowUp']) {
        const thrust = 0.3;
        ship.vel.x += Math.cos(ship.angle) * thrust;
        ship.vel.y += Math.sin(ship.angle) * thrust;
      }

      // Fire missile
      if (keys[' '] && now - lastMissileTime > 250) {
        missiles.push({
          pos: { x: ship.pos.x, y: ship.pos.y },
          vel: {
            x: Math.cos(ship.angle) * 8 + ship.vel.x,
            y: Math.sin(ship.angle) * 8 + ship.vel.y,
          },
          life: 60,
        });
        lastMissileTime = now;
      }

      // Apply friction
      ship.vel.x *= 0.99;
      ship.vel.y *= 0.99;

      // Update ship position
      ship.pos.x += ship.vel.x;
      ship.pos.y += ship.vel.y;

      // Wrap ship around screen
      if (ship.pos.x < 0) ship.pos.x = canvas.width;
      if (ship.pos.x > canvas.width) ship.pos.x = 0;
      if (ship.pos.y < 0) ship.pos.y = canvas.height;
      if (ship.pos.y > canvas.height) ship.pos.y = 0;

      // Update asteroids
      asteroids.forEach((asteroid) => {
        asteroid.pos.x += asteroid.vel.x;
        asteroid.pos.y += asteroid.vel.y;
      });

      // Remove off-screen asteroids and spawn new ones
      asteroids = asteroids.filter((asteroid) => {
        const margin = 100;
        return (
          asteroid.pos.x > -margin &&
          asteroid.pos.x < canvas.width + margin &&
          asteroid.pos.y > -margin &&
          asteroid.pos.y < canvas.height + margin
        );
      });

      // Spawn new asteroids periodically
      asteroidSpawnTimer++;
      if (asteroidSpawnTimer > 120 && asteroids.length < 10) {
        spawnAsteroid();
        asteroidSpawnTimer = 0;
      }

      // Update missiles
      missiles.forEach((missile) => {
        missile.pos.x += missile.vel.x;
        missile.pos.y += missile.vel.y;
        missile.life--;
      });

      // Remove expired missiles
      missiles = missiles.filter((missile) => missile.life > 0);

      // Check missile-asteroid collisions
      missiles.forEach((missile, mi) => {
        asteroids.forEach((asteroid, ai) => {
          const dx = missile.pos.x - asteroid.pos.x;
          const dy = missile.pos.y - asteroid.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < asteroid.radius) {
            asteroids.splice(ai, 1);
            missiles.splice(mi, 1);
            currentScore += 10;
            setScore(currentScore);
          }
        });
      });

      // Check ship-asteroid collisions
      if (!invulnerable) {
        asteroids.forEach((asteroid, ai) => {
          const dx = ship.pos.x - asteroid.pos.x;
          const dy = ship.pos.y - asteroid.pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < ship.radius + asteroid.radius) {
            asteroids.splice(ai, 1);
            currentLives--;
            setLives(currentLives);
            invulnerable = true;
            invulnerableTime = 120;

            if (currentLives <= 0) {
              isGameOver = true;
              setGameOver(true);
            }
          }
        });
      }

      // Draw ship
      ctx.save();
      ctx.translate(ship.pos.x, ship.pos.y);
      ctx.rotate(ship.angle);
      ctx.strokeStyle = invulnerable && Math.floor(invulnerableTime / 5) % 2 === 0 ? '#888' : '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(15, 0);
      ctx.lineTo(-10, -8);
      ctx.lineTo(-10, 8);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();

      // Draw asteroids
      asteroids.forEach((asteroid) => {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(asteroid.pos.x, asteroid.pos.y, asteroid.radius, 0, Math.PI * 2);
        ctx.stroke();
      });

      // Draw missiles
      missiles.forEach((missile) => {
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(missile.pos.x, missile.pos.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100vw', height: '100vh', background: '#000' }}>
      <canvas ref={canvasRef} style={{ display: 'block' }} />
      <div
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          color: '#fff',
          fontFamily: 'Arial, sans-serif',
          fontSize: '20px',
          userSelect: 'none',
        }}
      >
        <div>Score: {score}</div>
        <div>Lives: {lives}</div>
        <div style={{ fontSize: '12px', marginTop: '10px', opacity: 0.7 }}>
          Speed: {(S0 + SPEED_STEP * Math.floor(score / 100)).toFixed(2)}× (max {S_MAX}×)
        </div>
      </div>
    </div>
  );
}
