import React from 'react';
import ReactMarkdown from 'react-markdown';

function Report({ report, onNext, loading, final = false }) {
  const handleDownload = () => {
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'academic-research-report.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Academic Research Report</title>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #000;
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            h1, h2, h3, h4, h5, h6 {
              margin-top: 1.5em;
              margin-bottom: 0.75em;
            }
            h1 {
              font-size: 2rem;
              border-bottom: 2px solid #eee;
              padding-bottom: 0.3em;
            }
            h2 {
              font-size: 1.6rem;
              border-bottom: 1px solid #eee;
              padding-bottom: 0.3em;
            }
            p, ul, ol {
              margin-bottom: 1.2em;
            }
            pre {
              background-color: #f5f5f5;
              padding: 16px;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              font-family: monospace;
              background-color: #f5f5f5;
              padding: 2px 4px;
              border-radius: 4px;
            }
            blockquote {
              border-left: 4px solid #ddd;
              padding-left: 16px;
              margin-left: 0;
              color: #666;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
            }
            img {
              max-width: 100%;
            }
            @media print {
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${document.querySelector('.report-content').innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  return (
    <div className="report">
      <h2>Research Report</h2>
      
      {!final && !report ? (
        <>
          <p>We'll generate a comprehensive academic report based on the research questions, answers, and papers found.</p>
          <button 
            onClick={onNext} 
            disabled={loading}
            className="primary-button"
          >
            {loading ? 'Generating Report...' : 'Generate Report'}
          </button>
        </>
      ) : (
        <>
          <div className="report-actions">
            <button onClick={handlePrint} className="secondary-button" style={{marginRight: '12px'}}>
              Print Report
            </button>
            <button onClick={handleDownload} className="secondary-button">
              Download Report (Markdown)
            </button>
          </div>
          
          <div className="report-content">
            <ReactMarkdown>{report}</ReactMarkdown>
          </div>
        </>
      )}
    </div>
  );
}

export default Report; 