import React, { useState, useEffect } from 'react';

function Papers({ 
  papers, 
  selectedPapers, 
  manualSources = [],
  onSelectPapers, 
  onAddManualSource,
  onNext, 
  loading 
}) {
  const [selected, setSelected] = useState([]);
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualSource, setManualSource] = useState({
    title: '',
    authors: '',
    year: '',
    doi: '',
    url: '',
    abstract: ''
  });

  useEffect(() => {

    if (selectedPapers && selectedPapers.length > 0) {
      setSelected(selectedPapers.map(paper => paper.id));
    }
  }, [selectedPapers]);

  const handleTogglePaper = (paperId) => {
    setSelected(prev => {
      if (prev.includes(paperId)) {
        return prev.filter(id => id !== paperId);
      } else {
        return [...prev, paperId];
      }
    });
  };

  const handleManualInputChange = (e) => {
    const { name, value } = e.target;
    setManualSource(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    
    
    const authorNames = manualSource.authors
      .split(',')
      .map(name => ({ name: name.trim() }))
      .filter(author => author.name);
    
    onAddManualSource({
      title: manualSource.title,
      authors: authorNames,
      year: manualSource.year ? parseInt(manualSource.year) : null,
      doi: manualSource.doi,
      url: manualSource.url,
      abstract: manualSource.abstract
    });
    
    
    setManualSource({
      title: '',
      authors: '',
      year: '',
      doi: '',
      url: '',
      abstract: ''
    });
    
    setShowManualForm(false);
  };

  const handleSelectionComplete = () => {
    onSelectPapers(selected);
    onNext();
  };

  return (
    <div className="papers">
      <h2>Select Academic Sources</h2>
      
      {papers.length === 0 && manualSources.length === 0 ? (
        <p>Searching for academic papers...</p>
      ) : (
        <>
          <p>Here are the academic papers found based on your search queries. Select the papers you want to include in your report:</p>
          
          <div className="relevance-legend">
            <div className="relevance-item high">High Relevance</div>
            <div className="relevance-item medium">Medium Relevance</div>
            <div className="relevance-item low">Low Relevance</div>
          </div>
          
          <div className="papers-list">
            {papers.map((paper, index) => {
          
              let relevanceClass = '';
              if (paper.relevanceScore) {
                if (paper.relevanceScore >= 7) relevanceClass = 'high-relevance';
                else if (paper.relevanceScore >= 4) relevanceClass = 'medium-relevance';
                else relevanceClass = 'low-relevance';
              }
              
              return (
                <div 
                  key={index} 
                  className={`paper-item ${selected.includes(paper.id) ? 'selected' : ''} ${relevanceClass}`}
                  onClick={() => handleTogglePaper(paper.id)}
                >
                  <div className="paper-selection">
                    <input 
                      type="checkbox" 
                      checked={selected.includes(paper.id)}
                      onChange={() => {}}
                    />
                  </div>
                  <div className="paper-content">
                    <h3>{paper.title}</h3>
                    <p>
                      <strong>Authors:</strong> {paper.authors?.map(a => a.name).join(', ') || 'Unknown'}
                    </p>
                    <p>
                      <strong>Year:</strong> {paper.year || 'Unknown'} | 
                      <strong> Source:</strong> {paper.source || 'Academic Database'} |
                      <strong> DOI:</strong> {paper.doi || 'N/A'}
                    </p>
                    {paper.relevanceScore && (
                      <p className="relevance-score">
                        <strong>Relevance Score:</strong> {paper.relevanceScore}/10
                        {paper.relevanceExplanation && (
                          <span className="relevance-explanation"> - {paper.relevanceExplanation}</span>
                        )}
                      </p>
                    )}
                    {paper.abstract && (
                      <div className="abstract">
                        <strong>Abstract:</strong>
                        <p>{paper.abstract}</p>
                      </div>
                    )}
                    {paper.url && (
                      <a 
                        href={paper.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()} 
                      >
                        View Paper
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
            
         
            {manualSources.length > 0 && (
              <div className="manual-sources">
                <h3>Manually Added Sources</h3>
                {manualSources.map((source, index) => (
                  <div key={`manual-${index}`} className="paper-item selected manual-source">
                    <div className="paper-content">
                      <h3>{source.title}</h3>
                      <p>
                        <strong>Authors:</strong> {source.authors?.map(a => a.name).join(', ') || 'Unknown'}
                      </p>
                      <p>
                        <strong>Year:</strong> {source.year || 'Unknown'} | 
                        <strong> Source:</strong> {source.source || 'Manual Entry'} |
                        <strong> DOI:</strong> {source.doi || 'N/A'}
                      </p>
                      {source.abstract && (
                        <div className="abstract">
                          <strong>Abstract:</strong>
                          <p>{source.abstract}</p>
                        </div>
                      )}
                      {source.url && (
                        <a 
                          href={source.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          View Source
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="manual-source-section">
            <button 
              onClick={() => setShowManualForm(!showManualForm)} 
              className="secondary-button"
            >
              {showManualForm ? 'Cancel' : 'Add Manual Source'}
            </button>
            
            {showManualForm && (
              <form onSubmit={handleManualSubmit} className="manual-source-form">
                <h3>Add Manual Source</h3>
                
                <div className="form-group">
                  <label htmlFor="title">Title *</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title" 
                    value={manualSource.title}
                    onChange={handleManualInputChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="authors">Authors (comma separated) *</label>
                  <input 
                    type="text" 
                    id="authors" 
                    name="authors" 
                    value={manualSource.authors}
                    onChange={handleManualInputChange}
                    placeholder="John Smith, Jane Doe"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="year">Year</label>
                    <input 
                      type="number" 
                      id="year" 
                      name="year" 
                      value={manualSource.year}
                      onChange={handleManualInputChange}
                      placeholder="2023"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="doi">DOI</label>
                    <input 
                      type="text" 
                      id="doi" 
                      name="doi" 
                      value={manualSource.doi}
                      onChange={handleManualInputChange}
                      placeholder="10.xxxx/xxxxx"
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="url">URL</label>
                  <input 
                    type="url" 
                    id="url" 
                    name="url" 
                    value={manualSource.url}
                    onChange={handleManualInputChange}
                    placeholder="https://..."
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="abstract">Abstract</label>
                  <textarea 
                    id="abstract" 
                    name="abstract" 
                    value={manualSource.abstract}
                    onChange={handleManualInputChange}
                    rows={4}
                  />
                </div>
                
                <button type="submit" className="primary-button">Add Source</button>
              </form>
            )}
          </div>
          
          <div className="selection-info">
            <p>{selected.length + manualSources.length} sources selected</p>
          </div>
          
          <button 
            onClick={handleSelectionComplete} 
            disabled={loading || (selected.length === 0 && manualSources.length === 0)}
            className="primary-button"
          >
            {loading ? 'Generating Report...' : 'Generate Report with Selected Sources'}
          </button>
        </>
      )}
    </div>
  );
}

export default Papers; 