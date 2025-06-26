import React, { useState, useRef, useEffect } from 'react'
import { chatWithGemini, chatWithOpenAI } from '../utils/chat-ai';
import { FaRobot, FaUserCircle, FaPaperPlane, FaComments, FaCopy, FaCheck, FaRedo, FaMagic, FaChartLine } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

type Props = {
    data: any[], apiKey: {
        openaiApiKey?: string,
        geminiApiKey?: string,
    }
    aiProvider: "gemini" | "openai";
    onChat?: (data: any[], query: string) => Promise<string>;

}

type Message = {
  sender: 'user' | 'bot' | 'error';
  text: string;
  timestamp: number;
  suggestions?: string[];
  error?: boolean;
};

const SUGGESTIONS = [
  '📊 Summarize this data',
  '🔝 Show top 5 rows',
  '🔍 Find any anomalies',
  '📈 What are the key trends?',
  '💡 Generate insights',
  '📋 Export analysis',
  '🧮 Calculate statistics',
  '🎯 Filter recommendations'
];

const ChatBox = ({ data, apiKey, aiProvider, onChat }: Props) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copyIdx, setCopyIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [retryMsg, setRetryMsg] = useState<Message | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Keep last 5 messages as context
  const getContext = () => messages.slice(-5).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));  const handleSubmit = async (customQuery?: string) => {
    const userText = (customQuery !== undefined ? customQuery : query).trim();
    console.log("handleSubmit called with:", { customQuery, userText, query });
    
    if (!userText) {
      console.log("No user text provided, returning early");
      return;
    }
    
    const userMsg: Message = { sender: 'user', text: userText, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    
    // Only clear the query if it came from the input field, not from suggestions
    if (customQuery === undefined) {
      setQuery("");
    }
    setRetryMsg(null);
    
    try {
      let result = "";
      let suggestions: string[] = [];
      
      // Check if we have proper API configuration
      if (aiProvider === "openai" && apiKey.openaiApiKey) {
        console.log("Calling OpenAI API...");
        result = await chatWithOpenAI(apiKey.openaiApiKey, data, userText);
      } else if (aiProvider === "gemini" && apiKey.geminiApiKey) {
        console.log("Calling Gemini API...");
        result = await chatWithGemini(apiKey.geminiApiKey, data, userText);
      } else if (onChat) {
        console.log("Using custom chat handler...");
        result = await onChat(data, userText);
      } else {
        // Fallback response when no AI service is configured
        console.log("Using mock response...");
        result = generateMockResponse(userText, data);
      }
      
      // Ensure we have a valid result
      if (!result || result.trim() === "") {
        result = "I'm sorry, I couldn't generate a response. Please try rephrasing your question.";
      }
      
      suggestions = SUGGESTIONS;
      console.log("Adding bot message with result:", result);
      setMessages((prev) => [...prev, { sender: 'bot', text: result, timestamp: Date.now(), suggestions }]);
      
    } catch (err) {
      console.error("Chat error:", err);
      const errorMsg = err instanceof Error ? err.message : "Unknown error occurred";
      setMessages((prev) => [...prev, { 
        sender: 'error', 
        text: `Error: ${errorMsg}. Please check your API configuration and try again.`, 
        timestamp: Date.now(), 
        error: true 
      }]);
      setRetryMsg(userMsg);
    } finally {
      setLoading(false);
    }
  };

  // Mock response generator for when no AI service is available
  const generateMockResponse = (query: string, tableData: any[]): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('summary') || lowerQuery.includes('summarize')) {
      return `📊 **Data Summary**\n\nYour table contains ${tableData.length} rows. Here's a quick overview of your data structure.`;
    }
    
    if (lowerQuery.includes('top') || lowerQuery.includes('first')) {
      const topRows = Math.min(5, tableData.length);
      return `🔝 **Top ${topRows} Rows**\n\nShowing the first ${topRows} entries from your dataset.`;
    }
    
    if (lowerQuery.includes('count') || lowerQuery.includes('total')) {
      return `📝 **Count Information**\n\nTotal records: ${tableData.length}`;
    }
    
    if (lowerQuery.includes('column') || lowerQuery.includes('field')) {
      const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
      return `📋 **Available Columns**\n\nYour data has ${columns.length} columns: ${columns.join(', ')}`;
    }
    
    // Default response
    return `🤖 **AI Response**\n\nI understand you're asking: "${query}"\n\nTo get more detailed insights, please configure an AI provider (OpenAI or Gemini) in the table settings. For now, I can help with basic information about your ${tableData.length} rows of data.`;
  };

  // Keyboard shortcut: Ctrl+Enter to send
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      handleSubmit();
    }
  };

  // Format timestamp
  const formatTime = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Copy to clipboard
  const handleCopy = async (text: string, idx: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyIdx(idx);
      setTimeout(() => setCopyIdx(null), 1200);
    } catch {}
  };

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  };

  // Handle input change with auto-resize
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
    autoResizeTextarea();
  };

  // Reset textarea height when message is sent
  useEffect(() => {
    if (!query && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [query]);

  // Enhanced loading messages for different AI providers
  const getLoadingMessage = () => {
    const messages = [
      "Analyzing your data...",
      "Processing your request...", 
      "Generating insights...",
      "Searching through data patterns...",
      "Preparing response..."
    ];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  const [loadingMessage, setLoadingMessage] = useState(getLoadingMessage());

  // Update loading message periodically
  useEffect(() => {
    if (loading) {
      const interval = setInterval(() => {
        setLoadingMessage(getLoadingMessage());
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [loading]);

  return (
    <div className="smart-table-chat-box" aria-label="Chat with Table AI">
      {/* Enhanced Header */}
      <div className="chatbox-header">
        <div className="chatbox-header-left">
          <div className="chatbox-header-icon">
            <FaRobot />
          </div>
          <div className="chatbox-header-info">
            <h3 className="chatbox-header-title">Table AI Assistant</h3>
            <p className="chatbox-header-subtitle">Ask questions about your data</p>
          </div>
        </div>
        <div className="chatbox-status-indicator">
          <span className="chatbox-status-dot"></span>
          <span className="chatbox-status-text">Online</span>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="chatbox-messages">
        {messages.length === 0 && !loading && (
          <div className="chatbox-welcome">
            <div className="chatbox-welcome-icon">
              <FaChartLine />
            </div>
            <div className="chatbox-welcome-content">
              <h3>Welcome to Table AI!</h3>
              <p>I can help you analyze your data, find insights, and answer questions about your table.</p>
              <div className="chatbox-welcome-features">
                <div className="chatbox-feature">
                  <FaMagic className="feature-icon" />
                  <span>Generate insights</span>
                </div>
                <div className="chatbox-feature">
                  <FaChartLine className="feature-icon" />
                  <span>Analyze trends</span>
                </div>
                <div className="chatbox-feature">
                  <FaRobot className="feature-icon" />
                  <span>Answer questions</span>
                </div>
              </div>
              <div className="chatbox-suggestion-prompt">
                <span>Try asking:</span>
                <div className="chatbox-welcome-suggestions">
                  {SUGGESTIONS.slice(0, 3).map((suggestion, i) => (
                    <button
                      key={i}
                      className="chatbox-suggestion-chip chatbox-welcome-chip"
                      onClick={() => handleSubmit(suggestion)}
                      aria-label={`Ask: ${suggestion}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Message List */}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbox-message ${msg.sender === 'user' ? 'chatbox-message-user' : msg.sender === 'error' ? 'chatbox-message-error' : 'chatbox-message-bot'}`}
            aria-label={msg.sender === 'user' ? 'Your message' : msg.sender === 'bot' ? 'Bot reply' : 'Error message'}
          >
            <div className="chatbox-message-avatar">
              {msg.sender === 'user' ? (
                <FaUserCircle />
              ) : (
                <FaRobot />
              )}
            </div>
            
            <div className="chatbox-message-content">
              <div className={`chatbox-message-bubble ${msg.sender === 'error' ? 'chatbox-error-bubble' : ''}`}>
                {msg.sender === 'bot' ? (
                  <>
                    <div className="chatbox-markdown">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown>
                    </div>
                    <button
                      className="chatbox-copy-btn"
                      aria-label="Copy response"
                      onClick={() => handleCopy(msg.text, idx)}
                      title="Copy to clipboard"
                    >
                      {copyIdx === idx ? <FaCheck /> : <FaCopy />}
                    </button>
                  </>
                ) : msg.sender === 'error' ? (
                  <div className="chatbox-error-content">
                    <div className="chatbox-error-message">
                      <span className="chatbox-error-icon">⚠️</span>
                      <span>{msg.text}</span>
                    </div>
                    {retryMsg && (
                      <button
                        className="chatbox-retry-btn"
                        aria-label="Retry"
                        onClick={() => handleSubmit(retryMsg.text)}
                        title="Retry message"
                      >
                        <FaRedo />
                        <span>Try Again</span>
                      </button>
                    )}
                  </div>
                ) : (
                  <span>{msg.text}</span>
                )}
              </div>
              
              <div className="chatbox-message-time">
                {formatTime(msg.timestamp)}
              </div>
              
              {msg.suggestions && msg.sender === 'bot' && (
                <div className="chatbox-suggestions">
                  <div className="chatbox-suggestions-label">Suggested questions:</div>
                  <div className="chatbox-suggestions-grid">
                    {msg.suggestions.map((suggestion, i) => (
                      <button
                        key={i}
                        className="chatbox-suggestion-chip"
                        onClick={(e) => {
                          console.log("Suggestion clicked:", suggestion);
                          e.preventDefault();
                          e.stopPropagation();
                          handleSubmit(suggestion);
                        }}
                        aria-label={`Ask: ${suggestion}`}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {/* Typing Indicator */}
        {loading && (
          <div className="chatbox-message chatbox-message-bot">
            <div className="chatbox-message-avatar">
              <FaRobot />
            </div>
            <div className="chatbox-message-content">
              <div className="chatbox-message-bubble chatbox-typing-bubble">
                <div className="chatbox-typing-indicator">
                  <span className="chatbox-typing-dot"></span>
                  <span className="chatbox-typing-dot"></span>
                  <span className="chatbox-typing-dot"></span>
                </div>
                <span className="chatbox-typing-text">{loadingMessage}</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Enhanced Input Form */}
      <form
        className="chatbox-input-form"
        onSubmit={e => { e.preventDefault(); handleSubmit(); }}
        aria-label="Send a message to Table AI"
      >
        <div className="chatbox-input-wrapper">          <textarea
            ref={textareaRef}
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Ask me anything about your table data..."
            className="chatbox-input"
            aria-label="Chat input"
            rows={1}
            style={{ resize: 'none', overflow: 'hidden' }}
          />
          <button
            type="submit"
            className="chatbox-send-btn"
            aria-label="Send message"
            disabled={loading || !query.trim()}
            title="Send message (Ctrl+Enter)"
          >
            <FaPaperPlane />
          </button>
        </div>
        <div className="chatbox-input-footer">
          <div className="chatbox-input-hint">
            Press <kbd>Ctrl</kbd> + <kbd>Enter</kbd> to send quickly
          </div>
          <div className="chatbox-powered-by">
            Powered by AI • {data.length} rows available
          </div>
        </div>
      </form>
    </div>
  )
}

export default ChatBox