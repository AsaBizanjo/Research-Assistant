import React, { useState } from 'react';

function UserQA({ qaChain, currentQuestion, onSubmitResponse, loading, questionCount, totalQuestions }) {
  const [userResponse, setUserResponse] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (userResponse.trim()) {
      onSubmitResponse(userResponse);
      setUserResponse('');
    }
  };

  return (
    <div className="user-qa">
      <h2>Research Questions</h2>
      <p>Please answer the following questions to help create your research report.</p>
      <p className="progress-info">Question {questionCount} of {totalQuestions}</p>
      
      
      {qaChain.length > 0 && (
        <div className="previous-qa">
          {qaChain.map((qa, index) => (
            <div key={index} className="qa-item">
              <div className="question">
                <h3>Q{index + 1}: {qa.question}</h3>
              </div>
              <div className="answer">
                <p><strong>Your response:</strong> {qa.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      
      <div className="current-question">
        <h3>Q{questionCount}: {currentQuestion}</h3>
        <form onSubmit={handleSubmit}>
          <textarea
            value={userResponse}
            onChange={(e) => setUserResponse(e.target.value)}
            placeholder="Type your response here..."
            rows={6}
            disabled={loading}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading || !userResponse.trim()}
            className="primary-button"
          >
            {loading ? 'Processing...' : 'Submit Response'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default UserQA; 