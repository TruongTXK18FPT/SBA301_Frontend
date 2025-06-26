import axios from 'axios';
import { getToken } from "./localStorageService";

export interface Message {
    role: string;
    content: string;
    timestamp?: string;
}

export interface PersonalityResult {
    personalityCode: string;
    nickname: string;
    keyTraits: string;
    description: string;
    careerRecommendations: string;
    scores: { [key: string]: number };
}

export interface ChatMessageRequest {
    sessionId: string;
    message: string;
}

export interface ChatMessageResponse {
    sessionId: string;
    botReply: string;
}

class ChatAiService {
    private baseURL = 'http://localhost:8080/api/v1/chatai';

    /**
     * Send a message to the chat API
     */
    async sendMessage(sessionId: string, message: string): Promise<ChatMessageResponse> {
        try {
            const token = getToken();
            const response = await axios.post<ChatMessageResponse>(`${this.baseURL}/chat/message`, {
                sessionId,
                message,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error('Failed to send message. Please try again.');
        }
    }

    /**
     * Fetch personality result for a session
     */
    async fetchPersonalityResult(sessionId: string): Promise<PersonalityResult> {
        try {
            const token = getToken();
            const response = await axios.post<PersonalityResult>(`${this.baseURL}/chat/result/${sessionId}`, {}, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching personality result:', error);
            throw new Error('Could not generate personality result. Please continue chatting!');
        }
    }

    /**
     * Set the base URL for the API (useful for different environments)
     */
    setBaseURL(url: string): void {
        this.baseURL = url;
    }

    /**
     * Get the current base URL
     */
    getBaseURL(): string {
        return this.baseURL;
    }
}

// Export a singleton instance
export const chatAiService = new ChatAiService();

// Also export the class for testing or multiple instances if needed
export default ChatAiService;