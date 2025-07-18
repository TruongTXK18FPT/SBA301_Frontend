import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import QuizIntro from '../components/quiz/QuizIntro';
import QuizQuestion from '../components/quiz/QuizQuestion';
import DiscQuestion from '../components/quiz/DiscQuestion';
import QuizProgress from '../components/quiz/QuizProgress';
import QuestionList from '../components/quiz/QuestionList';
import QuizResult from '../components/quiz/QuizResult';
import LoadingSpinner from '../components/LoadingSpinner';
import quizService, {
    MBTIQuestion,
    DISCQuestionSet,
    QuizSubmissionData
  } from '../services/quizService';
  import '../styles/Quiz.css';

  type QuizType = 'MBTI' | 'DISC';
  type DISCAnswer = { most?: 'D' | 'I' | 'S' | 'C'; least?: 'D' | 'I' | 'S' | 'C' };
  type Answer = string | DISCAnswer;
  
  // Frontend result interface for the QuizResult component
  interface TransformedResult {
    type: string;
    description: string;
    careers: string[];
    universities: string[];
    personalityCode?: string;
    keyTraits?: string;
    nickname?: string;
    scores?: any;
  }

  // Hook for responsive design
  const useResponsive = () => {
    const [screenSize, setScreenSize] = useState({
      isMobile: window.innerWidth <= 480,
      isTablet: window.innerWidth > 480 && window.innerWidth <= 768,
      isSmallDesktop: window.innerWidth > 768 && window.innerWidth <= 1024,
      isDesktop: window.innerWidth > 1024
    });

    useEffect(() => {
      const handleResize = () => {
        const width = window.innerWidth;
        setScreenSize({
          isMobile: width <= 480,
          isTablet: width > 480 && width <= 768,
          isSmallDesktop: width > 768 && width <= 1024,
          isDesktop: width > 1024
        });
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return screenSize;
  };

  const Quiz: React.FC = () => {
    const [quizStep, setQuizStep] = useState<'intro' | 'questions' | 'result'>('intro');
    const [quizType, setQuizType] = useState<QuizType | null>(null);
    const [availableTypes, setAvailableTypes] = useState<Array<{type: QuizType; category: {id: number; name: string; description: string}}>>();
    const [questions, setQuestions] = useState<Array<MBTIQuestion | DISCQuestionSet>>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const [result, setResult] = useState<TransformedResult | null>(null);
    const [loading, setLoading] = useState(false);
    const [questionsLoaded, setQuestionsLoaded] = useState(false);

    const { type } = useParams<{ type?: string }>();
    const { isMobile, isTablet } = useResponsive();

    // Memoize current question to prevent unnecessary re-renders
    const currentQuestionData = useMemo(() => {
      return questions.length > 0 ? questions[currentQuestion] : null;
    }, [questions, currentQuestion]);

    // Memoized check for question answered status
    const isQuestionAnswered = useCallback(() => {
      if (!currentQuestionData) return false;

      const answer = answers[currentQuestionData.id];
      if (!answer) {
        console.log(`No answer found for question ${currentQuestionData.id}`);
        return false;
      }

      if (quizType === 'DISC') {
        const discAnswer = answer as DISCAnswer;
        const isValid = discAnswer.most !== undefined && discAnswer.least !== undefined;
        console.log(`DISC question ${currentQuestionData.id} validation:`, {
          most: discAnswer.most,
          least: discAnswer.least,
          isValid
        });
        return isValid;
      }

      // For MBTI, any string answer is valid (including neutral options)
      const isValid = typeof answer === 'string' && answer.trim().length > 0;
      console.log(`MBTI question ${currentQuestionData.id} validation:`, {
        answer,
        isValid
      });
      return isValid;
    }, [currentQuestionData, answers, quizType]);

  // Helper function to check if a single answer is valid
  const isAnswerValid = useCallback((answer: Answer, questionType: QuizType): boolean => {
    if (questionType === 'DISC') {
      const discAnswer = answer as DISCAnswer;
      return discAnswer.most !== undefined && discAnswer.least !== undefined;
    }
    // For MBTI, any string answer is valid
    return typeof answer === 'string' && answer.trim().length > 0;
  }, []);

  // Memoized check for ALL questions answered status
  const areAllQuestionsAnswered = useCallback(() => {
    if (questions.length === 0) return false;

    const answeredCount = questions.filter(question => {
      const answer = answers[question.id];
      return answer && isAnswerValid(answer, quizType || 'MBTI');
    }).length;

    const allAnswered = answeredCount === questions.length;
    console.log(`All questions answered check: ${answeredCount}/${questions.length} = ${allAnswered}`);
    return allAnswered;
  }, [questions, answers, quizType, isAnswerValid]);

    // Fetch available quiz types on component mount
    useEffect(() => {
      const fetchQuizTypes = async () => {
        try {
          const types = await quizService.getAvailableQuizTypes();
          setAvailableTypes(types);

          // If type is provided in URL, start that quiz
          if (type && (type === 'MBTI' || type === 'DISC')) {
            handleStartQuiz(type);
          }
        } catch (error) {
          console.error('Failed to load quiz types:', error);
        }
      };

      fetchQuizTypes();
    }, [type]); // Removed dependency that was causing infinite loops

    const handleStartQuiz = useCallback(async (type: QuizType) => {
      setLoading(true);
      setQuizType(type);
      setQuestionsLoaded(false);

      try {
        // Ensure availableTypes is loaded
        let types = availableTypes;
        if (!types) {
          console.log('Loading quiz types first...');
          types = await quizService.getAvailableQuizTypes();
          setAvailableTypes(types);
        }

        // Find the category ID for the selected quiz type
        const selectedType = types.find(t => t.type === type);
        if (!selectedType?.category) {
          throw new Error(`Category not found for quiz type: ${type}`);
        }

        const categoryId = selectedType.category.id;
        console.log(`Found category ID: ${categoryId} for quiz type: ${type}`);

        // Get quizzes for the category
        const quizzes = await quizService.getQuizzesByCategory(categoryId);

        if (quizzes.length === 0) {
          throw new Error('No quizzes found for this category');
        }

        // Get questions for the first quiz
        const quizId = quizzes[0].id;
        const transformedQuestions = await quizService.getQuestionsByQuizId(quizId);

        setQuestions(transformedQuestions);
        setQuestionsLoaded(true);
        setQuizStep('questions');
        setCurrentQuestion(0);
        setAnswers({});
      } catch (error) {
        console.error('Failed to start quiz:', error);
        alert(`Failed to start quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }, [availableTypes]);

    const handleAnswer = useCallback((questionId: number, answer: Answer) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    }, []);

    const handleNextQuestion = useCallback(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      }
      // Remove the automatic submit - let user click Submit button explicitly
    }, [currentQuestion, questions.length]);

    const handlePrevQuestion = useCallback(() => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      }
    }, [currentQuestion]);

    const handleQuestionSelect = useCallback((index: number) => {
      setCurrentQuestion(index);
    }, []);

    const submitQuiz = useCallback(async () => {
      setLoading(true);

      try {
        // Get the quiz ID from the category
        const categoryId = availableTypes?.find(t => t.type === quizType)?.category.id;
        const quizzes = await quizService.getQuizzesByCategory(categoryId || 0);
        const quizId = quizzes[0].id;

        // Convert answers to the format expected by backend
        const formattedAnswers: Record<number, number> = {};

        for (const question of questions) {
          const questionId = question.id;
          const answer = answers[questionId];

          if (answer) {
            if (quizType === 'MBTI') {
              formattedAnswers[questionId] = answer as any; // Service will handle conversion
            } else if (quizType === 'DISC') {
              formattedAnswers[questionId] = answer as any; // Service will handle conversion
            }
          }
        }

        const submissionData: QuizSubmissionData = {
          quizId,
          answers: formattedAnswers
        };

        // Submit quiz
        const quizResult = await quizService.submitQuiz(submissionData);
        console.log('quizResult:', quizResult); // Kiểm tra dữ liệu từ backend

        // Transform the backend data to match frontend expectations
        const transformedResult: TransformedResult = {
          type: quizResult.personalityCode || 'Unknown',
          personalityCode: quizResult.personalityCode,
          description: quizResult.description || '',
          careers: Array.isArray(quizResult.careerRecommendations)
              ? quizResult.careerRecommendations.filter((career: string) => career.trim() !== '')
              : typeof quizResult.careerRecommendations === 'string'
                  ? quizResult.careerRecommendations.split(', ').filter(career => career.trim() !== '')
                  : [],
          universities: Array.isArray(quizResult.universityRecommendations)
              ? quizResult.universityRecommendations.filter((uni: string) => uni.trim() !== '')
              : typeof quizResult.universityRecommendations === 'string'
                  ? quizResult.universityRecommendations.split(', ').filter(uni => uni.trim() !== '')
                  : [],
          keyTraits: quizResult.keyTraits || '',
          nickname: quizResult.nickname || '',
          scores: quizResult.scores || null
        };

        setResult(transformedResult);
        setQuizStep('result');
      } catch (error) {
        console.error('Failed to submit quiz:', error);
        alert(`Failed to submit quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    }, [availableTypes, quizType, answers, questions]);

    const handleRetakeQuiz = useCallback(() => {
      setQuizStep('intro');
      setQuizType(null);
      setQuestions([]);
      setCurrentQuestion(0);
      setAnswers({});
      setResult(null);
      setQuestionsLoaded(false);
    }, []);

    const renderQuizContent = useMemo(() => {
      if (loading) {
        return (
          <LoadingSpinner
            size="medium"
            message="Đang tải câu hỏi..."
          />
        );
      }

      switch (quizStep) {
        case 'intro':
          return <QuizIntro onStart={handleStartQuiz} availableTypes={availableTypes} />;

        case 'questions': {
          if (!questionsLoaded || questions.length === 0) {
            return (
              <LoadingSpinner
                size="medium"
                message="Đang chuẩn bị bài trắc nghiệm..."
              />
            );
          }

          const question = currentQuestionData;
          if (!question) return null;

          return (
            <div className="quiz-layout">
              <div className="quiz-content">
                <QuizProgress
                  current={currentQuestion}
                  total={questions.length}
                  type={quizType as QuizType}
                />

                {quizType === 'MBTI' && 'content' in question ? (
                  <QuizQuestion
                    question={question as MBTIQuestion}
                    selectedAnswer={answers[question.id] as string}
                    onAnswer={handleAnswer}
                  />
                ) : (
                  <DiscQuestion
                    questionSet={question as DISCQuestionSet}
                    selectedAnswer={answers[question.id] as DISCAnswer}
                    onAnswer={handleAnswer}
                  />
                )}

                <div className="quiz-navigation">
                  <button
                    className="nav-button prev-button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Trước
                  </button>


                  <span className="question-indicator">
                    {currentQuestion + 1} of {questions.length}
                  </span>

                  <div className="nav-right-buttons">
                    {currentQuestion < questions.length - 1 && (
                      <button
                        className="nav-button next-button"
                        onClick={handleNextQuestion}
                        disabled={!isQuestionAnswered()}
                      >
                        Tiếp
                      </button>
                    )}

                    <button
                      className="nav-button submit-button"
                      onClick={submitQuiz}
                      disabled={!areAllQuestionsAnswered()}
                      style={{
                        marginLeft: currentQuestion < questions.length - 1 ? '0.5rem' : '0',
                        opacity: areAllQuestionsAnswered() ? 1 : 0.6
                      }}
                    >
                      Nộp Bài
                    </button>
                  </div>
                </div>
              </div>

              <QuestionList
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                answers={answers}
                questions={questions} // Pass the questions array
                onQuestionSelect={handleQuestionSelect}
                isMobile={isMobile}
                isTablet={isTablet}
              />
            </div>
          );
        }

        case 'result':
          return result ? (
            <QuizResult
              type={quizType as QuizType}
              result={result}
              onRetake={handleRetakeQuiz}
            />
          ) : null;
      }
    }, [
      loading,
      quizStep,
      availableTypes,
      questionsLoaded,
      questions.length,
      currentQuestionData,
      currentQuestion,
      quizType,
      answers,
      result,
      handleStartQuiz,
      handleAnswer,
      handleNextQuestion,
      handlePrevQuestion,
      handleQuestionSelect,
      submitQuiz,
      handleRetakeQuiz,
      isQuestionAnswered,
      areAllQuestionsAnswered
    ]);

    return (
      <div className="quiz-container">
        {renderQuizContent}
      </div>
    );
  };

  export default Quiz;
