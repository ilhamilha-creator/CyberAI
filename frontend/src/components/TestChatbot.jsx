import React from 'react'

export default function TestChatbot() {
  return (
    <div style={{ padding: '20px', height: '100vh', backgroundColor: '#1a1a1a', color: 'white' }}>
      <h2>🤖 TEST LLM CHATBOT</h2>
      <p>Ceci est un composant de test pour vérifier si LLM s'affiche.</p>
      <div style={{ border: '1px solid #333', padding: '10px', margin: '10px 0', backgroundColor: '#2a2a2a' }}>
        <p>✅ Composant LLM chargé avec succès</p>
        <p>📝 Si vous voyez ce message, le mode LLM fonctionne</p>
      </div>
    </div>
  )
}
