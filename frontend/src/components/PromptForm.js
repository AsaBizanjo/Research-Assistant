import React, { useState } from 'react';

function PromptForm({ onSubmit, loading }) {
  const [promptText, setPromptText] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptText.trim()) {
      onSubmit(promptText);
    }
  };

  return (
    <div className="prompt-form">
      <h2>What would you like to research today?</h2>
      <p className="instruction">
        Enter your research topic or question below. Be as specific as possible for better results.
      </p>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={promptText}
          onChange={(e) => setPromptText(e.target.value)}
          placeholder="e.g., What are the latest advancements in quantum computing and their potential applications in cryptography?"
          disabled={loading}
          required
        />
        
        <button type="submit" disabled={loading || !promptText.trim()}>
          {loading ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
              <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
              <span>Processing...</span>
            </div>
          ) : (
            'Begin Research'
          )}
        </button>
      </form>
    </div>
  );
}

export default PromptForm; 