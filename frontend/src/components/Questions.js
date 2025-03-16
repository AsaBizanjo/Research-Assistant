import React from 'react';

function Questions({ questions, onNext, loading }) {
  return (
    <div className="questions">
      <h2>Generated Research Questions</h2>
      <p>Based on your prompt, here are 5 research questions to explore:</p>
      
      <ol>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ol>
      
      <button onClick={onNext} disabled={loading}>
        {loading ? 'Generating Answers...' : 'Generate Answers'}
      </button>
    </div>
  );
}

export default Questions; 