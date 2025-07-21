import React from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import QuizResult from '../components/quiz/QuizResult';
import LoadingSpinner from '../components/LoadingSpinner';

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

const QuizResultPage: React.FC = () => {
  const { type } = useParams<{ type?: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  // Get result data from navigation state
  const { result, quizType } = (location.state as { 
    result: any; 
    quizType: string; 
  }) || {};

  // If no result data, redirect to quiz selection
  if (!result || !quizType) {
    navigate('/quiz');
    return null;
  }

  // Transform the backend data to match frontend expectations
  const transformedResult: TransformedResult = {
    type: result.personalityCode || 'Unknown',
    personalityCode: result.personalityCode,
    description: result.description || '',
    careers: Array.isArray(result.careerRecommendations)
        ? result.careerRecommendations.filter((career: string) => career.trim() !== '')
        : typeof result.careerRecommendations === 'string'
            ? result.careerRecommendations.split(', ').filter(career => career.trim() !== '')
            : [],
    universities: Array.isArray(result.universityRecommendations)
        ? result.universityRecommendations.filter((uni: string) => uni.trim() !== '')
        : typeof result.universityRecommendations === 'string'
            ? result.universityRecommendations.split(', ').filter(uni => uni.trim() !== '')
            : [],
    keyTraits: result.keyTraits || '',
    nickname: result.nickname || '',
    scores: result.scores || null
  };

  const handleRetakeQuiz = () => {
    navigate('/quiz');
  };

  return (
    <div className="quiz-container">
      <QuizResult
        type={quizType as 'DISC' | 'MBTI'}
        result={transformedResult}
        onRetake={handleRetakeQuiz}
        userInfo={{
          userId: 'current-user',
          email: 'user@example.com',
          fullName: 'Người dùng'
        }}
      />
    </div>
  );
};

export default QuizResultPage;