import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shield, Target, Zap, AlertTriangle, Activity, Clock, Eye, Lock, TrendingUp } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function KillChain() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getKillChain()
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        phases: [
          {
            phase: "Reconnaissance",
            status: "active",
            indicators: 18,
            severity: "medium",
            description: "Active reconnaissance activities detected",
            last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            threat_level: 5
          },
          {
            phase: "Weaponization",
            status: "monitoring",
            indicators: 12,
            severity: "high",
            description: "Malware preparation observed",
            last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            threat_level: 7
          },
          {
            phase: "Delivery",
            status: "active",
            indicators: 28,
            severity: "critical",
            description: "Multiple delivery vectors in use",
            last_activity: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
            threat_level: 9
          },
          {
            phase: "Exploitation",
            status: "investigating",
            indicators: 15,
            severity: "critical",
            description: "Vulnerability exploitation attempts",
            last_activity: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
            threat_level: 8
          },
          {
            phase: "Installation",
            status: "monitoring",
            indicators: 8,
            severity: "high",
            description: "Persistent installation detected",
            last_activity: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
            threat_level: 6
          },
          {
            phase: "Command & Control",
            status: "active",
            indicators: 22,
            severity: "critical",
            description: "C2 communications established",
            last_activity: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
            threat_level: 9
          },
          {
            phase: "Actions on Objectives",
            status: "blocked",
            indicators: 5,
            severity: "medium",
            description: "Objective attempts blocked",
            last_activity: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            threat_level: 3
          }
        ],
        total_indicators: 108,
        active_phases: 3,
        critical_phases: 3,
        last_updated: new Date().toISOString()
      })
    }
    finally { setLoading(false) }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'active': return <Activity className="w-4 h-4 text-red-400 animate-pulse" />
      case 'monitoring': return <Eye className="w-4 h-4 text-yellow-400" />
      case 'investigating': return <Target className="w-4 h-4 text-orange-400" />
      case 'blocked': return <Lock className="w-4 h-4 text-green-400" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'text-red-400 bg-red-400/20'
      case 'monitoring': return 'text-yellow-400 bg-yellow-400/20'
      case 'investigating': return 'text-orange-400 bg-orange-400/20'
      case 'blocked': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'text-red-400 bg-red-400/20'
      case 'high': return 'text-orange-400 bg-orange-400/20'
      case 'medium': return 'text-yellow-400 bg-yellow-400/20'
      case 'low': return 'text-green-400 bg-green-400/20'
      default: return 'text-gray-400 bg-gray-400/20'
    }
  }

  const getThreatLevelColor = (level) => {
    if (level >= 8) return 'text-red-400'
    if (level >= 6) return 'text-orange-400'
    if (level >= 4) return 'text-yellow-400'
    return 'text-green-400'
  }

  const getPhaseIcon = (phase) => {
    const icons = {
      'Reconnaissance': <Eye className="w-6 h-6" />,
      'Weaponization': <Zap className="w-6 h-6" />,
      'Delivery': <Target className="w-6 h-6" />,
      'Exploitation': <AlertTriangle className="w-6 h-6" />,
      'Installation': <Shield className="w-6 h-6" />,
      'Command & Control': <Activity className="w-6 h-6" />,
      'Actions on Objectives': <Lock className="w-6 h-6" />
    }
    return icons[phase] || <Clock className="w-6 h-6" />
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading KillChain...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Cyber Kill Chain</h2>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-red-400 animate-pulse" />
          <span className="text-xs font-mono text-gray-500">Real-time</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-4 text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-accent-primary" />
          <div className="text-2xl font-mono text-accent-primary">{data?.total_indicators || 0}</div>
          <div className="text-xs font-mono text-gray-400">Total Indicators</div>
        </div>
        <div className="glass p-4 text-center">
          <Activity className="w-8 h-8 mx-auto mb-2 text-red-400" />
          <div className="text-2xl font-mono text-red-400">{data?.active_phases || 0}</div>
          <div className="text-xs font-mono text-gray-400">Active Phases</div>
        </div>
        <div className="glass p-4 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
          <div className="text-2xl font-mono text-orange-400">{data?.critical_phases || 0}</div>
          <div className="text-xs font-mono text-gray-400">Critical Phases</div>
        </div>
        <div className="glass p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
          <div className="text-2xl font-mono text-neon-blue">
            {Math.round((data?.active_phases || 0) / 7 * 100)}%
          </div>
          <div className="text-xs font-mono text-gray-400">Attack Progress</div>
        </div>
      </div>

      {/* Kill Chain Phases */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-6">Attack Phases</h3>
        <div className="space-y-4">
          {data?.phases?.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-white/10 rounded-lg p-4 bg-cyber-surface/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getSeverityColor(phase.severity)}`}>
                    {getPhaseIcon(phase.phase)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-200 text-lg">{phase.phase}</h4>
                    <p className="text-sm text-gray-400 mt-1">{phase.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(phase.status)}
                    <span className={`text-xs font-mono px-2 py-1 rounded ${getStatusColor(phase.status)}`}>
                      {phase.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-gray-400">
                    Threat Level: 
                    <span className={`ml-1 font-semibold ${getThreatLevelColor(phase.threat_level)}`}>
                      {phase.threat_level}/10
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Indicators</p>
                  <p className="font-mono text-accent-primary font-semibold">{phase.indicators}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Severity</p>
                  <span className={`font-mono px-2 py-1 rounded ${getSeverityColor(phase.severity)}`}>
                    {phase.severity.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Last Activity</p>
                  <p className="font-mono text-gray-300">
                    {new Date(phase.last_activity).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Response Time</p>
                  <p className="font-mono text-neon-blue">
                    {Math.round((Date.now() - new Date(phase.last_activity).getTime()) / (1000 * 60))}m ago
                  </p>
                </div>
              </div>

              {/* Threat Level Bar */}
              <div className="mt-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-gray-400">Threat Level</span>
                  <span className={`text-xs font-mono ${getThreatLevelColor(phase.threat_level)}`}>
                    {phase.threat_level}/10
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <motion.div
                    className={`h-2 rounded-full ${getThreatLevelColor(phase.threat_level).replace('text-', 'bg-')}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${phase.threat_level * 10}%` }}
                    transition={{ delay: index * 0.1 + 0.5, duration: 0.8 }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Timeline Visualization */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Attack Timeline</h3>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-600"></div>
          {data?.phases?.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="relative flex items-center mb-4"
            >
              <div className={`w-4 h-4 rounded-full border-2 border-gray-800 ${getStatusColor(phase.status).replace('text-', 'bg-')} z-10`}></div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm text-gray-300">{phase.phase}</span>
                  <span className="text-xs font-mono text-gray-500">
                    {new Date(phase.last_activity).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
