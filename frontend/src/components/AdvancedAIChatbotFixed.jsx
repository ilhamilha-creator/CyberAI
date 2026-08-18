import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Brain, Zap } from 'lucide-react'
import { cyberApi } from '../services/api'

const AdvancedAIChatbotFixed = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '🧠 **CyberAI Advanced LLM - Assistant Intelligent Spécialisé**\n\nBonjour ! Je suis votre assistant de cybersécurité avancé, entraîné sur des datasets spécialisés.\n\n**🚀 Mes capacités avancées :**\n• LLM Entraîné : Fine-tuné sur NSL-KDD, CIC-IDS2017, UNSW-NB15\n• Base de connaissances : Vector database avec 25+ domaines\n• Classification de menaces : IA pour détection automatique\n• Apprentissage continu : Amélioration avec feedback\n\n**📊 Datasets d\'entraînement :**\n• NSL-KDD (148K+ enregistrements)\n• CIC-IDS2017 (2.8M+ flux réseau)\n• UNSW-NB15 (2.5M+ attaques)\n\nPosez-moi vos questions de cybersécurité !',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

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
    setIsLoading(true)
    setIsTyping(true)

    try {
      const response = await cyberApi.sendAIMessage({
        message: input,
        context: 'cybersecurity'
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        confidence: response.data.confidence,
        model: response.data.model,
        category: response.data.category,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])

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

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex items-start space-x-2 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-green-500 to-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Brain className="w-5 h-5 text-green-400" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.confidence && (
                    <div className="mt-2 text-xs opacity-70">
                      Confiance: {Math.round(message.confidence * 100)}% | Modèle: {message.model}
                    </div>
                  )}
                  <div className="mt-1 text-xs opacity-50">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700">
              <Brain className="w-5 h-5 text-green-400 animate-pulse" />
              <div className="text-gray-400 text-sm">L'IA Advanced réfléchit...</div>
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-700 p-4">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez votre question de cybersécurité avancée..."
            className="flex-1 bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
            disabled={isLoading}
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-gradient-to-r from-green-500 to-blue-500 border border-green-400/30 text-white px-4 py-3 rounded-lg hover:from-green-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Suggestions rapides */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'Analyser IP suspecte',
            'Détecter malware',
            'Évaluer vulnérabilité',
            'Analyse DDoS'
          ].map((suggestion, index) => (
            <motion.button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs bg-cyber-surface/30 text-gray-400 px-3 py-1 rounded-full border border-white/5 hover:bg-green-500/10 hover:text-green-400 transition-all"
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
    </div>
  )
}

export default AdvancedAIChatbotFixed
