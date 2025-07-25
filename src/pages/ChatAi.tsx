import React, { useRef, useState, useEffect, useCallback } from 'react';
import { chatAiService, Message, AnalysisResult } from '../services/chatAiService';
// I've added FiArrowRight to the import list
import { FiSend, FiPlus, FiMessageSquare, FiTrash2, FiUser, FiAward, FiClock, FiLoader, FiStar, FiArrowRight, FiEdit2,FiChevronRight,FiChevronLeft } from 'react-icons/fi';
import '../styles/ChatAi.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const getTraitColor = (score: number): string => {
    if (score >= 8) return '#00f6ff'; // Bright Cyan
    if (score >= 5) return '#7d2cff'; // Vibrant Purple
    return '#ef4444'; // Red for low scores remains
};

const ChatAi: React.FC = () => {
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [sessions, setSessions] = useState<string[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [sessionLimitError, setSessionLimitError] = useState<string | null>(null);
    const [showAnalysis, setShowAnalysis] = useState(true);
    const [showWelcomeScreen, setShowWelcomeScreen] = useState(true);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    const loadInitialSessions = useCallback(async () => {
        setLoading(true);
        try {
            const userSessions = await chatAiService.getUserSessions();
            if (userSessions.length > 0) {
                setSessions(userSessions);
                await switchSession(userSessions[0], false); 
                setShowWelcomeScreen(false);
            } else {
                setShowWelcomeScreen(true);
            }
        } catch {
            setError('Could not load your conversations. Please try refreshing.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInitialSessions();
    }, [loadInitialSessions]);

    const switchSession = useCallback(async (sessionId: string, hideWelcome = true) => {
        if (loading || activeSessionId === sessionId) return;
        setLoading(true);
        setError(null);
        setResult(null);
        if (hideWelcome) setShowWelcomeScreen(false);
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
            setSessions(prev => [newSession.sessionId, ...prev]);
            setMessages([]);
            setActiveSessionId(newSession.sessionId);
            setResult(null);
            setShowWelcomeScreen(false);
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
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
                if (updatedSessions.length > 0) {
                    await switchSession(updatedSessions[0]);
                } else {
                    setActiveSessionId(null);
                    setMessages([]);
                    setResult(null);
                    setShowWelcomeScreen(true);
                }
            }
        } catch {
            setError('Failed to delete the session.');
        }
    }, [activeSessionId, sessions, switchSession]);

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
        setShowAnalysis(true);
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
            sendMessage();
        }
    };

    // if (showWelcomeScreen) {
    //     return (
    //         <div className="welcome-overlay">
    //             <div className="welcome-content">
    //                 <div className="welcome-logo"><FiStar /></div>
    //                 <h1 className="welcome-title">Personality AI</h1>
    //                 <p className="welcome-subtitle">Start a conversation to analyze your personality.</p>
    //                 <button onClick={handleNewChat} className="start-chat-button" disabled={loading}>
    //                     {loading ? <FiLoader className="spin" /> : 'Start New Session'}
    //                 </button>
    //             </div>
    //         </div>
    //     );
    // }
    
    return (
        <div className="chat-ai-layout">
             <div className="background-effects"></div>
             <div className="sidebar">
                <div className="sidebar-header">
                    <h3>Conversations</h3>
                    <button onClick={handleNewChat} className="new-chat-button" title="New Chat" disabled={loading}>
                        <FiEdit2 />
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
                            <span className="session-id">{`Session ${sid.substring(5, 11)}`}</span>
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
                            <button onClick={() => setSessionLimitError(null)}>&times;</button>
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
                
         {showWelcomeScreen ? (
                <div className="welcome-container"> {/* Note the class name change */}
                    <div className="welcome-content">
                        <div className="welcome-logo"><FiStar /></div>
                        <h1 className="welcome-title">Personality AI</h1>
                        <p className="welcome-subtitle">Start a conversation to analyze your personality.</p>
                        <button onClick={handleNewChat} className="start-chat-button" disabled={loading}>
                            {loading ? <FiLoader className="spin" /> : 'Start New Session'}
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <div className="chat-messages">
                        {loading && messages.length === 0 ? (
                             <div className="full-page-loader"><FiLoader className="spin-large" /></div>
                        ) : (
                            messages.map((msg, index) => (
                                <div key={`${msg.role}-${index}-${msg.timestamp}`} className={`message ${msg.role}`}>
                                    <div className="message-avatar">
                                        {msg.role === 'user' ? <FiUser /> : <FiStar />}
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
    <span className="ai-thinking-icon">
      <FiStar />
    </span>
    <span className="ai-thinking-text">AI đang suy nghĩ</span>
    <span className="typing-dots">
      <span className="dot"></span>
      <span className="dot"></span>
      <span className="dot"></span>
    </span>
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
                            <small>Personality AI can make mistakes. Consider checking important information.</small>
                        </div>
                    </div>
                </>
            )}
                {result && showAnalysis && (
                   <div className="analysis-result">
                    <div className="analysis-header">
                        <h3>Personality Analysis</h3>
                        <button className="close-analysis" onClick={() => setShowAnalysis(false)}>&times;</button>
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
                            <div className="traits-display">
                                {result.keyTraits && Array.isArray(result.keyTraits) && result.keyTraits.length > 0 ? (
                                    <div className="key-traits-container">
                                        {result.keyTraits.map((trait, index) => (
                                            <div key={`key-trait-${index}`} className="key-trait">
                                                <span className="trait-bullet">•</span>
                                                <span className="trait-text">{trait}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : result.traits && Array.isArray(result.traits) && result.traits.length > 0 ? (
                                    <div className="traits-grid">
                                        {result.traits.map((trait, index) => {
                                            const name = trait?.name ? String(trait.name) : `Trait ${index + 1}`;
                                            const score = typeof trait?.score === 'number' ? Math.min(10, Math.max(0, trait.score)) : 0;
                                            return (
                                                <div key={index} className="trait-card">
                                                    <div className="trait-header">
                                                        <span className="trait-name">{name}</span>
                                                        <span className="trait-score" style={{ color: getTraitColor(score) }}>{score}/10</span>
                                                    </div>
                                                    {trait?.description && (
                                                        <div className="trait-description">{String(trait.description)}</div>
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
                                        })}
                                    </div>
                                ) : (
                                    <div className="no-traits"><p>No personality traits could be analyzed.</p></div>
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