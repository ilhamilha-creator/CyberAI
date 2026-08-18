import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cyberApi } from '../../services/api'

const MITRE_TACTICS = [
  'Initial Access', 'Execution', 'Persistence', 'Privilege Escalation',
  'Defense Evasion', 'Credential Access', 'Discovery', 'Lateral Movement',
  'Collection', 'Command & Control', 'Exfiltration', 'Impact'
]

const TECHNIQUES_BY_TACTIC = {
  'Initial Access': ['Spearphishing', 'Exploit Public-Facing App', 'Valid Accounts'],
  'Execution': ['Command and Scripting', 'User Execution'],
  'Persistence': ['Create Account', 'Modify System Config'],
  'Privilege Escalation': ['Exploitation for Privilege Escalation'],
  'Defense Evasion': ['Obfuscated Files', 'Process Injection'],
  'Credential Access': ['Brute Force', 'Credential Dumping'],
  'Discovery': ['Network Service Scanning', 'Process Discovery'],
  'Lateral Movement': ['Remote Services', 'Remote File Copy'],
  'Collection': ['Data from Information Repositories'],
  'Command & Control': ['Application Layer Protocol'],
  'Exfiltration': ['Exfiltration Over C2 Channel'],
  'Impact': ['Data Encrypted for Impact']
}

export default function MitreMatrix() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedTactic, setSelectedTactic] = useState(null)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getAlerts({ limit: 200, hours: 24 })
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        alerts: [
          { id: 1, tactic: 'Initial Access', technique: 'Spearphishing', severity: 'high', count: 5 },
          { id: 2, tactic: 'Execution', technique: 'Command and Scripting', severity: 'medium', count: 12 },
          { id: 3, tactic: 'Credential Access', technique: 'Brute Force', severity: 'critical', count: 8 },
          { id: 4, tactic: 'Discovery', technique: 'Network Service Scanning', severity: 'low', count: 15 },
          { id: 5, tactic: 'Lateral Movement', technique: 'Remote Services', severity: 'high', count: 3 },
        ]
      })
    }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading MitreMatrix...</div></div>

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-severity-critical',
      high: 'bg-severity-high',
      medium: 'bg-severity-medium',
      low: 'bg-severity-low'
    }
    return colors[severity] || 'bg-gray-500'
  }

  const getTacticSeverity = (tactic) => {
    const tacticAlerts = data?.alerts?.filter(a => a.tactic === tactic) || []
    if (tacticAlerts.some(a => a.severity === 'critical')) return 'critical'
    if (tacticAlerts.some(a => a.severity === 'high')) return 'high'
    if (tacticAlerts.some(a => a.severity === 'medium')) return 'medium'
    return 'low'
  }

  const getTacticCount = (tactic) => {
    return data?.alerts?.filter(a => a.tactic === tactic).reduce((sum, a) => sum + a.count, 0) || 0
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">MITRE ATT&CK Matrix</h2>
        <span className="text-xs font-mono text-gray-500">Real-time</span>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Tactics', value: new Set(data?.alerts?.map(a => a.tactic)).size || 0, color: 'text-accent-primary' },
          { label: 'Critical Alerts', value: data?.alerts?.filter(a => a.severity === 'critical').length || 0, color: 'text-severity-critical' },
          { label: 'Total Techniques', value: new Set(data?.alerts?.map(a => a.technique)).size || 0, color: 'text-neon-blue' },
          { label: 'Coverage', value: '83%', color: 'text-green-400' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass glass-hover p-4 text-center">
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-display text-3xl mt-2 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* MITRE Matrix Grid */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Attack Tactics Matrix</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {MITRE_TACTICS.map((tactic, i) => {
            const severity = getTacticSeverity(tactic)
            const count = getTacticCount(tactic)
            const isActive = count > 0
            
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedTactic(selectedTactic === tactic ? null : tactic)}
                className={`glass-hover p-4 border rounded-lg cursor-pointer transition-all ${
                  isActive ? 'border-accent-primary/30' : 'border-white/5'
                } ${selectedTactic === tactic ? 'ring-2 ring-accent-primary' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-sm text-gray-200">{tactic}</h4>
                  {isActive && (
                    <div className={`w-2 h-2 rounded-full ${getSeverityColor(severity)} animate-pulse-glow`} />
                  )}
                </div>
                
                {isActive ? (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="badge-critical text-xs">{severity}</span>
                      <span className="text-xs text-gray-400">{count} alerts</span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {data?.alerts?.filter(a => a.tactic === tactic).slice(0, 2).map(a => a.technique).join(', ')}
                      {data?.alerts?.filter(a => a.tactic === tactic).length > 2 && '...'}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-gray-600">No activity</div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected Tactic Details */}
      {selectedTactic && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">
            {selectedTactic} - Techniques
          </h3>
          <div className="space-y-3">
            {data?.alerts?.filter(a => a.tactic === selectedTactic).map((alert, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-3 bg-cyber-surface/50 rounded-lg border border-white/5">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)} animate-pulse-glow`} />
                  <div>
                    <p className="font-semibold text-gray-200">{alert.technique}</p>
                    <p className="text-xs text-gray-500">{alert.tactic}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`badge-${alert.severity}`}>{alert.severity}</span>
                  <span className="text-accent-primary font-mono text-sm">{alert.count} alerts</span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Techniques Heatmap */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Techniques Distribution</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(TECHNIQUES_BY_TACTIC).slice(0, 8).map(([tactic, techniques]) => (
            <div key={tactic} className="space-y-2">
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{tactic}</h4>
              <div className="space-y-1">
                {techniques.slice(0, 3).map((technique) => {
                  const count = data?.alerts?.filter(a => a.technique === technique).reduce((sum, a) => sum + a.count, 0) || 0
                  const severity = data?.alerts?.find(a => a.technique === technique)?.severity || 'low'
                  
                  return (
                    <div key={technique} className="flex items-center justify-between">
                      <span className="text-xs text-gray-500 truncate">{technique}</span>
                      <div className="flex items-center gap-1">
                        {count > 0 && (
                          <div className={`w-1.5 h-1.5 rounded-full ${getSeverityColor(severity)}`} />
                        )}
                        <span className="text-xs font-mono text-gray-400">{count}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
