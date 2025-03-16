import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';

function ConfirmationDialog({ question, onSubmitFeedback, loading, stage, previousFeedback }) {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (feedback.trim()) {
      onSubmitFeedback(feedback);
      setFeedback('');
    }
  };

  
  const getStageName = () => {
    switch (stage) {
      case 'outline': return 'Report Outline';
      case 'keypoints': return 'Key Points';
      case 'sources': return 'Source Preferences';
      case 'focus': return 'Research Focus';
      case 'final': return 'Final Confirmation';
      default: return 'Customization';
    }
  };

  return (
    <div className="confirmation-dialog">
      <h2>{getStageName()}</h2>
      
     
      {previousFeedback.length > 0 && (
        <div className="previous-feedback">
          <h3>Your Previous Preferences</h3>
          {previousFeedback.map((item, index) => (
            <div key={index} className="feedback-item">
              <ReactMarkdown>{item.question}</ReactMarkdown>
              <div className="user-response">
                <p><strong>Your response:</strong> {item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="current-question">
        <ReactMarkdown>{question}</ReactMarkdown>
        
        <form onSubmit={handleSubmit}>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Type your response here..."
            rows={6}
            disabled={loading}
            required
          />
          
          <button 
            type="submit" 
            disabled={loading || !feedback.trim()}
            className="primary-button"
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                <span>Processing...</span>
              </div>
            ) : (
              'Submit Preferences'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

export default ConfirmationDialog; 