import React from 'react';
import ReactMarkdown from 'react-markdown';

function InitialContent({ content, onProceed, loading }) {
  return (
    <div className="initial-content">
      <h2>Initial Research Overview</h2>
      <p>Based on your topic, here's an initial overview of what your report could include:</p>
      
      <div className="content-preview">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
      
      <p className="instruction">This is just a starting point. In the next steps, you'll be able to customize what goes into your report.</p>
      
      <button 
        onClick={onProceed} 
        disabled={loading}
        className="primary-button"
      >
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
            <span>Processing...</span>
          </div>
        ) : (
          'Continue to Customize'
        )}
      </button>
    </div>
  );
}

export default InitialContent; 