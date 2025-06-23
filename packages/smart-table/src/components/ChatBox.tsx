import React, { useState, useRef, useEffect } from 'react'
import { chatWithGemini, chatWithOpenAI } from '../utils/chat-ai';
import { FaRobot, FaUserCircle, FaPaperPlane, FaComments, FaCopy, FaCheck, FaRedo } from 'react-icons/fa';
import ReactMarkdown from 'react-markdown';

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
  'Summarize this data',
  'Show top 5 rows',
  'Any anomalies?',
  'What are the key trends?',
  'Export this insight',
];

const ChatBox = ({ data, apiKey, aiProvider, onChat }: Props) => {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [copyIdx, setCopyIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [retryMsg, setRetryMsg] = useState<Message | null>(null);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Keep last 5 messages as context
  const getContext = () => messages.slice(-5).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', content: m.text }));

  const handleSubmit = async (customQuery?: string) => {
    const userText = (customQuery !== undefined ? customQuery : query).trim();
    if (!userText) return;
    const userMsg: Message = { sender: 'user', text: userText, timestamp: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setQuery("");
    setRetryMsg(null);
    try {
      let result = "";
      let suggestions: string[] = [];
      if (aiProvider === "openai" && apiKey.openaiApiKey) {
        // Pass context for more natural conversation
        result = await chatWithOpenAI(apiKey.openaiApiKey, data, userText, getContext());
      } else if (aiProvider === "gemini" && apiKey.geminiApiKey) {
        result = await chatWithGemini(apiKey.geminiApiKey, data, userText, getContext());
      } else if (onChat) {
        result = await onChat(data, userText);
      }
      // Extract suggestions (simple demo: use static, or parse from result if desired)
      suggestions = SUGGESTIONS;
      setMessages((prev) => [...prev, { sender: 'bot', text: result, timestamp: Date.now(), suggestions }]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: 'error', text: "An error occurred while processing your request. Please try again.", timestamp: Date.now(), error: true }]);
      setRetryMsg(userMsg);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="smart-table-chat-box" aria-label="Chat with Table AI" style={{ maxWidth: 480, minWidth: 260, margin: '0 auto', boxShadow: '0 2px 12px var(--color-shadow)' }}>
      <div className="chatbox-header" style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1.5px solid #e0e4ea', paddingBottom: 8, marginBottom: 10 }}>
        <FaComments style={{ color: 'var(--color-primary)', fontSize: 22 }} />
        <span style={{ fontWeight: 600, fontSize: 17, color: 'var(--color-primary)' }}>Ask Table AI</span>
      </div>
      <div className="chatbox-messages" style={{ maxHeight: 220, overflowY: 'auto', marginBottom: 10, paddingRight: 2 }}>
        {messages.length === 0 && !loading && (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 30, fontSize: 15 }}>
            <FaRobot style={{ fontSize: 22, marginBottom: 6 }} />
            <div>Ask questions about your data.<br />Try: <em>"Show me the top 5 items by revenue"</em></div>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`chatbox-message chatbox-message-${msg.sender}${msg.error ? ' chatbox-error' : ''}`}
            style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 10, animation: 'fade-in-msg 0.18s' }}
            aria-label={msg.sender === 'user' ? 'Your message' : msg.sender === 'bot' ? 'Bot reply' : 'Error message'}
          >
            {msg.sender === 'user' ? (
              <FaUserCircle className="chatbox-avatar" style={{ fontSize: 22, marginRight: 8, color: '#888' }} />
            ) : (
              <FaRobot className="chatbox-avatar" style={{ fontSize: 22, marginRight: 8, color: 'var(--color-primary)' }} />
            )}
            <div style={{ position: 'relative', width: '100%' }}>
              {msg.sender === 'bot' ? (
                <>
                  <ReactMarkdown className="chatbox-markdown">{msg.text}</ReactMarkdown>
                  <button
                    className="chatbox-copy-btn"
                    aria-label="Copy response"
                    onClick={() => handleCopy(msg.text, idx)}
                    style={{ position: 'absolute', top: 6, right: 6, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15, opacity: 0.7 }}
                  >
                    {copyIdx === idx ? <FaCheck color="#fff" /> : <FaCopy color="#fff" />}
                  </button>
                  {msg.suggestions && (
                    <div style={{ marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {msg.suggestions.map((s, i) => (
                        <button
                          key={i}
                          className="chatbox-suggestion-chip"
                          onClick={() => handleSubmit(s)}
                          aria-label={`Ask: ${s}`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : msg.sender === 'error' ? (
                <div style={{ color: '#fff', background: '#e74c3c', borderRadius: 8, padding: '8px 14px', fontSize: 15, minWidth: 30, maxWidth: 320, boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}>
                  {msg.text}
                  {retryMsg && (
                    <button
                      className="chatbox-copy-btn"
                      aria-label="Retry"
                      onClick={() => handleSubmit(retryMsg.text)}
                      style={{ marginLeft: 10, background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontSize: 15 }}
                    >
                      <FaRedo /> Retry
                    </button>
                  )}
                </div>
              ) : (
                <div>{msg.text}</div>
              )}
              <div style={{ fontSize: 11, color: msg.sender === 'user' ? '#888' : '#e0e4ea', marginTop: 4, textAlign: 'right' }}>{formatTime(msg.timestamp)}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="chatbox-message chatbox-message-bot" style={{ display: 'flex', alignItems: 'flex-end', marginBottom: 10 }}>
            <FaRobot className="chatbox-avatar" style={{ fontSize: 22, marginRight: 8, color: 'var(--color-primary)' }} />
            <div className="chatbox-typing" style={{ background: 'var(--color-primary)', color: '#fff', borderRadius: 12, padding: '8px 14px', maxWidth: 320, fontSize: 15, boxShadow: '0 1px 4px rgba(0,0,0,0.06)', marginRight: 6, minWidth: 30, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span className="chatbox-typing-dots">
                <span className="dot" /> <span className="dot" /> <span className="dot" />
              </span>
              <span style={{ fontSize: 12, marginLeft: 6 }}>AI is typing…</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form
        className="chatbox-input-row"
        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        onSubmit={e => { e.preventDefault(); handleSubmit(); }}
        aria-label="Send a message to Table AI"
      >
        <textarea
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about this table..."
          rows={2}
          style={{ flex: 1, borderRadius: 8, border: '1.5px solid #e0e4ea', padding: '8px 10px', fontSize: 15, resize: 'none', outline: 'none', minHeight: 38, maxHeight: 80, background: '#fff' }}
          aria-label="Chat input"
        />
        <button
          type="submit"
          className="chatbox-send-btn"
          style={{ background: 'var(--color-primary)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 14px', fontSize: 17, cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.18s' }}
          aria-label="Send message"
          disabled={loading || !query.trim()}
        >
          <FaPaperPlane />
        </button>
      </form>
    </div>
  )
}

export default ChatBox