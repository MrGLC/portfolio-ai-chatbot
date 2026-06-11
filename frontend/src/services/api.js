import axios from 'axios';

// Default to relative URLs: dev server and production nginx both proxy /api to the backend.
const API_URL = import.meta.env.VITE_API_URL || '';
const CHATBOT_API_URL = import.meta.env.VITE_CHATBOT_API_URL || '';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

const chatbotApi = axios.create({
  baseURL: CHATBOT_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const homeAPI = {
  getHomeData: () => api.get('/api/home'),
};

export const aboutAPI = {
  getAboutData: () => api.get('/api/about'),
};

export const projectsAPI = {
  getProjects: () => api.get('/api/projects'),
};

export const chatbotAPI = {
  // Chat operations
  sendMessage: (message, userId = 'user123', sessionId = null, options = {}) => {
    // Real chatbot service not deployed yet — fall back to the backend demo endpoint.
    // Phase 2 swaps this for the configurable provider seam.
    if (!import.meta.env.VITE_CHATBOT_API_URL) {
      return api.post('/api/chatbot/demo', { message });
    }
    return chatbotApi.post('/api/chat', {
      message,
      user_id: userId,
      session_id: sessionId,
      processing_mode: options.processingMode || 'immediate',
      stream: options.stream || false,
      force_new_session: options.forceNewSession || false,
    });
  },

  // WebSocket connection — Phase 3 seam
  createWebSocketConnection: (userId = 'user123', sessionId = null, language = 'en') => {
    const wsUrl = import.meta.env.VITE_WS_URL || 'ws://localhost:5002';
    const params = new URLSearchParams({
      user_id: userId,
      language: language
    });

    if (sessionId) {
      params.append('session_id', sessionId);
    }

    return new WebSocket(`${wsUrl}/ws/query-analyzer?${params.toString()}`);
  },
};

export default api;