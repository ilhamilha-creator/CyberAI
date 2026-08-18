import axios from 'axios'
import { useAuthStore } from '../store/authStore'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

const api = axios.create({ 
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  }
})

api.interceptors.request.use(config => {
  const token = useAuthStore.getState().token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) useAuthStore.getState().logout()
  return Promise.reject(err)
})

export const cyberApi = {
  login: (apiKey) => api.post('/auth/login', { api_key: apiKey }),
  getMetrics: () => api.get('/metrics'),
  getAlerts: (params) => api.get('/alerts', { params }),
  updateAlertStatus: (id, status) => api.put(`/alerts/${id}/status`, { status }),
  getTimeline: (hours = 24) => api.get(`/metrics/timeline?hours=${hours}`),
  getDistribution: () => api.get('/metrics/distribution'),
  getThreats: () => api.get('/threats'),
  getKillChain: () => api.get('/kill-chain'),
  getVlans: () => api.get('/vlans'),
  getModels: () => api.get('/models'),
  predict: (data) => api.post('/predict', data),
  getHealth: () => api.get('/health'),
  getDatasets: () => api.get('/datasets'),
  getThreatIntel: () => api.get('/threat-intel'),
  blockIP: (ip, reason) => api.post('/threats/block-ip', { ip, reason }),
  retrain: () => api.post('/models/retrain'),
  getAdminStats: () => api.get('/admin/stats'),
  getMLOpsStatus: () => api.get('/ml-ops/status'),
  // LLM Chat API
  sendLLMMessage: (data) => api.post('/llm/chat', data),
  getLLMModels: () => api.get('/llm/models'),
  submitLLMFeedback: (data) => api.post('/llm/feedback', data),
  // Advanced AI API
  getAIStatus: () => api.get('/ai/status'),
  sendAIMessage: (data) => api.post('/ai/chat', data),
  initializeAI: () => api.post('/ai/initialize'),
  getTrainingStatus: () => api.get('/ai/training-status'),
  searchKnowledge: (data) => api.post('/ai/knowledge-search', data),
  classifyThreat: (data) => api.post('/ai/classify-threat', data),
}

export default api
