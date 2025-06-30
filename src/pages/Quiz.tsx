import React, { useState, useEffect } from 'react';
  import { useNavigate, useParams } from 'react-router-dom';
  import QuizIntro from '../components/quiz/QuizIntro';
  import QuizQuestion from '../components/quiz/QuizQuestion';
  import DISCQuestion from '../components/quiz/DISCQuestion';
  import QuizProgress from '../components/quiz/QuizProgress';
  import QuestionList from '../components/quiz/QuestionList';
  import QuizResult from '../components/quiz/QuizResult';
  import quizService, {
    MBTIQuestion,
    DISCQuestionSet,
    QuizSubmissionData,
    QuizResult as QuizResultType
  } from '../services/quizService';
  import '../styles/Quiz.css';

  type QuizType = 'MBTI' | 'DISC';
  type Answer = string | { most?: 'D' | 'I' | 'S' | 'C'; least?: 'D' | 'I' | 'S' | 'C' };

  const Quiz: React.FC = () => {
    const [quizStep, setQuizStep] = useState<'intro' | 'questions' | 'result'>('intro');
    const [quizType, setQuizType] = useState<QuizType | null>(null);
    const [availableTypes, setAvailableTypes] = useState<Array<{type: QuizType; category: {id: number; name: string; description: string}}>>();
    const [questions, setQuestions] = useState<Array<MBTIQuestion | DISCQuestionSet>>([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, Answer>>({});
    const [result, setResult] = useState<QuizResultType | null>(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { type } = useParams<{ type?: string }>();

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
    }, [type]);

    const handleStartQuiz = async (type: QuizType) => {
      setLoading(true);
      setQuizType(type);

      try {
        // Find the category ID for the selected quiz type
        const categoryId = availableTypes?.find(t => t.type === type)?.category.id;

        if (!categoryId) {
          throw new Error('Category not found for quiz type');
        }

        // Get quizzes for the category
        const quizzes = await quizService.getQuizzesByCategory(categoryId);

        if (quizzes.length === 0) {
          throw new Error('No quizzes found for this category');
        }

        // Get questions for the first quiz
        const quizId = quizzes[0].id;
        const fetchedQuestions = await quizService.getQuestionsByQuizId(quizId);

        // Transform questions for frontend
        const transformedQuestions = quizService.transformQuestionsForFrontend(
          fetchedQuestions,
          type
        );

        setQuestions(transformedQuestions);
        setQuizStep('questions');
        setCurrentQuestion(0);
        setAnswers({});
      } catch (error) {
        console.error('Failed to start quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleAnswer = (questionId: number, answer: Answer) => {
      setAnswers(prev => ({
        ...prev,
        [questionId]: answer
      }));
    };

    const handleNextQuestion = () => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        submitQuiz();
      }
    };

    const handlePrevQuestion = () => {
      if (currentQuestion > 0) {
        setCurrentQuestion(currentQuestion - 1);
      }
    };

    const handleQuestionSelect = (index: number) => {
      setCurrentQuestion(index);
    };

    const submitQuiz = async () => {
      setLoading(true);

      try {
        // Get the quiz ID from the category
        const categoryId = availableTypes?.find(t => t.type === quizType)?.category.id;
        const quizzes = await quizService.getQuizzesByCategory(categoryId || 0);
        const quizId = quizzes[0].id;

        // Prepare submission data
        const submissionData: QuizSubmissionData = {
          quizId,
          answers,
          quizType: quizType as 'MBTI' | 'DISC'
        };

        // Submit quiz
        const quizResult = await quizService.submitQuiz(submissionData);
        setResult(quizResult);
        setQuizStep('result');
      } catch (error) {
        console.error('Failed to submit quiz:', error);
      } finally {
        setLoading(false);
      }
    };

    const handleRetakeQuiz = () => {
      setQuizStep('intro');
      setQuizType(null);
      setQuestions([]);
      setCurrentQuestion(0);
      setAnswers({});
      setResult(null);
    };

    const isQuestionAnswered = () => {
      const answer = answers[questions[currentQuestion]?.id];

      if (!answer) return false;

      if (quizType === 'DISC') {
        const discAnswer = answer as { most?: 'D' | 'I' | 'S' | 'C'; least?: 'D' | 'I' | 'S' | 'C' };
        return discAnswer.most !== undefined && discAnswer.least !== undefined;
      }

      return true;
    };

    const renderQuizContent = () => {
      if (loading) {
        return <div className="loading">Loading...</div>;
      }

      switch (quizStep) {
        case 'intro':
          return <QuizIntro onStart={handleStartQuiz} availableTypes={availableTypes} />;

        case 'questions':
          if (questions.length === 0) return null;

          const question = questions[currentQuestion];

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
                  <DISCQuestion
                    questionSet={question as DISCQuestionSet}
                    selectedAnswer={answers[question.id] as { most?: 'D' | 'I' | 'S' | 'C'; least?: 'D' | 'I' | 'S' | 'C' }}
                    onAnswer={handleAnswer}
                  />
                )}

                <div className="quiz-navigation">
                  <button
                    className="nav-button prev-button"
                    onClick={handlePrevQuestion}
                    disabled={currentQuestion === 0}
                  >
                    Previous
                  </button>

                  <span className="question-indicator">
                    {currentQuestion + 1} of {questions.length}
                  </span>

                  {currentQuestion < questions.length - 1 ? (
                    <button
                      className="nav-button next-button"
                      onClick={handleNextQuestion}
                      disabled={!isQuestionAnswered()}
                    >
                      Next
                    </button>
                  ) : (
                    <button
                      className="nav-button submit-button"
                      onClick={submitQuiz}
                      disabled={!isQuestionAnswered()}
                    >
                      Submit
                    </button>
                  )}
                </div>
              </div>

              <QuestionList
                totalQuestions={questions.length}
                currentQuestion={currentQuestion}
                answers={answers}
                onQuestionSelect={handleQuestionSelect}
              />
            </div>
          );

        case 'result':
          return result ? (
            <QuizResult
              type={quizType as QuizType}
              result={result}
              onRetake={handleRetakeQuiz}
            />
          ) : null;
      }
    };

    return (
      <div className="quiz-container">
        {renderQuizContent()}
      </div>
    );
  };

  export default Quiz;