import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cyberApi } from '../services/api'

export default function AttackMap() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getThreats()
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        attacks: [
          { id: 1, lat: 48.8566, lng: 2.3522, city: 'Paris', severity: 'critical', count: 15 },
          { id: 2, lat: 40.7128, lng: -74.0060, city: 'New York', severity: 'high', count: 8 },
          { id: 3, lat: 51.5074, lng: -0.1278, city: 'London', severity: 'medium', count: 5 },
          { id: 4, lat: 35.6762, lng: 139.6503, city: 'Tokyo', severity: 'low', count: 3 },
        ]
      })
    }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading AttackMap...</div></div>

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-severity-critical',
      high: 'bg-severity-high', 
      medium: 'bg-severity-medium',
      low: 'bg-severity-low'
    }
    return colors[severity] || 'bg-gray-500'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Global Attack Map</h2>
        <span className="text-xs font-mono text-gray-500">Real-time</span>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Attacks', value: data?.attacks?.length || 0, color: 'text-accent-primary' },
          { label: 'Critical', value: data?.attacks?.filter(a => a.severity === 'critical').length || 0, color: 'text-severity-critical' },
          { label: 'High', value: data?.attacks?.filter(a => a.severity === 'high').length || 0, color: 'text-severity-high' },
          { label: 'Countries', value: new Set(data?.attacks?.map(a => a.city)).size || 0, color: 'text-neon-blue' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass glass-hover p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-display text-3xl mt-2 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Attack List */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Active Threat Locations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(data?.attacks || []).map((attack) => (
            <motion.div key={attack.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-hover p-4 border border-white/5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(attack.severity)} animate-pulse-glow`} />
                  <span className="font-semibold text-gray-200">{attack.city}</span>
                </div>
                <span className={`badge-${attack.severity}`}>{attack.severity}</span>
              </div>
              <div className="text-sm text-gray-400">
                <p>Lat: {attack.lat.toFixed(4)}, Lng: {attack.lng.toFixed(4)}</p>
                <p>Attack Count: <span className="text-accent-primary font-mono">{attack.count}</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="glass p-8 text-center">
        <div className="w-full h-64 bg-cyber-surface/50 rounded-lg flex items-center justify-center border-2 border-dashed border-white/10">
          <div>
            <div className="text-4xl mb-2">🗺️</div>
            <p className="text-gray-400 font-mono text-sm">Interactive Map Integration</p>
            <p className="text-gray-500 text-xs mt-1">Leaflet/MapBox coming soon</p>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
