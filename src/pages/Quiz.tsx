import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import QuizIntro from '../components/quiz/QuizIntro';
import QuizQuestion from '../components/quiz/QuizQuestion';
import QuizProgress from '../components/quiz/QuizProgress';
import QuizResult from '../components/quiz/QuizResult';
import QuestionList from '../components/quiz/QuestionList';
import '../styles/Quiz.css';

interface MBTIQuestion {
  id: number;
  content: string;
  type: 'E/I' | 'S/N' | 'T/F' | 'J/P';
  options: Array<{
    id: number;
    text: string;
  }>;
}

interface DISCQuestionSet {
  id: number;
  choices: Array<{
    text: string;
    trait: 'D' | 'I' | 'S' | 'C';
  }>;
}

type Question = MBTIQuestion | DISCQuestionSet;

interface DISCAnswer {
  most?: 'D' | 'I' | 'S' | 'C';
  least?: 'D' | 'I' | 'S' | 'C';
}

const MBTI_QUESTIONS = 60;
const DISC_SETS = 28;
const QUESTIONS_PER_TYPE = 15;

// Type guard functions
const isMBTIQuestion = (question: Question): question is MBTIQuestion => {
  return 'type' in question && 'options' in question;
};

const isDISCQuestionSet = (question: Question): question is DISCQuestionSet => {
  return 'choices' in question;
};

const generateMBTIQuestions = (): MBTIQuestion[] => {
  const types: Array<'E/I' | 'S/N' | 'T/F' | 'J/P'> = ['E/I', 'S/N', 'T/F', 'J/P'];
  return types.flatMap((type, typeIndex) => 
    Array.from({ length: QUESTIONS_PER_TYPE }, (_, index) => ({
      id: typeIndex * QUESTIONS_PER_TYPE + index,
      content: `${type} Question ${index + 1}: Sample question content`,
      type: type,
      options: [
        { id: 1, text: "Disagree" },
        { id: 2, text: "Neutral" },
        { id: 3, text: "Agree" }
      ]
    }))
  );
};

const generateDISCQuestions = (): DISCQuestionSet[] => {
  const traitDescriptors = {
    D: ['Confident', 'Direct', 'Bold', 'Decisive', 'Assertive', 'Independent', 'Competitive'],
    I: ['Friendly', 'Outgoing', 'Enthusiastic', 'Optimistic', 'Lively', 'Sociable', 'Talkative'],
    S: ['Patient', 'Steady', 'Calm', 'Supportive', 'Reliable', 'Consistent', 'Good listener'],
    C: ['Precise', 'Analytical', 'Systematic', 'Accurate', 'Careful', 'Organized', 'Detailed']
  };

  return Array.from({ length: DISC_SETS }, (_, index) => ({
    id: index,
    choices: (['D', 'I', 'S', 'C'] as const).map(trait => ({
      text: traitDescriptors[trait][index % traitDescriptors[trait].length],
      trait: trait
    }))
  }));
};

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [mbtiAnswers, setMBTIAnswers] = useState<Record<number, string>>({});
  const [discAnswers, setDISCAnswers] = useState<Record<number, DISCAnswer>>({});
  const [quizType, setQuizType] = useState<'DISC' | 'MBTI'>('MBTI');
  const [questions, setQuestions] = useState<Question[]>(() => generateMBTIQuestions());
  const [showSubmit, setShowSubmit] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('Quiz type changed:', quizType);
    const newQuestions = quizType === 'MBTI' ? generateMBTIQuestions() : generateDISCQuestions();
    console.log('Generated questions:', newQuestions);
    setQuestions(newQuestions);
    setCurrentQuestion(0);
  }, [quizType]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', { state: { from: '/quiz' } });
    }
  }, [navigate]);

  useEffect(() => {
    if (quizType === 'MBTI') {
      setShowSubmit(Object.keys(mbtiAnswers).length === MBTI_QUESTIONS);
    } else {
      const completeSets = Object.values(discAnswers).filter(
        answer => answer.most && answer.least
      ).length;
      setShowSubmit(completeSets === DISC_SETS);
    }
  }, [mbtiAnswers, discAnswers, quizType]);

  const handleStartQuiz = (type: 'DISC' | 'MBTI') => {
    console.log('Starting quiz:', type);
    setQuizType(type);
    setCurrentStep('quiz');
    setMBTIAnswers({});
    setDISCAnswers({});
    setCurrentQuestion(0);
  };

  const handleMBTIAnswer = (questionId: number, answer: string) => {
    setMBTIAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleDISCAnswer = (setId: number, trait: 'D' | 'I' | 'S' | 'C', type: 'most' | 'least') => {
    console.log('DISC answer:', { setId, trait, type });
    setDISCAnswers(prev => {
      const currentAnswer = prev[setId] || {};
      const newAnswer = {
        ...currentAnswer,
        [type]: trait
      };
      console.log('Updated DISC answers:', { ...prev, [setId]: newAnswer });
      return { ...prev, [setId]: newAnswer };
    });
  };

  const handleQuestionSelect = (index: number) => {
    setCurrentQuestion(index);
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleNextQuestion = () => {
    const totalQuestions = quizType === 'MBTI' ? MBTI_QUESTIONS : DISC_SETS;
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const calculateDISCScores = () => {
    const scores = { D: 0, I: 0, S: 0, C: 0 };
    Object.values(discAnswers).forEach(answer => {
      if (answer.most) scores[answer.most] += 1;
      if (answer.least) scores[answer.least] -= 1;
    });
    return scores;
  };

  const handleSubmitQuiz = async () => {
    try {
      if (quizType === 'MBTI') {
        const mbtiScores = questions.reduce((scores, question, index) => {
          if (isMBTIQuestion(question) && mbtiAnswers[index]) {
            scores[question.type] = (scores[question.type] || 0) + 
              (mbtiAnswers[index] === 'Agree' ? 1 : mbtiAnswers[index] === 'Disagree' ? -1 : 0);
          }
          return scores;
        }, {} as Record<string, number>);
        console.log('MBTI Scores:', mbtiScores);
      } else {
        const discScores = calculateDISCScores();
        console.log('DISC Scores:', discScores);
      }

      const result = {
        type: quizType === 'MBTI' ? 'ESFJ' : 'D',
        description: quizType === 'MBTI'
          ? 'You are an ESFJ - The Caregiver. ESFJs are warm, organized, and harmonious, striving to help and please others.'
          : 'You have a dominant D (Dominance) style. You are direct, results-oriented, and decisive.',
        careers: ['Teacher', 'Healthcare Administrator', 'Social Worker', 'HR Manager'],
        universities: ['Harvard University', 'Stanford University', 'MIT', 'Yale University']
      };

      setCurrentStep('result');
    } catch (error) {
      console.error('Error submitting quiz:', error);
    }
  };

  const totalQuestions = quizType === 'MBTI' ? MBTI_QUESTIONS : DISC_SETS;
  const currentQuestionData = questions[currentQuestion];

  const renderQuizContent = () => {
    console.log('Rendering quiz content:', { 
      quizType, 
      currentQuestion, 
      currentQuestionData,
      questions
    });

    if (!currentQuestionData) {
      console.log('No current question data');
      return null;
    }

    if (quizType === 'MBTI' && isMBTIQuestion(currentQuestionData)) {
      return (
        <>
          <div className="question-type-indicator">
            Type: {currentQuestionData.type}
          </div>
          <QuizQuestion
            question={currentQuestionData}
            selectedAnswer={mbtiAnswers[currentQuestion]}
            onAnswer={handleMBTIAnswer}
          />
        </>
      );
    }

    if (quizType === 'DISC' && isDISCQuestionSet(currentQuestionData)) {
      return (
        <div className="disc-question-set">
          <h3 className="disc-question-title">Set {currentQuestion + 1}</h3>
          <p className="disc-instruction">Select the option that MOST describes you and the option that LEAST describes you:</p>
          <div className="disc-choices">
            {currentQuestionData.choices.map((choice, index) => (
              <div key={index} className="disc-choice">
                <span className="choice-text">{choice.text}</span>
                <div className="choice-buttons">
                  <button
                    className={`choice-button most ${
                      discAnswers[currentQuestion]?.most === choice.trait ? 'selected' : ''
                    }`}
                    onClick={() => handleDISCAnswer(currentQuestion, choice.trait, 'most')}
                  >
                    Most
                  </button>
                  <button
                    className={`choice-button least ${
                      discAnswers[currentQuestion]?.least === choice.trait ? 'selected' : ''
                    }`}
                    onClick={() => handleDISCAnswer(currentQuestion, choice.trait, 'least')}
                  >
                    Least
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    console.log('No matching question type');
    return null;
  };

  return (
    <motion.div 
      className="quiz-container"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <AnimatePresence mode="wait">
        {currentStep === 'intro' && (
          <QuizIntro onStart={handleStartQuiz} />
        )}

        {currentStep === 'quiz' && questions.length > 0 && (
          <div className="quiz-layout">
            <motion.div
              key="quiz"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="quiz-content"
            >
              <QuizProgress 
                current={currentQuestion + 1} 
                total={totalQuestions}
                type={quizType}
              />
              {renderQuizContent()}
              <div className="quiz-navigation">
                <button 
                  className="nav-button previous"
                  onClick={handlePreviousQuestion}
                  disabled={currentQuestion === 0}
                >
                  Previous
                </button>
                <div className="question-indicator">
                  {quizType === 'MBTI' ? (
                    `Question ${currentQuestion + 1} of ${totalQuestions}`
                  ) : (
                    `Set ${currentQuestion + 1} of ${totalQuestions}`
                  )}
                </div>
                <button 
                  className="nav-button next"
                  onClick={handleNextQuestion}
                  disabled={currentQuestion === totalQuestions - 1}
                >
                  Next
                </button>
              </div>
              {showSubmit && (
                <motion.button
                  className="submit-button"
                  onClick={handleSubmitQuiz}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  Submit Quiz
                </motion.button>
              )}
            </motion.div>
            <QuestionList
              totalQuestions={totalQuestions}
              currentQuestion={currentQuestion}
              answers={quizType === 'MBTI' ? mbtiAnswers : discAnswers}
              onQuestionSelect={handleQuestionSelect}
            />
          </div>
        )}

        {currentStep === 'result' && (
          <QuizResult 
            type={quizType}
            result={{
              type: quizType === 'MBTI' ? 'ESFJ' : 'D',
              description: quizType === 'MBTI'
                ? 'You are an ESFJ - The Caregiver. ESFJs are warm, organized, and harmonious, striving to help and please others.'
                : 'You have a dominant D (Dominance) style. You are direct, results-oriented, and decisive.',
              careers: ['Teacher', 'Healthcare Administrator', 'Social Worker', 'HR Manager'],
              universities: ['Harvard University', 'Stanford University', 'MIT', 'Yale University']
            }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Quiz;
