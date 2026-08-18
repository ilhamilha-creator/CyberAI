import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Server, User, Activity, Shield, Cpu, HardDrive, Network, AlertTriangle, CheckCircle, Clock } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function Admin() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getAdminStats()
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        system: {
          uptime: "15 days, 7 hours, 32 minutes",
          version: "8.0.0",
          last_update: new Date().toISOString(),
          status: "healthy"
        },
        users: {
          total: 45,
          active: 12,
          new_today: 3,
          roles: { admin: 5, analyst: 25, viewer: 15 }
        },
        performance: {
          cpu_usage: 65,
          memory_usage: 78,
          disk_usage: 45,
          network_throughput: 250,
          response_time_ms: 120
        },
        security: {
          blocked_ips: 2500,
          failed_logins: 125,
          active_threats: 8,
          security_events_today: 275
        },
        alerts: {
          total: 1250,
          critical: 25,
          high: 85,
          medium: 180,
          resolved_today: 95
        }
      })
    }
    finally { setLoading(false) }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'healthy': return 'text-green-400'
      case 'warning': return 'text-yellow-400'
      case 'critical': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getUsageColor = (usage) => {
    if (usage > 80) return 'text-red-400'
    if (usage > 60) return 'text-yellow-400'
    return 'text-green-400'
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading Admin...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">System Administration</h2>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs font-mono text-gray-500">Real-time</span>
        </div>
      </div>

      {/* System Status */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <Server className={`w-8 h-8 ${getStatusColor(data?.system?.status)}`} />
            <div>
              <p className="text-xs font-mono text-gray-400">Status</p>
              <p className={`font-display text-lg ${getStatusColor(data?.system?.status)}`}>
                {data?.system?.status?.toUpperCase()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-accent-primary" />
            <div>
              <p className="text-xs font-mono text-gray-400">Uptime</p>
              <p className="font-display text-lg text-gray-200">{data?.system?.uptime}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-8 h-8 text-neon-blue" />
            <div>
              <p className="text-xs font-mono text-gray-400">Version</p>
              <p className="font-display text-lg text-gray-200">{data?.system?.version}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <div>
              <p className="text-xs font-mono text-gray-400">Last Update</p>
              <p className="font-display text-sm text-gray-200">
                {new Date(data?.system?.last_update).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center">
            <Cpu className={`w-8 h-8 mx-auto mb-2 ${getUsageColor(data?.performance?.cpu_usage)}`} />
            <p className="text-xs font-mono text-gray-400">CPU Usage</p>
            <p className={`font-display text-2xl ${getUsageColor(data?.performance?.cpu_usage)}`}>
              {data?.performance?.cpu_usage}%
            </p>
          </div>
          <div className="text-center">
            <HardDrive className={`w-8 h-8 mx-auto mb-2 ${getUsageColor(data?.performance?.memory_usage)}`} />
            <p className="text-xs font-mono text-gray-400">Memory</p>
            <p className={`font-display text-2xl ${getUsageColor(data?.performance?.memory_usage)}`}>
              {data?.performance?.memory_usage}%
            </p>
          </div>
          <div className="text-center">
            <Network className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
            <p className="text-xs font-mono text-gray-400">Network</p>
            <p className="font-display text-2xl text-neon-blue">
              {data?.performance?.network_throughput} MB/s
            </p>
          </div>
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-2 text-purple-400" />
            <p className="text-xs font-mono text-gray-400">Response Time</p>
            <p className="font-display text-2xl text-purple-400">
              {data?.performance?.response_time_ms}ms
            </p>
          </div>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">User Statistics</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Total Users</span>
              <span className="font-display text-lg text-accent-primary">{data?.users?.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Active Now</span>
              <span className="font-display text-lg text-green-400">{data?.users?.active}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">New Today</span>
              <span className="font-display text-lg text-neon-blue">{data?.users?.new_today}</span>
            </div>
            <div className="border-t border-white/10 pt-3">
              <p className="text-xs font-mono text-gray-400 mb-2">User Roles</p>
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500">Admin</span>
                  <span className="text-xs font-mono text-red-400">{data?.users?.roles?.admin}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500">Analyst</span>
                  <span className="text-xs font-mono text-yellow-400">{data?.users?.roles?.analyst}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono text-gray-500">Viewer</span>
                  <span className="text-xs font-mono text-green-400">{data?.users?.roles?.viewer}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Security Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Blocked IPs</span>
              <span className="font-display text-lg text-red-400">{data?.security?.blocked_ips}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Failed Logins</span>
              <span className="font-display text-lg text-yellow-400">{data?.security?.failed_logins}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Active Threats</span>
              <span className="font-display text-lg text-orange-400">{data?.security?.active_threats}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Security Events</span>
              <span className="font-display text-lg text-purple-400">{data?.security?.security_events_today}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Alert Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-accent-primary" />
            <p className="text-2xl font-mono text-accent-primary">{data?.alerts?.total}</p>
            <p className="text-xs font-mono text-gray-400">Total</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-400" />
            <p className="text-2xl font-mono text-red-400">{data?.alerts?.critical}</p>
            <p className="text-xs font-mono text-gray-400">Critical</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-orange-400" />
            <p className="text-2xl font-mono text-orange-400">{data?.alerts?.high}</p>
            <p className="text-xs font-mono text-gray-400">High</p>
          </div>
          <div className="text-center">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-yellow-400" />
            <p className="text-2xl font-mono text-yellow-400">{data?.alerts?.medium}</p>
            <p className="text-xs font-mono text-gray-400">Medium</p>
          </div>
          <div className="text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
            <p className="text-2xl font-mono text-green-400">{data?.alerts?.resolved_today}</p>
            <p className="text-xs font-mono text-gray-400">Resolved</p>
          </div>
        </div>
      </div>

      {/* Admin Actions */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Admin Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => alert('Refreshing system status...')}
            className="flex items-center gap-2 bg-accent-primary/20 border border-accent-primary/30 text-accent-primary px-4 py-2 rounded-lg hover:bg-accent-primary/30 transition-all"
          >
            <Activity className="w-4 h-4" />
            Refresh Status
          </button>
          <button
            onClick={() => alert('Opening user management...')}
            className="flex items-center gap-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-all"
          >
            <User className="w-4 h-4" />
            User Management
          </button>
          <button
            onClick={() => alert('Opening security settings...')}
            className="flex items-center gap-2 bg-purple-400/20 border border-purple-400/30 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-400/30 transition-all"
          >
            <Shield className="w-4 h-4" />
            Security Settings
          </button>
        </div>
      </div>
    </motion.div>
  )
}
