import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const VideoBackground = () => {
  const [videoError, setVideoError] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRef = useRef(null)

  // Simulation de vidéo avec effet de particules
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsPlaying(true)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  if (videoError) {
    return null
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Effet de particules animées */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent-primary rounded-full"
            initial={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: 0
            }}
            animate={{
              x: Math.random() * window.innerWidth,
              y: Math.random() * window.innerHeight,
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 10 + 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
            style={{
              boxShadow: '0 0 6px rgba(100, 255, 218, 0.8)'
            }}
          />
        ))}
      </div>

      {/* Lignes de connexion animées */}
      <svg className="absolute inset-0 w-full h-full">
        {[...Array(8)].map((_, i) => (
          <motion.line
            key={i}
            x1={Math.random() * 100 + '%'}
            y1={Math.random() * 100 + '%'}
            x2={Math.random() * 100 + '%'}
            y2={Math.random() * 100 + '%'}
            stroke="rgba(100, 255, 218, 0.3)"
            strokeWidth="1"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: [0, 1, 0], 
              opacity: [0, 0.6, 0] 
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2
            }}
          />
        ))}
      </svg>

      {/* Gradient overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-purple-500/10"
        animate={{
          opacity: [0.3, 0.6, 0.3]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Effet de scan horizontal */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent"
        animate={{ x: ['-100%', '100%'] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'linear'
        }}
        style={{ width: '200%' }}
      />

      {/* Effet de scan vertical */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent"
        animate={{ y: ['-100%', '100%'] }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'linear',
          delay: 1.5
        }}
        style={{ height: '200%' }}
      />

      {/* Pulse effect central */}
      <motion.div
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.5, 2, 1.5, 1],
          opacity: [0.8, 0.4, 0.2, 0.4, 0.8]
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        <div className="w-96 h-96 rounded-full border border-accent-primary/20" />
      </motion.div>

      {/* Grille hexagonale animée */}
      <div className="absolute inset-0 opacity-20">
        <div className="hexagon-grid" />
      </div>
    </div>
  )
}

export default VideoBackground
