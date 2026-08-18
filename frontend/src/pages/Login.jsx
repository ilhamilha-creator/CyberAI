import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuthStore } from '../store/authStore'
import { cyberApi } from '../services/api'
import { Shield, Lock, Eye, EyeOff, Brain, Zap, Globe, Radio, Activity, Sparkles } from 'lucide-react'

const heroImages = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80',
  'https://images.unsplash.com/photo-1563206767-5b1d972d9b2f?w=1920&q=80'
]

export default function Login() {
  const [apiKey, setApiKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const login = useAuthStore(s => s.login)

  // Background image rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length)
    }, 8000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = async () => {
    if (!apiKey.trim()) return setError('Enter an API key')
    setLoading(true); setError('')
    
    // Vérification locale des clés API
    const validKeys = {
      'cyberai-admin-key-v8-2024': { token: 'admin-token', user: { role: 'admin', name: 'SOC Administrator' } },
      'cyberai-analyst-key-v8-2024': { token: 'analyst-token', user: { role: 'analyst', name: 'SOC Analyst' } }
    }
    
    if (validKeys[apiKey]) {
      login(validKeys[apiKey].token, validKeys[apiKey].user)
      navigate('/')
    } else {
      setError('Invalid API key')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-cyber-ink">
      {/* Animated Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImageIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 0.2, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 2 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentImageIndex]}
            alt="Cyber Security Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-ink via-cyber-surface to-cyber-card" />
        </motion.div>
      </AnimatePresence>

      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-accent-primary/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0, 1, 0],
              scale: [1, 1.5, 1]
            }}
            transition={{
              duration: 5 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      {/* Login Card */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="relative z-10 w-full max-w-lg mx-4"
      >
        <div className="cyber-card p-8 md:p-12 relative overflow-hidden">
          {/* Decorative Elements */}
          <motion.div
            className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-accent-primary/20 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
          <motion.div
            className="absolute -bottom-20 -left-20 w-40 h-40 bg-gradient-to-tr from-purple-500/20 to-transparent rounded-full blur-3xl"
            animate={{ scale: [1, 1.5, 1] }}
            transition={{ duration: 4, repeat: Infinity, delay: 2 }}
          />

          <div className="relative z-10">
            {/* Logo Section */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary mb-6 shadow-2xl"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(100,255,218,0.3)',
                    '0 0 40px rgba(100,255,218,0.5)',
                    '0 0 20px rgba(100,255,218,0.3)'
                  ]
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Shield className="w-10 h-10 text-cyber-ink" />
              </motion.div>
              
              <motion.h1
                className="font-display text-5xl font-bold mb-2"
                animate={{
                  backgroundPosition: ['0%', '100%', '0%'],
                }}
                style={{
                  background: 'linear-gradient(90deg, #64ffda, #00b4d8, #7c3aed, #64ffda)',
                  backgroundSize: '300% 100%',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
                transition={{ duration: 5, repeat: Infinity }}
              >
                CYBERAI
              </motion.h1>
              
              <motion.p
                className="text-gray-400 text-sm font-mono tracking-wider"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                SOC AI Platform v8.0
              </motion.p>
            </motion.div>

            {/* Features Grid */}
            <motion.div
              className="grid grid-cols-3 gap-3 mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {[
                { icon: Brain, label: 'AI Powered', color: 'from-purple-500 to-pink-500' },
                { icon: Zap, label: 'Real-time', color: 'from-yellow-500 to-orange-500' },
                { icon: Globe, label: 'Global', color: 'from-green-500 to-teal-500' }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  className="text-center p-3 bg-white/5 rounded-xl border border-white/10 hover:border-accent-primary/30 transition-all hover:bg-white/10"
                  whileHover={{ scale: 1.05, y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                >
                  <motion.div
                    className={`w-10 h-10 mx-auto mb-2 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center`}
                    whileHover={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <feature.icon className="w-5 h-5 text-white" />
                  </motion.div>
                  <p className="text-xs text-gray-400 font-medium">{feature.label}</p>
                </motion.div>
              ))}
            </motion.div>

            {/* Login Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <div className="space-y-4">
                <div className="relative">
                  <motion.div
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-accent-primary"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Lock className="w-5 h-5" />
                  </motion.div>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={apiKey} 
                    onChange={e => setApiKey(e.target.value)} 
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    placeholder="Enter API Key..." 
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 pl-12 pr-12 text-gray-300 font-mono text-sm focus:border-accent-primary focus:ring-2 focus:ring-accent-primary/30 outline-none transition-all duration-300 hover:border-white/20 placeholder-gray-500"
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-accent-primary transition-colors"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </motion.button>
                </div>

                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm font-mono flex items-center gap-2"
                  >
                    <Activity className="w-4 h-4" />
                    {error}
                  </motion.p>
                )}

                <motion.button 
                  onClick={handleLogin} 
                  disabled={loading} 
                  className="w-full py-4 bg-gradient-to-r from-accent-primary to-accent-secondary text-cyber-ink font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                    initial={{ x: '-100%' }}
                    whileHover={{ x: '100%' }}
                    transition={{ duration: 0.5 }}
                  />
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Sparkles className="w-5 h-5" />
                        </motion.div>
                        Connecting...
                      </>
                    ) : (
                      <>
                        <Radio className="w-5 h-5" />
                        Access SOC Platform
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
            </motion.div>

            {/* Quick Access Keys */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 pt-6 border-t border-white/10"
            >
              <p className="text-xs text-gray-500 font-mono mb-3 text-center">Quick Access Keys:</p>
              <div className="space-y-2">
                {[
                  { key: 'cyberai-admin-key-v8-2024', role: 'Administrator', color: 'text-accent-primary' },
                  { key: 'cyberai-analyst-key-v8-2024', role: 'Analyst', color: 'text-accent-secondary' }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10 hover:border-accent-primary/30 transition-all cursor-pointer group"
                    onClick={() => setApiKey(item.key)}
                    whileHover={{ x: 5, backgroundColor: 'rgba(100,255,218,0.05)' }}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + i * 0.1 }}
                  >
                    <div className="flex items-center gap-3">
                      <Lock className="w-4 h-4 text-gray-500 group-hover:text-accent-primary transition-colors" />
                      <div>
                        <p className={`text-xs font-mono ${item.color} group-hover:text-accent-primary transition-colors`}>
                          {item.key}
                        </p>
                        <p className="text-xs text-gray-500">{item.role}</p>
                      </div>
                    </div>
                    <motion.div
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.2 }}
                    >
                      <Activity className="w-4 h-4 text-accent-primary" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 text-center"
            >
              <p className="text-xs text-gray-600 font-mono">
                Powered by Advanced AI & Machine Learning
              </p>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}