import React, { useState } from 'react'
import TestChatbot from '../components/TestChatbot'
import TestAdvancedAI from '../components/TestAdvancedAI'
import SecurityChatbot from '../components/SecurityChatbot'

export default function AssistantTest() {
  const [mode, setMode] = useState('expert')

  return (
    <div style={{ padding: '20px', height: '100vh', backgroundColor: '#0f0f0f', color: 'white' }}>
      <h1>🔧 MODE TEST ASSISTANT</h1>
      
      {/* Boutons de sélection de mode */}
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => setMode('expert')}
          style={{ 
            margin: '5px', 
            padding: '10px 20px', 
            backgroundColor: mode === 'expert' ? '#007acc' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          🔵 Expert
        </button>
        <button 
          onClick={() => setMode('llm')}
          style={{ 
            margin: '5px', 
            padding: '10px 20px', 
            backgroundColor: mode === 'llm' ? '#9333ea' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          🟣 LLM
        </button>
        <button 
          onClick={() => setMode('advanced')}
          style={{ 
            margin: '5px', 
            padding: '10px 20px', 
            backgroundColor: mode === 'advanced' ? '#10b981' : '#333',
            color: 'white',
            border: 'none',
            borderRadius: '5px'
          }}
        >
          🟢 Advanced AI
        </button>
      </div>

      {/* Affichage du composant sélectionné */}
      <div style={{ 
        border: '2px solid #333', 
        borderRadius: '10px', 
        padding: '20px',
        backgroundColor: '#1a1a1a',
        height: 'calc(100vh - 200px)'
      }}>
        {mode === 'expert' && (
          <div>
            <h3>🛡️ Mode Expert</h3>
            <SecurityChatbot />
          </div>
        )}
        {mode === 'llm' && (
          <div>
            <h3>🤖 Mode LLM</h3>
            <TestChatbot />
          </div>
        )}
        {mode === 'advanced' && (
          <div>
            <h3>🧠 Mode Advanced AI</h3>
            <TestAdvancedAI />
          </div>
        )}
      </div>

      <div style={{ marginTop: '20px', fontSize: '12px', opacity: '0.7' }}>
        <p>Mode actuel: <strong>{mode}</strong></p>
        <p>Si vous voyez ce message, la page fonctionne. Si le contenu ne change pas quand vous cliquez sur les boutons, il y a un problème React.</p>
      </div>
    </div>
  )
}
