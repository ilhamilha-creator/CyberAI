import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Shield, Brain, Zap } from 'lucide-react'
import { cyberApi } from '../services/api'

export default function LLMChatbotFixed() {
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
      const response = await cyberApi.sendLLMMessage({
        message: input,
        context: "cybersecurity",
        conversation_history: messages.slice(-5)
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        confidence: response.data.confidence,
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
                    ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-5 h-5" />
                  ) : (
                    <Bot className="w-5 h-5 text-purple-400" />
                  )}
                </div>
                <div className={`p-3 rounded-lg ${
                  message.type === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-100 border border-gray-700'
                }`}>
                  <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                  {message.confidence && (
                    <div className="mt-2 text-xs opacity-70">
                      Confiance: {Math.round(message.confidence * 100)}% | Catégorie: {message.category}
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
              <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
              <div className="text-gray-400 text-sm">L'IA réfléchit...</div>
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
            placeholder="Posez votre question de cybersécurité..."
            className="flex-1 bg-gray-800 text-gray-100 px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none"
            disabled={isLoading}
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            className="bg-accent-primary/20 border border-accent-primary/30 text-accent-primary px-4 py-3 rounded-lg hover:bg-accent-primary/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
        
        {/* Suggestions rapides */}
        <div className="mt-3 flex flex-wrap gap-2">
          {[
            'Analyser les menaces',
            'Métriques de sécurité',
            'Vulnérabilités détectées',
            'Conseils de sécurité'
          ].map((suggestion, index) => (
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
    </div>
  )
}
