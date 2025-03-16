import React from 'react';

function QAChain({ qaChain, currentQuestion, onAnswerQuestion, loading, questionCount, totalQuestions }) {
  return (
    <div className="qa-chain">
      <h2>Research Questions & Answers</h2>
      <p>Building a chain of questions and answers to explore the topic in depth.</p>
      <p className="progress-info">Question {questionCount} of {totalQuestions}</p>
      
      
      {qaChain.length > 0 && (
        <div className="previous-qa">
          {qaChain.map((qa, index) => (
            <div key={index} className="qa-item">
              <div className="question">
                <h3>Q{index + 1}: {qa.question}</h3>
              </div>
              <div className="answer">
                <p>{qa.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      
      <div className="current-question">
        <h3>Current Question: {currentQuestion}</h3>
        <button 
          onClick={onAnswerQuestion} 
          disabled={loading || !currentQuestion}
          className="primary-button"
        >
          {loading ? 'Generating Answer...' : 'Generate Answer'}
        </button>
      </div>
    </div>
  );
}

export default QAChain; 