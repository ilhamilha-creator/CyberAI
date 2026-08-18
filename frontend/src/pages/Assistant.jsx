import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Brain, Shield, Cpu, Settings, Info, Zap, GraduationCap } from 'lucide-react'
import SimpleLLMChatbot from '../components/SimpleLLMChatbot'
import SimpleAdvancedAIChatbot from '../components/SimpleAdvancedAIChatbot'
import SecurityChatbot from '../components/SecurityChatbot'

export default function Assistant() {
  const [useLLM, setUseLLM] = useState(false)
  const [useAdvancedAI, setUseAdvancedAI] = useState(false)

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">Assistant IA</h2>
        <div className="flex items-center gap-4">
          <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Brain className="w-5 h-5 text-accent-primary" />
                <h3 className="text-lg font-medium text-gray-200">Mode Assistant IA</h3>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => { setUseAdvancedAI(false); setUseLLM(false); }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    !useAdvancedAI && !useLLM 
                      ? 'bg-blue-600 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Shield className="w-4 h-4 inline mr-1" />
                  Expert
                </button>
                <button
                  onClick={() => { setUseAdvancedAI(false); setUseLLM(true); }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    !useAdvancedAI && useLLM 
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Brain className="w-4 h-4 inline mr-1" />
                  LLM
                </button>
                <button
                  onClick={() => { setUseAdvancedAI(true); setUseLLM(false); }}
                  className={`px-3 py-2 rounded-lg font-medium transition-all text-sm ${
                    useAdvancedAI 
                      ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg animate-pulse' 
                      : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  }`}
                >
                  <Zap className="w-4 h-4 inline mr-1" />
                  Advanced AI
                </button>
              </div>
            </div>

            <div className="text-sm text-gray-400">
              {useAdvancedAI ? (
                <div className="space-y-2">
                  <p className="flex items-center">
                    <Zap className="w-4 h-4 mr-2 text-green-400" />
                    <span>🚀 Advanced AI - LLM Entraîné sur Datasets Cybersécurité</span>
                  </p>
                  <div className="pl-6 space-y-1">
                    <p>• <strong>LLM Fine-tuné</strong> sur NSL-KDD, CIC-IDS2017, UNSW-NB15</p>
                    <p>• <strong>Vector Database</strong> avec 25+ domaines de connaissances</p>
                    <p>• <strong>Classification IA</strong> des menaces en temps réel</p>
                    <p>• <strong>Apprentissage continu</strong> avec feedback utilisateur</p>
                    <p>• <strong>148K+ samples</strong> d'entraînement cybersécurité</p>
                  </div>
                </div>
              ) : useLLM ? (
                <div className="space-y-2">
                  <p className="flex items-center">
                    <Brain className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Mode LLM - Intelligence Artificielle</span>
                  </p>
                  <div className="pl-6 space-y-1">
                    <p>• Réponses contextuelles et intelligentes</p>
                    <p>• Analyse sémantique des questions</p>
                    <p>• Base de connaissances cybersécurité</p>
                    <p>• Scores de confiance pour chaque réponse</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="flex items-center">
                    <Shield className="w-4 h-4 mr-2 text-blue-400" />
                    <span>Mode Expert - Réponses basées sur des règles</span>
                  </p>
                  <div className="pl-6 space-y-1">
                    <p>• Réponses rapides et prévisibles</p>
                    <p>• Basé sur des règles prédéfinies</p>
                    <p>• Couvre les sujets de sécurité essentiels</p>
                    <p>• Idéal pour les questions standards</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chat Component */}
      <div className="glass neon-border">
        {useAdvancedAI ? (
          <SimpleAdvancedAIChatbot />
        ) : useLLM ? (
          <SimpleLLMChatbot />
        ) : (
          <SecurityChatbot />
        )}
      </div>

      {/* Feature Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">
            {useAdvancedAI ? 'Capacités Advanced AI' : useLLM ? 'Capacités LLM' : 'Capacités Expert'}
          </h3>
          <div className="space-y-3">
            {useAdvancedAI ? [
              { title: 'LLM Fine-tuné', desc: 'Entraîné sur NSL-KDD, CIC-IDS2017, UNSW-NB15', icon: '🧠' },
              { title: 'Vector Database', desc: '25+ domaines de connaissances cybersécurité', icon: '🗄️' },
              { title: 'Classification IA', desc: '10 types de menaces en temps réel', icon: '🎯' },
              { title: 'Apprentissage Continu', desc: 'Amélioration avec feedback utilisateur', icon: '📈' }
            ] : useLLM ? [
              { title: 'IA Contextuelle', desc: 'Comprend le contexte et génère des réponses intelligentes', icon: '🧠' },
              { title: 'Analyse Avancée', desc: 'DDoS, malware, IP, cybersécurité spécialisée', icon: '🔍' },
              { title: 'Réponses Rapides', desc: 'Génération de réponses en 1 seconde', icon: '⚡' },
              { title: 'Interface Stable', desc: 'Pas de dépendances externes, fonctionne toujours', icon: '🛡️' }
            ] : [
              { title: 'Réponses Rapides', desc: 'Basées sur des règles prédéfinies', icon: '⚡' },
              { title: 'Fiabilité', desc: 'Réponses prévisibles et cohérentes', icon: '🛡️' },
              { title: 'Couverture Sécurité', desc: 'Sujets essentiels de cybersécurité', icon: '🔒' },
              { title: 'Légèreté', desc: 'Pas besoin de ressources lourdes', icon: '🪶' }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-3 bg-cyber-surface/30 rounded-lg"
              >
                <span className="text-2xl">{feature.icon}</span>
                <div>
                  <div className="font-semibold text-gray-200">{feature.title}</div>
                  <div className="text-xs text-gray-400">{feature.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="glass p-6">
          <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">
            {useAdvancedAI ? 'Avantages Advanced AI' : useLLM ? 'Avantages LLM' : 'Avantages Expert'}
          </h3>
          <div className="space-y-3">
            {useAdvancedAI ? [
              { title: 'Ultra-Intelligence', desc: 'LLM entraîné sur 148K+ échantillons spécialisés', icon: '🧠' },
              { title: 'Vector Database', desc: '25+ domaines de connaissances cybersécurité', icon: '🗄️' },
              { title: 'Classification IA', desc: '10 types de menaces en temps réel', icon: '🎯' },
              { title: 'Analyse MITRE', desc: 'TTPs complets et stratégies de défense', icon: '📊' }
            ] : useLLM ? [
              { title: 'Compréhension Naturelle', desc: 'Comprend les questions complexes', icon: '✅' },
              { title: 'Adaptabilité', desc: "S'adapte à chaque situation", icon: '✅' },
              { title: 'Contexte Étendu', desc: 'Mémoire de conversation longue', icon: '✅' },
              { title: 'Innovation', desc: 'Génère des solutions originales', icon: '✅' }
            ] : [
              { title: 'Fiabilité', desc: 'Réponses toujours cohérentes', icon: '✅' },
              { title: 'Performance', desc: 'Réponses instantanées', icon: '✅' },
              { title: 'Sécurité', desc: 'Pas de données externes', icon: '✅' },
              { title: 'Simplicité', desc: 'Facile à maintenir', icon: '✅' }
            ].map((advantage, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-3 p-2 bg-green-400/10 rounded-lg"
              >
                <span className="text-green-400">{advantage.icon}</span>
                <div>
                  <div className="font-semibold text-gray-200">{advantage.title}</div>
                  <div className="text-xs text-gray-400">{advantage.desc}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Usage Instructions */}
      <div className="glass p-6 mt-6">
        <h3 className="font-display text-lg tracking-wider text-gray-300 mb-4">
          💡 Instructions d'utilisation
        </h3>
        <div className="space-y-3 text-sm text-gray-400">
          <div className="flex items-start gap-2">
            <span className="text-accent-primary">•</span>
            <span>
              <strong>Mode LLM</strong>: Pour des questions complexes, analyses approfondies et conversations contextuelles
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-neon-blue">•</span>
            <span>
              <strong>Mode Expert</strong>: Pour des réponses rapides basées sur des règles cybersécurité établies
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-purple-400">•</span>
            <span>
              <strong>Basculez</strong>: Utilisez le mode adapté à votre besoin pour une assistance optimale
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
