import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Shield, AlertTriangle, Brain, Zap } from 'lucide-react'

export default function SecurityChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '🛡️ CyberAI Assistant ready. Je peux analyser les menaces, expliquer les alertes et vous aider avec la sécurité réseau. Posez-moi vos questions !',
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Réponses intelligentes basées sur les motifs de sécurité
  const getSecurityResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    // Détection DDoS
    if (input.includes('ddos') || input.includes('attack') || input.includes('flood')) {
      return {
        content: `🚨 **Analyse DDoS détectée**\n\n• Type: ${['SYN Flood', 'UDP Flood', 'HTTP Flood'][Math.floor(Math.random() * 3)]}\n• Source: ${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}\n• Sévérité: ÉLEVÉE\n\n**Actions recommandées:**\n1. Activer le rate limiting\n2. Bloquer l'IP source\n3. Augmenter la capacité des serveurs`,
        type: 'threat'
      }
    }
    
    // Questions sur les métriques
    if (input.includes('métrique') || input.includes('statistique') || input.includes('performance')) {
      return {
        content: `📊 **Métriques de sécurité actuelles**\n\n• **CPU Usage**: ${Math.floor(Math.random() * 30 + 60)}%\n• **Memory**: ${Math.floor(Math.random() * 20 + 70)}%\n• **Bandwidth**: ${Math.floor(Math.random() * 500 + 500)} Mbps\n• **Active Connections**: ${Math.floor(Math.random() * 200 + 300)}\n• **Threat Level**: ${['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]}\n\nToutes les métriques sont dans les limites normales.`,
        type: 'metrics'
      }
    }
    
    // Analyse de logs
    if (input.includes('log') || input.includes('analyse') || input.includes('erreur')) {
      return {
        content: `🔍 **Analyse des logs récents**\n\n**Alertes critiques:**\n• Tentative de brute force détectée - Port 22\n• Scan de ports suspect - 192.168.1.${Math.floor(Math.random() * 255)}\n• Traffic anormal sur le serveur web\n\n**Recommandations:**\n• Renforcer les mots de passe\n• Configurer le fail2ban\n• Surveiller les connexions inhabituelles`,
        type: 'analysis'
      }
    }
    
    // Questions sur les vulnérabilités
    if (input.includes('vulnérabilité') || input.includes('faille') || input.includes('patch')) {
      return {
        content: `🛡️ **Analyse des vulnérabilités**\n\n**Vulnérabilités détectées:**\n• CVE-2024-0001: Apache (Critical)\n• CVE-2024-0002: OpenSSL (High)\n• CVE-2024-0003: WordPress (Medium)\n\n**Patches disponibles:** ✅\n• Apache 2.4.58 disponible\n• OpenSSL 3.0.12 disponible\n• WordPress 6.4.2 disponible\n\n**Action recommandée:** Appliquer les patches dans les 48h.`,
        type: 'vulnerability'
      }
    }
    
    // Questions générales sur la sécurité
    if (input.includes('sécurité') || input.includes('protéger') || input.includes('conseil')) {
      return {
        content: `🔒 **Conseils de sécurité**\n\n**Mesures essentielles:**\n1. **Mots de passe forts**: 12+ caractères, symboles, chiffres\n2. **MFA**: Activez l'authentification multi-facteurs\n3. **Mises à jour**: Patchs réguliers des systèmes\n4. **Surveillance**: Monitoring 24/7 des activités\n5. **Sauvegardes**: Tests réguliers de restauration\n\n**Niveau de sécurité actuel**: ${Math.floor(Math.random() * 30 + 70)}/100`,
        type: 'advice'
      }
    }
    
    // Réponse par défaut intelligente
    const responses = [
      {
        content: `🧠 **Analyse en cours...**\n\nBasé sur votre demande, j'analyse les patterns de sécurité actuels.\n\n**Résultat**: Aucune menace immédiate détectée.\n**Recommandation**: Continuer la surveillance normale.\n\nAutres questions sur la sécurité réseau ?`,
        type: 'general'
      },
      {
        content: `⚡ **Intelligence sécurité**\n\nJ'analyse ${Math.floor(Math.random() * 10000 + 5000)} événements/seconde.\n\n**Alertes actives**: ${Math.floor(Math.random() * 10 + 1)}\n**Menaces bloquées aujourd'hui**: ${Math.floor(Math.random() * 100 + 50)}\n\nComment puis-je vous aider plus spécifiquement ?`,
        type: 'general'
      }
    ]
    
    return responses[Math.floor(Math.random() * responses.length)]
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    // Simuler le temps de réponse
    setTimeout(() => {
      const botResponse = getSecurityResponse(input)
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        ...botResponse,
        timestamp: new Date()
      }
      
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1500 + Math.random() * 1000)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getBotIcon = (type) => {
    switch (type) {
      case 'threat': return <AlertTriangle className="w-4 h-4 text-severity-critical" />
      case 'metrics': return <Brain className="w-4 h-4 text-accent-primary" />
      case 'analysis': return <Shield className="w-4 h-4 text-neon-blue" />
      case 'vulnerability': return <Zap className="w-4 h-4 text-severity-high" />
      case 'advice': return <Shield className="w-4 h-4 text-purple-400" />
      default: return <Bot className="w-4 h-4 text-accent-primary" />
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass neon-border h-[600px] flex flex-col"
    >
      {/* En-tête */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Bot className="w-6 h-6 text-accent-primary" />
          </motion.div>
          <div>
            <h3 className="font-display text-lg tracking-wider text-gray-200">CyberAI Assistant</h3>
            <p className="text-xs text-gray-500 font-mono">Security Intelligence Bot</p>
          </div>
          <div className="ml-auto">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 rounded-full bg-green-400"
              />
              <span className="text-xs font-mono text-gray-500">ONLINE</span>
            </div>
          </div>
        </div>
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
                  {getBotIcon(message.type)}
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
            className="flex gap-3"
          >
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-accent-primary" />
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
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez vos questions de sécurité..."
            className="flex-1 bg-cyber-input border border-white/10 rounded-lg px-4 py-3 text-gray-300 font-mono text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none transition-all"
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim() || isTyping}
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
    </motion.div>
  )
}
