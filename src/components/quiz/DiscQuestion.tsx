import React from 'react';
import { motion } from 'framer-motion';

interface DISCChoice {
    id: number;
    text: string;
    trait: 'D' | 'I' | 'S' | 'C';
}

interface DISCQuestionSet {
    id: number;
    content: string;
    options: DISCChoice[];
}

interface DiscQuestionProps {
    questionSet: DISCQuestionSet;
    selectedAnswer?: { most?: 'D' | 'I' | 'S' | 'C'; least?: 'D' | 'I' | 'S' | 'C' };
    onAnswer: (questionId: number, answer: { most?: 'D' | 'I' | 'S' | 'C'; least?: 'D' | 'I' | 'S' | 'C' }) => void;
}

const DiscQuestion: React.FC<DiscQuestionProps> = ({ questionSet, selectedAnswer = {}, onAnswer }) => {
    const handleSelection = (trait: 'D' | 'I' | 'S' | 'C', type: 'most' | 'least') => {
        // Create a new answer object to avoid mutating the original
        const newAnswer = { ...selectedAnswer };

        // If selecting the same trait that's already selected, unselect it
        if (newAnswer[type] === trait) {
            delete newAnswer[type];
        } else {
            // Otherwise, set the new trait
            newAnswer[type] = trait;
        }

        // Call the parent's onAnswer function with the new answer
        onAnswer(questionSet.id, newAnswer);
    };

    return (
        <motion.div
            className="disc-question-set"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="disc-question-title">{questionSet.content}</div>
            <p className="disc-instruction">For each row, select one statement that is most like you and one that is least like you</p>

            <div className="disc-choices">
                {questionSet.options.map((choice, index) => (
                    <motion.div
                        key={index}
                        className="disc-choice"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <span className="choice-text">{choice.text}</span>
                        <div className="choice-buttons">
                            <button
                                className={`choice-button most ${selectedAnswer.most === choice.trait ? 'selected' : ''}`}
                                onClick={() => handleSelection(choice.trait, 'most')}
                            >
                                Most
                            </button>
                            <button
                                className={`choice-button least ${selectedAnswer.least === choice.trait ? 'selected' : ''}`}
                                onClick={() => handleSelection(choice.trait, 'least')}
                            >
                                Least
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};

export default DiscQuestion;