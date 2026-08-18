import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, Box, Sphere, Text } from '@react-three/drei'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// Animated network node component
function NetworkNode({ position, color, size, label, data }) {
  const meshRef = useRef()
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.1
    }
  })

  return (
    <group position={position}>
      <Sphere
        ref={meshRef}
        args={[size, 16, 16]}
        onClick={() => console.log('Node clicked:', label, data)}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <meshStandardMaterial 
          color={hovered ? '#64ffda' : color} 
          emissive={hovered ? '#64ffda' : color}
          emissiveIntensity={hovered ? 0.5 : 0.2}
        />
      </Sphere>
      {hovered && (
        <Text
          position={[0, size + 0.5, 0]}
          fontSize={0.3}
          color="#64ffda"
          anchorX="center"
          anchorY="middle"
        >
          {label}
        </Text>
      )}
    </group>
  )
}

// Connection line component
function Connection({ start, end, color, intensity }) {
  const points = useMemo(() => [new THREE.Vector3(...start), new THREE.Vector3(...end)], [start, end])
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial 
        color={color} 
        opacity={intensity}
        transparent
      />
    </line>
  )
}

// Main 3D Network Visualization
function NetworkVisualization() {
  const [networkData, setNetworkData] = useState(null)

  useEffect(() => {
    // Simulate network data
    setNetworkData({
      nodes: [
        { id: 1, label: 'Core Router', position: [0, 0, 0], color: '#64ffda', size: 0.5, type: 'router' },
        { id: 2, label: 'Web Server', position: [3, 0, 2], color: '#00b4d8', size: 0.3, type: 'server' },
        { id: 3, label: 'DB Server', position: [-3, 0, 2], color: '#7c3aed', size: 0.4, type: 'database' },
        { id: 4, label: 'Firewall', position: [0, 2, -3], color: '#ff6b35', size: 0.35, type: 'security' },
        { id: 5, label: 'Client 1', position: [5, -1, 0], color: '#8892b0', size: 0.2, type: 'client' },
        { id: 6, label: 'Client 2', position: [-5, -1, 0], color: '#8892b0', size: 0.2, type: 'client' },
        { id: 7, label: 'Attacker', position: [0, -2, 4], color: '#ff2d55', size: 0.25, type: 'threat' },
      ],
      connections: [
        { from: 1, to: 2, intensity: 0.8, traffic: 'normal' },
        { from: 1, to: 3, intensity: 0.6, traffic: 'normal' },
        { from: 1, to: 4, intensity: 1.0, traffic: 'high' },
        { from: 2, to: 5, intensity: 0.4, traffic: 'normal' },
        { from: 3, to: 6, intensity: 0.3, traffic: 'normal' },
        { from: 7, to: 2, intensity: 0.9, traffic: 'attack' },
        { from: 7, to: 4, intensity: 0.7, traffic: 'attack' },
      ]
    })
  }, [])

  if (!networkData) return null

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={0.5} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#64ffda" />

      {/* Network Nodes */}
      {networkData.nodes.map((node) => (
        <NetworkNode
          key={node.id}
          position={node.position}
          color={node.color}
          size={node.size}
          label={node.label}
          data={node}
        />
      ))}

      {/* Connections */}
      {networkData.connections.map((connection, index) => {
        const fromNode = networkData.nodes.find(n => n.id === connection.from)
        const toNode = networkData.nodes.find(n => n.id === connection.to)
        
        if (!fromNode || !toNode) return null

        const color = connection.traffic === 'attack' ? '#ff2d55' : '#64ffda'
        
        return (
          <Connection
            key={index}
            start={fromNode.position}
            end={toNode.position}
            color={color}
            intensity={connection.intensity}
          />
        )
      })}

      {/* Grid Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial 
          color="#04080f" 
          wireframe
          opacity={0.1}
          transparent
        />
      </mesh>
    </>
  )
}

// Main component wrapper
export default function ThreeDVisualization() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-accent-primary font-mono animate-pulse">Loading 3D Visualization...</div>
      </div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">3D Network Visualization</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
          <span className="text-xs font-mono text-gray-500">Real-time</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Nodes', value: '7', color: 'text-accent-primary' },
          { label: 'Connections', value: '7', color: 'text-neon-blue' },
          { label: 'Threat Level', value: 'HIGH', color: 'text-severity-high' },
          { label: 'Data Flow', value: '2.4 GB/s', color: 'text-green-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass glass-hover p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-display text-2xl mt-2 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* 3D Canvas */}
      <div className="glass p-6">
        <div className="w-full h-96 bg-cyber-surface/50 rounded-lg overflow-hidden">
          <Canvas
            camera={{ position: [8, 6, 8], fov: 60 }}
            style={{ background: 'linear-gradient(135deg, #04080f 0%, #080f1e 100%)' }}
          >
            <OrbitControls 
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minDistance={3}
              maxDistance={20}
            />
            <NetworkVisualization />
          </Canvas>
        </div>
      </div>

      {/* Legend */}
      <div className="glass p-4">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Network Legend</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { color: '#64ffda', label: 'Core Infrastructure' },
            { color: '#00b4d8', label: 'Web Services' },
            { color: '#7c3aed', label: 'Database' },
            { color: '#ff6b35', label: 'Security' },
            { color: '#8892b0', label: 'Clients' },
            { color: '#ff2d55', label: 'Threats' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-xs text-gray-400">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Controls Info */}
      <div className="glass p-4">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-2">Controls</h3>
        <div className="text-xs text-gray-400 space-y-1">
          <p>🖱️ Left Click + Drag: Rotate view</p>
          <p>🖱️ Right Click + Drag: Pan view</p>
          <p>⚙️ Scroll: Zoom in/out</p>
          <p>👆 Click nodes: View details</p>
        </div>
      </div>
    </motion.div>
  )
}
