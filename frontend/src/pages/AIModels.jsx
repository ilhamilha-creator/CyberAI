import React from 'react'
import { motion } from 'framer-motion'
import { Brain, Cpu, Activity, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

export default function AIModels() {
  // Données statiques pour test
  const data = {
    models: [
      {
        name: 'Random Forest',
        type: 'Classical',
        accuracy: 0.94,
        f1_score: 0.92,
        status: 'active',
        last_trained: '2024-01-15T10:30:00Z',
        predictions_today: 15420
      },
      {
        name: 'XGBoost',
        type: 'Classical', 
        accuracy: 0.96,
        f1_score: 0.94,
        status: 'active',
        last_trained: '2024-01-15T10:35:00Z',
        predictions_today: 12380
      },
      {
        name: 'LSTM',
        type: 'Deep Learning',
        accuracy: 0.91,
        f1_score: 0.89,
        status: 'training',
        last_trained: '2024-01-14T22:15:00Z',
        predictions_today: 8750
      },
      {
        name: 'Autoencoder',
        type: 'Anomaly Detection',
        accuracy: 0.88,
        f1_score: 0.86,
        status: 'active',
        last_trained: '2024-01-15T09:45:00Z',
        predictions_today: 9200
      }
    ]
  }

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle className="w-4 h-4 text-green-400" />,
      training: <Activity className="w-4 h-4 text-yellow-400 animate-pulse" />,
      error: <AlertTriangle className="w-4 h-4 text-red-400" />
    }
    return icons[status] || icons.error
  }

  const getTypeColor = (type) => {
    const colors = {
      'Classical': 'text-accent-primary',
      'Deep Learning': 'text-neon-blue',
      'Anomaly Detection': 'text-purple-400'
    }
    return colors[type] || 'text-gray-400'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">AI Models</h2>
        <span className="text-xs font-mono text-gray-500">Real-time</span>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Models', value: data.models.filter(m => m.status === 'active').length, icon: Brain, color: 'text-accent-primary' },
          { label: 'Training', value: data.models.filter(m => m.status === 'training').length, icon: Activity, color: 'text-yellow-400' },
          { label: 'Avg Accuracy', value: `${((data.models.reduce((acc, m) => acc + m.accuracy, 0) / data.models.length) * 100).toFixed(1)}%`, icon: TrendingUp, color: 'text-green-400' },
          { label: 'Predictions Today', value: data.models.reduce((acc, m) => acc + m.predictions_today, 0).toLocaleString(), icon: Cpu, color: 'text-neon-blue' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass p-4 text-center">
            <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-xs text-gray-500 uppercase tracking-wider">{stat.label}</p>
            <p className="font-display text-2xl mt-2 text-gray-200">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Models Grid */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Model Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.models.map((model, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
              className="glass p-5 border border-white/5 rounded-lg">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="font-semibold text-gray-200">{model.name}</h4>
                  <p className={`text-xs ${getTypeColor(model.type)} uppercase tracking-wider`}>{model.type}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(model.status)}
                  <span className="text-xs text-gray-400 capitalize">{model.status}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-xs text-gray-500">Accuracy</p>
                  <p className="font-display text-lg text-accent-primary">{(model.accuracy * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">F1 Score</p>
                  <p className="font-display text-lg text-neon-blue">{(model.f1_score * 100).toFixed(1)}%</p>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1">
                <p>Last Trained: {new Date(model.last_trained).toLocaleString()}</p>
                <p>Predictions Today: <span className="text-accent-primary font-mono">{model.predictions_today.toLocaleString()}</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="glass p-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Model Actions</h3>
        <div className="flex flex-wrap gap-3">
          <motion.button
            onClick={() => console.log("Retraining models...")}
            className="flex items-center gap-2 bg-accent-primary/20 border border-accent-primary/30 text-accent-primary px-4 py-2 rounded-lg hover:bg-accent-primary/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Activity className="w-4 h-4" />
            Retrain All Models
          </motion.button>
          <motion.button
            onClick={() => console.log("Viewing performance...")}
            className="flex items-center gap-2 bg-neon-blue/20 border border-neon-blue/30 text-neon-blue px-4 py-2 rounded-lg hover:bg-neon-blue/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <TrendingUp className="w-4 h-4" />
            View Performance
          </motion.button>
          <motion.button
            onClick={() => console.log("Adding new model...")}
            className="flex items-center gap-2 bg-purple-400/20 border border-purple-400/30 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-400/30 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Brain className="w-4 h-4" />
            Add New Model
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
