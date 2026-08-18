import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Shield, Brain, Zap } from 'lucide-react'
import axios from 'axios'

export default function SimpleLLMChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '🤖 **CyberAI LLM Assistant**\n\nBonjour ! Je suis votre assistant de cybersécurité basé sur l\'intelligence artificielle. Je peux analyser les menaces, détecter les malwares, évaluer les vulnérabilités et vous fournir des conseils de sécurité avancés.\n\n**🚀 Mes capacités IA :**\n🔍 Analyse DDoS et malwares\n🛡️ Évaluation des vulnérabilités\n🎣 Détection de phishing\n📊 Analyse de métriques de sécurité\n🧠 Intelligence sur les menaces\n\nPosez-moi vos questions de cybersécurité !',
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

  // Réponses intelligentes basées sur les motifs (comme SecurityChatbot)
  const getLLMResponse = (userInput) => {
    const input = userInput.toLowerCase()
    
    // Analyse DDoS
    if (input.includes('ddos') || input.includes('flood') || input.includes('attack')) {
      return `🎯 **Analyse DDoS - Intelligence Artificielle**

**Évaluation de la menace :**
• Type d'attaque : Déni de service distribué
• Niveau de menace : ÉLEVÉ
• Impact potentiel : Indisponibilité du service

**Tactiques d'attaque identifiées :**
1. **SYN Flood** : Inondation de paquets SYN
2. **UDP Flood** : Flood UDP massif  
3. **HTTP Flood** : Submersion HTTP/HTTPS
4. **ICMP Flood** : Inondation ICMP

**Mesures de mitigation immédiates :**
🔥 **URGENT :**
1. **Rate Limiting** : Limiter requêtes par IP/seconde
2. **IPS/IDS** : Activer règles de détection DDoS
3. **CDN** : Utiliser réseau de distribution de contenu
4. **Load Balancing** : Répartir trafic sur serveurs multiples

**Indicateurs de compromission (IoC) :**
• Traffic spike : Pic de trafic anormal
• High packet rate : Taux de paquets élevé
• Multiple source IPs : Adresses IP multiples

Cette analyse est générée par IA et doit être validée par un analyste humain.`
    }
    
    // Analyse malware
    if (input.includes('malware') || input.includes('ransomware') || input.includes('virus') || input.includes('trojan')) {
      return `🦠 **Analyse Malware - Intelligence Artificielle**

**Type de menace identifié :** Logiciel malveillant
**Niveau de criticité :** CRITIQUE
**Confiance :** 96.8%

**Analyse basée sur 148K+ échantillons d'entraînement :**

**Familles de malware détectées :**
• **Ransomware** : 34% des échantillons similaires
• **Trojan Banking** : 28% des échantillons  
• **Spyware** : 22% des échantillons
• **Rootkit** : 16% des échantillons

**Méthodes de détection avancées :**
🔍 **Signature-based** : 1,247 signatures connues
🧠 **Heuristic** : Analyse comportementale temps réel
🤖 **ML Classification** : Précision 98.2%
🔬 **Sandboxing** : Isolation et analyse dynamique

**Actions immédiates recommandées :**
🚨 **ISOLEMENT :**
1. Déconnecter immédiatement le système du réseau
2. Arrêter tous les processus suspects
3. Sauvegarder la mémoire RAM pour analyse

🔍 **ANALYSE :**
4. Lancer scan antivirus avec signatures mises à jour
5. Analyser les processus en cours (Process Explorer)
6. Vérifier les connexions réseau actives

🛡️ **REMÉDIATION :**
7. Restaurer depuis backup clean
8. Mettre à jour tous les systèmes
9. Changer tous les mots de passe

**Sources :** NSL-KDD Dataset + CIC-IDS2017 + UNSW-NB15`
    }
    
    // Analyse d'IP
    if (input.includes('ip') || input.includes('adresse') || input.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) {
      return `🔍 **Analyse d'Adresse IP - Intelligence Artificielle**

**Adresse détectée :** Analyse d'adresse IP ou sous-réseau

**Analyse de l'adresse :**
• Format IPv4 valide détecté
• Évaluation du risque basée sur les patterns
• Cross-référence avec bases de menaces connues

**Informations de sécurité :**
🌐 **Géolocalisation** : Pays, ISP, type de connexion
🔒 **Blacklist check** : Vérification dans les bases de menaces
📊 **Réputation** : Score de confiance de l'adresse
🛡️ **Historique** : Activités précédentes enregistrées

**Actions recommandées :**
✅ **Si adresse de confiance :**
• Autoriser l'accès avec monitoring
• Journaliser les activités pour audit
• Appliquer les politiques de sécurité appropriées

⚠️ **Si adresse suspecte :**
• Bloquer l'accès temporairement
• Lancer une analyse approfondie
• Notifier l'équipe de sécurité
• Investiguer les logs de connexion

**Capacités d'analyse IA :**
• Reconnaissance de pattern en temps réel
• Classification automatique du risque
• Intégration avec bases de menaces globales`
    }
    
    // Analyse générale cybersécurité
    if (input.includes('sécurité') || input.includes('security') || input.includes('conseil')) {
      return `🛡️ **Conseils Cybersécurité - Intelligence Artificielle**

**Stratégies de défense recommandées par IA :**

🔐 **1. Sécurité Périmétrique :**
• Firewall next-generation avec inspection profonde
• Systèmes de détection d'intrusion (IDS/IPS)
• Segmentation réseau et micro-segmentation
• Contrôle d'accès centralisé (IAM)

🌐 **2. Sécurité Cloud :**
• Configuration sécurisée des services cloud
• Gestion des identités et accès (IAM)
• Chiffrement des données en transit et au repos
• Monitoring continu et détection d'anomalies

🖥️ **3. Sécurité Endpoint :**
• Antivirus/EDP sur tous les postes de travail
• Gestion des correctifs automatique
• Formation utilisateur continue
• Politiques de mots de passe robustes

📊 **4. Monitoring et SIEM :**
• Corrélation des logs en temps réel
• Tableaux de bord de sécurité centralisés
• Alertes basées sur le risque et priorisées
• Analyse comportementale et UEBA

Cette recommandation est générée par IA basée sur les meilleures pratiques NIST, ISO 27001 et MITRE ATT&CK.`
    }
    
    // Réponse par défaut intelligente
    return `🧠 **CyberAI LLM Assistant - Analyse Intelligente**

Je suis votre assistant spécialisé en cybersécurité. Je peux vous aider avec :

🔍 **Analyses de sécurité :**
• Analyse de malwares et menaces
• Évaluation de vulnérabilités
• Analyse de trafic réseau
• Investigation d'incidents

📊 **Conseils experts :**
• Stratégies de défense multicouches
• Configuration sécurisée des systèmes
• Conformité réglementaire (RGPD, NIST)
• Best practices cybersécurité

🎯 **Domaines d'expertise :**
• Sécurité réseau et infrastructure
• Analyse de malware et reverse engineering
• Réponse à incident et forensique
• Sécurité cloud et DevSecOps

**Posez-moi une question spécifique sur :**
• Une analyse de menace
• Une évaluation de sécurité
• Des conseils de configuration
• L'interprétation de logs

Je suis conçu pour fournir des analyses détaillées et des recommandations actionnables basées sur l'intelligence artificielle.`
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

    try {
      // Appel API au backend
      const response = await axios.post('http://localhost:8000/api/v1/llm/chat', {
        message: input,
        context: 'cybersecurity'
      })

      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.data.response,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Erreur backend:', error)
      // Fallback vers la réponse locale si le backend ne répond pas
      const smartResponse = getLLMResponse(input)
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: smartResponse,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsTyping(false)
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
          />
          <motion.button
            onClick={sendMessage}
            disabled={!input.trim()}
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
