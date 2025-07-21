import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getToken } from "./localStorageService";

// Types for API responses
export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface QuizOption {
  id: number;
  optionText: string;
  targetTrait?: string;
  scoreValue: number;
  questionId: number;
}

export interface BackendQuizQuestion {
  id: number;
  content: string;
  orderNumber: number;
  dimension: string;
  quizId: number;
  options: QuizOption[];
}

export interface MBTIQuestion {
  id: number;
  content: string;
  type: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  options: Array<{
    id: number;
    text: string;
    value?: number;
  }>;
}

export interface DISCChoice {
  trait: 'D' | 'I' | 'S' | 'C';
  text: string;
}

export interface DISCQuestionSet {
  id: number;
  content: string;
  options: DISCChoice[];
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
  // Remove userId - backend will extract it from JWT token via auth-service
  answers: Record<number, string | { most?: 'D' | 'I' | 'S' | 'C', least?: 'D' | 'I' | 'S' | 'C' }>; // questionId -> answer
}

export interface QuizResult {
  id: number;
  personalityCode: string;
  nickname?: string;
  keyTraits?: string;
  description: string;
  careerRecommendations?: string;
  universityRecommendations?: string;
  scores?: Record<string, number>;
  submittedAt: string;
  quizType: string;
}

// Quiz Management Types
export interface QuizData {
  id: number;
  title: string;
  categoryId: number;
  description: string;
  questionQuantity: number;
  categoryName?: string;
}

export interface QuizRequestDTO {
  title: string;
  categoryId: number;
  description: string;
  questionQuantity: number;
}

export interface QuizQuestionCreateRequest {
  content: string;
  orderNumber: number;
  dimension: string;
  quizId: number;
  options: QuizOptionCreateRequest[];
}

export interface QuizOptionCreateRequest {
  optionText: string;
  targetTrait?: string;
  scoreValue: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO'; // Match backend enum
}

export interface QuizQuestionResponse {
  id: number;
  content: string;
  orderNumber: number;
  dimension: string;
  quizId: number;
  options: QuizOptionResponse[];
}

export interface QuizOptionResponse {
  id: number;
  optionText: string;
  targetTrait?: string;
  scoreValue: number;
  questionId: number;
}

// Add new interfaces for quiz options management
export interface QuizOptionsDTO {
  id?: number;
  optionText: string;
  targetTrait?: string;
  scoreValue: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO';
  questionId: number;
}

export interface QuizOptionUpdateRequest {
  optionText: string;
  targetTrait?: string;
  scoreValue: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO';
  questionId: number;
}

interface CacheItem {
  data: unknown;
  timestamp: number;
  ttl: number;
}

class QuizService {
  private baseURL = 'http://localhost:8080/api/v1/quiz';

  // Client-side cache for better performance
  private cache = new Map<string, CacheItem>();
  private readonly DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly QUESTIONS_CACHE_TTL = 10 * 60 * 1000; // 10 minutes for questions

  private getHeaders() {
    const token = getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  // Enhanced cache management
  private getCacheKey(endpoint: string, params?: unknown): string {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${endpoint}${paramStr}`;
  }

  private getCachedData<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`Cache hit for: ${key}`);
      return cached.data as T;
    }
    if (cached) {
      this.cache.delete(key); // Remove expired cache
    }
    return null;
  }

  private setCachedData<T>(key: string, data: T, ttl: number = this.DEFAULT_CACHE_TTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  private async fetchAPI<T>(endpoint: string, options: AxiosRequestConfig = {}, cacheTtl?: number): Promise<T> {
    // Check cache first for GET requests
    if (!options.method || options.method.toUpperCase() === 'GET') {
      const cacheKey = this.getCacheKey(endpoint, options.params);
      const cachedData = this.getCachedData<T>(cacheKey);
      if (cachedData) {
        return cachedData;
      }
    }

    try {
      const fullUrl = `${this.baseURL}${endpoint}`;
      console.log(`Making API request to: ${fullUrl}`);

      const startTime = performance.now();
      const response: AxiosResponse<T> = await axios({
        url: fullUrl,
        headers: this.getHeaders(),
        timeout: 30000, // 30 second timeout
        ...options,
      });
      const endTime = performance.now();

      console.log(`API call took ${endTime - startTime}ms for: ${endpoint}`);

      // Cache GET responses
      if (!options.method || options.method.toUpperCase() === 'GET') {
        const cacheKey = this.getCacheKey(endpoint, options.params);
        this.setCachedData(cacheKey, response.data, cacheTtl);
      }

      return response.data;
    } catch (error) {
      console.error('API request failed:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError;
        console.error('Response data:', axiosError.response?.data);
        console.error('Response status:', axiosError.response?.status);
        
        // More detailed error messages based on status codes
        const status = axiosError.response?.status;
        const responseData = axiosError.response?.data;
        
        switch (status) {
          case 401:
            throw new Error('Unauthenticated - Please login again');
          case 403:
            throw new Error('Forbidden - You do not have permission to access this resource');
          case 404:
            throw new Error('Not Found - The requested resource was not found');
          case 500:
            // Extract more specific error message from backend if available
            if (typeof responseData === 'string' && responseData.includes('Unauthenticated')) {
              throw new Error('Internal Server Error - Authentication failed with microservice');
            }
            throw new Error(`Internal Server Error - ${responseData || 'Server encountered an error'}`);
          default:
            throw new Error(`API Error ${axiosError.code}: ${axiosError.message}`);
        }
      }
      throw new Error('Unknown API error occurred');
    }
  }

  // Get all available quiz types (MBTI, DISC) with caching
  async getAvailableQuizTypes(): Promise<{ type: 'MBTI' | 'DISC'; category: Category }[]> {
    const categories = await this.fetchAPI<Category[]>('/categories', {}, this.DEFAULT_CACHE_TTL);
    console.log('Available categories:', categories);

    // Find categories by name instead of hardcoded IDs
    const mbtiCategory = categories.find(c =>
      c.name.toUpperCase().includes('MBTI') ||
      c.name.toUpperCase().includes('MYERS')
    );

    const discCategory = categories.find(c =>
      c.name.toUpperCase().includes('DISC') ||
      c.name.toUpperCase().includes('DOMINANCE')
    );

    const availableTypes: { type: 'MBTI' | 'DISC'; category: Category }[] = [];

    if (mbtiCategory) {
      availableTypes.push({ type: 'MBTI', category: mbtiCategory });
    }

    if (discCategory) {
      availableTypes.push({ type: 'DISC', category: discCategory });
    }

    console.log('Mapped quiz types:', availableTypes);
    return availableTypes;
  }

  // Get quizzes by category with caching
  async getQuizzesByCategory(categoryId: number): Promise<Quiz[]> {
    return this.fetchAPI<Quiz[]>(`/quiz/category/${categoryId}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Get questions for a specific quiz with aggressive caching
  async getQuestionsByQuizId(quizId: number): Promise<(MBTIQuestion | DISCQuestionSet)[]> {
    console.log(`Fetching questions for quiz ID: ${quizId}`);
    const startTime = performance.now();

    const backendQuestions = await this.fetchAPI<BackendQuizQuestion[]>(
      `/quiz-questions/quiz/${quizId}`,
      {},
      this.QUESTIONS_CACHE_TTL // Cache questions for 10 minutes
    );

    const endTime = performance.now();
    console.log(`API call took ${endTime - startTime} milliseconds for ${backendQuestions.length} questions`);

    // Determine quiz type based on the first question's dimension
    const firstQuestion = backendQuestions[0];
    if (!firstQuestion) return [];

    const isDiscQuiz = firstQuestion.dimension === 'DISC';
    const quizType: 'MBTI' | 'DISC' = isDiscQuiz ? 'DISC' : 'MBTI';

    console.log(`Transforming ${backendQuestions.length} ${quizType} questions`);
    const transformStartTime = performance.now();

    const transformed = this.transformQuestionsForFrontend(backendQuestions, quizType);

    const transformEndTime = performance.now();
    console.log(`Transformation took ${transformEndTime - transformStartTime} milliseconds`);

    return transformed;
  }

  // Optimized transformation with memoization
  private transformationCache = new Map<string, (MBTIQuestion | DISCQuestionSet)[]>();

  transformQuestionsForFrontend(
    backendQuestions: BackendQuizQuestion[],
    type: 'MBTI' | 'DISC'
  ): (MBTIQuestion | DISCQuestionSet)[] {
    // Create a cache key based on questions and type
    const cacheKey = `transform_${type}_${backendQuestions.map(q => q.id).join('_')}`;

    if (this.transformationCache.has(cacheKey)) {
      console.log('Using cached transformation');
      return this.transformationCache.get(cacheKey)!;
    }

    console.log(`Transforming ${type} questions:`, backendQuestions);

    let result: (MBTIQuestion | DISCQuestionSet)[];

    if (type === 'MBTI') {
      result = backendQuestions.map(q => {
        return {
          id: q.id,
          content: q.content,
          type: this.determineMBTIType(q.dimension),
          options: q.options.map(option => ({
            id: option.id,
            text: option.optionText,
            value: option.scoreValue
          }))
        } as MBTIQuestion;
      });
    } else {
      // DISC questions - group options by question
      result = backendQuestions.map(q => {
        return {
          id: q.id,
          content: q.content,
          options: q.options.map(option => ({
            trait: (option.targetTrait || 'D') as 'D' | 'I' | 'S' | 'C',
            text: option.optionText
          }))
        } as DISCQuestionSet;
      });
    }

    // Cache the transformation result
    this.transformationCache.set(cacheKey, result);

    return result;
  }

  // Helper method to determine MBTI type from dimension
  private determineMBTIType(dimension: string): 'E/I' | 'S/N' | 'T/F' | 'J/P' {
    switch (dimension) {
      case 'E': case 'I': return 'E/I';
      case 'S': case 'N': return 'S/N';
      case 'T': case 'F': return 'T/F';
      case 'J': case 'P': return 'J/P';
      default: return 'E/I'; // fallback
    }
  }

  // Enhanced quiz submission with secure microservices integration
  async submitQuiz(submissionData: QuizSubmissionData): Promise<QuizResult> {
    const { quizId, answers: frontendAnswers } = submissionData;

    // Get backend questions to map answers to optionIds
    const backendQuestions = await this.fetchAPI<BackendQuizQuestion[]>(
      `/quiz-questions/quiz/${quizId}`,
      {},
      this.QUESTIONS_CACHE_TTL
    );

    // Determine quiz type from first question
    const firstQuestion = backendQuestions[0];
    if (!firstQuestion) {
      throw new Error('No questions found for this quiz');
    }

    const quizType: 'MBTI' | 'DISC' = firstQuestion.dimension === 'DISC' ? 'DISC' : 'MBTI';

    // Convert answers to the format expected by backend (questionId -> optionId)
    const formattedAnswers: Record<number, number> = {};

    for (const backendQuestion of backendQuestions) {
      const questionId = backendQuestion.id;
      const answer = frontendAnswers[questionId];

      if (answer) {
        if (quizType === 'MBTI') {
          // For MBTI, find the option that matches the selected text
          const selectedOption = backendQuestion.options.find(opt => opt.optionText === answer);
          if (selectedOption) {
            formattedAnswers[questionId] = selectedOption.id;
          }
        } else if (quizType === 'DISC') {
          // For DISC, handle the most/least selection
          const discAnswer = answer as { most?: 'D' | 'I' | 'S' | 'C', least?: 'D' | 'I' | 'S' | 'C' };

          if (discAnswer.most) {
            // Find the option that matches the "most" selection
            const mostOption = backendQuestion.options.find(opt => opt.targetTrait === discAnswer.most);
            if (mostOption) {
              formattedAnswers[questionId] = mostOption.id;
            }
          }
        }
      }
    }

    // Prepare final submission data (no userId - backend extracts from JWT via microservices)
    const finalSubmissionData = {
      quizId,
      answers: formattedAnswers
    };

    console.log('Submitting quiz with formatted data:', finalSubmissionData);

    try {
      // Submit to backend - JWT token automatically included in headers
      const result = await this.fetchAPI<QuizResult>('/quiz-results/submit', {
        method: 'POST',
        data: finalSubmissionData
      });

      console.log('Quiz result received with microservices data:', result);

      // Cache the result
      const cacheKey = `result_${quizId}`;
      this.setCachedData(cacheKey, result, this.DEFAULT_CACHE_TTL);

      return result;

    } catch (error) {
      console.error('Quiz submission failed:', error);
      throw new Error(`Failed to submit quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Get user's quiz results by email (for parent dashboard)
  async getUserResultsByEmail(email: string): Promise<{
    userId: string;
    email: string;
    fullName: string;
    results: Array<{
      id: number;
      personalityCode: string;
      nickname?: string;
      keyTraits?: string;
      description: string;
      careerRecommendations?: string;
      universityRecommendations?: string;
      scores?: Record<string, number>;
      submittedAt: string;
      quizType: string;
    }>;
  }> {
    try {
      const response = await this.fetchAPI<{
        userId: string;
        email: string;
        totalQuizzesTaken: number;
        quizResults: Array<{
          resultId: number;
          personalityCode?: string;
          resultType: string;
          personalityName?: string;
          personalityDescription?: string;
          timeSubmit: string;
          resultJson?: string;
        }>;
      }>(`/quiz-results/user/by-email?email=${encodeURIComponent(email)}`);

      if (!response) {
        throw new Error('No response received from server');
      }
      // Transform the response to match expected format
      return {
        userId: response.userId,
        email: response.email,
        fullName: response.email, // Using email as fullName since it's not provided
        results: response.quizResults?.map(result => ({
          id: result.resultId,
          personalityCode: result.personalityCode || result.resultType,
          nickname: result.personalityName,
          description: result.personalityDescription || '',
          submittedAt: result.timeSubmit,
          quizType: result.resultType,
          // Include additional fields from resultJson if available
          ...(result.resultJson ? JSON.parse(result.resultJson) : {})
        })) || []
      };
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }
  // Get quiz results by ID for management
  async getMyQuizResults(): Promise<{
  userId: string;
  email: string;
  fullName: string;
  results: Array<{
    id: number;
    personalityCode: string;
    nickname?: string;
    keyTraits?: string;
    description: string;
    careerRecommendations?: string;
    universityRecommendations?: string;
    scores?: Record<string, number>;
    submittedAt: string;
    quizType: string;
  }>;
}> {
  try {
    const response = await this.fetchAPI<{
      userId: string;
      email: string;
      fullName: string;
      quizResults: Array<{
        resultId: number;
        personalityCode?: string;
        resultType: string;
        personalityName?: string;
        personalityDescription?: string;
        timeSubmit: string;
        resultJson?: string;
      }>;
    }>('/quiz-results/user/me');

    if (!response) {
      throw new Error('No response received from server');
    }
    return {
      userId: response.userId,
      email: response.email,
      fullName: response.fullName,
      results: response.quizResults?.map(result => ({
        id: result.resultId,
        personalityCode: result.personalityCode || result.resultType,
        nickname: result.personalityName,
        description: result.personalityDescription || '',
        submittedAt: result.timeSubmit,
        quizType: result.resultType,
        ...(result.resultJson ? JSON.parse(result.resultJson) : {})
      })) || []
    };
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}
  /**
   * Get detailed quiz result by ID
   * @param resultId The ID of the quiz result to fetch
   * @returns A promise that resolves to the quiz result details
   */
  async getQuizResultById(resultId: number): Promise<QuizResult> {
    try {
      // Fetch the detailed result from the backend
      const response = await this.fetchAPI<{
        resultId: number;
        personalityCode?: string;
        resultType: string;
        personalityName?: string;
        personalityDescription?: string;
        timeSubmit: string;
        resultJson?: string;
      }>(`/quiz-results/${resultId}`);

      if (!response) {
        throw new Error('No response received from server');
      }

      // Parse the resultJson if it exists
      const jsonData = response.resultJson ? JSON.parse(response.resultJson) : {};
      
      // Map the response to the QuizResult interface
      return {
        id: response.resultId,
        personalityCode: response.personalityCode || response.resultType || 'N/A',
        nickname: response.personalityName || jsonData.nickname || 'N/A',
        keyTraits: jsonData.keyTraits || jsonData.traits || 'N/A',
        description: response.personalityDescription || jsonData.description || 'No description available',
        careerRecommendations: jsonData.careerRecommendations || jsonData.careers || 'N/A',
        universityRecommendations: jsonData.universityRecommendations || jsonData.universities || 'N/A',
        scores: jsonData.scores || {},
        submittedAt: response.timeSubmit,
        quizType: response.resultType
      };
    } catch (error) {
      console.error('Failed to fetch quiz result details:', error);
      throw error;
    }
  }
  // Get all quizzes for management
  async getAllQuizzes(): Promise<QuizData[]> {
    return this.fetchAPI<QuizData[]>('/quiz', {}, this.DEFAULT_CACHE_TTL);
  }

  // Get all categories for dropdown
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await this.fetchAPI<Category[]>('/categories', {}, this.DEFAULT_CACHE_TTL);
      console.log('Categories API response:', response);
      return response;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  // Update existing quiz
  async updateQuiz(quizId: number, quizData: QuizRequestDTO): Promise<QuizData> {
    // Clear cache after updating
    this.cache.clear();
    return this.fetchAPI<QuizData>(`/quiz/${quizId}`, {
      method: 'PUT',
      data: quizData
    });
  }

  // Get quiz by ID for editing
  async getQuizById(quizId: number): Promise<QuizData> {
    return this.fetchAPI<QuizData>(`/quiz/${quizId}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Create quiz question with options
  async createQuizQuestion(questionData: QuizQuestionCreateRequest): Promise<QuizQuestionResponse> {
    // Clear cache after creating
    this.cache.clear();
    return this.fetchAPI<QuizQuestionResponse>('/quiz-questions', {
      method: 'POST',
      data: questionData
    });
  }

  // Get questions for a quiz (for management)
  async getQuizQuestions(quizId: number): Promise<QuizQuestionResponse[]> {
    return this.fetchAPI<QuizQuestionResponse[]>(`/quiz-questions/quiz/${quizId}`, {}, this.DEFAULT_CACHE_TTL);
  }

  async getQuizQuestionById(questionId: number): Promise<QuizQuestionResponse> {
  return quizService.fetchAPI<QuizQuestionResponse>(`/quiz-questions/${questionId}`);
}

  // Update quiz question
  async updateQuizQuestion(questionId: number, questionData: QuizQuestionCreateRequest): Promise<QuizQuestionResponse> {
    this.cache.clear();
    return this.fetchAPI<QuizQuestionResponse>(`/quiz-questions/${questionId}`, {
      method: 'PUT',
      data: questionData
    });
  }

  // Delete quiz question
  async deleteQuizQuestion(questionId: number): Promise<void> {
    this.cache.clear();
    return this.fetchAPI<void>(`/quiz-questions/${questionId}`, {
      method: 'DELETE'
    });
  }

  // === Quiz Options Management Functions ===

  // Get options by question ID
  async getOptionsByQuestionId(questionId: number): Promise<QuizOptionsDTO[]> {
    return this.fetchAPI<QuizOptionsDTO[]>(`/quiz-options/question/${questionId}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Get options by multiple question IDs
  async getOptionsByQuestionIds(questionIds: number[]): Promise<QuizOptionsDTO[]> {
    return this.fetchAPI<QuizOptionsDTO[]>(`/quiz-options/questions?questionIds=${questionIds.join(',')}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Get specific option by ID
  async getOptionById(optionId: number): Promise<QuizOptionsDTO> {
    return this.fetchAPI<QuizOptionsDTO>(`/quiz-options/${optionId}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Create a new quiz option
  async createQuizOption(optionData: QuizOptionsDTO): Promise<QuizOptionsDTO> {
    this.cache.clear();
    return this.fetchAPI<QuizOptionsDTO>('/quiz-options', {
      method: 'POST',
      data: optionData
    });
  }

  // Create multiple quiz options
  async createQuizOptions(optionsData: QuizOptionsDTO[]): Promise<QuizOptionsDTO[]> {
    this.cache.clear();
    return this.fetchAPI<QuizOptionsDTO[]>('/quiz-options/bulk', {
      method: 'POST',
      data: optionsData
    });
  }

  // Update a quiz option
  async updateQuizOption(optionId: number, optionData: QuizOptionUpdateRequest): Promise<QuizOptionsDTO> {
    this.cache.clear();
    return this.fetchAPI<QuizOptionsDTO>(`/quiz-options/${optionId}`, {
      method: 'PUT',
      data: optionData
    });
  }

  // Delete a quiz option
  async deleteQuizOption(optionId: number): Promise<void> {
    this.cache.clear();
    return this.fetchAPI<void>(`/quiz-options/${optionId}`, {
      method: 'DELETE'
    });
  }

  // Delete all options for a question
  async deleteOptionsByQuestionId(questionId: number): Promise<void> {
    this.cache.clear();
    return this.fetchAPI<void>(`/quiz-options/question/${questionId}`, {
      method: 'DELETE'
    });
  }

  // Get options by target trait
  async getOptionsByTargetTrait(targetTrait: string): Promise<QuizOptionsDTO[]> {
    return this.fetchAPI<QuizOptionsDTO[]>(`/quiz-options/target-trait/${targetTrait}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Get options by score value
  async getOptionsByScoreValue(scoreValue: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO'): Promise<QuizOptionsDTO[]> {
    return this.fetchAPI<QuizOptionsDTO[]>(`/quiz-options/score-value/${scoreValue}`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Count options for a question
  async countOptionsByQuestionId(questionId: number): Promise<{ count: number }> {
    return this.fetchAPI<{ count: number }>(`/quiz-options/question/${questionId}/count`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Check if option exists
  async optionExists(optionId: number): Promise<{ exists: boolean }> {
    return this.fetchAPI<{ exists: boolean }>(`/quiz-options/${optionId}/exists`, {}, this.DEFAULT_CACHE_TTL);
  }

  // Get available score values
  async getAvailableScoreValues(): Promise<('NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO')[]> {
    return this.fetchAPI<('NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO')[]>('/quiz-options/score-values', {}, this.DEFAULT_CACHE_TTL);
  }

  // === Helper Functions for Quiz Types ===

  // Get appropriate score values based on quiz type
  getScoreValuesForQuizType(isDiscQuiz: boolean): { value: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO', label: string, numericValue: number }[] {
    if (isDiscQuiz) {
      return [
        { value: 'DISC_TWO', label: 'Most Like Me (2)', numericValue: 2 }
      ];
    } else {
      // MBTI quiz
      return [
        { value: 'NEGATIVE_ONE', label: 'Disagree (-1)', numericValue: -1 },
        { value: 'ZERO', label: 'Neutral (0)', numericValue: 0 },
        { value: 'POSITIVE_ONE', label: 'Agree (1)', numericValue: 1 }
      ];
    }
  }

  // Get appropriate traits based on quiz type
  getTraitsForQuizType(isDiscQuiz: boolean): string[] {
    if (isDiscQuiz) {
      return ['D', 'I', 'S', 'C'];
    } else {
      // MBTI quiz
      return ['E', 'I', 'S', 'N', 'T', 'F', 'J', 'P'];
    }
  }

  // Convert score value enum to numeric value
  convertScoreValueToNumber(scoreValue: 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO'): number {
    switch (scoreValue) {
      case 'NEGATIVE_ONE': return -1;
      case 'ZERO': return 0;
      case 'POSITIVE_ONE': return 1;
      case 'DISC_TWO': return 2;
      default: return 0;
    }
  }

  // Convert numeric value to score value enum
  convertNumberToScoreValue(numericValue: number): 'NEGATIVE_ONE' | 'ZERO' | 'POSITIVE_ONE' | 'DISC_TWO' {
    switch (numericValue) {
      case -1: return 'NEGATIVE_ONE';
      case 0: return 'ZERO';
      case 1: return 'POSITIVE_ONE';
      case 2: return 'DISC_TWO';
      default: return 'ZERO';
    }
  }
}

const quizService = new QuizService();
export default quizService;
