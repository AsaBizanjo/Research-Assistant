import React from 'react';

function ProgressBar({ currentStep, totalSteps }) {
  const progress = (currentStep / totalSteps) * 100;
  
  const steps = [
    'Research Topic',
    'Initial Overview',
    'Customize Report',
    'Search Strategies',
    'Find Papers',
    'Select Sources',
    'Final Report'
  ];

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div 
          className="progress-fill" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      
      <div className="progress-steps">
        {steps.map((step, index) => (
          <div 
            key={index} 
            className={`progress-step ${currentStep > index + 1 ? 'completed' : ''} ${currentStep === index + 1 ? 'active' : ''}`}
          >
            <div className="step-number">
              {currentStep > index + 1 ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" fill="currentColor"/>
                </svg>
              ) : (
                index + 1
              )}
            </div>
            <div className="step-name">{step}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProgressBar; 