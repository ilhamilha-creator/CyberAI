import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, ScatterChart, Scatter, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Network, Activity, Shield, AlertTriangle, Zap, Target, Brain, Cpu, Database, Globe, Router, Wifi } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function NetworkAnalysis() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedView, setSelectedView] = useState('topology')
  const [realTimeData, setRealTimeData] = useState([])
  const [networkStats, setNetworkStats] = useState({
    totalPackets: 0,
    bandwidth: 0,
    activeConnections: 0,
    threatLevel: 'low'
  })

  useEffect(() => {
    loadNetworkData()
    const interval = setInterval(() => {
      loadRealTimeData()
      updateNetworkStats()
    }, 2000)
    return () => clearInterval(interval)
  }, [selectedView])

  const loadNetworkData = async () => {
    try {
      // Simuler des données réseau complexes
      const topologyData = generateTopologyData()
      const trafficData = generateTrafficData()
      const threatData = generateThreatData()
      
      setData({
        topology: topologyData,
        traffic: trafficData,
        threats: threatData
      })
    } catch (error) {
      console.error('Error loading network data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadRealTimeData = () => {
    const newData = {
      timestamp: new Date().toLocaleTimeString(),
      packets: Math.floor(Math.random() * 10000) + 5000,
      bandwidth: Math.floor(Math.random() * 1000) + 500,
      threats: Math.floor(Math.random() * 50) + 10,
      latency: Math.random() * 100 + 10
    }
    
    setRealTimeData(prev => [...prev.slice(-19), newData])
  }

  const updateNetworkStats = () => {
    setNetworkStats({
      totalPackets: Math.floor(Math.random() * 100000) + 50000,
      bandwidth: Math.floor(Math.random() * 1000) + 500,
      activeConnections: Math.floor(Math.random() * 500) + 200,
      threatLevel: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)]
    })
  }

  const generateTopologyData = () => {
    return [
      { id: 'core-router', name: 'Core Router', type: 'router', x: 400, y: 100, connections: ['dist-switch-1', 'dist-switch-2'], status: 'active', load: 85 },
      { id: 'dist-switch-1', name: 'Distribution Switch 1', type: 'switch', x: 200, y: 250, connections: ['core-router', 'access-switch-1', 'access-switch-2'], status: 'active', load: 65 },
      { id: 'dist-switch-2', name: 'Distribution Switch 2', type: 'switch', x: 600, y: 250, connections: ['core-router', 'access-switch-3', 'access-switch-4'], status: 'active', load: 72 },
      { id: 'access-switch-1', name: 'Access Switch 1', type: 'switch', x: 100, y: 400, connections: ['dist-switch-1'], status: 'active', load: 45 },
      { id: 'access-switch-2', name: 'Access Switch 2', type: 'switch', x: 300, y: 400, connections: ['dist-switch-1'], status: 'warning', load: 89 },
      { id: 'access-switch-3', name: 'Access Switch 3', type: 'switch', x: 500, y: 400, connections: ['dist-switch-2'], status: 'active', load: 56 },
      { id: 'access-switch-4', name: 'Access Switch 4', type: 'switch', x: 700, y: 400, connections: ['dist-switch-2'], status: 'active', load: 38 },
      { id: 'firewall', name: 'Firewall', type: 'firewall', x: 400, y: 550, connections: ['internet'], status: 'active', load: 92 },
      { id: 'internet', name: 'Internet', type: 'internet', x: 400, y: 700, connections: ['firewall'], status: 'active', load: 100 }
    ]
  }

  const generateTrafficData = () => {
    return Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      inbound: Math.floor(Math.random() * 1000) + 500,
      outbound: Math.floor(Math.random() * 800) + 300,
      threats: Math.floor(Math.random() * 50) + 5,
      bandwidth: Math.floor(Math.random() * 100) + 50
    }))
  }

  const generateThreatData = () => {
    return [
      { type: 'DDoS', count: 45, severity: 'high', trend: 'up' },
      { type: 'Port Scan', count: 32, severity: 'medium', trend: 'stable' },
      { type: 'SQL Injection', count: 18, severity: 'critical', trend: 'down' },
      { type: 'Brute Force', count: 28, severity: 'medium', trend: 'up' },
      { type: 'Malware', count: 12, severity: 'high', trend: 'stable' },
      { type: 'Phishing', count: 8, severity: 'low', trend: 'down' }
    ]
  }

  const getNodeIcon = (type) => {
    switch (type) {
      case 'router': return <Router className="w-6 h-6" />
      case 'switch': return <Wifi className="w-6 h-6" />
      case 'firewall': return <Shield className="w-6 h-6" />
      case 'internet': return <Globe className="w-6 h-6" />
      default: return <Network className="w-6 h-6" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#64ffda'
      case 'warning': return '#ffa62b'
      case 'critical': return '#ff2d55'
      default: return '#8892b0'
    }
  }

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        className="flex items-center justify-center h-64"
      >
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="inline-block mb-4"
          >
            <Network className="w-12 h-12 text-accent-primary mx-auto" />
          </motion.div>
          <div className="text-accent-primary font-mono animate-pulse">Analyzing Network Topology...</div>
          <div className="text-gray-500 text-xs font-mono mt-2">Mapping network infrastructure</div>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      {/* En-tête avec statistiques en temps réel */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <motion.h1 
          className="font-display text-3xl tracking-wider text-gray-200"
          animate={{ 
            textShadow: [
              '0 0 10px rgba(100,255,218,0.5)',
              '0 0 20px rgba(100,255,218,0.8)',
              '0 0 10px rgba(100,255,218,0.5)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🌐 Network Analysis Center
        </motion.h1>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-3 h-3 rounded-full bg-green-400"
            />
            <span className="text-xs font-mono text-gray-500">LIVE</span>
          </div>
          
          {/* Statistiques en temps réel */}
          <div className="flex gap-4">
            <motion.div 
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <div className="text-xs text-gray-500 font-mono">Packets/sec</div>
              <div className="text-lg font-mono text-accent-primary">{networkStats.totalPackets.toLocaleString()}</div>
            </motion.div>
            <motion.div 
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
            >
              <div className="text-xs text-gray-500 font-mono">Bandwidth</div>
              <div className="text-lg font-mono text-neon-blue">{networkStats.bandwidth} Mbps</div>
            </motion.div>
            <motion.div 
              className="text-center"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
            >
              <div className="text-xs text-gray-500 font-mono">Connections</div>
              <div className="text-lg font-mono text-purple-400">{networkStats.activeConnections}</div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Sélecteur de vue */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex gap-2"
      >
        {['topology', 'traffic', 'threats', 'performance'].map((view, index) => (
          <motion.button
            key={view}
            onClick={() => setSelectedView(view)}
            className={`px-4 py-2 text-sm font-mono rounded-lg transition-all ${
              selectedView === view
                ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
            }`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            {view.charAt(0).toUpperCase() + view.slice(1)}
          </motion.button>
        ))}
      </motion.div>

      {/* Contenu principal */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {selectedView === 'topology' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Topologie réseau */}
              <div className="lg:col-span-2 glass p-6">
                <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Network Topology</h3>
                <div className="relative h-96 bg-cyber-surface/20 rounded-lg border border-white/5">
                  <svg className="absolute inset-0 w-full h-full">
                    {/* Connexions */}
                    {data?.topology?.map((node, i) => 
                      node.connections?.map((targetId, j) => {
                        const target = data.topology.find(n => n.id === targetId)
                        if (!target) return null
                        return (
                          <motion.line
                            key={`${node.id}-${targetId}`}
                            x1={node.x}
                            y1={node.y}
                            x2={target.x}
                            y2={target.y}
                            stroke={getStatusColor(node.status)}
                            strokeWidth="2"
                            strokeOpacity="0.3"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{ delay: (i * node.connections.length + j) * 0.1 }}
                          />
                        )
                      })
                    )}
                    
                    {/* Nœuds */}
                    {data?.topology?.map((node, i) => (
                      <motion.g
                        key={node.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <circle
                          cx={node.x}
                          cy={node.y}
                          r="20"
                          fill={getStatusColor(node.status)}
                          fillOpacity="0.2"
                          stroke={getStatusColor(node.status)}
                          strokeWidth="2"
                        />
                        <foreignObject x={node.x - 12} y={node.y - 12} width="24" height="24">
                          <div className="flex items-center justify-center text-white">
                            {getNodeIcon(node.type)}
                          </div>
                        </foreignObject>
                        <text
                          x={node.x}
                          y={node.y + 35}
                          textAnchor="middle"
                          className="text-xs font-mono fill-gray-400"
                        >
                          {node.name}
                        </text>
                        <text
                          x={node.x}
                          y={node.y + 48}
                          textAnchor="middle"
                          className="text-xs font-mono fill-accent-primary"
                        >
                          {node.load}%
                        </text>
                      </motion.g>
                    ))}
                  </svg>
                </div>
              </div>

              {/* Légende et statistiques */}
              <div className="space-y-4">
                <div className="glass p-4">
                  <h4 className="font-display text-sm tracking-wider text-gray-300 mb-3">Node Status</h4>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-400" />
                      <span className="text-xs font-mono text-gray-400">Active</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-400" />
                      <span className="text-xs font-mono text-gray-400">Warning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-400" />
                      <span className="text-xs font-mono text-gray-400">Critical</span>
                    </div>
                  </div>
                </div>

                <div className="glass p-4">
                  <h4 className="font-display text-sm tracking-wider text-gray-300 mb-3">Quick Stats</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">Total Nodes</span>
                        <span className="text-accent-primary">{data?.topology?.length || 0}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">Active Connections</span>
                        <span className="text-green-400">{data?.topology?.filter(n => n.status === 'active').length || 0}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-gray-400">Avg Load</span>
                        <span className="text-yellow-400">{Math.round(data?.topology?.reduce((acc, n) => acc + n.load, 0) / (data?.topology?.length || 1))}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {selectedView === 'traffic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Graphique de trafic */}
              <div className="glass p-6">
                <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Traffic Analysis</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data?.traffic || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="hour" stroke="#8892b0" fontSize={10} />
                    <YAxis stroke="#8892b0" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid rgba(100,255,218,0.3)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Area type="monotone" dataKey="inbound" stackId="1" stroke="#64ffda" fill="#64ffda" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="outbound" stackId="1" stroke="#00b4d8" fill="#00b4d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Trafic en temps réel */}
              <div className="glass p-6">
                <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Real-time Traffic</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={realTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="timestamp" stroke="#8892b0" fontSize={10} />
                    <YAxis stroke="#8892b0" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid rgba(100,255,218,0.3)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Line type="monotone" dataKey="packets" stroke="#64ffda" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="bandwidth" stroke="#ffa62b" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="threats" stroke="#ff2d55" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {selectedView === 'threats' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Distribution des menaces */}
              <div className="glass p-6">
                <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Threat Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={data?.threats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="type" stroke="#8892b0" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#8892b0" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1a1a2e', 
                        border: '1px solid rgba(100,255,218,0.3)',
                        borderRadius: '8px'
                      }} 
                    />
                    <Bar dataKey="count" fill="#64ffda">
                      {data?.threats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={
                          entry.severity === 'critical' ? '#ff2d55' :
                          entry.severity === 'high' ? '#ff6b35' :
                          entry.severity === 'medium' ? '#ffa62b' : '#00b4d8'
                        } />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Analyse des menaces */}
              <div className="glass p-6">
                <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Threat Intelligence</h3>
                <div className="space-y-4">
                  {data?.threats?.map((threat, index) => (
                    <motion.div
                      key={threat.type}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 bg-cyber-surface/20 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          threat.severity === 'critical' ? 'bg-severity-critical' :
                          threat.severity === 'high' ? 'bg-severity-high' :
                          threat.severity === 'medium' ? 'bg-severity-medium' : 'bg-severity-low'
                        }`} />
                        <div>
                          <div className="text-sm font-mono text-gray-300">{threat.type}</div>
                          <div className="text-xs font-mono text-gray-500">{threat.severity}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-mono text-accent-primary">{threat.count}</div>
                        <div className="text-xs font-mono text-gray-500">
                          {threat.trend === 'up' ? '↑' : threat.trend === 'down' ? '↓' : '→'} {threat.trend}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {selectedView === 'performance' && (
            <div className="glass p-6">
              <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Performance Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                    className="inline-block mb-4"
                  >
                    <Cpu className="w-12 h-12 text-accent-primary mx-auto" />
                  </motion.div>
                  <div className="text-2xl font-mono text-accent-primary">87%</div>
                  <div className="text-xs font-mono text-gray-500">CPU Usage</div>
                </div>
                <div className="text-center">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Database className="w-12 h-12 text-neon-blue mx-auto" />
                  </motion.div>
                  <div className="text-2xl font-mono text-neon-blue">64%</div>
                  <div className="text-xs font-mono text-gray-500">Memory Usage</div>
                </div>
                <div className="text-center">
                  <motion.div
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="inline-block mb-4"
                  >
                    <Zap className="w-12 h-12 text-purple-400 mx-auto" />
                  </motion.div>
                  <div className="text-2xl font-mono text-purple-400">12ms</div>
                  <div className="text-xs font-mono text-gray-500">Avg Latency</div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
