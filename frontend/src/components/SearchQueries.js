import React, { useState } from 'react';

function SearchQueries({ 
  queries, 
  onGenerateQueries, 
  onSearch, 
  onContinue,
  loading, 
  showSearch = false 
}) {
  const [customQuery, setCustomQuery] = useState('');

  const handleCustomQueryChange = (e) => {
    setCustomQuery(e.target.value);
  };

  const handleAddCustomQuery = () => {
    if (customQuery.trim()) {
      console.log('Custom query added:', customQuery);
      setCustomQuery('');
    }
  };

  return (
    <div className="search-queries">
      <h2>{showSearch ? 'Academic Search Queries' : 'Generate Search Queries'}</h2>
      
      {queries.length === 0 ? (
        <>
          <p>Based on your research preferences, we'll generate optimized search queries to find relevant academic papers.</p>
          <button 
            onClick={onGenerateQueries} 
            disabled={loading}
            className="primary-button"
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                <span>Generating Queries...</span>
              </div>
            ) : (
              'Generate Search Queries'
            )}
          </button>
        </>
      ) : (
        <>
          <p>Here are the search queries optimized for finding relevant academic papers:</p>
          
          <div className="queries-list">
            {queries.map((query, index) => (
              <div key={index} className="query-item">
                <div className="query-text">
                  <code>{query}</code>
                </div>
                <p className="query-explanation">
                  This query is designed to find papers related to {index === 0 ? 'the core topic' : index === 1 ? 'specific aspects' : 'related concepts'}.
                </p>
              </div>
            ))}
          </div>
          
          {showSearch ? (
            <div className="custom-query">
              <h3>Add Custom Search Query (Optional)</h3>
              <div className="custom-query-input">
                <input 
                  type="text" 
                  value={customQuery}
                  onChange={handleCustomQueryChange}
                  placeholder='e.g., "machine learning" AND healthcare NOT survey'
                />
                <button 
                  onClick={handleAddCustomQuery}
                  disabled={!customQuery.trim()}
                  className="secondary-button"
                >
                  Add
                </button>
              </div>
              
              <button 
                onClick={onSearch} 
                disabled={loading}
                className="primary-button"
              >
                {loading ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                    <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                    <span>Searching...</span>
                  </div>
                ) : (
                  'Search for Academic Sources'
                )}
              </button>
            </div>
          ) : (
            <button 
              onClick={onContinue} 
              disabled={loading}
              className="primary-button"
            >
              {loading ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                  <span className="loading-spinner" style={{ width: '20px', height: '20px' }}></span>
                  <span>Processing...</span>
                </div>
              ) : (
                'Continue with These Queries'
              )}
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default SearchQueries; 