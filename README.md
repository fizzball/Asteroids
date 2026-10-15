# Asteroids 🚀

Classic Asteroids arcade game built with Next.js and TypeScript. Play the iconic space shooter right in your browser with smooth controls and retro graphics!

## Features

- 🎮 Classic Asteroids gameplay
- ⌨️ Responsive keyboard controls
- 🎯 Score tracking and lives system
- 💥 Collision detection
- 🔄 Asteroid respawning
- 🎨 Retro-style graphics with HTML5 Canvas
- 🐳 Docker support for easy deployment

## Quick Start

### Prerequisites

- Node.js 18 or higher
- npm
- Docker (optional, for containerized deployment)

### Run Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:3000
   ```

### Build for Production

```bash
npm run build
npm start
```

## Docker Deployment

### Build the Docker image:

```bash
docker build -t asteroids .
```

### Run the container:

```bash
docker run -p 3000:3000 asteroids
```

### Access the game:

Open your browser and navigate to `http://localhost:3000`

## How to Play

### Controls

- **⬅️ Left Arrow**: Rotate ship counter-clockwise
- **➡️ Right Arrow**: Rotate ship clockwise  
- **⎵ Spacebar**: Fire missiles
- **R**: Restart game (when game over)

### Objective

- Destroy incoming asteroids by firing missiles at them
- Each asteroid destroyed earns you 10 points
- Avoid collisions with asteroids - you have 3 lives
- Asteroids start slow and speed up every 100 points (capped)
- Asteroids continuously spawn, so stay alert!
- Try to achieve the highest score possible

## Technology Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Rendering**: HTML5 Canvas
- **Styling**: CSS Modules
- **Containerization**: Docker

## Project Structure

```
asteroids/
├── components/
│   └── GameCanvas.tsx       # Main game component with game loop
├── pages/
│   ├── _app.tsx            # Next.js app wrapper
│   └── index.tsx           # Home page
├── styles/
│   ├── globals.css         # Global styles
│   └── Home.module.css     # Page-specific styles
├── Dockerfile              # Docker configuration
├── next.config.js          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── README.md              # This file
```

## Development

The game uses a continuous game loop powered by `requestAnimationFrame` for smooth 60 FPS gameplay. Key features:

- **Ship rotation**: Controlled via arrow keys with smooth rotation
- **Missile system**: Limited to 5 active missiles with cooldown
- **Asteroid spawning**: Random spawning from screen edges, moving toward center; base speed ~50% of the original, ramping every 100 points up to a 2.5× cap
- **Collision detection**: Circle-based collision between ship/asteroids and missiles/asteroids
- **Lives system**: 3 lives with ship respawn on collision
- **Score tracking**: 10 points per asteroid destroyed

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available for educational and personal use.

## Acknowledgments

Inspired by the classic Atari Asteroids arcade game (1979).

---

**Enjoy playing Asteroids! 🎮🚀**
