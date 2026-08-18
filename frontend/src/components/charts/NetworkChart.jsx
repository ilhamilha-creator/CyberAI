import React, { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { motion } from 'framer-motion'
import { cyberApi } from '../../services/api'

export default function NetworkChart() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState('1h')

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [timeRange])

  const loadData = async () => {
    try {
      const res = await cyberApi.getTimeline(timeRange === '1h' ? 1 : timeRange === '6h' ? 6 : 24)
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      const now = new Date()
      const points = timeRange === '1h' ? 12 : timeRange === '6h' ? 24 : 48
      const demoData = Array.from({ length: points }, (_, i) => {
        const time = new Date(now.getTime() - (points - i) * (timeRange === '1h' ? 5 * 60 * 1000 : timeRange === '6h' ? 15 * 60 * 1000 : 30 * 60 * 1000))
        return {
          time: time.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
          bandwidth: Math.floor(Math.random() * 1000) + 500,
          packets: Math.floor(Math.random() * 5000) + 2000,
          alerts: Math.floor(Math.random() * 10),
          connections: Math.floor(Math.random() * 200) + 100
        }
      })
      setData({ timeline: demoData })
    }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading Network...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Network Monitoring</h2>
        <div className="flex items-center gap-2">
          {['1h', '6h', '24h'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-xs font-mono rounded transition-all ${
                timeRange === range
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary'
                  : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Network Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Bandwidth', value: '2.4 GB/s', color: 'text-accent-primary', unit: '↑ 1.2 GB/s ↓ 1.2 GB/s' },
          { label: 'Connections', value: '1,247', color: 'text-neon-blue', unit: 'Active sessions' },
          { label: 'Packets/sec', value: '8.5K', color: 'text-green-400', unit: 'Avg last minute' },
          { label: 'Alerts', value: data?.timeline?.reduce((sum, d) => sum + d.alerts, 0) || 0, color: 'text-severity-high', unit: 'Last period' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass glass-hover p-4">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-display text-2xl mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-600 mt-1">{stat.unit}</p>
          </motion.div>
        ))}
      </div>

      {/* Bandwidth Chart */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Bandwidth Usage</h3>
        <ResponsiveContainer width="100%" height={250}>
          <AreaChart data={data?.timeline || []}>
            <defs>
              <linearGradient id="bandwidthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#64ffda" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#64ffda" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
            <XAxis 
              dataKey="time" 
              stroke="#666" 
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <YAxis 
              stroke="#666" 
              fontSize={12}
              tick={{ fill: '#666' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0c1628', 
                border: '1px solid #64ffda33',
                borderRadius: '8px'
              }}
              labelStyle={{ color: '#64ffda' }}
            />
            <Area 
              type="monotone" 
              dataKey="bandwidth" 
              stroke="#64ffda" 
              strokeWidth={2}
              fill="url(#bandwidthGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Packets & Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Packet Rate</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                fontSize={11}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={11}
                tick={{ fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0c1628', 
                  border: '1px solid #00b4d833',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#00b4d8' }}
              />
              <Line 
                type="monotone" 
                dataKey="packets" 
                stroke="#00b4d8" 
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Security Alerts</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data?.timeline || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" />
              <XAxis 
                dataKey="time" 
                stroke="#666" 
                fontSize={11}
                tick={{ fill: '#666' }}
              />
              <YAxis 
                stroke="#666" 
                fontSize={11}
                tick={{ fill: '#666' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#0c1628', 
                  border: '1px solid #ff6b3533',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: '#ff6b35' }}
              />
              <Line 
                type="monotone" 
                dataKey="alerts" 
                stroke="#ff6b35" 
                strokeWidth={2}
                dot={{ fill: '#ff6b35', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Connection Table */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Top Connections</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 uppercase border-b border-white/5">
                <th className="py-2 text-left">Source IP</th>
                <th className="text-left">Destination</th>
                <th className="text-left">Protocol</th>
                <th className="text-left">Bytes</th>
                <th className="text-left">Duration</th>
                <th className="text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { src: '192.168.1.100', dst: '10.0.0.50', proto: 'HTTPS', bytes: '2.4 MB', duration: '12s', status: 'active' },
                { src: '172.16.0.25', dst: '8.8.8.8', proto: 'DNS', bytes: '512 B', duration: '0.1s', status: 'completed' },
                { src: '10.0.0.15', dst: '192.168.1.200', proto: 'SSH', bytes: '1.2 MB', duration: '45s', status: 'active' },
                { src: '192.168.1.50', dst: '10.0.0.100', proto: 'HTTP', bytes: '5.6 MB', duration: '8s', status: 'completed' },
              ].map((conn, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2 font-mono text-xs text-accent-primary">{conn.src}</td>
                  <td className="font-mono text-xs">{conn.dst}</td>
                  <td className="text-xs">{conn.proto}</td>
                  <td className="text-xs font-mono">{conn.bytes}</td>
                  <td className="text-xs font-mono">{conn.duration}</td>
                  <td className="text-xs">
                    <span className={`${
                      conn.status === 'active' 
                        ? 'text-green-400' 
                        : 'text-gray-400'
                    }`}>
                      {conn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  )
}
