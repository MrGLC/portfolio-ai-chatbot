import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const CHATBOT_API_URL = process.env.REACT_APP_CHATBOT_API_URL || 'http://localhost:5002';

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
  sendMessage: (message, userId = 'user123', sessionId = null, options = {}) => chatbotApi.post('/api/chat', { 
    message, 
    user_id: userId,
    session_id: sessionId,
    processing_mode: options.processingMode || 'immediate',
    stream: options.stream || false,
    force_new_session: options.forceNewSession || false
  }),
  
  // WebSocket connection
  createWebSocketConnection: (userId = 'user123', sessionId = null, language = 'en') => {
    const wsUrl = process.env.REACT_APP_WS_URL || 'ws://localhost:5002';
    const params = new URLSearchParams({
      user_id: userId,
      language: language
    });
    
    if (sessionId) {
      params.append('session_id', sessionId);
    }
    
    return new WebSocket(`${wsUrl}/ws/query-analyzer?${params.toString()}`);
  },
  
  // Session management
  createNewSession: (userId, title = 'New Chat') => chatbotApi.post('/api/sessions/new', { user_id: userId, title }),
  getUserConversations: (userId) => chatbotApi.get(`/api/users/${userId}/conversations`),
  getSessionConversation: (sessionId) => chatbotApi.get(`/api/sessions/${sessionId}/conversation`),
  
  // User management
  getUserFacts: (userId) => chatbotApi.get(`/api/users/${userId}/facts`),
  updateUserSettings: (userId, settings) => chatbotApi.put(`/api/users/${userId}/settings`, settings),
  
  // Model management
  getModels: () => chatbotApi.get('/models'),
  getCurrentModel: () => chatbotApi.get('/model'),
  switchModel: (model) => chatbotApi.post('/model', { model }),
  
  // MCP Store integration
  getMCPServers: () => chatbotApi.get('/api/mcp/servers'),
  connectMCPServer: (serverConfig) => chatbotApi.post('/api/mcp/servers', serverConfig),
  getMCPTools: () => chatbotApi.get('/api/mcp/tools'),
  executeMCPTool: (toolName, params) => chatbotApi.post(`/api/mcp/tools/${toolName}/execute`, params),
  
  // Health & status
  getHealth: () => chatbotApi.get('/health'),
  
  // Analysis
  getAnalysis: (userId) => chatbotApi.get(`/api/analysis/${userId}/latest`)
};

export default api;