import React, { useState, useEffect, useRef } from 'react';
import "../styles/ChatAi.css";
import { chatAiService, Message, PersonalityResult } from '../services/chatAiService';

const ChatAi: React.FC = () => {
    const [sessionId, setSessionId] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState<string>('');
    const [result, setResult] = useState<PersonalityResult | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [isIdle, setIsIdle] = useState<boolean>(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const idleTimerRef = useRef<number | null>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Reset idle timer function
    const resetIdleTimer = () => {
        setIsIdle(false);
        if (idleTimerRef.current) {
            window.clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = window.setTimeout(() => {
            setIsIdle(true);
        }, 60 * 1000); // 1 minute for demo; adjust to 1-5 minutes (e.g., 5 * 60 * 1000 for 5 minutes)
    };

    // Idle timer logic
    useEffect(() => {
        const handleUserActivity = () => {
            resetIdleTimer();
        };

        // Add event listeners for user activity
        window.addEventListener('mousemove', handleUserActivity);
        window.addEventListener('keydown', handleUserActivity);
        window.addEventListener('click', handleUserActivity);
        window.addEventListener('touchstart', handleUserActivity);

        // Initialize timer
        resetIdleTimer();

        // Cleanup
        return () => {
            if (idleTimerRef.current) {
                window.clearTimeout(idleTimerRef.current);
            }
            window.removeEventListener('mousemove', handleUserActivity);
            window.removeEventListener('keydown', handleUserActivity);
            window.removeEventListener('click', handleUserActivity);
            window.removeEventListener('touchstart', handleUserActivity);
        };
    }, []);

    // Handle input change and reset idle immediately
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInput(e.target.value);
        // Reset idle state immediately when user starts typing
        resetIdleTimer();
    };

    const sendMessage = async () => {
        if (!input.trim()) return;

        setLoading(true);
        resetIdleTimer(); // Reset idle state on send
        const userMessage: Message = { role: 'user', content: input };
        setMessages([...messages, userMessage]);
        setInput('');

        try {
            const response = await chatAiService.sendMessage(sessionId, input);

            setSessionId(response.sessionId);
            const botMessage: Message = {
                role: 'bot',
                content: response.botReply,
            };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', content: 'Oops, something went wrong. Please try again.' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const fetchResult = async () => {
        if (!sessionId) return;

        setLoading(true);
        resetIdleTimer(); // Reset idle state on fetch
        try {
            const personalityResult = await chatAiService.fetchPersonalityResult(sessionId);
            setResult(personalityResult);
        } catch (error) {
            console.error('Error fetching result:', error);
            setMessages((prev) => [
                ...prev,
                { role: 'bot', content: 'Could not generate personality result. Please continue chatting!' },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderSnowflakes = (): React.ReactElement[] | null => {
        if (!isIdle) return null;

        const snowflakes: React.ReactElement[] = [];
        for (let i = 0; i < 30; i++) {
            const leftPosition = Math.random() * 100;
            const animationDuration = 3 + Math.random() * 3;
            const delay = Math.random() * 3;
            const style = {
                left: `${leftPosition}%`,
                animation: `chatai-snowfall ${animationDuration}s linear ${delay}s infinite`
            };
            snowflakes.push(<div key={i} className="chatai-snowflake" style={style} />);
        }
        return snowflakes;
    };

    return (
        <div className="chatai-page">
            <div className="chatai-container">
                <div className="chatai-header">
                    <h1 className="chatai-title">Personality Chat AI</h1>
                    <p className="chatai-subtitle">Discover your personality through conversation</p>
                </div>
                <div className="chatai-messages">
                    {messages.map((msg, index) => (
                        <div key={`${msg.role}-${index}-${msg.content.substring(0, 20)}`} className={`chatai-message chatai-${msg.role}`}>
                            <div className="chatai-message-content">
                                <span className="chatai-message-role">{msg.role === 'user' ? 'You' : 'AI'}:</span>
                                <span>{msg.content}</span>
                            </div>
                        </div>
                    ))}
                    {loading && <div className="chatai-message chatai-bot chatai-loading">Typing...</div>}
                    {isIdle && (
                        <div className="chatai-idle-animation">
                            {renderSnowflakes()}
                            <span className="chatai-idle-text">I'm still here, ready to chat!</span>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>
            {result && (
                <div className="chatai-result-container">
                    <h2 className="chatai-result-title">Your Personality Result</h2>
                    <p className="chatai-result-text"><strong>Personality Code:</strong> {result.personalityCode}</p>
                    <p className="chatai-result-text"><strong>Nickname:</strong> {result.nickname}</p>
                    <p className="chatai-result-text"><strong>Key Traits:</strong> {result.keyTraits}</p>
                    <p className="chatai-result-text"><strong>Description:</strong> {result.description}</p>
                    <p className="chatai-result-text"><strong>Career Recommendations:</strong> {result.careerRecommendations}</p>
                    <div className="chatai-scores">
                        <h3 className="chatai-scores-title">Scores:</h3>
                        {Object.entries(result.scores).map(([trait, score]) => (
                            <p key={trait} className="chatai-result-text">{trait}: {score}</p>
                        ))}
                    </div>
                </div>
            )}
            <div className="chatai-input">
                <textarea
                    className="chatai-textarea"
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <div className="chatai-button-group">
                    <button className="chatai-button chatai-send-button" onClick={sendMessage} disabled={loading}>
                        ➤
                    </button>
                    <button className="chatai-button" onClick={fetchResult} disabled={loading || !sessionId}>
                        Get Personality Result
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default ChatAi;