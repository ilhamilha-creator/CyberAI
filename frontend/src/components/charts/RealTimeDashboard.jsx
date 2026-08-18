import React, { useState, useEffect } from 'react'
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion, AnimatePresence } from 'framer-motion'
import { Activity, TrendingUp, AlertTriangle, Shield, Cpu, Database, Zap, Target, Brain, Globe, Lock, Eye, Flame, Radio, Radar, Sparkles } from 'lucide-react'
import { cyberApi } from '../../services/api'

// Simulated data for demo when backend is not available
const simulatedData = {
  metrics: {
    kpis: {
      total_alerts: 1247,
      critical_alerts: 23,
      high_alerts: 156,
      medium_alerts: 423,
      new_alerts: 89
    }
  },
  timeline: [
    { time: '00:00', alerts: 45 },
    { time: '04:00', alerts: 32 },
    { time: '08:00', alerts: 78 },
    { time: '12:00', alerts: 156 },
    { time: '16:00', alerts: 234 },
    { time: '20:00', alerts: 189 },
    { time: '24:00', alerts: 167 }
  ],
  distribution: [
    { name: 'DDoS', value: 35 },
    { name: 'Phishing', value: 25 },
    { name: 'Malware', value: 20 },
    { name: 'SQL Injection', value: 12 },
    { name: 'XSS', value: 8 }
  ],
  alerts: [
    { severity: 'critical', message: 'DDoS attack detected from IP 192.168.1.100', timestamp: '2 min ago' },
    { severity: 'high', message: 'Suspicious login attempt from unknown location', timestamp: '5 min ago' },
    { severity: 'medium', message: 'Unusual data transfer pattern detected', timestamp: '12 min ago' },
    { severity: 'high', message: 'Malware signature found in incoming traffic', timestamp: '18 min ago' },
    { severity: 'low', message: 'Port scan activity detected', timestamp: '25 min ago' }
  ]
}

const heroImages = [
  'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80',
  'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
  'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80'
]

export default function RealTimeDashboard() {
  const [data, setData] = useState(simulatedData)
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState('1h')
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0)
  const [animatedValues, setAnimatedValues] = useState({
    total_alerts: 0,
    critical_alerts: 0,
    bandwidth: 0,
    cpu: 0,
    memory: 0
  })

  // Hero image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % heroImages.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  // Animate values
  useEffect(() => {
    const interval = setInterval(() => {
      setAnimatedValues(prev => ({
        total_alerts: Math.min(prev.total_alerts + 50, data?.metrics?.kpis?.total_alerts || 1247),
        critical_alerts: Math.min(prev.critical_alerts + 2, data?.metrics?.kpis?.critical_alerts || 23),
        bandwidth: Math.min(prev.bandwidth + 10, 850),
        cpu: Math.min(prev.cpu + 5, 65),
        memory: Math.min(prev.memory + 5, 72)
      }))
    }, 50)
    return () => clearInterval(interval)
  }, [data])

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          kpis: {
            ...prev.metrics.kpis,
            total_alerts: prev.metrics.kpis.total_alerts + Math.floor(Math.random() * 5),
            new_alerts: prev.metrics.kpis.new_alerts + Math.floor(Math.random() * 3)
          }
        }
      }))
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  const kpiCards = [
    { 
      label: 'Total Alerts', 
      value: animatedValues.total_alerts, 
      color: 'from-cyan-400 to-blue-500', 
      icon: AlertTriangle, 
      trend: '+12%',
      bgColor: 'bg-cyan-500/10',
      borderColor: 'border-cyan-500/30'
    },
    { 
      label: 'Critical', 
      value: animatedValues.critical_alerts, 
      color: 'from-red-400 to-orange-500', 
      icon: Shield, 
      trend: '+3%',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30'
    },
    { 
      label: 'High', 
      value: Math.floor(animatedValues.total_alerts * 0.12), 
      color: 'from-orange-400 to-yellow-500', 
      icon: TrendingUp, 
      trend: '+8%',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30'
    },
    { 
      label: 'Medium', 
      value: Math.floor(animatedValues.total_alerts * 0.34), 
      color: 'from-yellow-400 to-amber-500', 
      icon: Activity, 
      trend: '-5%',
      bgColor: 'bg-yellow-500/10',
      borderColor: 'border-yellow-500/30'
    },
    { 
      label: 'Bandwidth', 
      value: `${animatedValues.bandwidth} MB/s`, 
      color: 'from-green-400 to-teal-500', 
      icon: Zap, 
      trend: '+15%',
      bgColor: 'bg-green-500/10',
      borderColor: 'border-green-500/30'
    },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-8"
    >
      {/* Hero Section with Animated Background */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden h-64 cyber-card"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentHeroIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 0.3, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 1.5 }}
            className="absolute inset-0"
          >
            <img
              src={heroImages[currentHeroIndex]}
              alt="Cyber Security"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-ink via-cyber-ink/80 to-transparent" />
          </motion.div>
        </AnimatePresence>

        <div className="relative z-10 p-8 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <motion.h1
              className="font-display text-5xl font-bold text-white mb-4"
              animate={{
                backgroundPosition: ['0%', '100%', '0%'],
              }}
              style={{
                background: 'linear-gradient(90deg, #64ffda, #00b4d8, #7c3aed, #64ffda)',
                backgroundSize: '300% 100%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
              transition={{ duration: 5, repeat: Infinity }}
            >
              CYBERAI DASHBOARD
            </motion.h1>
            <p className="text-xl text-gray-300 font-light max-w-2xl">
              Advanced AI-Powered Security Operations Center
            </p>
          </motion.div>

          <motion.div
            className="flex items-center gap-6 mt-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <motion.div
                className="w-3 h-3 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              <span className="text-sm text-white font-medium">LIVE MONITORING</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Radio className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-white font-medium">AI ACTIVE</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20">
              <Shield className="w-4 h-4 text-accent-primary" />
              <span className="text-sm text-white font-medium">PROTECTED</span>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* KPI Cards with Glass Effect */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        {kpiCards.map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1, type: 'spring', stiffness: 200 }}
            whileHover={{ 
              scale: 1.05, 
              y: -5,
              boxShadow: '0 20px 40px rgba(100,255,218,0.3)'
            }}
            className={`cyber-card p-6 relative overflow-hidden group cursor-pointer ${kpi.bgColor} ${kpi.borderColor}`}
          >
            {/* Animated Background Gradient */}
            <motion.div
              className={`absolute inset-0 bg-gradient-to-br ${kpi.color} opacity-0 group-hover:opacity-10 transition-opacity`}
              animate={{
                opacity: [0, 0.1, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: i * 0.5
              }}
            />

            <div className="relative z-10">
              <motion.div
                className="mb-4"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 4, 
                  repeat: Infinity,
                  delay: i * 0.8
                }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${kpi.color} flex items-center justify-center shadow-lg`}>
                  <kpi.icon className="w-6 h-6 text-white" />
                </div>
              </motion.div>

              <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold mb-2">
                {kpi.label}
              </p>

              <motion.p
                className={`font-display text-3xl font-bold bg-gradient-to-r ${kpi.color} bg-clip-text text-transparent`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: 'spring',
                  stiffness: 200,
                  delay: i * 0.1 + 0.3
                }}
              >
                {typeof kpi.value === 'number' ? kpi.value.toLocaleString() : kpi.value}
              </motion.p>

              <motion.div
                className={`mt-2 flex items-center gap-1 text-sm font-medium ${
                  kpi.trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {kpi.trend.startsWith('+') ? <TrendingUp size={14} /> : <Activity size={14} />}
                {kpi.trend}
              </motion.div>
            </div>

            {/* Decorative Elements */}
            <motion.div
              className="absolute -top-10 -right-10 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            />
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="cyber-card p-6 relative overflow-hidden"
        >
          <motion.div
            className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-full blur-2xl"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-display text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent-primary" />
                Alert Timeline
              </h3>
              <div className="flex gap-2">
                {['1h', '6h', '24h'].map((range) => (
                  <motion.button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1 text-xs font-mono rounded-lg transition-all ${
                      timeRange === range
                        ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary'
                        : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {range}
                  </motion.button>
                ))}
              </div>
            </div>

            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data?.timeline || []}>
                <defs>
                  <linearGradient id="colorTimeline" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#64ffda" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#64ffda" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="time" stroke="#8892b0" fontSize={12} />
                <YAxis stroke="#8892b0" fontSize={12} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(12,22,40,0.9)', 
                    border: '1px solid rgba(100,255,218,0.3)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#64ffda' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="alerts" 
                  stroke="#64ffda" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorTimeline)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="cyber-card p-6 relative overflow-hidden"
        >
          <motion.div
            className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-purple-500/10 to-transparent rounded-full blur-2xl"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />

          <div className="relative z-10">
            <h3 className="text-lg font-display text-white mb-6 flex items-center gap-2">
              <Target className="w-5 h-5 text-accent-primary" />
              Attack Distribution
            </h3>

            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={data?.distribution || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {['#ff2d55', '#ff6b35', '#ffa62b', '#00b4d8', '#64ffda'].map((color, i) => (
                    <Cell key={`cell-${i}`} fill={color} stroke="rgba(12,22,40,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(12,22,40,0.9)', 
                    border: '1px solid rgba(100,255,218,0.3)', 
                    borderRadius: '12px',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ color: '#64ffda' }}
                />
              </PieChart>
            </ResponsiveContainer>

            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {data?.distribution?.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: ['#ff2d55', '#ff6b35', '#ffa62b', '#00b4d8', '#64ffda'][i] }}
                  />
                  <span className="text-xs text-gray-400">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Alerts with Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="cyber-card p-6 relative overflow-hidden"
      >
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-b from-accent-primary/5 to-transparent rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity }}
        />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-display text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-accent-primary" />
              Recent Alerts
            </h3>
            <motion.button
              className="px-4 py-2 bg-accent-primary/10 text-accent-primary rounded-lg text-sm font-medium hover:bg-accent-primary/20 transition-all border border-accent-primary/30"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View All
            </motion.button>
          </div>

          <div className="space-y-3">
            {(data?.alerts || []).map((alert, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ x: 5 }}
                className="group flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all border border-white/5 hover:border-accent-primary/30"
              >
                <div className="flex items-center gap-4">
                  <motion.div
                    className={`w-3 h-3 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-500 shadow-lg shadow-red-500/50' :
                      alert.severity === 'high' ? 'bg-orange-500 shadow-lg shadow-orange-500/50' :
                      alert.severity === 'medium' ? 'bg-yellow-500 shadow-lg shadow-yellow-500/50' : 'bg-blue-500 shadow-lg shadow-blue-500/50'
                    }`}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />
                  <div>
                    <p className="text-sm text-gray-200 font-medium group-hover:text-accent-primary transition-colors">
                      {alert.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1 font-mono">
                      {alert.severity.toUpperCase()} • {alert.timestamp}
                    </p>
                  </div>
                </div>
                <motion.button
                  className="p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <Eye className="w-4 h-4 text-gray-400 hover:text-accent-primary" />
                </motion.button>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Additional Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="cyber-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold">AI Analysis</h4>
              <p className="text-xs text-gray-400">Real-time threat detection</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Model Accuracy</span>
              <span className="text-accent-primary font-mono">98.7%</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '98.7%' }}
                transition={{ duration: 1.5, delay: 0.7 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="cyber-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Network Status</h4>
              <p className="text-xs text-gray-400">Global connectivity</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Active Connections</span>
              <span className="text-accent-primary font-mono">12,847</span>
            </div>
            <div className="flex gap-1">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  className="flex-1 h-2 bg-green-500/50 rounded-full"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.3, 1, 0.3] }}
                  transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                />
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="cyber-card p-6 relative overflow-hidden"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <Flame className="w-6 h-6 text-white" />
            </div>
            <div>
              <h4 className="text-white font-semibold">Threat Level</h4>
              <p className="text-xs text-gray-400">Current risk assessment</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Risk Score</span>
              <span className="text-orange-400 font-mono">MEDIUM</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-2">
              <motion.div
                className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: '45%' }}
                transition={{ duration: 1.5, delay: 0.9 }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}