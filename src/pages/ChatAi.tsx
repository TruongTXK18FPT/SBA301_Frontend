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
    const idleTimerRef = useRef<NodeJS.Timeout | null>(null);

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
            clearTimeout(idleTimerRef.current);
        }
        idleTimerRef.current = setTimeout(() => {
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
                clearTimeout(idleTimerRef.current);
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

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const renderSnowflakes = () => {
        if (!isIdle) return null;

        const snowflakes = [];
        for (let i = 0; i < 30; i++) {
            const leftPosition = Math.random() * 100;
            const animationDuration = 3 + Math.random() * 3;
            const delay = Math.random() * 3;
            const style = {
                left: `${leftPosition}%`,
                animation: `snowfall ${animationDuration}s linear ${delay}s infinite`
            };
            snowflakes.push(<div key={i} className="snowflake" style={style} />);
        }
        return snowflakes;
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <h1>Personality Chat AI</h1>
                <p>Discover your personality through conversation</p>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <div className="message-content">
                            <span className="role">{msg.role === 'user' ? 'You' : 'AI'}:</span>
                            <span>{msg.content}</span>
                        </div>
                    </div>
                ))}
                {loading && <div className="message bot loading">Typing...</div>}
                {isIdle && (
                    <div className="idle-animation">
                        {renderSnowflakes()}
                        <span className="idle-text">I'm still here, ready to chat!</span>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>
            {result && (
                <div className="result-container">
                    <h2>Your Personality Result</h2>
                    <p><strong>Personality Code:</strong> {result.personalityCode}</p>
                    <p><strong>Nickname:</strong> {result.nickname}</p>
                    <p><strong>Key Traits:</strong> {result.keyTraits}</p>
                    <p><strong>Description:</strong> {result.description}</p>
                    <p><strong>Career Recommendations:</strong> {result.careerRecommendations}</p>
                    <div className="scores">
                        <h3>Scores:</h3>
                        {Object.entries(result.scores).map(([trait, score]) => (
                            <p key={trait}>{trait}: {score}</p>
                        ))}
                    </div>
                </div>
            )}
            <div className="chat-input">
                <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    disabled={loading}
                />
                <div className="button-group">
                    <button className="send-button" onClick={sendMessage} disabled={loading}>
                        ➤
                    </button>
                    <button onClick={fetchResult} disabled={loading || !sessionId}>
                        Get Personality Result
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatAi;