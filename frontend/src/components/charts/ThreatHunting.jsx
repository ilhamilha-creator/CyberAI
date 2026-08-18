import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, Target, Activity, AlertTriangle, Clock, TrendingUp } from 'lucide-react'
import { cyberApi } from '../../services/api'

export default function ThreatHunting() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedThreat, setSelectedThreat] = useState(null)
  const [filterSeverity, setFilterSeverity] = useState('all')

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
        threats: [
          {
            id: 1,
            name: 'Suspicious PowerShell Activity',
            type: 'malware_c2',
            severity: 'high',
            confidence: 0.92,
            status: 'investigating',
            source_ip: '192.168.1.150',
            destination: '10.0.0.50',
            first_seen: '2024-01-15T14:30:00Z',
            indicators: ['powershell.exe', '-enc', 'base64', 'downloadstring'],
            affected_hosts: 3,
            risk_score: 85
          },
          {
            id: 2,
            name: 'Potential Data Exfiltration',
            type: 'data_exfiltration',
            severity: 'critical',
            confidence: 0.88,
            status: 'active',
            source_ip: '172.16.0.25',
            destination: '45.123.45.67',
            first_seen: '2024-01-15T13:15:00Z',
            indicators: ['large_transfer', 'encrypted_traffic', 'unusual_hours'],
            affected_hosts: 1,
            risk_score: 95
          },
          {
            id: 3,
            name: 'Brute Force Attack Detected',
            type: 'brute_force',
            severity: 'medium',
            confidence: 0.95,
            status: 'mitigated',
            source_ip: '203.0.113.45',
            destination: '192.168.1.100',
            first_seen: '2024-01-15T12:00:00Z',
            indicators: ['ssh_failed_login', 'multiple_attempts', 'dictionary_attack'],
            affected_hosts: 2,
            risk_score: 65
          },
          {
            id: 4,
            name: 'Port Scanning Activity',
            type: 'port_scan',
            severity: 'low',
            confidence: 0.78,
            status: 'monitoring',
            source_ip: '198.51.100.22',
            destination: '10.0.0.0/24',
            first_seen: '2024-01-15T11:45:00Z',
            indicators: ['nmap_scan', 'port_sweep', 'service_enumeration'],
            affected_hosts: 15,
            risk_score: 35
          }
        ]
      })
    }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading ThreatHunting...</div></div>

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'text-severity-critical bg-severity-critical/10 border-severity-critical/30',
      high: 'text-severity-high bg-severity-high/10 border-severity-high/30',
      medium: 'text-severity-medium bg-severity-medium/10 border-severity-medium/30',
      low: 'text-severity-low bg-severity-low/10 border-severity-low/30'
    }
    return colors[severity] || colors.low
  }

  const getStatusIcon = (status) => {
    const icons = {
      active: <Activity className="w-4 h-4 text-red-400 animate-pulse" />,
      investigating: <Search className="w-4 h-4 text-yellow-400" />,
      mitigated: <Target className="w-4 h-4 text-green-400" />,
      monitoring: <Clock className="w-4 h-4 text-blue-400" />
    }
    return icons[status] || icons.monitoring
  }

  const filteredThreats = data?.threats?.filter(threat => {
    const matchesSearch = threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         threat.indicators.some(ind => ind.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesSeverity = filterSeverity === 'all' || threat.severity === filterSeverity
    return matchesSearch && matchesSeverity
  }) || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Threat Hunting</h2>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
          <span className="text-xs font-mono text-gray-500">Live</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {[
          { label: 'Active Threats', value: data?.threats?.filter(t => t.status === 'active').length || 0, color: 'text-severity-critical', icon: AlertTriangle },
          { label: 'Investigating', value: data?.threats?.filter(t => t.status === 'investigating').length || 0, color: 'text-yellow-400', icon: Search },
          { label: 'Mitigated', value: data?.threats?.filter(t => t.status === 'mitigated').length || 0, color: 'text-green-400', icon: Target },
          { label: 'Avg Risk Score', value: Math.round(data?.threats?.reduce((acc, t) => acc + t.risk_score, 0) / (data?.threats?.length || 1)) || 0, color: 'text-accent-primary', icon: TrendingUp },
          { label: 'Affected Hosts', value: data?.threats?.reduce((acc, t) => acc + t.affected_hosts, 0) || 0, color: 'text-neon-blue', icon: Activity },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass glass-hover p-4 text-center">
            <stat.icon className={`w-5 h-5 mx-auto mb-2 ${stat.color}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className={`font-display text-2xl mt-1 ${stat.color}`}>{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="glass p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-500" />
            <input
              type="text"
              placeholder="Search threats, indicators, IPs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cyber-input border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-primary/50"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="bg-cyber-input border border-white/10 rounded-lg px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-accent-primary/50"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Threats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredThreats.map((threat, i) => (
          <motion.div
            key={threat.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelectedThreat(selectedThreat?.id === threat.id ? null : threat)}
            className={`glass glass-hover p-5 border rounded-lg cursor-pointer transition-all ${
              selectedThreat?.id === threat.id ? 'ring-2 ring-accent-primary' : 'border-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-200 text-sm">{threat.name}</h4>
                <p className="text-xs text-gray-500 mt-1">{threat.type.replace(/_/g, ' ')}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(threat.status)}
                <span className={`badge-${threat.severity} text-xs`}>{threat.severity}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3 text-xs">
              <div>
                <p className="text-gray-500">Confidence</p>
                <p className="font-mono text-accent-primary">{Math.round(threat.confidence * 100)}%</p>
              </div>
              <div>
                <p className="text-gray-500">Risk Score</p>
                <p className="font-mono text-severity-high">{threat.risk_score}</p>
              </div>
            </div>

            <div className="text-xs text-gray-400 space-y-1">
              <p>Source: <span className="text-accent-primary font-mono">{threat.source_ip}</span></p>
              <p>Destination: <span className="font-mono">{threat.destination}</span></p>
              <p>Affected: <span className="text-neon-blue">{threat.affected_hosts} hosts</span></p>
            </div>

            {selectedThreat?.id === threat.id && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 pt-4 border-t border-white/10">
                <h5 className="font-semibold text-gray-200 text-sm mb-2">Indicators</h5>
                <div className="flex flex-wrap gap-2">
                  {threat.indicators.map((indicator, idx) => (
                    <span key={idx} className="bg-cyber-surface/50 border border-white/10 px-2 py-1 rounded text-xs text-gray-300">
                      {indicator}
                    </span>
                  ))}
                </div>
                <div className="mt-3 flex gap-2">
                  <button className="btn-primary text-xs">Investigate</button>
                  <button className="btn-danger text-xs">Block Source</button>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      {filteredThreats.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass p-8 text-center">
          <Search className="w-12 h-12 mx-auto mb-4 text-gray-500 opacity-50" />
          <p className="text-gray-400 font-mono">No threats found matching your criteria</p>
          <p className="text-gray-500 text-sm mt-2">Try adjusting filters or search terms</p>
        </motion.div>
      )}
    </motion.div>
  )
}
