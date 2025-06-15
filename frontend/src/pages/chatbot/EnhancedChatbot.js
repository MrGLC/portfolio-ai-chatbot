import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatbotAPI } from '../../services/api';

function EnhancedChatbot() {
  // Core chat state
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [userId] = useState(`user_${Date.now()}`);
  
  // WebSocket state
  const [wsConnected, setWsConnected] = useState(false);
  const [entities, setEntities] = useState([]);
  const [intentFlow, setIntentFlow] = useState(null);
  
  // Session management
  const [conversations, setConversations] = useState([]);
  const [showConversations, setShowConversations] = useState(false);
  
  // User state
  const [userFacts, setUserFacts] = useState([]);
  const [showUserProfile, setShowUserProfile] = useState(false);
  
  // Model management
  const [currentModel, setCurrentModel] = useState('openai');
  const [availableModels, setAvailableModels] = useState(['openai', 'claude', 'google']);
  const [modelSwitching, setModelSwitching] = useState(false);
  
  // MCP Tools
  const [mcpServers, setMcpServers] = useState([]);
  const [mcpTools, setMcpTools] = useState([]);
  const [showMCPTools, setShowMCPTools] = useState(false);
  
  // Processing mode
  const [processingMode, setProcessingMode] = useState('immediate');
  
  const wsRef = useRef(null);
  const analysisTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Initialize new session
  const createNewSession = async () => {
    try {
      const response = await chatbotAPI.createNewSession(userId, 'New Chat');
      setSessionId(response.data.session_id);
      setMessages([]);
      return response.data.session_id;
    } catch (error) {
      console.error('Error creating session:', error);
    }
  };

  // WebSocket connection
  const connectWebSocket = useCallback(() => {
    try {
      wsRef.current = chatbotAPI.createWebSocketConnection(userId, sessionId);
      
      wsRef.current.onopen = () => {
        setWsConnected(true);
        console.log('WebSocket connected');
      };
      
      wsRef.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        console.log('WebSocket received:', data); // Debug log
        
        switch (data.type) {
          case 'connection':
            if (data.session_id && !sessionId) {
              setSessionId(data.session_id);
            }
            break;
          case 'analysis':
            // Use structured_entities first, fall back to entities if not available
            let finalEntities = [];
            if (data.structured_entities) {
              finalEntities = [
                ...(data.structured_entities.asset || []),
                ...(data.structured_entities.company || []),
                ...(data.structured_entities.crypto || []),
                ...(data.structured_entities.forex || [])
              ];
            } else {
              finalEntities = data.entities || [];
            }
            setEntities(finalEntities);
            
            // Set full intent flow data including intent analysis
            setIntentFlow({
              ...data.flow,
              primary_intent: data.intent_analysis?.primary_intent,
              confidence: data.intent_analysis?.confidence,
              suggested_actions: data.flow?.suggested_actions || []
            });
            break;
          case 'error':
            console.error('WebSocket error:', data.message);
            break;
          default:
            console.log('Unknown WebSocket message type:', data.type);
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

  // Analyze text in real-time
  const analyzeText = useCallback((text) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && text.trim()) {
      wsRef.current.send(JSON.stringify({
        type: 'analyze',
        text: text
      }));
    }
  }, []);

  // Handle input change with debounced analysis
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

  // Submit message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    let currentSessionId = sessionId;
    if (!currentSessionId) {
      currentSessionId = await createNewSession();
    }

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
      const response = await chatbotAPI.sendMessage(
        currentMessage, 
        userId, 
        currentSessionId,
        { processingMode }
      );
      
      const botMessage = { 
        text: response.data.response, 
        sender: 'bot', 
        timestamp: new Date().toISOString(),
        messageId: response.data.message_id
      };
      setMessages(prev => [...prev, botMessage]);
      
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { 
        text: error.response?.data?.detail || 'Sorry, something went wrong. Please try again.', 
        sender: 'bot',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Load user conversations
  const loadConversations = async () => {
    try {
      const response = await chatbotAPI.getUserConversations(userId);
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  // Load specific conversation
  const loadConversation = async (conversationId) => {
    try {
      const response = await chatbotAPI.getSessionConversation(conversationId);
      const messages = response.data.messages.map(msg => ({
        text: msg.content,
        sender: msg.role === 'user' ? 'user' : 'bot',
        timestamp: msg.timestamp
      }));
      setMessages(messages);
      setSessionId(conversationId);
      setShowConversations(false);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  // Load user facts
  const loadUserFacts = async () => {
    try {
      const response = await chatbotAPI.getUserFacts(userId);
      setUserFacts(response.data.facts || []);
    } catch (error) {
      console.error('Error loading user facts:', error);
    }
  };

  // Switch model
  const switchModel = async (model) => {
    setModelSwitching(true);
    try {
      await chatbotAPI.switchModel(model);
      setCurrentModel(model);
    } catch (error) {
      console.error('Error switching model:', error);
    } finally {
      setModelSwitching(false);
    }
  };

  // Load MCP servers and tools
  const loadMCPData = async () => {
    try {
      const [serversRes, toolsRes] = await Promise.all([
        chatbotAPI.getMCPServers(),
        chatbotAPI.getMCPTools()
      ]);
      setMcpServers(serversRes.data.servers || []);
      setMcpTools(toolsRes.data.tools || []);
    } catch (error) {
      console.error('Error loading MCP data:', error);
    }
  };

  // Entity highlighting for display (creates React elements)
  const renderHighlightedText = (text, entities) => {
    if (!entities || entities.length === 0) {
      return <span>{text}</span>;
    }
    
    const sortedEntities = [...entities].sort((a, b) => a.start - b.start);
    const parts = [];
    let lastIndex = 0;
    
    sortedEntities.forEach((entity, index) => {
      // Add text before entity
      if (entity.start > lastIndex) {
        parts.push(
          <span key={`text-${index}`}>
            {text.substring(lastIndex, entity.start)}
          </span>
        );
      }
      
      // Add highlighted entity
      const colorClass = entity.type === 'company' || entity.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                        entity.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                        entity.type === 'forex' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800';
      
      parts.push(
        <span 
          key={`entity-${index}`}
          className={`${colorClass} px-1 py-0.5 rounded text-sm font-medium`}
          title={`${entity.type}: ${entity.value}`}
        >
          {text.substring(entity.start, entity.end)}
        </span>
      );
      
      lastIndex = entity.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(
        <span key="text-end">
          {text.substring(lastIndex)}
        </span>
      );
    }
    
    return <span>{parts}</span>;
  };

  // Initialize
  useEffect(() => {
    connectWebSocket();
    loadUserFacts();
    loadMCPData();
    
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current);
      }
    };
  }, [connectWebSocket]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="min-h-screen bg-gray-50 py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Advanced AI Financial Assistant</h1>
          <p className="text-lg text-gray-600">
            Real-time market analysis, entity detection, and multi-model support
          </p>
        </div>
        
        <div className="grid grid-cols-1 xl:grid-cols-6 gap-6">
          {/* Left Sidebar */}
          <div className="xl:col-span-1 space-y-4">
            {/* Model Selection */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">AI Model</h3>
              <select 
                value={currentModel} 
                onChange={(e) => switchModel(e.target.value)}
                disabled={modelSwitching}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green"
              >
                {availableModels.map(model => (
                  <option key={model} value={model}>{model.toUpperCase()}</option>
                ))}
              </select>
              {modelSwitching && (
                <p className="text-sm text-gray-500 mt-2">Switching model...</p>
              )}
            </div>

            {/* Processing Mode */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Processing Mode</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="immediate"
                    checked={processingMode === 'immediate'}
                    onChange={(e) => setProcessingMode(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Fast Response</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="complete"
                    checked={processingMode === 'complete'}
                    onChange={(e) => setProcessingMode(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm">Full Analysis</span>
                </label>
              </div>
            </div>

            {/* Session History */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">Conversations</h3>
                <button
                  onClick={() => {
                    setShowConversations(!showConversations);
                    if (!showConversations) loadConversations();
                  }}
                  className="text-primary-green hover:text-dark-green"
                >
                  {showConversations ? 'Hide' : 'Show'}
                </button>
              </div>
              {showConversations && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-gray-500">No conversations yet</p>
                  ) : (
                    conversations.map(conv => (
                      <button
                        key={conv.id}
                        onClick={() => loadConversation(conv.id)}
                        className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg"
                      >
                        <div className="font-medium">{conv.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(conv.created_at).toLocaleDateString()}
                        </div>
                      </button>
                    ))
                  )}
                  <button
                    onClick={createNewSession}
                    className="w-full p-2 text-sm bg-primary-green text-white rounded-lg hover:bg-dark-green"
                  >
                    New Conversation
                  </button>
                </div>
              )}
            </div>

            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-gray-900">User Profile</h3>
                <button
                  onClick={() => setShowUserProfile(!showUserProfile)}
                  className="text-primary-green hover:text-dark-green"
                >
                  {showUserProfile ? 'Hide' : 'Show'}
                </button>
              </div>
              {showUserProfile && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {userFacts.length === 0 ? (
                    <p className="text-sm text-gray-500">No facts learned yet</p>
                  ) : (
                    userFacts.map((fact, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{fact.key}:</span> {fact.value}
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="xl:col-span-3">
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
                  <div className="text-white text-sm">
                    Session: {sessionId ? sessionId.substring(0, 8) : 'Not started'}
                  </div>
                </div>
              </div>
              
              <div className="h-96 overflow-y-auto p-6 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-center text-gray-500 mt-8">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    <p>Ask me about stocks, crypto, forex, or financial analysis!</p>
                  </div>
                )}
                
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        msg.sender === 'user'
                          ? 'bg-primary-green text-white'
                          : 'bg-white border border-gray-200 text-gray-700'
                      }`}
                    >
                      {msg.sender === 'user' && msg.entities ? 
                        renderHighlightedText(msg.text, msg.entities) : 
                        msg.text
                      }
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
                <div ref={messagesEndRef} />
              </div>
              
              <form onSubmit={handleSubmit} className="border-t bg-white p-4">
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={message}
                      onChange={handleInputChange}
                      placeholder="Try: 'What's the price of AAPL?' or 'Compare BTC vs ETH'"
                      className="w-full px-4 py-2 pr-20 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-green"
                    />
                    
                    {/* WebSocket status indicator in input */}
                    <div className="absolute right-16 top-1/2 transform -translate-y-1/2">
                      <div className={`w-2 h-2 rounded-full ${wsConnected ? 'bg-green-500' : 'bg-red-500'} ${wsConnected ? 'animate-pulse' : ''}`} 
                           title={wsConnected ? 'Live analysis active' : 'Analysis offline'}></div>
                    </div>
                    
                    <button
                      type="submit"
                      disabled={loading}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 px-4 py-1 bg-primary-orange text-white rounded-lg hover:bg-dark-orange disabled:opacity-50"
                    >
                      Send
                    </button>
                  </div>
                  
                  {/* Analysis preview below input */}
                  {(entities.length > 0 || (intentFlow && intentFlow.primary_intent)) && (
                    <div className="bg-gray-50 rounded-lg p-3 border space-y-2">
                      {/* Entities */}
                      {entities.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">🏷️ Detected entities:</div>
                          <div className="flex flex-wrap gap-1">
                            {entities.map((entity, index) => (
                              <span 
                                key={index}
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                  entity.type === 'company' || entity.type === 'asset' ? 'bg-blue-100 text-blue-800' :
                                  entity.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                                  entity.type === 'forex' ? 'bg-green-100 text-green-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}
                                title={entity.normalized_value ? `Normalized: ${entity.normalized_value}` : entity.value}
                              >
                                {entity.value}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Intent */}
                      {intentFlow && intentFlow.primary_intent && (
                        <div>
                          <div className="text-xs text-gray-600">🎯 Intent:</div>
                          <div className="text-xs text-purple-700">
                            {intentFlow.primary_intent.intent_id} 
                            {intentFlow.primary_intent.confidence && 
                              ` (${Math.round(intentFlow.primary_intent.confidence * 100)}%)`
                            }
                          </div>
                        </div>
                      )}
                      
                      {/* Suggestions */}
                      {intentFlow && intentFlow.suggested_actions && intentFlow.suggested_actions.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">💡 Suggestions:</div>
                          <div className="space-y-1">
                            {intentFlow.suggested_actions.slice(0, 2).map((suggestion, index) => (
                              <button
                                key={index}
                                onClick={() => setMessage(suggestion)}
                                className="block w-full text-left text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-2 py-1 rounded transition-colors"
                              >
                                💬 {suggestion}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Intent Flow Visualization */}
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
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold bg-${
                        step.color === 'yellow' ? 'yellow' : 
                        step.color === 'golden' ? 'yellow' : 
                        step.color === 'blue' ? 'blue' : 'green'
                      }-500`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{step.label}</div>
                        {step.metadata && (
                          <div className="text-sm text-gray-600">
                            {Object.entries(step.metadata).map(([key, value]) => (
                              <span key={key} className="mr-3">
                                {key}: {Array.isArray(value) ? value.join(', ') : value}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Quick Queries</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setMessage("What's the current price of AAPL and MSFT?")}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary-green">→</span> Stock Prices
                </button>
                <button
                  onClick={() => setMessage("Show me BTC and ETH analysis")}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary-green">→</span> Crypto Analysis
                </button>
                <button
                  onClick={() => setMessage("What's the EUR/USD forex rate?")}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary-green">→</span> Forex Rates
                </button>
                <button
                  onClick={() => setMessage("Analyze market trends today")}
                  className="text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <span className="text-primary-green">→</span> Market Trends
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Analysis Panel */}
          <div className="xl:col-span-2 space-y-4">
            {/* WebSocket Connection Status */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Live Analysis</h3>
                <div className={`flex items-center text-sm ${wsConnected ? 'text-green-600' : 'text-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${wsConnected ? 'bg-green-500' : 'bg-red-500'} ${wsConnected ? 'animate-pulse' : ''}`}></div>
                  {wsConnected ? 'Connected' : 'Disconnected'}
                </div>
              </div>
              {wsConnected ? (
                <p className="text-sm text-gray-600">Type in the chat to see real-time entity detection</p>
              ) : (
                <p className="text-sm text-gray-600">Connecting to analysis engine...</p>
              )}
            </div>

            {/* Real-time Entity Detection */}
            {entities.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  Detected Entities
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {entities.map((entity, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          entity.type === 'company' ? 'bg-blue-100 text-blue-800' :
                          entity.type === 'crypto' ? 'bg-purple-100 text-purple-800' :
                          entity.type === 'forex' ? 'bg-green-100 text-green-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {entity.type.toUpperCase()}
                        </span>
                        {entity.confidence && (
                          <span className="text-xs text-gray-500">
                            {Math.round(entity.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <div className="font-medium text-gray-900">{entity.value}</div>
                      {entity.normalized_value && entity.normalized_value !== entity.value && (
                        <div className="text-sm text-gray-600">→ {entity.normalized_value}</div>
                      )}
                      {entity.ticker && (
                        <div className="text-sm text-gray-600">Ticker: {entity.ticker}</div>
                      )}
                      <div className="text-xs text-gray-500 mt-1">
                        Position: {entity.start}-{entity.end}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Intent Analysis */}
            {intentFlow && intentFlow.primary_intent && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Intent Analysis
                </h3>
                <div className="space-y-3">
                  {intentFlow.primary_intent && (
                    <div className="bg-purple-50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-purple-900">Primary Intent</span>
                        <span className="text-sm text-purple-600">
                          {Math.round((intentFlow.primary_intent.confidence || 0) * 100)}%
                        </span>
                      </div>
                      <div className="text-sm text-purple-800">
                        ID: {intentFlow.primary_intent.intent_id}
                      </div>
                      {intentFlow.primary_intent.metadata && (
                        <div className="mt-2 text-xs text-purple-700">
                          {Object.entries(intentFlow.primary_intent.metadata).map(([key, value]) => (
                            <div key={key}>
                              <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : value}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Processing Flow */}
            {intentFlow && intentFlow.steps && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Processing Steps
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {intentFlow.steps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5 ${
                        step.color === 'yellow' ? 'bg-yellow-500' :
                        step.color === 'golden' ? 'bg-yellow-600' :
                        step.color === 'blue' ? 'bg-blue-500' :
                        'bg-green-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm">{step.label}</div>
                        {step.metadata && (
                          <div className="text-xs text-gray-500 mt-1">
                            {Object.entries(step.metadata).slice(0, 2).map(([key, value]) => (
                              <div key={key} className="truncate">
                                {key}: {Array.isArray(value) ? value.join(', ') : String(value)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                {intentFlow.total_duration_ms && (
                  <div className="mt-3 pt-3 border-t text-xs text-gray-500">
                    Analysis time: {intentFlow.total_duration_ms}ms
                  </div>
                )}
              </div>
            )}

            {/* Suggested Actions */}
            {intentFlow && intentFlow.suggested_actions && intentFlow.suggested_actions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Suggested Actions
                </h3>
                <div className="space-y-2">
                  {intentFlow.suggested_actions.slice(0, 3).map((action, index) => (
                    <button
                      key={index}
                      onClick={() => setMessage(action)}
                      className="w-full text-left p-2 text-sm bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <span className="text-orange-600">→</span> {action}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Debug Info */}
            {process.env.NODE_ENV === 'development' && intentFlow && (
              <div className="bg-gray-100 rounded-xl shadow-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Debug Info</h3>
                <pre className="text-xs text-gray-600 overflow-auto max-h-32">
                  {JSON.stringify(intentFlow, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default EnhancedChatbot;