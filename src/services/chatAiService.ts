import axios from 'axios';
import { getToken } from './localStorageService';

export interface Message {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
}

export interface AnalysisResult {
    personalityType: string;
    description: string;
    traits: {
        name: string;
        score: number;
        description: string;
    }[];
    keyTraits?: string[];  // Array of trait names or descriptions
    recommendations: string[];
}

export interface ChatSession {
    sessionId: string;
    userId: string;
    messages: Message[];
    botReply?: string;
    error?: string | null;
    analysisAvailable?: boolean;
    analysisPrompt?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ChatResponse {
    sessionId: string;
    message: Message;
    botReply?: string;
    analysisResult?: AnalysisResult;
}

class ChatAiService {
    private baseURL = 'http://localhost:8080/api/v1/chatai/chat';
    private defaultHeaders: Record<string, string> = {
        'Content-Type': 'application/json',
    };

    private getHeaders(): Record<string, string> {
        const token = getToken();
        if (!token) {
            throw new Error('No authentication token found. Please log in.');
        }
        
        // Basic token validation
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            localStorage.removeItem('accessToken');
            throw new Error('Invalid token format. Please log in again.');
        }
        
        // Check token expiration and get user ID
        let userId = '';
        try {
            const payload = JSON.parse(atob(tokenParts[1]));
            const expiry = payload.exp;
            if (expiry && Date.now() >= expiry * 1000) {
                localStorage.removeItem('accessToken');
                throw new Error('Session expired. Please log in again.');
            }
            userId = payload.sub || ''; // Extract user ID from token
            if (!userId) {
                throw new Error('Invalid token: No user ID');
            }
        } catch {
            localStorage.removeItem('accessToken');
            throw new Error('Invalid token. Please log in again.');
        }
        
        return {
            ...this.defaultHeaders,
            'Authorization': `Bearer ${token}`,
            'X-User-Id': userId // Add user ID header required by backend
        };
    }

    /**
     * Get all session IDs for the current user
     */
    async getUserSessions(): Promise<string[]> {
        const response = await axios.get<string[]>(`${this.baseURL}/sessions`, {
            headers: this.getHeaders(),
        });
        return response.data;
    }

    async deleteSession(sessionId: string): Promise<void> {
        await axios.delete(`${this.baseURL}/${sessionId}`, {
            headers: this.getHeaders(),
        });
    }

    /**
     * Start a new chat session
     */
    async startNewSession(): Promise<ChatSession> {
        try {
            const response = await axios.post<ChatSession>(
                `${this.baseURL}/start`,
                {},
                { 
                    headers: this.getHeaders(),
                    validateStatus: (status) => status < 500 // Don't throw for 4xx errors
                }
            );
            
            // If we get a 403, handle it specifically
            if (response.status === 403) {
                const errorMessage = response.data?.error || 'You have reached the maximum number of chat sessions. Please delete an old one to create a new chat.';
                throw new Error(errorMessage);
            }
            
            // For other successful responses
            return response.data;
            
        } catch (error) {
            if (error instanceof Error) {
                throw error;
            }
            throw new Error('Failed to start a new chat session. Please try again.');
        }
    }

    /**
     * Send a message in an existing chat session
     */
    async sendMessage(sessionId: string, message: string): Promise<ChatResponse> {
        try {
            const headers = this.getHeaders();
            const requestData = { message, sessionId };

            const response = await axios.post<ChatResponse>(
                `${this.baseURL}/message`,
                requestData,
                {
                    headers,
                    validateStatus: () => true // Don't throw for any status codes
                }
            );

            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem('accessToken');
                throw new Error('Session expired. Please log in again.');
            }

            if (!response.data) {
                console.error('Empty response when sending message');
                throw new Error('No response from server');
            }

            return response.data;

        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('No response received:', error.request);
                } else {
                    console.error('Error setting up request:', error.message);
                }
            } else if (error instanceof Error) {
                console.error('Error message:', error.message);
            } else {
                console.error('Unexpected error:', error);
            }
            throw error;
        }
    }

    /**
     * Get chat history for a session
     */
    async getChatHistory(sessionId: string): Promise<Message[]> {
        const headers = this.getHeaders();

        const response = await axios({
            method: 'get',
            url: `${this.baseURL}/history/${sessionId}`,
            headers,
            validateStatus: () => true // Don't throw for any status codes
        });

        if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('accessToken');
            throw new Error('Session expired. Please log in again.');
        }

        if (!response.data) {
            return [];
        }

        let messages: Message[] = [];

        if (Array.isArray(response.data)) {
            messages = response.data;
        }
        else if (response.data && typeof response.data === 'object') {
            interface ResponseData {
                messages?: unknown;
                data?: unknown;
                chatHistory?: unknown;
                role?: string;
                content?: string;
                [key: string]: unknown;
            }
            const data = response.data as ResponseData;

            if (Array.isArray(data.messages)) {
                messages = data.messages as Message[];
            }
            else if (data.data && Array.isArray(data.data)) {
                messages = data.data as Message[];
            }
            else if (data.chatHistory && Array.isArray(data.chatHistory)) {
                messages = data.chatHistory as Message[];
            }
            else if (data.role && data.content) {
                messages = [{
                    role: data.role as 'user' | 'assistant' | 'system',
                    content: String(data.content),
                    timestamp: data.timestamp ? String(data.timestamp) : new Date().toISOString()
                }];
            }
        }
        
        // Define backend message interface
        interface BackendMessage {
            sender: string;
            content?: string;
            createdAt?: string;
            [key: string]: unknown;
        }
        
        // Map backend message format to frontend format
        return messages
            .map((msg: unknown) => {
                if (msg && typeof msg === 'object' && 'sender' in msg) {
                    const backendMessage = msg as BackendMessage;
                    return {
                        role: (backendMessage.sender === 'user' ? 'user' : 'assistant') as 'user' | 'assistant' | 'system',
                        content: backendMessage.content || '',
                        timestamp: backendMessage.createdAt || new Date().toISOString(),
                        _raw: msg
                    } as Message;
                }
                return msg as Message;
            })
            .filter(msg => {
                const isValid = msg &&
                    typeof msg === 'object' &&
                    'role' in msg &&
                    'content' in msg;
                if (!isValid) {
                    // Message format is invalid, will be filtered out
                }
                return isValid;
            });
    }

    /**
     * Analyze the conversation and get personality insights
     */
    async analyzeConversation(sessionId: string): Promise<AnalysisResult> {
        try {
            interface BackendAnalysisResponse {
                mbtiType: string;
                discType?: string;
                analysis: string;
                traits: { [key: string]: number } | Array<{ name: string; score: number; description: string }>;
                keyTraits?: string[];
                suitableCareers?: string[];
                recommendations?: string[];
                strengths?: string[];
                weaknesses?: string[];
                developmentSuggestions?: string;
            }

            const response = await axios.post<BackendAnalysisResponse>(
                `${this.baseURL}/analyze/${sessionId}`,
                {},
                { 
                    headers: this.getHeaders(),
                    validateStatus: () => true // Don't throw for any status codes
                }
            );

            console.log('Analysis response:', response.data);
            const backendResult = response.data;

            // Handle both object and array formats for traits
            let traitsArray: { name: string; score: number; description: string }[] = [];
            
            if (Array.isArray(backendResult.traits)) {
                // If traits is already an array, use it directly
                traitsArray = backendResult.traits;
            } else if (typeof backendResult.traits === 'object' && backendResult.traits !== null) {
                // If traits is an object, convert it to an array
                traitsArray = Object.entries(backendResult.traits).map(([name, score]) => ({
                    name: name.charAt(0).toUpperCase() + name.slice(1),
                    score: typeof score === 'number' ? score : 0,
                    description: `Description for ${name}.`
                }));
            }

            // Create the frontend result with all available fields
            const frontendResult: AnalysisResult = {
                personalityType: backendResult.mbtiType || '',
                description: backendResult.analysis || '',
                traits: traitsArray,
                keyTraits: backendResult.keyTraits || [],
                recommendations: backendResult.suitableCareers || backendResult.recommendations || [],
                // Include these fields if they exist in the backend response
                ...(backendResult.strengths && { strengths: backendResult.strengths }),
                ...(backendResult.weaknesses && { weaknesses: backendResult.weaknesses }),
                ...(backendResult.developmentSuggestions && { developmentSuggestions: backendResult.developmentSuggestions })
            };

            console.log('Mapped frontend result:', frontendResult);
            return frontendResult;

        } catch (error) {
            console.error('Error analyzing conversation:', error);
            throw error;
        }
    }

}

// Export a singleton instance
export const chatAiService = new ChatAiService();

export default ChatAiService;