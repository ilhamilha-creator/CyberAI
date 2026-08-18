import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, AlertTriangle, Eye, Clock, Target, Activity } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function ThreatIntel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getThreatIntel()
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        threats: [
          {
            id: 1,
            name: "APT-28 Campaign",
            type: "APT",
            severity: "critical",
            confidence: 95,
            description: "State-sponsored attack targeting critical infrastructure",
            indicators: [
              { type: "ip", value: "192.168.1.100", confidence: 85 },
              { type: "domain", value: "malicious.example.com", confidence: 92 }
            ],
            affected_assets: 12,
            status: "active"
          }
        ],
        total: 1
      })
    }
    finally { setLoading(false) }
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-severity-critical bg-severity-critical/20'
      case 'high': return 'text-severity-high bg-severity-high/20'
      case 'medium': return 'text-severity-medium bg-severity-medium/20'
      default: return 'text-severity-low bg-severity-low/20'
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-green-400 bg-green-400/20'
      case 'investigating': return 'text-yellow-400 bg-yellow-400/20'
      case 'monitoring': return 'text-blue-400 bg-blue-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading ThreatIntel...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Threat Intelligence</h2>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs font-mono text-gray-500">Real-time</span>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-accent-primary" />
          <div className="text-2xl font-mono text-accent-primary">{data?.total || 0}</div>
          <div className="text-xs font-mono text-gray-400">Active Threats</div>
        </div>
        <div className="glass p-4 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-severity-critical" />
          <div className="text-2xl font-mono text-severity-critical">
            {data?.threats?.filter(t => t.severity === 'critical').length || 0}
          </div>
          <div className="text-xs font-mono text-gray-400">Critical</div>
        </div>
        <div className="glass p-4 text-center">
          <Target className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
          <div className="text-2xl font-mono text-neon-blue">
            {data?.threats?.reduce((sum, t) => sum + t.affected_assets, 0) || 0}
          </div>
          <div className="text-xs font-mono text-gray-400">Assets Affected</div>
        </div>
        <div className="glass p-4 text-center">
          <Eye className="w-8 h-8 mx-auto mb-2 text-purple-400" />
          <div className="text-2xl font-mono text-purple-400">
            {Math.round(data?.threats?.reduce((sum, t) => sum + t.confidence, 0) / (data?.threats?.length || 1)) || 0}%
          </div>
          <div className="text-xs font-mono text-gray-400">Avg Confidence</div>
        </div>
      </div>

      {/* Threats List */}
      <div className="space-y-4">
        {data?.threats?.map((threat, index) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-display text-lg tracking-wider text-gray-200 mb-2">{threat.name}</h3>
                <p className="text-sm text-gray-400 mb-3">{threat.description}</p>
                <div className="flex gap-2 flex-wrap">
                  <span className={`px-2 py-1 rounded text-xs font-mono ${getSeverityColor(threat.severity)}`}>
                    {threat.severity.toUpperCase()}
                  </span>
                  <span className={`px-2 py-1 rounded text-xs font-mono ${getStatusColor(threat.status)}`}>
                    {threat.status}
                  </span>
                  <span className="px-2 py-1 rounded text-xs font-mono bg-cyber-surface/30 text-gray-400">
                    {threat.type}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-gray-400">Confidence</div>
                <div className="text-lg font-mono text-accent-primary">{threat.confidence}%</div>
              </div>
            </div>

            {/* Indicators */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-sm font-mono text-gray-400 mb-2">Indicators</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {threat.indicators.map((indicator, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-cyber-surface/30 rounded p-2">
                    <span className="text-xs font-mono text-gray-500">{indicator.type}:</span>
                    <span className="text-xs font-mono text-accent-primary">{indicator.value}</span>
                    <span className="text-xs font-mono text-gray-400 ml-auto">{indicator.confidence}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Metadata */}
            <div className="flex justify-between items-center mt-4 text-xs font-mono text-gray-500">
              <span>Assets: {threat.affected_assets}</span>
              <span>Last seen: {new Date(threat.last_seen).toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
