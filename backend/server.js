const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());


const openai = new OpenAI({
  base_url: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1/",
  api_key: process.env.OPENAI_API_KEY,
});

const coreApiCache = new Map();

async function searchCoreWithCache(query, limit = 1) {
  const cacheKey = `${query}_${limit}`;
  
  if (coreApiCache.has(cacheKey)) {
    return coreApiCache.get(cacheKey);
  }
  
  try {
    const response = await axios.get('https://api.core.ac.uk/v3/search/works', {
      params: { q: query, limit },
      headers: { 'Authorization': `Bearer ${process.env.CORE_API_KEY}` }
    });
    
    coreApiCache.set(cacheKey, response.data.results);
    
    if (coreApiCache.size > 100) {
      const oldestKey = coreApiCache.keys().next().value;
      coreApiCache.delete(oldestKey);
    }
    
    return response.data.results;
  } catch (error) {
    console.error('CORE API search error:', error);
    return [];
  }
}

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
          content: "You are an academic research assistant. Review the list of papers found for a research topic and rate their relevance on a scale of 1-10. For each paper, provide a brief explanation of why it's relevant or not relevant to the research topic. Return a JSON array with each paper having these additional fields: relevanceScore (number 1-10) and relevanceExplanation (string). Ensure your response is valid JSON." 
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
      enhancedPapers = papers.map(paper => ({
        ...paper,
        relevanceScore: 5,
        relevanceExplanation: "Relevance could not be automatically determined."
      }));
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
    
    const papersWithFullText = await Promise.all(selectedPapers.map(async (paper) => {
      try {
        const response = await axios.post(`${req.protocol}://${req.get('host')}/api/fetch-full-text`, {
          doi: paper.doi,
          url: paper.url,
          title: paper.title,
          authors: paper.authors?.map(a => a.name).join(', '),
          year: paper.year
        });
        
        return {
          ...paper,
          fullText: response.data.fullText,
          textSource: response.data.source
        };
      } catch (error) {
        console.error(`Error fetching full text for paper "${paper.title}":`, error);
        return paper;
      }
    }));
    
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
    papersWithFullText.forEach((paper, index) => {
      context += `Paper ${index+1}:\n`;
      context += `Title: ${paper.title}\n`;
      context += `Authors: ${paper.authors?.map(a => a.name).join(', ') || 'Unknown'}\n`;
      context += `Year: ${paper.year || 'Unknown'}\n`;
      context += `DOI: ${paper.doi || 'N/A'}\n`;
      
      if (paper.fullText) {
        context += `Full Text Available: Yes (Source: ${paper.textSource})\n`;
        
        const sections = extractSectionsFromFullText(paper.fullText);
        
        if (Object.keys(sections).length > 0) {
          Object.entries(sections).forEach(([sectionName, content]) => {
            context += `${sectionName.charAt(0).toUpperCase() + sectionName.slice(1)}: ${content}\n\n`;
          });
        } else {
          const fullTextSummary = summarizeFullText(paper.fullText, 2000);
          context += `Full Text Summary: ${fullTextSummary}\n\n`;
        }
      } else {
        context += `Full Text Available: No\n`;
        context += `Abstract: ${paper.abstract || 'N/A'}\n\n`;
      }
    });
    
    const systemPrompt = `You are an academic research assistant with expertise in creating comprehensive research reports. 
    
    Some papers have full text available from CORE API, while others only have abstracts. When citing:
    - For papers with full text, you can make detailed references to their methodology, findings, and conclusions
    - For papers with only abstracts, clearly indicate the limited information available
    
    Generate a detailed academic report in Markdown format with proper APA citations...`;
    
    const completion = await openai.chat.completions.create({
      model: "gemini-2.0-flash-thinking-exp-01-21", 
      messages: [
        { 
          role: "system", 
          content: systemPrompt 
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

function extractSectionsFromFullText(text) {
  const sections = {};
  
  const sectionPatterns = {
    abstract: /abstract[\s\n:]+/i,
    introduction: /(?:introduction|background)[\s\n:]+/i,
    methodology: /(?:methodology|methods|experimental setup|materials and methods)[\s\n:]+/i,
    results: /results[\s\n:]+/i,
    discussion: /discussion[\s\n:]+/i,
    conclusion: /(?:conclusion|conclusions|concluding remarks)[\s\n:]+/i
  };
  
  for (const [sectionName, pattern] of Object.entries(sectionPatterns)) {
    const match = text.match(pattern);
    if (match) {
      const startIndex = match.index + match[0].length;
      
      let endIndex = text.length;
      for (const nextPattern of Object.values(sectionPatterns)) {
        const nextMatch = text.slice(startIndex).match(nextPattern);
        if (nextMatch && nextMatch.index < endIndex - startIndex) {
          endIndex = startIndex + nextMatch.index;
        }
      }
      
      const sectionContent = text.slice(startIndex, endIndex).trim();
      sections[sectionName] = sectionContent.length > 1000 
        ? sectionContent.substring(0, 1000) + '...' 
        : sectionContent;
    }
  }
  
  return sections;
}

function summarizeFullText(text, maxLength = 2000) {
  if (text.length <= maxLength) return text;
  
  const truncated = text.substring(0, maxLength);
  const lastPeriod = truncated.lastIndexOf('.');
  
  if (lastPeriod > maxLength * 0.8) {
    return truncated.substring(0, lastPeriod + 1);
  }
  
  return truncated + '...';
}

app.post('/api/get-related-papers', async (req, res) => {
  try {
    const { paperId } = req.body;
    
    if (!paperId) {
      return res.status(400).json({ error: 'Paper ID is required' });
    }
    
    const response = await axios.get(`https://api.core.ac.uk/v3/works/${paperId}/related`, {
      headers: { 'Authorization': `Bearer ${process.env.CORE_API_KEY}` }
    });
    
    res.json({ relatedPapers: response.data.results || [] });
  } catch (error) {
    console.error('Error getting related papers:', error);
    res.status(500).json({ error: 'Failed to get related papers' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 