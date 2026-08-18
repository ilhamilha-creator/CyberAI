import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Shield, AlertTriangle, Brain, Zap, Activity, CheckCircle } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function LLMChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '🤖 **CyberAI LLM Assistant**\n\nBonjour ! Je suis votre assistant de cybersécurité basé sur l\'intelligence artificielle spécialisée. Je peux analyser les menaces, détecter les malwares, évaluer les vulnérabilités et vous fournir des conseils de sécurité avancés.\n\n**Mes capacités IA :**\n🔍 Analyse DDoS et malwares\n🛡️ Évaluation des vulnérabilités\n🎣 Détection de phishing\n📊 Analyse de métriques de sécurité\n🧠 Intelligence sur les menaces\n\nPosez-moi vos questions de cybersécurité !',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [modelInfo, setModelInfo] = useState(null)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // Charger les informations du modèle au démarrage
    loadModelInfo()
  }, [])

  const loadModelInfo = async () => {
    try {
      // Simuler le chargement des infos modèle pour éviter l'erreur API
      setModelInfo({
        available_models: [
          {
            name: "CyberAI-LLM-v1.0",
            type: "Specialized Security LLM",
            description: "Modèle spécialisé en cybersécurité avec base de connaissances structurée",
            capabilities: ["DDoS Analysis", "Malware Detection", "Vulnerability Assessment", "Phishing Detection", "Security Guidance", "Threat Intelligence"],
            confidence_threshold: 0.85,
            languages: ["fr", "en"],
            specialization: "cybersecurity"
          }
        ],
        default_model: "CyberAI-LLM-v1.0",
        features: [
          "Context-aware responses",
          "Knowledge base integration", 
          "Confidence scoring",
          "Multi-language support",
          "Real-time analysis"
        ]
      })
    } catch (error) {
      console.error('Error loading model info:', error)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)
    setIsLoading(true)

    try {
      const response = await cyberApi.sendLLMMessage({
        message: input,
        context: "cybersecurity",
        conversation_history: messages.slice(-5) // Envoyer les 5 derniers messages pour le contexte
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.response,
        confidence: response.confidence,
        model: response.model,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      
      // Envoyer le feedback pour améliorer le modèle
      if (response.confidence > 0.8) {
        await cyberApi.submitLLMFeedback({
          message: input,
          response: response.response,
          rating: "good",
          category: response.category
        })
      }
    } catch (error) {
      console.error('Error sending message:', error)
      let errorContent = '❌ **Erreur de communication avec l\'IA**\n\nDésolé, je ne peux pas traiter votre demande pour le moment.\n\n**Détails de l\'erreur :**\n'
      
      if (error.response) {
        errorContent += `• Code: ${error.response.status}\n`
        errorContent += `• Message: ${error.response.data?.error || error.response.data?.detail || 'Erreur serveur'}\n`
      } else if (error.request) {
        errorContent += '• Problème de connexion réseau\n'
      } else {
        errorContent += `• Erreur: ${error.message}\n`
      }
      
      errorContent += '\n**Solutions possibles :**\n• Vérifiez la connexion au backend\n• Réessayez dans quelques instants\n• Contactez l\'administrateur système'
      
      const errorMessage = {
        id: Date.now() + 2,
        type: 'bot',
        content: errorContent,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getBotIcon = (confidence = 0.85) => {
    if (confidence >= 0.9) {
      return <CheckCircle className="w-4 h-4 text-green-400" />
    } else if (confidence >= 0.8) {
      return <Brain className="w-4 h-4 text-accent-primary" />
    } else if (confidence >= 0.7) {
      return <Activity className="w-4 h-4 text-yellow-400" />
    } else {
      return <AlertTriangle className="w-4 h-4 text-orange-400" />
    }
  }

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.9) return 'text-green-400'
    if (confidence >= 0.8) return 'text-accent-primary'
    if (confidence >= 0.7) return 'text-yellow-400'
    return 'text-orange-400'
  }

  const clearChat = () => {
    setMessages([
      {
        id: Date.now(),
        type: 'bot',
        content: '🤖 **CyberAI LLM Assistant**\n\nConversation effacée. Comment puis-je vous aider maintenant ?',
        timestamp: new Date()
      }
    ])
  }

  const suggestions = [
    'Analyser une attaque DDoS',
    'Détecter un malware',
    'Évaluer une vulnérabilité',
    'Conseils de sécurité',
    'Analyser des logs de sécurité'
  ]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass neon-border h-[600px] flex flex-col"
    >
      {/* Header avec info modèle */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              <Brain className="w-6 h-6 text-accent-primary" />
            </motion.div>
            <div>
              <h3 className="font-display text-lg tracking-wider text-gray-200">CyberAI LLM</h3>
              <p className="text-xs text-gray-500 font-mono">Security Intelligence AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 rounded-full bg-green-400"
            />
            <span className="text-xs font-mono text-green-400">ONLINE</span>
          </div>
        </div>
        
        {/* Info modèle */}
        {modelInfo && (
          <div className="mt-2 text-xs text-gray-400">
            <span className="font-mono">Modèle: {modelInfo.default_model}</span>
            <span className="mx-2">|</span>
            <span className="font-mono">Confiance: {modelInfo.available_models?.[0]?.confidence_threshold}</span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {message.type === 'bot' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                  {message.confidence ? getBotIcon(message.confidence) : <Bot className="w-4 h-4 text-accent-primary" />}
                </div>
              )}
              
              <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-accent-primary/20 text-accent-primary ml-auto' 
                    : 'bg-cyber-surface/50 text-gray-300'
                }`}>
                  <div className="whitespace-pre-line text-sm font-mono">
                    {message.content}
                  </div>
                  {message.type === 'bot' && message.confidence && (
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/10">
                      <span className="text-xs text-gray-500">Confiance</span>
                      <div className="flex items-center gap-2">
                        <div className={`text-xs font-mono ${getConfidenceColor(message.confidence)}`}>
                          {Math.round(message.confidence * 100)}%
                        </div>
                        {getBotIcon(message.confidence)}
                      </div>
                    </div>
                  )}
                  {message.type === 'bot' && message.model && (
                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-white/10">
                      <span className="text-xs text-gray-500">Modèle</span>
                      <span className="text-xs font-mono text-accent-primary">{message.model}</span>
                    </div>
                  )}
                </div>
                <div className="text-xs text-gray-500 font-mono mt-1 px-2">
                  {message.timestamp.toLocaleTimeString('fr-FR')}
                </div>
              </div>
              
              {message.type === 'user' && (
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-blue/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-neon-blue" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3 justify-start"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-accent-primary" />
            </div>
            <div className="bg-cyber-surface/50 text-gray-300 p-3 rounded-lg">
              <div className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-accent-primary rounded-full"
                    animate={{ scale: [1, 1.5, 1] }}
                    transition={{
                      duration: 0.8,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-400">L'IA analyse...</span>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2 mb-3">
          <button
            onClick={clearChat}
            className="text-xs bg-cyber-surface/30 text-gray-400 px-3 py-1 rounded-full border border-white/10 hover:bg-cyber-surface/50 transition-all"
          >
            Effacer
          </button>
          {modelInfo && (
            <div className="flex-1 text-xs text-gray-500 text-center">
              <span className="font-mono">
                {modelInfo.available_models?.[0]?.capabilities?.slice(0, 3).join(' • ')} • {modelInfo.available_models?.[0]?.capabilities?.length + 1} capacités
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question de cybersécurité..."
            className="flex-1 bg-cyber-input border border-white/10 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none transition-all"
            disabled={isLoading}
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-accent-primary/20 border border-accent-primary/30 text-accent-primary px-4 py-3 rounded-lg hover:bg-accent-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity }}
              >
                <Zap className="w-4 h-4" />
              </motion.div>
            ) : (
              <Send className="w-4 h-4" />
            )}
          </motion.button>
        </div>
        
        {/* Suggestions rapides */}
        <div className="flex flex-wrap gap-2 mt-3">
          {suggestions.map((suggestion, index) => (
            <motion.button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs bg-cyber-surface/30 text-gray-400 px-3 py-1 rounded-full border border-white/5 hover:bg-accent-primary/10 hover:text-accent-primary transition-all"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              {suggestion}
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
