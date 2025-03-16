import React from 'react';

function Answers({ questions, answers, onNext, loading }) {
  return (
    <div className="answers">
      <h2>Answers to Research Questions</h2>
      
      <div className="qa-list">
        {questions.map((question, index) => (
          <div key={index} className="qa-item">
            <h3>Q: {question}</h3>
            <div className="answer">
              <p>{answers[index]}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button onClick={onNext} disabled={loading}>
        {loading ? 'Generating Strategies...' : 'Generate Search Strategies'}
      </button>
    </div>
  );
}

export default Answers; 