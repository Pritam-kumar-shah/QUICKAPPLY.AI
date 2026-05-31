// ============================================
// ApplyFlow.ai — Resume Parser Service
// Extracts structured data from PDF resumes
// ============================================

const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

class ResumeParserService {
  /**
   * Parse a PDF resume and extract raw text
   */
  async extractText(filePath) {
    try {
      const absolutePath = path.resolve(filePath);
      const dataBuffer = fs.readFileSync(absolutePath);
      const data = await pdfParse(dataBuffer);
      
      return {
        text: data.text,
        pages: data.numpages,
        info: data.info,
      };
    } catch (error) {
      throw new Error(`Resume parsing failed: ${error.message}`);
    }
  }

  /**
   * Basic regex-based extraction as fallback (when AI is unavailable)
   */
  extractBasicInfo(text) {
    const emailRegex = /[\w.-]+@[\w.-]+\.\w+/gi;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    const linkedinRegex = /linkedin\.com\/in\/[\w-]+/gi;
    const githubRegex = /github\.com\/[\w-]+/gi;
    const urlRegex = /https?:\/\/[^\s]+/gi;

    // Common skill keywords
    const skillKeywords = [
      'javascript', 'typescript', 'python', 'java', 'c++', 'c#', 'go', 'rust', 'ruby', 'php', 'swift', 'kotlin',
      'react', 'angular', 'vue', 'next.js', 'node.js', 'express', 'django', 'flask', 'spring boot', 'fastapi',
      'html', 'css', 'sass', 'tailwind', 'bootstrap',
      'mongodb', 'postgresql', 'mysql', 'redis', 'elasticsearch', 'firebase', 'supabase',
      'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'terraform', 'jenkins', 'ci/cd',
      'git', 'github', 'gitlab', 'bitbucket',
      'machine learning', 'deep learning', 'nlp', 'computer vision', 'tensorflow', 'pytorch',
      'figma', 'photoshop', 'illustrator',
      'agile', 'scrum', 'jira', 'confluence',
      'rest api', 'graphql', 'websocket', 'grpc',
      'linux', 'bash', 'powershell',
      'data structures', 'algorithms', 'system design', 'microservices',
    ];

    const lowerText = text.toLowerCase();
    const foundSkills = skillKeywords.filter(skill => lowerText.includes(skill));

    return {
      emails: text.match(emailRegex) || [],
      phones: text.match(phoneRegex) || [],
      linkedin: text.match(linkedinRegex) || [],
      github: text.match(githubRegex) || [],
      urls: text.match(urlRegex) || [],
      skills: [...new Set(foundSkills)],
      wordCount: text.split(/\s+/).length,
      characterCount: text.length,
    };
  }

  /**
   * Calculate basic ATS compatibility score
   */
  calculateBasicATSScore(text) {
    let score = 0;
    const lowerText = text.toLowerCase();

    // Has contact info
    if (/[\w.-]+@[\w.-]+\.\w+/.test(text)) score += 10;
    if (/\d{10}|\+\d{12}/.test(text)) score += 5;

    // Has key sections
    const sections = ['experience', 'education', 'skills', 'projects', 'summary', 'objective'];
    sections.forEach(section => {
      if (lowerText.includes(section)) score += 8;
    });

    // Has quantified achievements
    const quantifiers = /\d+%|\d+x|increased|decreased|improved|reduced|managed|led|built|developed|launched/gi;
    const quantifierMatches = text.match(quantifiers) || [];
    score += Math.min(quantifierMatches.length * 3, 20);

    // Proper length (not too short, not too long)
    const wordCount = text.split(/\s+/).length;
    if (wordCount >= 200 && wordCount <= 800) score += 10;
    else if (wordCount >= 100) score += 5;

    // Has links (LinkedIn, GitHub, Portfolio)
    if (/linkedin/i.test(text)) score += 5;
    if (/github/i.test(text)) score += 5;

    return Math.min(score, 100);
  }
}

module.exports = new ResumeParserService();
