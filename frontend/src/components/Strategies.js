import React from 'react';

function Strategies({ strategies, onNext, loading }) {
  return (
    <div className="strategies">
      <h2>Search Strategies</h2>
      
      {strategies.length === 0 ? (
        <>
          <p>Based on the questions and answers, we'll generate effective search strategies for finding relevant academic papers.</p>
          <button 
            onClick={onNext} 
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Generating Strategies...' : 'Generate Search Strategies'}
          </button>
        </>
      ) : (
        <>
          <p>Here are 3 search strategies to find relevant academic papers:</p>
          
          {strategies.map((strategy, index) => (
            <div key={index} className="strategy-item">
              <h3>Strategy {index + 1}</h3>
              <pre>{strategy}</pre>
            </div>
          ))}
          
          <button 
            onClick={onNext} 
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Searching Papers...' : 'Search for Papers'}
          </button>
        </>
      )}
    </div>
  );
}

export default Strategies; 