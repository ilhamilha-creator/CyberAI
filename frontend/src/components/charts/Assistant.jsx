import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, AlertCircle } from 'lucide-react'
import { cyberApi } from '../../services/api'

export default function AIAssistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setIsTyping(true)

    try {
      const response = await cyberApi.predict({ query: input.trim() })
      
      setTimeout(() => {
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: response.data?.response || generateMockResponse(input.trim()),
          timestamp: new Date(),
          confidence: response.data?.confidence || 0.85
        }
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
        setLoading(false)
      }, 1500)
    } catch (e) {
      console.error('API Error:', e)
      setTimeout(() => {
        const errorMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: generateMockResponse(input.trim()),
          timestamp: new Date(),
          confidence: 0.75,
          error: true
        }
        setMessages(prev => [...prev, errorMessage])
        setIsTyping(false)
        setLoading(false)
      }, 1500)
    }
  }

  const generateMockResponse = (query) => {
    const responses = {
      'attack': 'Based on the current threat landscape, I detect multiple attack patterns. The most common are DDoS attacks (45%), followed by port scanning (25%) and brute force attempts (15%). Would you like detailed mitigation strategies?',
      'security': 'Current security posture shows 87% effectiveness. Critical recommendations: 1) Update firewall rules, 2) Implement multi-factor authentication, 3) Deploy network segmentation. Need specific guidance?',
      'threat': 'Threat intelligence indicates increased activity from Eastern European APT groups. Primary targets: financial institutions and healthcare sectors. Recommended actions: enhanced monitoring and threat hunting.',
      'network': 'Network analysis reveals unusual traffic patterns on VLAN 10 and 30. Possible lateral movement detected. Recommend immediate investigation of endpoints 192.168.1.150 and 192.168.1.200.',
      'alert': 'There are 12 critical alerts requiring attention. Priority order: 1) SQL injection attempts on web server, 2) Suspicious admin login, 3) Data exfiltration patterns detected.'
    }

    const keywords = Object.keys(responses)
    const matchedKeyword = keywords.find(keyword => query.toLowerCase().includes(keyword))
    
    return matchedKeyword 
      ? responses[matchedKeyword]
      : `I analyze your security environment in real-time. Current status shows normal operation with ${Math.floor(Math.random() * 20) + 5} active alerts being processed. How can I assist your security operations today?`
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl tracking-wider text-gray-200">AI Security Assistant</h2>
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-accent-primary animate-pulse" />
          <span className="text-xs font-mono text-gray-500">GPT-4 Enhanced</span>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 glass p-4 overflow-y-auto mb-4">
        <div className="space-y-4">
          {messages.length === 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="text-center py-8">
              <Bot className="w-12 h-12 mx-auto mb-4 text-accent-primary opacity-50" />
              <p className="text-gray-400 font-mono text-sm">AI Security Assistant ready</p>
              <p className="text-gray-500 text-xs mt-2">Ask about threats, alerts, network status, or security recommendations</p>
            </motion.div>
          )}

          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`flex items-start gap-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.type === 'user' 
                      ? 'bg-accent-primary text-cyber-ink' 
                      : 'bg-neon-blue text-cyber-ink'
                  }`}>
                    {message.type === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>
                  
                  <div className={`glass p-3 rounded-lg ${
                    message.type === 'user' 
                      ? 'bg-accent-primary/10 border border-accent-primary/30' 
                      : 'bg-cyber-surface/50 border border-white/10'
                  }`}>
                    <p className="text-sm text-gray-200">{message.content}</p>
                    
                    {message.type === 'bot' && (
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2">
                          {message.error && <AlertCircle className="w-3 h-3 text-yellow-400" />}
                          <span className="text-xs text-gray-500">
                            Confidence: {Math.round((message.confidence || 0.85) * 100)}%
                          </span>
                        </div>
                        <span className="text-xs text-gray-600">
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex justify-start">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-neon-blue text-cyber-ink flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="glass p-3 rounded-lg bg-cyber-surface/50 border border-white/10">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="glass p-4">
        <div className="flex items-end gap-3">
          <div className="flex-1">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about security threats, alerts, or network status..."
              className="w-full bg-cyber-input border border-white/10 rounded-lg px-4 py-3 text-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-accent-primary/50 resize-none"
              rows={2}
              disabled={loading}
            />
          </div>
          <button
            onClick={sendMessage}
            disabled={!input.trim() || loading}
            className="btn-primary p-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-glow" />
            <span className="text-xs text-gray-500">Connected</span>
          </div>
          <div className="text-xs text-gray-500">
            {messages.length} messages exchanged
          </div>
        </div>
      </div>
    </motion.div>
  )
}
