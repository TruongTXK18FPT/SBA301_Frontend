import React, { useRef, useState, useEffect, useCallback } from 'react';
import { chatAiService, Message, AnalysisResult } from '../services/chatAiService';
import { FiSend, FiPlus, FiMessageSquare, FiTrash2, FiUser, FiAward, FiClock, FiLoader } from 'react-icons/fi';
import '../styles/ChatAi.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getTraitColor = (score: number): string => {
    if (score >= 8) return '#10b981';
    if (score >= 5) return '#f59e0b';
    return '#ef4444';
};

const ChatAi: React.FC = () => {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionLimitError, setSessionLimitError] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const switchSession = useCallback(async (sessionId: string) => {
        if (loading || activeSessionId === sessionId) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const history = await chatAiService.getChatHistory(sessionId);
            setMessages(history);
            setActiveSessionId(sessionId);
        } catch {
            setError('Failed to load chat history. Please try again.');

        } finally {
            setLoading(false);
        }
    }, [activeSessionId, loading]);

    const handleNewChat = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        setError(null);
        setSessionLimitError(null);
        
        try {
            const newSession = await chatAiService.startNewSession();
            const history = await chatAiService.getChatHistory(newSession.sessionId);
            setSessions(prev => [newSession.sessionId, ...prev]);
            setMessages(history);
            setActiveSessionId(newSession.sessionId);
        } catch (error) {

            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred while creating a new chat.';

            if (errorMessage.includes('maximum') || errorMessage.includes('session limit')) {
                setSessionLimitError(errorMessage);
            } else {
                setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    }, [loading]);

    const handleDeleteSession = useCallback(async (e: React.MouseEvent, sessionIdToDelete: string) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this conversation forever?')) {
            return;
        }
        try {
            await chatAiService.deleteSession(sessionIdToDelete);
            const updatedSessions = sessions.filter(id => id !== sessionIdToDelete);
            setSessions(updatedSessions);
            if (activeSessionId === sessionIdToDelete) {
                setActiveSessionId(null);
                setMessages([]);
                setResult(null);
                if (updatedSessions.length > 0) {
                    await switchSession(updatedSessions[0]);
                } else {
                    await handleNewChat();
                }
            }
        } catch {
            setError('Failed to delete the session.');

        }
    }, [activeSessionId, sessions, switchSession, handleNewChat]);

    useEffect(() => {
        const loadUserSessions = async () => {
            try {
                const userSessions = await chatAiService.getUserSessions();
                setSessions(userSessions);
                if (userSessions.length > 0) {
                    await switchSession(userSessions[0]);
                } else {
                    await handleNewChat();
                }
            } catch {
                setError('Could not load your conversations. Please try refreshing.');
    
            } finally {
                setLoading(false);
            }
        };
        loadUserSessions();
    }, []);

    const sendMessage = async () => {
        if (!input.trim() || !activeSessionId || sending) return;
        const userMessage: Message = { role: 'user', content: input, timestamp: new Date().toISOString() };
        setMessages(prev => [...prev, userMessage]);
        const currentInput = input;
        setInput('');
        setSending(true);
        setError(null);
        try {
            const response = await chatAiService.sendMessage(activeSessionId, currentInput);
            const botMessage: Message = {
                role: 'assistant',
                content: response.botReply || "I'm sorry, I couldn't get a response.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, botMessage]);
        } catch (err: unknown) {
            const errorMessage: Message = {
                role: 'assistant',
                content: err instanceof Error ? err.message : "An unexpected error occurred.",
                timestamp: new Date().toISOString()
            };
            setMessages(prev => [...prev, errorMessage]);
            setError(errorMessage.content);
        } finally {
            setSending(false);
        }
    };

    const analyzeConversation = async () => {
        if (!activeSessionId || isAnalyzing) return;
        setIsAnalyzing(true);
        try {
            const analysis = await chatAiService.analyzeConversation(activeSessionId);
            setResult(analysis);
        } catch {
            setError('Failed to analyze conversation.');

        } finally {
            setIsAnalyzing(false);
        }
    };

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
            inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
        }
    }, [input]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (input.trim()) {
                sendMessage();
            }
        }
    };

    return (
        <div className="chat-ai-layout">
            <div className="sidebar">
                <div className="sidebar-header">
                    <h3>Conversations</h3>
                    <button onClick={handleNewChat} className="new-chat-button" title="New Chat" disabled={loading}>
                        <FiPlus />
                    </button>
                </div>
                <div className="session-list">
                    {sessions.map(sid => (
                        <div
                            key={sid}
                            className={`session-item ${sid === activeSessionId ? 'active' : ''}`}
                            onClick={() => switchSession(sid)}
                        >
                            <FiMessageSquare className="session-icon" />
                            <span className="session-id">{`Chat ${sid.substring(5, 11)}...`}</span>
                            <button
                                className="delete-session-button"
                                onClick={(e) => handleDeleteSession(e, sid)}
                                title="Delete Chat"
                            >
                                <FiTrash2 />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
            <div className="chat-ai-container">
                {sessionLimitError && (
                    <div className="session-limit-notification">
                        <div className="notification-content">
                            <span>{sessionLimitError}</span>
                            <button 
                                className="close-notification"
                                onClick={() => setSessionLimitError(null)}
                                aria-label="Close notification"
                            >
                                &times;
                            </button>
                        </div>
                    </div>
                )}
                <div className="chat-header">
                    <div className="chat-title">
                        <h1>Personality AI</h1>
                        <span className="status-indicator">• Online</span>
                    </div>
                    <button
                        className="analyze-button"
                        onClick={analyzeConversation}
                        disabled={isAnalyzing || (messages.length < 5) || !activeSessionId}
                    >
                        {isAnalyzing ? <FiLoader className="spin" /> : <FiAward />}
                        {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                    </button>
                </div>
                {error && <div className="error-banner">{error}</div>}
                <div className="chat-messages">
                    {loading && messages.length === 0 ? (
                        <div className="full-page-loader"><FiLoader className="spin" /></div>
                    ) : (
                        messages.map((msg, index) => (
                            <div key={`${msg.role}-${index}-${msg.timestamp}`} className={`message ${msg.role}`}>
                                <div className="message-avatar">
                                    {msg.role === 'user' ? <FiUser /> : <FiMessageSquare />}
                                </div>
                                <div className="message-content">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
                                    <div className="message-timestamp">
                                        <FiClock size={12} />
                                        {new Date(msg.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {sending && (
                        <div className="typing-indicator">
                            <div className="typing-dot"></div><div className="typing-dot"></div><div className="typing-dot"></div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
                <div className="chat-input-container">
                    <div className="chat-input-wrapper">
                        <textarea
                            ref={inputRef}
                            className="chat-input"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Message Personality AI..."
                            disabled={sending || loading || !activeSessionId}
                            rows={1}
                        />
                        <button
                            className="send-button"
                            onClick={sendMessage}
                            disabled={!input.trim() || sending || loading || !activeSessionId}
                        >
                            <FiSend />
                        </button>
                    </div>
                    <div className="input-footer">
                        <small>Personality AI may produce inaccurate information.</small>
                    </div>
                </div>
                {result && showAnalysis && (
                    <div className="analysis-result">
                    <div className="analysis-header">
                        <h3>Personality Analysis</h3>
                        <button 
                            className="close-analysis" 
                            onClick={() => setShowAnalysis(false)}
                            aria-label="Close analysis"
                        >
                            &times;
                        </button>
                    </div>
                    <div className="result-grid">
                        <div className="result-card">
                            <h4>Personality Type</h4>
                            <div className="result-value">{result.personalityType}</div>
                        </div>
                        <div className="result-card full-width">
                            <h4>Description</h4>
                            <p>{result.description}</p>
                        </div>
                        <div className="result-card full-width">
                            <h4>Key Traits</h4>
                            <div className="traits-grid">
                                {/* First, check if we have keyTraits (array of strings) */}
                                {result.keyTraits && Array.isArray(result.keyTraits) && result.keyTraits.length > 0 ? (
                                    <div className="key-traits-container">
                                        {result.keyTraits.map((trait, index) => (
                                            <div key={`key-trait-${index}`} className="key-trait">
                                                <span className="trait-bullet">•</span>
                                                <span className="trait-text">{trait}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // If no keyTraits, fall back to the traits array (if it exists)
                                    result.traits && Array.isArray(result.traits) ? (
                                        result.traits.length > 0 ? (
                                            result.traits.map((trait, index) => {
                                                // Safely extract values with defaults
                                                const name = trait?.name ? String(trait.name) : `Trait ${index + 1}`;
                                                const score = typeof trait?.score === 'number' ? Math.min(10, Math.max(0, trait.score)) : 0;
                                                const description = trait?.description ? String(trait.description) : undefined;
                                                
                                                return (
                                                    <div key={index} className="trait-card">
                                                        <div className="trait-header">
                                                            <span className="trait-name">{name}</span>
                                                            <span className="trait-score">{score}/10</span>
                                                        </div>
                                                        {description && (
                                                            <div className="trait-description">{description}</div>
                                                        )}
                                                        <div className="trait-bar">
                                                            <div 
                                                                className="trait-bar-fill"
                                                                style={{
                                                                    width: `${score * 10}%`,
                                                                    backgroundColor: getTraitColor(score)
                                                                }}
                                                            ></div>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="no-traits">
                                                <p>No personality traits available for analysis.</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="no-traits">
                                            <p>No personality analysis data available.</p>
                                        </div>
                                    )
                                )}
                            </div>
                        </div>
                        {result.recommendations && result.recommendations.length > 0 && (
                            <div className="result-card full-width">
                                <h4>Recommendations</h4>
                                <ul className="recommendations-list">
                                    {result.recommendations.map((rec, index) => (
                                        <li key={index} className="recommendation-item">
                                            <FiAward className="recommendation-icon" />
                                            <span>{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
                )}
            </div>
        </div>
    );
};

export default ChatAi;