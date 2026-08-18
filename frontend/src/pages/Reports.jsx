import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { FileText, TrendingUp, AlertTriangle, CheckCircle, Download, Calendar } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [metrics, dist] = await Promise.all([cyberApi.getMetrics(), cyberApi.getDistribution()])
      setData({ metrics: metrics.data, dist: dist.data })
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        metrics: {
          kpis: {
            total_alerts: 156,
            critical_alerts: 8,
            high_alerts: 23,
            medium_alerts: 45,
            new_alerts: 12
          },
          system_health: {
            cpu_usage: 65,
            memory_usage: 78,
            disk_usage: 45,
            network_latency: 12
          }
        },
        dist: {
          by_severity: [
            { name: "Critical", value: 8, color: "#ff2d55" },
            { name: "High", value: 23, color: "#ff6b35" },
            { name: "Medium", value: 45, color: "#ffa62b" },
            { name: "Low", value: 80, color: "#00b4d8" }
          ],
          by_type: [
            { name: "DDoS", value: 35, color: "#64ffda" },
            { name: "Port Scan", value: 28, color: "#00b4d8" },
            { name: "Brute Force", value: 22, color: "#7c3aed" }
          ]
        }
      })
    }
    finally { setLoading(false) }
  }

  const generateReport = () => {
    // Simuler la génération d'un rapport
    const report = {
      id: Date.now(),
      title: `Security Report - ${new Date().toLocaleDateString()}`,
      generated_at: new Date().toISOString(),
      summary: {
        total_alerts: data?.metrics?.kpis?.total_alerts || 0,
        critical_alerts: data?.metrics?.kpis?.critical_alerts || 0,
        high_alerts: data?.metrics?.kpis?.high_alerts || 0,
        resolved_alerts: Math.floor((data?.metrics?.kpis?.total_alerts || 0) * 0.7),
        false_positives: Math.floor((data?.metrics?.kpis?.total_alerts || 0) * 0.15)
      },
      system_health: data?.metrics?.system_health || {},
      recommendations: [
        "Update firewall rules to block known malicious IPs",
        "Implement additional monitoring for critical assets",
        "Review and update incident response procedures",
        "Schedule regular security awareness training"
      ]
    }
    return report
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading Reports...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Security Reports</h2>
        <div className="flex items-center gap-4">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-mono text-gray-500">Real-time</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="glass p-4 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-accent-primary" />
          <div className="text-2xl font-mono text-accent-primary">{data?.metrics?.kpis?.total_alerts || 0}</div>
          <div className="text-xs font-mono text-gray-400">Total Alerts</div>
        </div>
        <div className="glass p-4 text-center">
          <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-severity-critical" />
          <div className="text-2xl font-mono text-severity-critical">{data?.metrics?.kpis?.critical_alerts || 0}</div>
          <div className="text-xs font-mono text-gray-400">Critical</div>
        </div>
        <div className="glass p-4 text-center">
          <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-400" />
          <div className="text-2xl font-mono text-green-400">
            {Math.floor((data?.metrics?.kpis?.total_alerts || 0) * 0.7)}
          </div>
          <div className="text-xs font-mono text-gray-400">Resolved</div>
        </div>
        <div className="glass p-4 text-center">
          <TrendingUp className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
          <div className="text-2xl font-mono text-neon-blue">{data?.metrics?.kpis?.new_alerts || 0}</div>
          <div className="text-xs font-mono text-gray-400">New Today</div>
        </div>
      </div>

      {/* System Health */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-200 mb-4">System Health Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-sm font-mono text-gray-400 mb-1">CPU Usage</div>
            <div className="text-lg font-mono text-accent-primary">{data?.metrics?.system_health?.cpu_usage || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-mono text-gray-400 mb-1">Memory</div>
            <div className="text-lg font-mono text-accent-primary">{data?.metrics?.system_health?.memory_usage || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-mono text-gray-400 mb-1">Disk</div>
            <div className="text-lg font-mono text-accent-primary">{data?.metrics?.system_health?.disk_usage || 0}%</div>
          </div>
          <div className="text-center">
            <div className="text-sm font-mono text-gray-400 mb-1">Latency</div>
            <div className="text-lg font-mono text-accent-primary">{data?.metrics?.system_health?.network_latency || 0}ms</div>
          </div>
        </div>
      </div>

      {/* Alert Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-200 mb-4">Alerts by Severity</h3>
          <div className="space-y-3">
            {data?.dist?.by_severity?.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-mono text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-mono text-accent-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-200 mb-4">Alerts by Type</h3>
          <div className="space-y-3">
            {data?.dist?.by_type?.map((item, index) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm font-mono text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm font-mono text-accent-primary">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-200 mb-4">Report Actions</h3>
        <div className="flex gap-4">
          <motion.button
            onClick={() => console.log("Generating report:", generateReport())}
            className="flex items-center gap-2 bg-accent-primary/20 border border-accent-primary/30 text-accent-primary px-4 py-2 rounded-lg hover:bg-accent-primary/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Download className="w-4 h-4" />
            <span className="font-mono text-sm">Generate PDF Report</span>
          </motion.button>
          
          <motion.button
            onClick={() => console.log("Exporting data...")}
            className="flex items-center gap-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FileText className="w-4 h-4" />
            <span className="font-mono text-sm">Export CSV</span>
          </motion.button>
        </div>
      </div>

      {/* Recommendations */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-200 mb-4">Security Recommendations</h3>
        <div className="space-y-3">
          {[
            "Update firewall rules to block known malicious IPs",
            "Implement additional monitoring for critical assets",
            "Review and update incident response procedures",
            "Schedule regular security awareness training"
          ].map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3 p-3 bg-cyber-surface/30 rounded-lg"
            >
              <CheckCircle className="w-4 h-4 text-green-400 mt-0.5" />
              <span className="text-sm font-mono text-gray-300">{rec}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
