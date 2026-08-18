import React, { useState } from 'react'

export default function AssistantMinimal() {
  const [mode, setMode] = useState('expert')

  const renderContent = () => {
    switch(mode) {
      case 'expert':
        return (
          <div style={{ padding: '20px', backgroundColor: '#2a2a2a', color: 'white', height: '400px' }}>
            <h2>🛡️ Expert Mode</h2>
            <p>Mode Expert avec réponses basées sur des règles.</p>
            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', marginTop: '10px', borderRadius: '5px' }}>
              <p>✅ Expert Chatbot Component Loaded</p>
            </div>
          </div>
        )
      case 'llm':
        return (
          <div style={{ padding: '20px', backgroundColor: '#2a2a2a', color: 'white', height: '400px' }}>
            <h2>🤖 LLM Mode</h2>
            <p>Mode LLM avec intelligence artificielle.</p>
            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', marginTop: '10px', borderRadius: '5px' }}>
              <p>✅ LLM Chatbot Component Loaded</p>
            </div>
          </div>
        )
      case 'advanced':
        return (
          <div style={{ padding: '20px', backgroundColor: '#2a2a2a', color: 'white', height: '400px' }}>
            <h2>🧠 Advanced AI Mode</h2>
            <p>Mode Advanced AI avec LLM entraîné.</p>
            <div style={{ backgroundColor: '#1a1a1a', padding: '15px', marginTop: '10px', borderRadius: '5px' }}>
              <p>✅ Advanced AI Chatbot Component Loaded</p>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#0f0f0f', padding: '20px' }}>
      <h1 style={{ color: 'white', textAlign: 'center', marginBottom: '30px' }}>
        🔧 Assistant Mode Test
      </h1>
      
      <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '30px' }}>
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

      {renderContent()}
      
      <div style={{ marginTop: '20px', textAlign: 'center', color: '#ccc' }}>
        <p>Mode sélectionné: <strong>{mode}</strong></p>
        <p>Si vous voyez ce message, React fonctionne. Testez les boutons pour changer de mode.</p>
      </div>
    </div>
  )
}
