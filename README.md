# Asteroids

Classic Asteroids arcade game built with Next.js and TypeScript. Play in your browser with keyboard controls to rotate your ship and fire missiles at incoming asteroids.

## Features

- **Progressive Difficulty**: Asteroid speed increases every 100 points scored
- **Scoring**: +10 points per asteroid destroyed
- **Lives System**: Start with 3 lives, temporary invulnerability after taking damage
- **Smooth Controls**: Responsive keyboard controls for rotation and firing
- **Speed Scaling**: Base speed S0 (0.8×) increases by 0.15× every 100 points, capped at 2.0×

## Controls

- **Arrow Left/Right**: Rotate ship
- **Arrow Up**: Thrust forward
- **Spacebar**: Fire missiles

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to play the game.

## Production Build

### Build the Application

```bash
npm run build
```

### Start Production Server

```bash
npm start
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## Docker

### Build the Docker Image

```bash
docker build -t asteroids .
```

### Run the Container

```bash
docker run -p 3000:3000 asteroids
```

Access the game at [http://localhost:3000](http://localhost:3000).

## Game Mechanics

- **Starting Speed**: Asteroids spawn with a manageable base speed (S0 = 0.8×)
- **Speed Progression**: Every 100 points scored, asteroid speed increases by 0.15×
- **Speed Cap**: Maximum asteroid speed is capped at 2.0× base speed
- **Asteroid Spawning**: New asteroids spawn from the edges of the screen periodically
- **Lives**: You have 3 lives; colliding with an asteroid costs one life and grants temporary invulnerability
- **Game Over**: The game ends when you lose all lives

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas
- **Containerization**: Docker

## License

MIT
