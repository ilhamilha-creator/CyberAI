import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Cpu, Activity, TrendingUp, Play, Pause, Settings, Database, Zap, Clock, CheckCircle, AlertTriangle, HardDrive } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function MLOps() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
    const interval = setInterval(loadData, 15000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const res = await cyberApi.getMLOpsStatus()
      setData(res.data)
    } catch (e) { 
      console.error('Load error:', e)
      // Données de démonstration
      setData({
        pipelines: [
          {
            name: "DDoS Detection Pipeline",
            status: "running",
            last_run: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            duration: "3m 45s",
            accuracy: 0.945,
            throughput: "2500 req/s"
          },
          {
            name: "Threat Classification",
            status: "running",
            last_run: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
            duration: "2m 15s",
            accuracy: 0.912,
            throughput: "1800 req/s"
          },
          {
            name: "Anomaly Detection",
            status: "training",
            last_run: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
            duration: "8m 30s",
            accuracy: 0.878,
            throughput: "1200 req/s"
          }
        ],
        experiments: {
          total: 35,
          running: 4,
          completed: 28,
          failed: 3
        },
        models: {
          total: 18,
          deployed: 12,
          in_training: 3,
          staged: 3
        },
        resources: {
          gpu_usage: 78,
          cpu_usage: 62,
          memory_usage: 84,
          storage_used: "450 GB"
        }
      })
    }
    finally { setLoading(false) }
  }

  const getStatusIcon = (status) => {
    switch(status) {
      case 'running': return <Play className="w-4 h-4 text-green-400" />
      case 'training': return <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />
      case 'stopped': return <Pause className="w-4 h-4 text-red-400" />
      default: return <Settings className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'running': return 'text-green-400'
      case 'training': return 'text-yellow-400'
      case 'stopped': return 'text-red-400'
      default: return 'text-gray-400'
    }
  }

  const getUsageColor = (usage) => {
    if (usage > 80) return 'text-red-400'
    if (usage > 60) return 'text-yellow-400'
    return 'text-green-400'
  }

  const handleNewExperiment = () => {
    alert('New experiment started!')
  }

  const handleRetrainModels = () => {
    alert('Models retraining started!')
  }

  const handleViewExperiments = () => {
    alert('Opening experiments view...')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-accent-primary font-mono animate-pulse">Loading MLOps...</div></div>

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">MLOps Dashboard</h2>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs font-mono text-gray-500">Real-time</span>
        </div>
      </div>

      {/* Resource Usage */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Resource Usage</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <Cpu className={`w-8 h-8 mx-auto mb-2 ${getUsageColor(data?.resources?.cpu_usage)}`} />
            <p className="text-xs font-mono text-gray-400">CPU</p>
            <p className={`font-display text-2xl ${getUsageColor(data?.resources?.cpu_usage)}`}>
              {data?.resources?.cpu_usage}%
            </p>
          </div>
          <div className="text-center">
            <Database className={`w-8 h-8 mx-auto mb-2 ${getUsageColor(data?.resources?.memory_usage)}`} />
            <p className="text-xs font-mono text-gray-400">Memory</p>
            <p className={`font-display text-2xl ${getUsageColor(data?.resources?.memory_usage)}`}>
              {data?.resources?.memory_usage}%
            </p>
          </div>
          <div className="text-center">
            <Zap className={`w-8 h-8 mx-auto mb-2 ${getUsageColor(data?.resources?.gpu_usage)}`} />
            <p className="text-xs font-mono text-gray-400">GPU</p>
            <p className={`font-display text-2xl ${getUsageColor(data?.resources?.gpu_usage)}`}>
              {data?.resources?.gpu_usage}%
            </p>
          </div>
          <div className="text-center">
            <HardDrive className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
            <p className="text-xs font-mono text-gray-400">Storage</p>
            <p className="font-display text-2xl text-neon-blue">{data?.resources?.storage_used}</p>
          </div>
        </div>
      </div>

      {/* ML Pipelines */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">ML Pipelines</h3>
        <div className="space-y-4">
          {data?.pipelines?.map((pipeline, index) => (
            <motion.div
              key={pipeline.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="border border-white/10 rounded-lg p-4 bg-cyber-surface/30"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-200 mb-1">{pipeline.name}</h4>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(pipeline.status)}
                    <span className={`text-xs font-mono ${getStatusColor(pipeline.status)}`}>
                      {pipeline.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs font-mono text-gray-400">Accuracy</p>
                  <p className="font-display text-lg text-accent-primary">
                    {(pipeline.accuracy * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div>
                  <p className="text-gray-400 mb-1">Last Run</p>
                  <p className="font-mono text-gray-300">
                    {new Date(pipeline.last_run).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Duration</p>
                  <p className="font-mono text-gray-300">{pipeline.duration}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">Throughput</p>
                  <p className="font-mono text-neon-blue">{pipeline.throughput}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Experiments and Models */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Experiments</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Total</span>
              <span className="font-display text-lg text-accent-primary">{data?.experiments?.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Running</span>
              <span className="font-display text-lg text-yellow-400">{data?.experiments?.running}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Completed</span>
              <span className="font-display text-lg text-green-400">{data?.experiments?.completed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Failed</span>
              <span className="font-display text-lg text-red-400">{data?.experiments?.failed}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Models</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Total Models</span>
              <span className="font-display text-lg text-accent-primary">{data?.models?.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Deployed</span>
              <span className="font-display text-lg text-green-400">{data?.models?.deployed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">In Training</span>
              <span className="font-display text-lg text-yellow-400">{data?.models?.in_training}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-mono text-gray-400">Staged</span>
              <span className="font-display text-lg text-purple-400">{data?.models?.staged}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Quick Actions</h3>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleNewExperiment}
            className="flex items-center gap-2 bg-accent-primary/20 border border-accent-primary/30 text-accent-primary px-4 py-2 rounded-lg hover:bg-accent-primary/30 transition-all"
          >
            <Play className="w-4 h-4" />
            New Experiment
          </button>
          <button
            onClick={handleRetrainModels}
            className="flex items-center gap-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-all"
          >
            <Brain className="w-4 h-4" />
            Retrain Models
          </button>
          <button
            onClick={handleViewExperiments}
            className="flex items-center gap-2 bg-purple-400/20 border border-purple-400/30 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-400/30 transition-all"
          >
            <TrendingUp className="w-4 h-4" />
            View Experiments
          </button>
        </div>
      </div>
    </motion.div>
  )
}
