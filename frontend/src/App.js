import React, { useState } from 'react';
import './App.css';
import PromptForm from './components/PromptForm';
import InitialContent from './components/InitialContent';
import ConfirmationDialog from './components/ConfirmationDialog';
import Strategies from './components/Strategies';
import Papers from './components/Papers';
import Report from './components/Report';
import ProgressBar from './components/ProgressBar';
import SearchQueries from './components/SearchQueries';
import { CSSTransition, TransitionGroup } from 'react-transition-group';


const LoadingSpinner = () => (
  <div className="loading">
    <div className="loading-spinner"></div>
    <p style={{ marginLeft: '15px', marginTop: '10px' }}>Processing your request...</p>
  </div>
);

function App() {
  const [prompt, setPrompt] = useState('');
  const [initialContent, setInitialContent] = useState('');
  const [userFeedback, setUserFeedback] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [currentStage, setCurrentStage] = useState('');
  const [strategies, setStrategies] = useState([]);
  const [papers, setPapers] = useState([]);
  const [selectedPapers, setSelectedPapers] = useState([]);
  const [report, setReport] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchQueries, setSearchQueries] = useState([]);
  const [manualSources, setManualSources] = useState([]);


  const stages = ["outline", "keypoints", "final"];

  const handlePromptSubmit = async (promptText) => {
    setPrompt(promptText);
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-initial-content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptText }),
      });
      
      if (!response.ok) throw new Error('Failed to generate initial content');
      
      const data = await response.json();
      setInitialContent(data.initialContent);
      setCurrentStep(2);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToConfirmation = async () => {
    setCurrentStage(stages[0]);
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-confirmation-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          currentStage: stages[0],
          userFeedback 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate question');
      
      const data = await response.json();
      setCurrentQuestion(data.question);
      setCurrentStep(3);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUserFeedback = async (answer) => {
  
    const newFeedback = [...userFeedback, { 
      question: currentQuestion, 
      answer: answer,
      stage: currentStage
    }];
    
    setUserFeedback(newFeedback);
    
   
    const currentIndex = stages.indexOf(currentStage);
    
   
    if (currentIndex >= stages.length - 1) {
      setCurrentStep(4);
      return;
    }
    
   
    const nextStage = stages[currentIndex + 1];
    setCurrentStage(nextStage);
    
    
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-confirmation-question', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          currentStage: nextStage,
          userFeedback: newFeedback 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate next question');
      
      const data = await response.json();
      setCurrentQuestion(data.question);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateStrategies = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, userFeedback }),
      });
      
      if (!response.ok) throw new Error('Failed to generate strategies');
      
      const data = await response.json();
      setStrategies(data.strategies);
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSearchQueries = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-search-queries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, userFeedback }),
      });
      
      if (!response.ok) throw new Error('Failed to generate search queries');
      
      const data = await response.json();
      setSearchQueries(data.queries);
      setCurrentStep(5);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchPapers = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('http://localhost:5000/api/search-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ queries: searchQueries }),
      });
      
      if (!response.ok) throw new Error('Failed to search papers');
      
      const data = await response.json();
      
      
      const validationResponse = await fetch('http://localhost:5000/api/validate-papers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ papers: data.papers, prompt }),
      });
      
      if (!validationResponse.ok) throw new Error('Failed to validate papers');
      
      const validationData = await validationResponse.json();
      setPapers(validationData.papers);
      setCurrentStep(6);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePaperSelection = (selectedPaperIds) => {
    const selected = papers.filter(paper => selectedPaperIds.includes(paper.id));
    setSelectedPapers(selected);
  };

  const handleAddManualSource = (source) => {
    setManualSources([...manualSources, {
      id: `manual-${Date.now()}`,
      ...source,
      source: 'Manual Entry'
    }]);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    setError('');
    
  
    const allSources = [...selectedPapers, ...manualSources];
    
    try {
      const response = await fetch('http://localhost:5000/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt, 
          userFeedback, 
          strategies, 
          selectedPapers: allSources 
        }),
      });
      
      if (!response.ok) throw new Error('Failed to generate report');
      
      const data = await response.json();
      setReport(data.report);
      setCurrentStep(7);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const handleContinueToSearch = () => {
    
    setCurrentStep(5);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Research Assistant</h1>
        <p>Your AI-powered research companion for comprehensive literature reviews</p>
      </header>
      
      <ProgressBar currentStep={currentStep} totalSteps={6} />
      
      {error && <div className="error-message">{error}</div>}
      
      <main className="App-main">
        <TransitionGroup>
          {currentStep === 1 && (
            <CSSTransition
              key="prompt-form"
              timeout={500}
              classNames="fade"
            >
              <PromptForm onSubmit={handlePromptSubmit} loading={loading} />
            </CSSTransition>
          )}
          
          {currentStep === 2 && initialContent && (
            <CSSTransition
              key="initial-content"
              timeout={500}
              classNames="fade"
            >
              <InitialContent 
                content={initialContent} 
                onProceed={handleProceedToConfirmation} 
                loading={loading}
              />
            </CSSTransition>
          )}
          
          {currentStep === 3 && (
            <CSSTransition
              key="confirmation-dialog"
              timeout={500}
              classNames="fade"
            >
              <ConfirmationDialog 
                question={currentQuestion}
                onSubmitFeedback={handleUserFeedback}
                loading={loading}
                stage={currentStage}
                previousFeedback={userFeedback}
              />
            </CSSTransition>
          )}
          
          {currentStep === 4 && (
            <CSSTransition
              key="search-queries"
              timeout={500}
              classNames="fade"
            >
              <SearchQueries 
                queries={searchQueries}
                onGenerateQueries={handleGenerateSearchQueries}
                onSearch={handleSearchPapers}
                onContinue={handleContinueToSearch}
                loading={loading}
                showSearch={false}
              />
            </CSSTransition>
          )}
          
          {currentStep === 5 && (
            <CSSTransition
              key="search-queries"
              timeout={500}
              classNames="fade"
            >
              <SearchQueries 
                queries={searchQueries}
                onSearch={handleSearchPapers}
                loading={loading}
                showSearch={true}
              />
            </CSSTransition>
          )}
          
          {currentStep === 6 && (
            <CSSTransition
              key="papers"
              timeout={500}
              classNames="fade"
            >
              <Papers 
                papers={papers}
                selectedPapers={selectedPapers}
                manualSources={manualSources}
                onSelectPapers={handlePaperSelection}
                onAddManualSource={handleAddManualSource}
                onNext={handleGenerateReport}
                loading={loading} 
              />
            </CSSTransition>
          )}
          
          {currentStep === 7 && (
            <CSSTransition
              key="report"
              timeout={500}
              classNames="fade"
            >
              {loading ? <LoadingSpinner /> : <Report report={report} final={true} />}
            </CSSTransition>
          )}
        </TransitionGroup>
      </main>
      
      <footer style={{ textAlign: 'center', padding: '40px 0 20px', color: '#666', fontSize: '14px' }}>
        <p>© {new Date().getFullYear()} Academic Research Assistant | All Rights Reserved</p>
      </footer>
    </div>
  );
}

export default App; 