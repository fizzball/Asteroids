# Asteroids

A browser-based arcade game built with Next.js featuring keyboard controls and progressive difficulty scaling.

## Features

- Classic Asteroids gameplay
- Keyboard controls for ship rotation, thrust, and firing
- Progressive difficulty: asteroid speed increases every 100 points
- Score tracking and lives system
- Smooth animations using canvas rendering
- Responsive controls with no input lag

## Controls

- **Arrow Keys** or **A/D**: Rotate ship left/right
- **Up Arrow** or **W**: Thrust forward
- **Spacebar**: Fire missiles

## Running Locally

### Prerequisites

- Node.js 18+ and npm

### Development Mode

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to [http://localhost:3000](http://localhost:3000)

### Production Mode

1. Install dependencies:
```bash
npm install
```

2. Build the application:
```bash
npm run build
```

3. Start the production server:
```bash
npm start
```

4. Open your browser to [http://localhost:3000](http://localhost:3000)

## Running with Docker

### Build the Docker Image

```bash
docker build -t asteroids .
```

### Run the Container

```bash
docker run -p 3000:3000 asteroids
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## Game Mechanics

### Scoring
- Destroy an asteroid: +10 points

### Difficulty Scaling
- **Base asteroid speed**: 1.5 units/frame (reduced for manageable early gameplay)
- **Speed increment**: +0.3 units per 100 points scored
- **Maximum speed**: 3.75 units/frame (2.5× base speed)
- Only newly spawned asteroids use the increased speed

### Lives
- Start with 3 lives
- Lose a life when your ship collides with an asteroid
- Brief invulnerability period after losing a life
- Game over when all lives are lost

## Technology Stack

- **Framework**: Next.js 14
- **UI**: React 18
- **Rendering**: HTML5 Canvas
- **Styling**: CSS Modules
- **Containerization**: Docker (multi-stage build)

## Repository

https://github.com/fizzball/Asteroids

## License

MIT
