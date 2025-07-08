import React from 'react';

interface DISCChoice {
    trait: 'D' | 'I' | 'S' | 'C';
    text: string;
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
        console.log(`DISC ${type} selection: ${trait} for question ${questionSet.id}`);
        console.log('Current selected answer:', selectedAnswer);

        const newAnswer = { ...selectedAnswer };

        // If selecting the same trait that's already selected for this type, unselect it
        if (newAnswer[type] === trait) {
            delete newAnswer[type];
            console.log(`Unselected ${type}: ${trait}`);
        } else {
            // If this trait is selected for the opposite type, clear it first
            if (type === 'most' && newAnswer.least === trait) {
                delete newAnswer.least;
                console.log(`Cleared least selection for trait: ${trait}`);
            } else if (type === 'least' && newAnswer.most === trait) {
                delete newAnswer.most;
                console.log(`Cleared most selection for trait: ${trait}`);
            }

            // Set the new selection
            newAnswer[type] = trait;
            console.log(`Selected ${type}: ${trait}`);
        }

        console.log('New answer:', newAnswer);
        onAnswer(questionSet.id, newAnswer);
    };

    return (
        <div className="disc-question-set">
            <h2 className="question-text">{questionSet.content}</h2>
            <p className="disc-instruction">
                For each row, select one statement that is <strong>most like you</strong> and one that is <strong>least like you</strong>
            </p>

            <div className="disc-choices">
                {questionSet.options.map((choice, index) => {
                    const isMostSelected = selectedAnswer.most === choice.trait;
                    const isLeastSelected = selectedAnswer.least === choice.trait;

                    console.log(`DISC Option ${index + 1}: trait="${choice.trait}", most=${isMostSelected}, least=${isLeastSelected}`);

                    return (
                        <div key={index} className="disc-choice">
                            <span className="choice-text">
                                <strong>{index + 1}.</strong> {choice.text}
                            </span>
                            <div className="choice-buttons">
                                <button
                                    className={`choice-button most ${isMostSelected ? 'selected' : ''}`}
                                    onClick={() => handleSelection(choice.trait, 'most')}
                                    disabled={false} // Remove any disabled logic
                                >
                                    Most
                                </button>
                                <button
                                    className={`choice-button least ${isLeastSelected ? 'selected' : ''}`}
                                    onClick={() => handleSelection(choice.trait, 'least')}
                                    disabled={false} // Remove any disabled logic
                                >
                                    Least
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Debug info */}
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#666', display: 'none' }}>
                Current selections: Most = {selectedAnswer.most || 'None'}, Least = {selectedAnswer.least || 'None'}
            </div>
        </div>
    );
};

export default DiscQuestion;