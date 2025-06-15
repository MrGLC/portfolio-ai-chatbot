import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatbotAPI } from '../../services/api';

function ChatbotDemo() {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [entities, setEntities] = useState([]);
  const [intentFlow, setIntentFlow] = useState(null);
  const [typingAnalysis, setTypingAnalysis] = useState(null);
  const [currentModel, setCurrentModel] = useState('openai');
  const [availableModels, setAvailableModels] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  
  const wsRef = useRef(null);
  const userId = 'user123';
  const analysisTimeoutRef = useRef(null);

  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = chatbotAPI.createWebSocketConnection(userId, sessionId);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        switch (data.type) {
          case 'connection':
            if (data.session_id) {
              setSessionId(data.session_id);
            }
            break;
          case 'analysis':
            setAnalysisResult(data);
            setEntities(data.entities || []);
            setIntentFlow(data.flow);
            break;
          case 'error':
            console.error('WebSocket error:', data.message);
            break;
          default:
            break;
        }
      };
      
      wsRef.current.onclose = () => {
        setWsConnected(false);
        console.log('WebSocket disconnected');
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [userId, sessionId]);
  
  const analyzeText = useCallback((text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && text.trim()) {
      wsRef.current.send(JSON.stringify({
        type: 'analyze',
        text: text
      }));
    }
  }, []);
  
  const handleInputChange = (e) => {
    const newMessage = e.target.value;
    setMessage(newMessage);
    
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current);
    }
    
    analysisTimeoutRef.current = setTimeout(() => {
      if (newMessage.trim()) {
        analyzeText(newMessage);
      } else {
        setTypingAnalysis(null);
        setEntities([]);
        setIntentFlow(null);
      }
    }, 300);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { text: message, sender: 'user', timestamp: new Date().toISOString() };
    setMessages([...messages, userMessage]);
    const currentMessage = message;
    setMessage('');
    setLoading(true);
    setTypingAnalysis(null);
    setEntities([]);
    setIntentFlow(null);

    try {
      const response = await chatbotAPI.sendMessage(currentMessage, userId);
      const botMessage = { 
        text: response.data.response, 
        sender: 'bot', 
        timestamp: new Date().toISOString(),
        sessionId: response.data.session_id
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        text: 'Sorry, something went wrong. Please try again.', 
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };
  
  const switchModel = async (model) => {
    try {
      await chatbotAPI.switchModel(model);
      setCurrentModel(model);
    } catch (error) {
      console.error('Error switching model:', error);
    }
  };
  
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await chatbotAPI.getModels();
        setAvailableModels(response.data.available_models || []);
        setCurrentModel(response.data.current_model || 'openai');
      } catch (error) {
        console.error('Error fetching models:', error);
      }
    };
    
    fetchModels();
    connectWebSocket();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);
  
  const highlightEntities = (text, entities) => {
    if (!entities || entities.length === 0) return text;
    
    let highlightedText = text;
    const sortedEntities = [...entities].sort((a, b) => b.start - a.start);
    
    sortedEntities.forEach(entity => {
      const before = highlightedText.substring(0, entity.start);
      const entityText = highlightedText.substring(entity.start, entity.end);
      const after = highlightedText.substring(entity.end);
      
      const colorClass = entity.type === 'company' ? 'bg-blue-100 text-blue-800' :
                        entity.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                        entity.type === 'forex' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800';
      
      highlightedText = before + 
        `<span class="${colorClass} px-1 py-0.5 rounded text-sm font-medium" title="${entity.type}: ${entity.value}">${entityText}</span>` + 
        after;
    });
    
    return highlightedText;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Chatbot Demo</h1>
          <p className="text-lg text-gray-600">
            Experience a sample conversation with my chatbot technology!
          </p>
        </div>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-primary-green to-primary-orange p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                AI Financial Assistant
                <span className={`ml-2 px-2 py-1 text-xs rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                  {wsConnected ? 'Live' : 'Offline'}
                </span>
              </h3>
              <div className="flex items-center space-x-2">
                <select 
                  value={currentModel} 
                  onChange={(e) => switchModel(e.target.value)}
                  className="text-black text-sm px-2 py-1 rounded"
                >
                  {availableModels.map(model => (
                    <option key={model} value={model}>{model.toUpperCase()}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          
          <div className="h-96 overflow-y-auto p-6 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 mt-8">
                <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <p>Start a conversation!</p>
              </div>
            )}
            
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                    msg.sender === 'user'
                      ? 'bg-primary-green text-white'
                      : 'bg-white border border-gray-200 text-gray-700'
                  }`}
                >
                  {msg.sender === 'user' && msg.entities ? (
                    <div 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightEntities(msg.text, msg.entities) 
                      }}
                    />
                  ) : (
                    msg.text
                  )}
                  {msg.timestamp && (
                    <div className="text-xs opacity-60 mt-1">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {loading && (
              <div className="flex justify-start mb-4">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <form onSubmit={handleSubmit} className="border-t bg-white p-4">
            <div className="flex space-x-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={message}
                  onChange={handleInputChange}
                  placeholder="Try: 'What's the price of AAPL?' or 'Compare TSLA vs BTC'"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent"
                />
                {entities.length > 0 && (
                  <div className="absolute -top-8 left-0 right-0 bg-white border rounded-lg shadow-lg p-2 text-xs">
                    <div className="flex flex-wrap gap-1">
                      {entities.map((entity, index) => (
                        <span 
                          key={index}
                          className={`px-2 py-1 rounded text-xs ${
                            entity.type === 'company' ? 'bg-blue-100 text-blue-800' :
                            entity.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                            entity.type === 'forex' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {entity.type}: {entity.value}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-primary-orange text-white rounded-lg hover:bg-dark-orange transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send
              </button>
            </div>
          </form>
        </div>

        {intentFlow && (
          <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              Processing Flow
            </h3>
            <div className="space-y-3">
              {intentFlow.steps && intentFlow.steps.map((step, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-${step.color === 'yellow' ? 'yellow-500' : step.color === 'golden' ? 'yellow-600' : step.color === 'blue' ? 'blue-500' : 'green-500'}`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{step.label}</div>
                    {step.metadata && (
                      <div className="text-sm text-gray-600">
                        {step.metadata.intent && `Intent: ${step.metadata.intent}`}
                        {step.metadata.entity_types && ` | Entities: ${step.metadata.entity_types.join(', ')}`}
                        {step.metadata.sources && ` | Sources: ${step.metadata.sources.join(', ')}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {intentFlow.suggested_actions && intentFlow.suggested_actions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Suggested Actions:</h4>
                <div className="flex flex-wrap gap-2">
                  {intentFlow.suggested_actions.map((action, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">
                      {action}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-3">Try Financial Queries:</h3>
          <div className="grid md:grid-cols-2 gap-3">
            <button
              onClick={() => setMessage("What's the current price of AAPL?")}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-primary-green">→</span> What's the current price of AAPL?
            </button>
            <button
              onClick={() => setMessage("Compare TSLA vs BTC performance")}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-primary-green">→</span> Compare TSLA vs BTC performance
            </button>
            <button
              onClick={() => setMessage("Show me EUR/USD forex rates")}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-primary-green">→</span> Show me EUR/USD forex rates
            </button>
            <button
              onClick={() => setMessage("Analyze Apple's technical indicators")}
              className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <span className="text-primary-green">→</span> Analyze Apple's technical indicators
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ChatbotDemo;