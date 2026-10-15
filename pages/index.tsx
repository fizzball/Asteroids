import Head from 'next/head'
import GameCanvas from '../components/GameCanvas'
import styles from '../styles/Home.module.css'

export default function Home() {
  return (
    <>
      <Head>
        <title>Asteroids - Classic Arcade Game</title>
        <meta name="description" content="Classic Asteroids arcade game built with Next.js" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.title}>🚀 ASTEROIDS</h1>
          <div className={styles.instructions}>
            <p><strong>Controls:</strong></p>
            <p>⬅️ Left Arrow: Rotate ship left</p>
            <p>➡️ Right Arrow: Rotate ship right</p>
            <p>⎵ Spacebar: Fire missiles</p>
            <p>🔄 R: Restart game (when game over)</p>
          </div>
          <GameCanvas />
          <div className={styles.footer}>
            <p>Destroy asteroids to earn points. Don&apos;t let them hit your ship!</p>
          </div>
        </div>
      </main>
    </>
  )
}
