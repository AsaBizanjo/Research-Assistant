const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const openai = new OpenAI({
  base_url: process.env.OPENAI_BASE_URL || "https://api.electronhub.top/v1/",
  api_key: process.env.OPENAI_API_KEY,
});


app.post('/api/generate-initial-content', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an academic research assistant. Based on the user's research topic, generate initial content that includes: 1) A brief overview of the topic, 2) 5 potential key points to explore, 3) A suggested report outline with sections. Keep it concise but informative." 
        },
        { role: "user", content: `Research topic: ${prompt}` }
      ],
      temperature: 0.7,
    });
    
    const initialContent = completion.choices[0].message.content;
    
    res.json({ initialContent });
  } catch (error) {
    console.error('Error generating initial content:', error);
    res.status(500).json({ error: 'Failed to generate initial content' });
  }
});


app.post('/api/generate-confirmation-question', async (req, res) => {
  try {
    const { prompt, currentStage, userFeedback = [] } = req.body;
    
    let context = `Research topic: ${prompt}\n\n`;
    context += "User feedback so far:\n";
    
    userFeedback.forEach((feedback, index) => {
      context += `Question: ${feedback.question}\nUser's response: ${feedback.answer}\n\n`;
    });
    
    let systemPrompt = "";
    let userPrompt = "";
    
    switch (currentStage) {
      case "outline":
        systemPrompt = "You are an academic research assistant. Based on the user's research topic and any previous feedback, suggest a report outline with 4-6 main sections. Then ask if they want to modify this outline in any way.";
        userPrompt = `${context}\nPlease suggest a report outline for this topic and ask if the user wants to make any changes.`;
        break;
        
      case "keypoints":
        systemPrompt = "You are an academic research assistant. Based on the user's research topic and approved outline, suggest 5 key points that should be covered in the report. Then ask if they want to add, remove, or modify any of these points.";
        userPrompt = `${context}\nPlease suggest 5 key points for this report and ask if the user wants to make any changes.`;
        break;
        
      case "final":
        systemPrompt = "You are an academic research assistant. Summarize the report plan based on all previous feedback and ask if the user is satisfied with this plan before proceeding to generate the report.";
        userPrompt = `${context}\nPlease summarize the report plan and ask for final confirmation.`;
        break;
    }
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
      temperature: 0.7,
    });
    
    const question = completion.choices[0].message.content;
    
    res.json({ question });
  } catch (error) {
    console.error('Error generating confirmation question:', error);
    res.status(500).json({ error: 'Failed to generate confirmation question' });
  }
});


app.post('/api/generate-strategies', async (req, res) => {
  try {
    const { prompt, userFeedback } = req.body;
    
    let context = `Research topic: ${prompt}\n\n`;
    context += "User preferences and feedback:\n";
    
    userFeedback.forEach((feedback, index) => {
      context += `Q: ${feedback.question}\nUser's response: ${feedback.answer}\n\n`;
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an academic research assistant. Generate 3 effective search strategies for finding academic papers on this topic based on the user's preferences. Each strategy should include specific keywords, boolean operators, and any other techniques to optimize academic database searches." 
        },
        { role: "user", content: context }
      ],
      temperature: 0.7,
    });
    
    const strategiesText = completion.choices[0].message.content;
    
    const strategies = strategiesText.split(/Strategy \d+:/i)
      .filter(s => s.trim())
      .map(s => s.trim());
    
    res.json({ strategies });
  } catch (error) {
    console.error('Error generating strategies:', error);
    res.status(500).json({ error: 'Failed to generate strategies' });
  }
});


app.post('/api/generate-search-queries', async (req, res) => {
  try {
    const { prompt, userFeedback } = req.body;
    
    let context = `Research topic: ${prompt}\n\n`;
    context += "User preferences and feedback:\n";
    
    userFeedback.forEach((feedback, index) => {
      context += `Q: ${feedback.question}\nUser's response: ${feedback.answer}\n\n`;
    });
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an academic research assistant specializing in literature search. Generate 3 highly specific search queries for finding relevant academic papers on this topic. Each query should:\n1. Be optimized for academic search engines\n2. Include specific keywords, boolean operators (AND, OR, NOT), and quotation marks for exact phrases\n3. Be focused on different aspects of the research topic based on user preferences\n4. Be formatted for direct use in academic databases\n\nFormat each query on its own line, without numbering or additional explanation." 
        },
        { role: "user", content: context }
      ],
      temperature: 0.7,
    });
    
    const queriesText = completion.choices[0].message.content;
    
    const queries = queriesText.split(/\n+/)
      .map(q => q.trim())
      .filter(q => q && !q.match(/^(\d+\.|\*|\-)\s/)) 
      .filter(q => q.length > 10); 
    
    res.json({ queries });
  } catch (error) {
    console.error('Error generating search queries:', error);
    res.status(500).json({ error: 'Failed to generate search queries' });
  }
});


app.post('/api/search-papers', async (req, res) => {
  try {
    const { queries } = req.body;
    
    if (!queries || queries.length === 0) {
      return res.status(400).json({ error: 'No search queries provided' });
    }
    
    
    const primaryQuery = queries[0];
    let papers = [];
    
    
    try {
      const coreResponse = await axios.get('https://api.core.ac.uk/v3/search/works', {
        params: {
          q: primaryQuery,
          limit: 15,
        },
        headers: {
          'Authorization': `Bearer ${process.env.CORE_API_KEY}`
        }
      });
      
      if (coreResponse.data.results && coreResponse.data.results.length > 0) {
        const corePapers = coreResponse.data.results.map(paper => ({
          id: `core-${paper.id}`,
          title: paper.title,
          authors: paper.authors?.map(author => ({ name: author.name })) || [],
          abstract: paper.abstract,
          year: paper.yearPublished,
          venue: paper.publisher,
          doi: paper.doi,
          url: paper.downloadUrl || paper.identifiers?.find(id => typeof id === 'string' && id.startsWith('http')),
          source: 'CORE'
        }));
        
        papers = [...papers, ...corePapers];
      }
    } catch (coreError) {
      console.error('Error with CORE API:', coreError);
      
    }
    
    
    try {
      const crossrefResponse = await axios.get('https://api.crossref.org/works', {
        params: {
          query: primaryQuery,
          rows: 10,
          sort: 'relevance',
          'filter': 'has-abstract:true,has-full-text:true'
        }
      });
      
      if (crossrefResponse.data.message.items && crossrefResponse.data.message.items.length > 0) {
        const crossrefPapers = crossrefResponse.data.message.items.map(paper => ({
          id: `crossref-${paper.DOI}`,
          title: paper.title ? (Array.isArray(paper.title) ? paper.title[0] : paper.title) : 'Unknown Title',
          authors: paper.author?.map(author => ({ 
            name: `${author.given || ''} ${author.family || ''}`.trim() 
          })) || [],
          abstract: paper.abstract || '',
          year: paper.published ? new Date(paper.published['date-time']).getFullYear() : null,
          venue: paper['container-title'] ? (Array.isArray(paper['container-title']) ? paper['container-title'][0] : paper['container-title']) : '',
          doi: paper.DOI,
          url: paper.URL,
          source: 'Crossref'
        }));
        
        papers = [...papers, ...crossrefPapers];
      }
    } catch (crossrefError) {
      console.error('Error with Crossref API:', crossrefError);
    }
    
    
    if (papers.length < 10 && queries.length > 1) {
      try {
        const secondaryResponse = await axios.get('https://api.core.ac.uk/v3/search/works', {
          params: {
            q: queries[1],
            limit: 10,
          },
          headers: {
            'Authorization': `Bearer ${process.env.CORE_API_KEY}`
          }
        });
        
        if (secondaryResponse.data.results && secondaryResponse.data.results.length > 0) {
          const secondaryPapers = secondaryResponse.data.results.map(paper => ({
            id: `core-secondary-${paper.id}`,
            title: paper.title,
            authors: paper.authors?.map(author => ({ name: author.name })) || [],
            abstract: paper.abstract,
            year: paper.yearPublished,
            venue: paper.publisher,
            doi: paper.doi,
            url: paper.downloadUrl || paper.identifiers?.find(id => typeof id === 'string' && id.startsWith('http')),
            source: 'CORE (Secondary Query)'
          }));
          
          
          const existingTitles = papers.map(p => p.title.toLowerCase());
          const newPapers = secondaryPapers.filter(p => !existingTitles.includes(p.title.toLowerCase()));
          
          papers = [...papers, ...newPapers];
        }
      } catch (secondaryError) {
        console.error('Error with secondary query:', secondaryError);
      }
    }
    
    
    papers = papers.filter(paper => 
      paper.title && 
      paper.title.length > 5 && 
      (paper.abstract || paper.doi || paper.url)
    );
    
    
    const uniquePapers = [];
    const seenDOIs = new Set();
    const seenTitles = new Set();
    
    for (const paper of papers) {
      const title = paper.title.toLowerCase();
      if (
        (paper.doi && !seenDOIs.has(paper.doi)) || 
        (!paper.doi && !seenTitles.has(title))
      ) {
        if (paper.doi) seenDOIs.add(paper.doi);
        seenTitles.add(title);
        uniquePapers.push(paper);
      }
    }
    
    
    uniquePapers.sort((a, b) => {
      
      if (a.abstract && !b.abstract) return -1;
      if (!a.abstract && b.abstract) return 1;
      
      
      if (a.year && b.year) return b.year - a.year;
      if (a.year && !b.year) return -1;
      if (!a.year && b.year) return 1;
      
      return 0;
    });
    
    res.json({ papers: uniquePapers.slice(0, 15) }); 
  } catch (error) {
    console.error('Error searching papers:', error);
    res.status(500).json({ error: 'Failed to search for papers' });
  }
});


app.post('/api/validate-papers', async (req, res) => {
  try {
    const { papers, prompt } = req.body;
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { 
          role: "system", 
          content: "You are an academic research assistant. Review the list of papers found for a research topic and rate their relevance on a scale of 1-10. For each paper, provide a brief explanation of why it's relevant or not relevant to the research topic. Return a JSON array with each paper having these additional fields: relevanceScore (number 1-10) and relevanceExplanation (string)." 
        },
        { 
          role: "user", 
          content: `Research topic: ${prompt}\n\nPapers found:\n${JSON.stringify(papers, null, 2)}` 
        }
      ],
      temperature: 0.7,
      response_format: { type: "json_object" }
    });
    
    let enhancedPapers;
    try {
      const result = JSON.parse(completion.choices[0].message.content);
      enhancedPapers = result.papers || papers;
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      enhancedPapers = papers;
    }
    
    res.json({ papers: enhancedPapers });
  } catch (error) {
    console.error('Error validating papers:', error);
    res.status(500).json({ error: 'Failed to validate papers' });
  }
});


app.post('/api/generate-report', async (req, res) => {
  try {
    const { prompt, userFeedback, strategies, selectedPapers } = req.body;
    
    let context = `Research topic: ${prompt}\n\n`;
    context += "User preferences and feedback:\n";
    
    userFeedback.forEach((feedback, index) => {
      context += `Q: ${feedback.question}\nUser's response: ${feedback.answer}\n\n`;
    });
    
    context += "Search Strategies:\n";
    strategies.forEach((strategy, index) => {
      context += `Strategy ${index+1}: ${strategy}\n\n`;
    });
    
    context += "Selected Papers for Citation:\n";
    selectedPapers.forEach((paper, index) => {
      context += `Paper ${index+1}:\n`;
      context += `Title: ${paper.title}\n`;
      context += `Authors: ${paper.authors?.map(a => a.name).join(', ') || 'Unknown'}\n`;
      context += `Year: ${paper.year || 'Unknown'}\n`;
      context += `DOI: ${paper.doi || 'N/A'}\n`;
      context += `Abstract: ${paper.abstract || 'N/A'}\n\n`;
    });
    
    // gemini-2.0-flash-thinking-exp-01-21 will give a better report
    const completion = await openai.chat.completions.create({
      model: "o3-mini", 
      messages: [
        { 
          role: "system", 
          content: "You are an academic research assistant with expertise in creating comprehensive research reports. Generate a detailed academic report in Markdown format with proper APA citations. The report should follow the outline and incorporate the key points specified by the user. Use the selected papers to support the arguments and provide academic backing. Include:\n1. An introduction that frames the research topic\n2. Main sections as outlined in the user's feedback\n3. A literature review that critically analyzes the selected papers\n4. A methodology section if applicable\n5. A findings/discussion section that synthesizes the research\n6. A conclusion that summarizes key insights and suggests future research directions\n7. A properly formatted APA references section" 
        },
        { 
          role: "user", 
          content: context + "\nPlease generate a comprehensive academic report in Markdown format with proper APA citations based on the user's preferences and the selected papers. The report should be well-structured, academically rigorous, and suitable for an academic audience." 
        }
      ],
      temperature: 0.5, 
    });
    
    const report = completion.choices[0].message.content;
    res.json({ report });
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 