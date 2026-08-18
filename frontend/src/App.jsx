import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import { useAuthStore } from './store/authStore'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const Alerts = lazy(() => import('./pages/Alerts'))
const MitreMatrix = lazy(() => import('./pages/MitreMatrix'))
const KillChain = lazy(() => import('./pages/KillChain'))
const Network = lazy(() => import('./pages/Network'))
const AIModels = lazy(() => import('./pages/AIModels'))
const Reports = lazy(() => import('./pages/Reports'))
const Admin = lazy(() => import('./pages/Admin'))
const ThreatIntel = lazy(() => import('./pages/ThreatIntel'))
const Assistant = lazy(() => import('./pages/Assistant'))
const AssistantDebug = lazy(() => import('./pages/AssistantDebug'))
const AssistantMinimal = lazy(() => import('./pages/AssistantMinimal'))
const ThreatHunting = lazy(() => import('./pages/ThreatHunting'))
const AttackMap = lazy(() => import('./pages/AttackMap'))
const MLOps = lazy(() => import('./pages/MLOps'))

const Loading = () => (
  <div className="flex items-center justify-center h-screen bg-cyber-ink">
    <div className="text-center">
      <div className="text-accent-primary font-display text-3xl tracking-widest animate-pulse mb-4">CYBERAI LOADING...</div>
      <div className="text-gray-500 text-sm font-mono">Initializing security platform</div>
    </div>
  </div>
)

function ProtectedRoute({ children }) {
  try {
    const token = useAuthStore(s => s.token)
    return token ? children : <Navigate to="/login" />
  } catch (error) {
    console.error('ProtectedRoute error:', error)
    return <Navigate to="/login" />
  }
}

export default function App() {
  try {
    return (
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="alerts" element={<Alerts />} />
            <Route path="mitre" element={<MitreMatrix />} />
            <Route path="killchain" element={<KillChain />} />
            <Route path="network" element={<Network />} />
            <Route path="ai" element={<AIModels />} />
            <Route path="reports" element={<Reports />} />
            <Route path="admin" element={<Admin />} />
            <Route path="threat-intel" element={<ThreatIntel />} />
            <Route path="assistant" element={<Assistant />} />
            <Route path="assistant-minimal" element={<AssistantMinimal />} />
            <Route path="hunting" element={<ThreatHunting />} />
            <Route path="attack-map" element={<AttackMap />} />
            <Route path="ml-ops" element={<MLOps />} />
          </Route>
        </Routes>
      </Suspense>
    )
  } catch (error) {
    console.error('App error:', error)
    return (
      <div className="flex items-center justify-center h-screen bg-cyber-ink">
        <div className="text-center">
          <div className="text-red-500 font-display text-2xl mb-4">Error Loading Application</div>
          <div className="text-gray-500 text-sm font-mono">{error.message}</div>
        </div>
      </div>
    )
  }
}