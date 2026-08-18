import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cyberApi } from '../services/api'

export default function Alerts() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getAlerts({ limit: 50, hours: 24 }); setData(res.data)
    } catch (e) { console.error('Load error:', e) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading Alerts...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Alerts</h2>
        <span className="text-xs font-mono text-gray-500">Real-time</span>
      </div>

      <div className="glass p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-xs text-gray-500 uppercase border-b border-white/5">
              <th className="py-2 text-left">Time</th><th className="text-left">Severity</th><th className="text-left">Type</th>
              <th className="text-left">Source</th><th className="text-left">Dest</th><th className="text-left">Status</th>
            </tr></thead>
            <tbody>
              {(data?.alerts || []).map((a, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition">
                  <td className="py-2 font-mono text-xs">{new Date(a.ts).toLocaleTimeString('fr-FR')}</td>
                  <td><span className={`badge-${a.severity}`}>{a.severity}</span></td>
                  <td className="text-xs">{a.alert_type?.replace(/_/g, ' ')}</td>
                  <td className="text-accent-primary font-mono text-xs">{a.src_ip}</td>
                  <td className="font-mono text-xs">{a.dst_ip}</td>
                  <td className="text-xs">{a.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">{data?.total || 0} total alerts</p>
      </div>
    </motion.div>
  )
}
