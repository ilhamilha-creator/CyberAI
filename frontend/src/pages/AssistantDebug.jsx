import React, { useState, useEffect } from 'react'
import LLMChatbot from '../components/LLMChatbot'
import AdvancedAIChatbot from '../components/AdvancedAIChatbot'
import SecurityChatbot from '../components/SecurityChatbot'

export default function AssistantDebug() {
  const [mode, setMode] = useState('expert')
  const [error, setError] = useState(null)

  useEffect(() => {
    // Capturer les erreurs JavaScript globales
    const handleError = (event) => {
      setError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack
      })
      console.error('React Error caught:', event.error)
    }

    const handleUnhandledRejection = (event) => {
      setError({
        message: event.reason,
        type: 'Unhandled Promise Rejection'
      })
      console.error('Unhandled Rejection:', event.reason)
    }

    window.addEventListener('error', handleError)
    window.addEventListener('unhandledrejection', handleUnhandledRejection)

    return () => {
      window.removeEventListener('error', handleError)
      window.removeEventListener('unhandledrejection', handleUnhandledRejection)
    }
  }, [])

  const renderComponent = () => {
    try {
      switch(mode) {
        case 'expert':
          return <SecurityChatbot />
        case 'llm':
          return <LLMChatbot />
        case 'advanced':
          return <AdvancedAIChatbot />
        default:
          return <SecurityChatbot />
      }
    } catch (err) {
      console.error('Component render error:', err)
      setError({
        message: err.message,
        type: 'Component Render Error',
        stack: err.stack
      })
      return (
        <div style={{ padding: '20px', color: 'red', backgroundColor: '#1a1a1a' }}>
          <h2>❌ Component Error</h2>
          <p>{err.message}</p>
        </div>
      )
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', padding: '20px', color: 'white' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>
        🔧 Assistant Debug Mode
      </h1>
      
      {/* Affichage des erreurs */}
      {error && (
        <div style={{ 
          backgroundColor: '#ff0000', 
          color: 'white', 
          padding: '15px', 
          marginBottom: '20px', 
          borderRadius: '5px',
          fontFamily: 'monospace'
        }}>
          <h3>🚨 JavaScript Error Detected:</h3>
          <p><strong>Error:</strong> {error.message}</p>
          {error.filename && <p><strong>File:</strong> {error.filename}</p>}
          {error.lineno && <p><strong>Line:</strong> {error.lineno}</p>}
          {error.type && <p><strong>Type:</strong> {error.type}</p>}
          {error.stack && (
            <details>
              <summary><strong>Stack Trace</strong></summary>
              <pre style={{ fontSize: '12px' }}>{error.stack}</pre>
            </details>
          )}
        </div>
      )}

      {/* Boutons de sélection de mode */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px' }}>
        <button
          onClick={() => setMode('expert')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'expert' ? '#007acc' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🔵 Expert
        </button>
        <button
          onClick={() => setMode('llm')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'llm' ? '#9333ea' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🟣 LLM
        </button>
        <button
          onClick={() => setMode('advanced')}
          style={{
            padding: '10px 20px',
            backgroundColor: mode === 'advanced' ? '#10b981' : '#555',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          🟢 Advanced AI
        </button>
      </div>

      {/* Zone de test du composant */}
      <div style={{ 
        border: '2px solid #333', 
        borderRadius: '10px', 
        padding: '20px',
        backgroundColor: '#1a1a1a',
        height: 'calc(100vh - 300px)',
        overflow: 'auto'
      }}>
        <h3>Testing {mode} component...</h3>
        {renderComponent()}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', opacity: '0.7' }}>
        <p>Mode actuel: <strong>{mode}</strong></p>
        <p>Si une erreur JavaScript s'affiche au-dessus, le problème est identifié.</p>
        <p>Sinon, vérifiez la console du navigateur (F12) pour d'autres erreurs.</p>
      </div>
    </div>
  )
}
