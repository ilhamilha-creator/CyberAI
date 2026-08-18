import React, { useState } from 'react'
import { motion } from 'framer-motion'
import SecurityChatbot from '../components/SecurityChatbot'
import { Brain, Shield, Zap, AlertTriangle, Activity } from 'lucide-react'

export default function SecurityAssistant() {
  const [activeTab, setActiveTab] = useState('chatbot')

  const securityMetrics = {
    threatLevel: 'Medium',
    activeAlerts: 12,
    blockedAttacks: 247,
    systemHealth: 87,
    lastScan: '2 minutes ago'
  }

  const quickActions = [
    { icon: Shield, label: 'Scanner Vulnérabilités', color: 'text-severity-high' },
    { icon: AlertTriangle, label: 'Analyser Logs', color: 'text-severity-critical' },
    { icon: Zap, label: 'Optimiser Sécurité', color: 'text-accent-primary' },
    { icon: Activity, label: 'Monitoring Live', color: 'text-neon-blue' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* En-tête */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <motion.h1
          className="font-display text-3xl tracking-wider text-gray-200"
          animate={{
            textShadow: [
              '0 0 10px rgba(100,255,218,0.5)',
              '0 0 20px rgba(100,255,218,0.8)',
              '0 0 10px rgba(100,255,218,0.5)'
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          🤖 Assistant IA Sécurité
        </motion.h1>

        <div className="flex gap-4">
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center"
          >
            <div className="text-xs text-gray-500 font-mono">Menace Actuelle</div>
            <div className={`text-lg font-mono ${
              securityMetrics.threatLevel === 'High' ? 'text-severity-critical' :
              securityMetrics.threatLevel === 'Medium' ? 'text-severity-high' : 'text-severity-medium'
            }`}>
              {securityMetrics.threatLevel}
            </div>
          </motion.div>
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
            className="text-center"
          >
            <div className="text-xs text-gray-500 font-mono">Santé Système</div>
            <div className="text-lg font-mono text-accent-primary">{securityMetrics.systemHealth}%</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Actions rapides */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        {quickActions.map((action, index) => (
          <motion.button
            key={action.label}
            onClick={() => setActiveTab(action.label.toLowerCase().replace(' ', ''))}
            className="glass glass-hover p-4 text-center group"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, delay: index * 0.5 }}
            >
              <action.icon className={`w-6 h-6 mx-auto mb-2 ${action.color} opacity-70 group-hover:opacity-100 transition-opacity`} />
            </motion.div>
            <div className="text-xs font-mono text-gray-400 group-hover:text-gray-300 transition-colors">
              {action.label}
            </div>
          </motion.button>
        ))}
      </motion.div>

      {/* Chatbot principal */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <SecurityChatbot />
      </motion.div>

      {/* Panneau d'informations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">État Actuel</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">Alertes Actives</span>
              <motion.span
                className="text-sm font-mono text-severity-high"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                {securityMetrics.activeAlerts}
              </motion.span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">Attaques Bloquées</span>
              <span className="text-sm font-mono text-accent-primary">{securityMetrics.blockedAttacks}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-xs font-mono text-gray-500">Dernier Scan</span>
              <span className="text-sm font-mono text-neon-blue">{securityMetrics.lastScan}</span>
            </div>
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Capacités IA</h3>
          <div className="space-y-2">
            {[
              '🧠 Analyse comportementale',
              '⚡ Détection temps réel',
              '🛡️ Prédiction menaces',
              '📊 Reporting intelligent',
              '🔍 Investigation automatique'
            ].map((capability, index) => (
              <motion.div
                key={capability}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * index }}
                className="text-xs font-mono text-gray-400 hover:text-accent-primary transition-colors cursor-pointer"
              >
                {capability}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">Recommandations</h3>
          <div className="space-y-3">
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-3 bg-severity-high/10 border border-severity-high/30 rounded-lg"
            >
              <div className="text-xs font-mono text-severity-high">⚠️ Critique</div>
              <div className="text-xs text-gray-400 mt-1">Mettre à jour les patches de sécurité</div>
            </motion.div>
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, delay: 1 }}
              className="p-3 bg-accent-primary/10 border border-accent-primary/30 rounded-lg"
            >
              <div className="text-xs font-mono text-accent-primary">💡 Suggestion</div>
              <div className="text-xs text-gray-400 mt-1">Optimiser les règles du firewall</div>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
