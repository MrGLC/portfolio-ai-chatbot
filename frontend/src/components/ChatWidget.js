import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatbotAPI } from '../services/api';

function ChatWidget({ isOpen, onToggle }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const [entities, setEntities] = useState([]);
  const [intentFlow, setIntentFlow] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  
  const wsRef = useRef(null);
  const userId = 'widget_user';
  const analysisTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const connectWebSocket = useCallback(() => {
    if (!isOpen) return;
    
    try {
      wsRef.current = chatbotAPI.createWebSocketConnection(userId, sessionId);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
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
            setEntities(data.entities || []);
            setIntentFlow(data.flow);
            break;
          default:
            break;
        }
      };
      
      wsRef.current.onclose = () => {
        setWsConnected(false);
      };
      
      wsRef.current.onerror = () => {
        setWsConnected(false);
      };
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
    }
  }, [isOpen, userId, sessionId]);

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
        setEntities([]);
        setIntentFlow(null);
      }
    }, 300);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const userMessage = { 
      text: message, 
      sender: 'user', 
      timestamp: new Date().toISOString(),
      entities: entities
    };
    setMessages([...messages, userMessage]);
    const currentMessage = message;
    setMessage('');
    setLoading(true);
    setEntities([]);
    setIntentFlow(null);

    try {
      const response = await chatbotAPI.sendMessage(currentMessage, userId);
      const botMessage = { 
        text: response.data.response, 
        sender: 'bot', 
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, botMessage]);
      
      if (response.data.session_id && !sessionId) {
        setSessionId(response.data.session_id);
      }
    } catch (error) {
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

  useEffect(() => {
    if (isOpen) {
      connectWebSocket();
    } else if (wsRef.current) {
      wsRef.current.close();
    }
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [isOpen, connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-primary-green to-primary-orange text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-50"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-96 bg-white rounded-2xl shadow-2xl flex flex-col z-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-green to-primary-orange p-4 rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="text-white font-semibold text-sm">AI Assistant</h3>
          <span className={`px-2 py-1 text-xs rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'}`}>
            {wsConnected ? 'Live' : 'Off'}
          </span>
        </div>
        <button
          onClick={onToggle}
          className="text-white hover:text-gray-200 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Ask me about stocks, crypto, or forex!</p>
          </div>
        )}
        
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-3 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
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
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start mb-3">
            <div className="bg-white border border-gray-200 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="border-t bg-white p-3 rounded-b-2xl">
        <div className="relative">
          <input
            type="text"
            value={message}
            onChange={handleInputChange}
            placeholder="Ask about AAPL, BTC, EUR/USD..."
            className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green focus:border-transparent text-sm"
          />
          {entities.length > 0 && (
            <div className="absolute -top-8 left-0 right-0 bg-white border rounded-lg shadow-lg p-2 text-xs z-10">
              <div className="flex flex-wrap gap-1">
                {entities.slice(0, 3).map((entity, index) => (
                  <span 
                    key={index}
                    className={`px-2 py-1 rounded text-xs ${
                      entity.type === 'company' ? 'bg-blue-100 text-blue-800' :
                      entity.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                      entity.type === 'forex' ? 'bg-green-100 text-green-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {entity.value}
                  </span>
                ))}
              </div>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 text-primary-orange hover:text-dark-orange transition-colors disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>
    </div>
  );
}

export default ChatWidget;