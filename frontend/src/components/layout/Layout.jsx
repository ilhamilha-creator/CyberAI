import React, { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuthStore } from '../../store/authStore'
import { LayoutDashboard, AlertTriangle, Target, Link2, Globe, Brain, FileText, Settings, Shield, Bot, Search, Map, Cpu, Activity, Zap, Lock, Eye, Wifi } from 'lucide-react'

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', color: 'from-cyan-400 to-blue-500' },
  { to: '/alerts', icon: AlertTriangle, label: 'Alerts', color: 'from-red-400 to-orange-500' },
  { to: '/mitre', icon: Target, label: 'MITRE ATT&CK', color: 'from-purple-400 to-pink-500' },
  { to: '/killchain', icon: Link2, label: 'Kill Chain', color: 'from-blue-400 to-indigo-500' },
  { to: '/network', icon: Globe, label: 'Network', color: 'from-green-400 to-teal-500' },
  { to: '/ai', icon: Brain, label: 'ML / AI', color: 'from-violet-400 to-purple-500' },
  { to: '/threat-intel', icon: Shield, label: 'Threat Intel', color: 'from-yellow-400 to-orange-500' },
  { to: '/assistant', icon: Bot, label: 'AI Assistant', color: 'from-pink-400 to-rose-500' },
  { to: '/hunting', icon: Search, label: 'Threat Hunting', color: 'from-indigo-400 to-blue-500' },
  { to: '/attack-map', icon: Map, label: 'Attack Map', color: 'from-red-500 to-pink-500' },
  { to: '/ml-ops', icon: Cpu, label: 'ML Ops', color: 'from-cyan-400 to-teal-500' },
  { to: '/reports', icon: FileText, label: 'Reports', color: 'from-gray-400 to-slate-500' },
  { to: '/admin', icon: Settings, label: 'Admin', color: 'from-slate-400 to-gray-500' },
]

const backgroundImages = [
  'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1920&q=80',
  'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1920&q=80',
  'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1920&q=80',
  'https://images.unsplash.com/photo-1563206767-5b1d972d9b2f?w=1920&q=80'
]

export default function Layout() {
  try {
    const { user, logout } = useAuthStore()
    const [collapsed, setCollapsed] = useState(false)
    const [currentBgIndex, setCurrentBgIndex] = useState(0)
    const [isOnline, setIsOnline] = useState(true)

    // Background image rotation
    React.useEffect(() => {
      const interval = setInterval(() => {
        setCurrentBgIndex((prev) => (prev + 1) % backgroundImages.length)
      }, 15000)
      return () => clearInterval(interval)
    }, [])

    // Online status simulation
    React.useEffect(() => {
      const interval = setInterval(() => {
        setIsOnline(Math.random() > 0.1)
      }, 5000)
      return () => clearInterval(interval)
    }, [])

    return (
      <div className="flex h-screen overflow-hidden relative">
        {/* Animated Background */}
        <div className="absolute inset-0 z-0">
          <img
            src={backgroundImages[currentBgIndex]}
            alt="Background"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-cyber-ink via-cyber-surface to-cyber-card" />
        </div>

        {/* Sidebar */}
        <aside className={`${collapsed ? 'w-20' : 'w-72'} bg-cyber-sidebar/90 backdrop-blur-2xl border-r border-white/10 flex flex-col transition-all duration-500 relative z-20`}>
          {/* Logo Section */}
          <div className="p-6 border-b border-white/5">
            <h1 
              className="font-display text-3xl tracking-[6px] cyber-gradient-text font-bold cursor-pointer"
              onClick={() => setCollapsed(!collapsed)}
            >
              {collapsed ? 'C' : 'CYBERAI'}
            </h1>
            {!collapsed && (
              <p className="text-xs text-gray-400 mt-2 font-mono tracking-wider">
                SOC Platform v8.0
              </p>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4 space-y-1">
            {NAV.map(({ to, icon: Icon, label, color }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative group flex items-center gap-3 px-4 py-3 mx-2 rounded-xl transition-all duration-300 ${
                    isActive
                      ? `bg-gradient-to-r ${color} text-white shadow-lg`
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`
                }
              >
                <Icon size={20} />
                {!collapsed && <span className="font-medium text-sm">{label}</span>}
              </NavLink>
            ))}
          </nav>

          {/* User Section */}
          <div className="p-4 border-t border-white/5">
            {!collapsed && (
              <div className="space-y-2">
                <p className="text-xs text-gray-500 font-mono">{user?.name || 'User'} ({user?.role || 'Analyst'})</p>
                <button 
                  onClick={logout} 
                  className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all text-sm font-medium"
                >
                  <Lock size={16} />
                  Logout
                </button>
              </div>
            )}
            {collapsed && (
              <button 
                onClick={logout} 
                className="w-full flex items-center justify-center p-2 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 rounded-lg transition-all"
              >
                <Lock size={20} />
              </button>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto relative z-10">
          {/* Topbar */}
          <header className="sticky top-0 z-40 bg-cyber-surface/80 backdrop-blur-2xl border-b border-white/10 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center">
                  <Eye className="w-6 h-6 text-cyber-ink" />
                </div>
                <div>
                  <h1 className="font-display text-xl tracking-wider text-white">
                    SECURITY OPERATIONS CENTER
                  </h1>
                  <p className="text-xs text-gray-400 font-mono">Advanced Threat Intelligence Platform</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-xs font-mono text-gray-400">
                      {isOnline ? 'ONLINE' : 'OFFLINE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-lg border border-white/10">
                    <Wifi className="w-4 h-4 text-accent-primary" />
                    <span className="text-xs font-mono text-gray-400">SECURE</span>
                  </div>

                  <div className="flex items-center gap-2 px-3 py-1.5 bg-accent-primary/10 rounded-lg border border-accent-primary/30">
                    <Activity className="w-4 h-4 text-accent-primary" />
                    <span className="text-xs font-mono text-accent-primary">LIVE</span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-mono text-white font-bold">
                    {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {new Date().toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </p>
                </div>
              </div>
            </div>
          </header>

          {/* Content Area */}
          <div className="p-6 relative">
            <Outlet />
          </div>
        </main>
      </div>
    )
  } catch (error) {
    console.error('Layout error:', error)
    return (
      <div className="flex items-center justify-center h-screen bg-cyber-ink">
        <div className="text-center">
          <div className="text-red-500 font-display text-2xl mb-4">Layout Error</div>
          <div className="text-gray-500 text-sm font-mono">{error.message}</div>
        </div>
      </div>
    )
  }
}