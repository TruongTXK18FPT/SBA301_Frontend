import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from "./localStorageService";

// Types for API responses
export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface MBTIQuestion {
  id: number;
  content: string;
  type: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  options: Array<{
    id: number;
    text: string;
  }>;
}

export interface DISCChoice {
  trait: 'D' | 'I' | 'S' | 'C';
  text: string;
}

export interface DISCQuestionSet {
  id: number;
  choices: DISCChoice[];
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  category: Category;
  totalQuestions: number;
}

export interface QuizSubmissionData {
  quizId: number;
  answers: Record<number, string | { most?: 'D' | 'I' | 'S' | 'C', least?: 'D' | 'I' | 'S' | 'C' }>;
  quizType: 'MBTI' | 'DISC';
}

export interface QuizResult {
  type: string;
  description: string;
  careers: string[];
  universities: string[];
}

class QuizService {
  private baseURL = 'http://localhost:8080/api/v1/quiz';

  private getHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  private async fetchAPI<T>(endpoint: string, options: AxiosRequestConfig = {}): Promise<T> {
    try {
      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`Making API request to: ${fullUrl}`);
      const response: AxiosResponse<T> = await axios({
        url: fullUrl,
        headers: this.getHeaders(),
        ...options,
      });
      console.log('API response:', response.data);
      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
        throw new Error(`API Error ${axiosError.code}: ${axiosError.message}`);
      }
      throw new Error('Unknown API error occurred');
    }
  }

  // Get all available quiz types (MBTI, DISC)
  async getAvailableQuizTypes(): Promise<{ type: 'MBTI' | 'DISC'; category: Category }[]> {
    const categories = await this.fetchAPI<Category[]>('/categories');

    // Assuming MBTI is category 1 and DISC is category 2
    return [
      { type: 'MBTI', category: categories.find(c => c.id === 1) || categories[0] },
      { type: 'DISC', category: categories.find(c => c.id === 2) || categories[1] }
    ];
  }

  // Get quizzes by category
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    return this.fetchAPI<Quiz[]>(`/quiz/category/${categoryId}`);
  }

  // Get questions for a specific quiz
  async getQuestionsByQuizId(quizId: number): Promise<(MBTIQuestion | DISCQuestionSet)[]> {
    return this.fetchAPI<(MBTIQuestion | DISCQuestionSet)[]>(`/quiz-questions/quiz/${quizId}`);
  }

  // Transform backend questions to frontend format
  transformQuestionsForFrontend(
    questions: (MBTIQuestion | DISCQuestionSet)[],
    type: 'MBTI' | 'DISC'
  ): (MBTIQuestion | DISCQuestionSet)[] {
    console.log(`Transforming ${type} questions:`, questions);

    if (type === 'MBTI') {
      return questions.map(q => {
        // Type guard to ensure we're working with an MBTI question
        if ('content' in q && 'options' in q) {
          return {
            id: q.id,
            content: q.content,
            type: q.type,
            options: q.options
          } as MBTIQuestion;
        }
        console.warn('Invalid MBTI question format:', q);
        return q;
      });
    } else {
      // DISC questions
      return questions.map(q => {
        // Type guard to ensure we're working with a DISC question set
        if ('choices' in q) {
          return {
            id: q.id,
            choices: q.choices.map((choice: DISCChoice) => ({
              trait: choice.trait,
              text: choice.text
            }))
          } as DISCQuestionSet;
        }
        console.warn('Invalid DISC question format:', q);
        return q;
      });
    }
  }

  // Submit quiz
  async submitQuiz(submissionData: QuizSubmissionData): Promise<QuizResult> {
    return this.fetchAPI<QuizResult>('/quiz-results/submit', {
      method: 'POST',
      data: submissionData
    });
  }

  // Get user's quiz results
  async getUserResults(userId: number): Promise<QuizResult[]> {
    return this.fetchAPI<QuizResult[]>(`/quiz-results/user/${userId}`);
  }

  // Get specific quiz result
  async getQuizResult(resultId: number): Promise<QuizResult> {
    return this.fetchAPI<QuizResult>(`/quiz-results/${resultId}`);
  }
}

const quizService = new QuizService();
export default quizService;