// ============================================
// ApplyFlow.ai — Gemini AI Service (CORE ENGINE)
// The brain of ApplyFlow — handles all AI operations
// ============================================

const { getModel } = require('../config/gemini');

class GeminiService {
  constructor() {
    this.model = null;
  }

  _getModel() {
    if (!this.model) {
      this.model = getModel();
    }
    return this.model;
  }

  /**
   * ─────────────────────────────────────────────
   * 1. RESUME ANALYSIS — Deep AI-powered parsing
   * ─────────────────────────────────────────────
   * Extracts structured profile data from raw resume text
   */
  async analyzeResume(resumeText) {
    const model = this._getModel();
    if (!model) return this._mockResumeAnalysis(resumeText);

    const prompt = `You are an expert HR analyst and ATS (Applicant Tracking System) specialist. 
Analyze the following resume text and extract structured data.

RESUME TEXT:
"""
${resumeText}
"""

Return a JSON object with EXACTLY this structure (no markdown, no code blocks, pure JSON):
{
  "name": "Full Name",
  "email": "email@domain.com",
  "phone": "phone number",
  "location": "City, Country",
  "linkedinUrl": "linkedin url or empty string",
  "githubUrl": "github url or empty string",
  "portfolioUrl": "portfolio url or empty string",
  "summary": "A 2-3 sentence professional summary of the candidate",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Start - End",
      "description": "Key achievements and responsibilities"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "institution": "University/College Name",
      "year": "Graduation Year"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "Project Name",
      "description": "Brief description",
      "techStack": ["tech1", "tech2"]
    }
  ],
  "atsScore": 75,
  "atsIssues": ["issue1", "issue2"],
  "atsStrengths": ["strength1", "strength2"],
  "overallAssessment": "Brief overall assessment of the resume quality"
}`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return this._parseJSON(responseText);
    } catch (error) {
      console.error('Gemini analyzeResume error:', error.message);
      return this._mockResumeAnalysis(resumeText);
    }
  }

  /**
   * ──────────────────────────────────────────────────────
   * 2. RESUME OPTIMIZATION — ATS-friendly live optimization
   * ──────────────────────────────────────────────────────
   * Takes a resume + target job description and optimizes it
   */
  async optimizeResume(resumeText, jobDescription, jobTitle) {
    const model = this._getModel();
    if (!model) return this._mockOptimization();

    const prompt = `You are a world-class resume optimization expert specializing in ATS (Applicant Tracking System) optimization.

CANDIDATE'S CURRENT RESUME:
"""
${resumeText}
"""

TARGET JOB:
Title: ${jobTitle}
Description: ${jobDescription}

YOUR TASK:
Optimize this resume specifically for this job. Return a JSON object with:
{
  "optimizedSummary": "A powerful, ATS-optimized professional summary tailored for THIS job (3-4 sentences)",
  "highlightedSkills": ["skill1", "skill2", "..."],
  "tailoredExperience": [
    "Rewritten bullet point 1 with quantified achievements and relevant keywords",
    "Rewritten bullet point 2...",
    "..."
  ],
  "atsScore": 88,
  "keywordsAdded": ["keyword1", "keyword2"],
  "keywordsFromJob": ["all", "important", "keywords", "from", "job", "description"],
  "optimizationNotes": [
    "Specific change made and why",
    "..."
  ],
  "beforeAfterComparison": {
    "scoreBefore": 60,
    "scoreAfter": 88,
    "improvements": ["improvement1", "improvement2"]
  }
}

IMPORTANT RULES:
- Use action verbs (Led, Built, Designed, Optimized, Scaled)
- Include quantified metrics (%, $, numbers)
- Mirror exact keywords from the job description
- Ensure ATS-parseable formatting
- Make the candidate sound impressive but truthful`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return this._parseJSON(responseText);
    } catch (error) {
      console.error('Gemini optimizeResume error:', error.message);
      return this._mockOptimization();
    }
  }

  /**
   * ──────────────────────────────────────────────────
   * 3. JOB MATCHING — Hyper-personalized matching engine
   * ──────────────────────────────────────────────────
   * Analyzes how well a candidate matches a specific job
   */
  async matchJobToCandidate(candidateProfile, jobData) {
    const model = this._getModel();
    if (!model) return this._mockJobMatch();

    const prompt = `You are an expert AI recruiter. Analyze the match between this candidate and job.

CANDIDATE PROFILE:
Name: ${candidateProfile.name || 'N/A'}
Skills: ${(candidateProfile.skills || []).join(', ')}
Experience: ${JSON.stringify(candidateProfile.experience || [])}
Education: ${JSON.stringify(candidateProfile.education || [])}
Summary: ${candidateProfile.summary || 'N/A'}

JOB DETAILS:
Title: ${jobData.title}
Company: ${jobData.company?.name || jobData.company}
Description: ${jobData.description}
Required Skills: ${(jobData.skills || []).join(', ')}
Experience Required: ${jobData.experienceYears?.min || 0}-${jobData.experienceYears?.max || 'N/A'} years
Location: ${jobData.location?.city || 'N/A'}, ${jobData.location?.country || 'N/A'}

Return a JSON object:
{
  "overallScore": 82,
  "skillMatch": 85,
  "experienceMatch": 78,
  "educationMatch": 90,
  "matchingSkills": ["skill1", "skill2"],
  "missingSkills": ["skill3", "skill4"],
  "whyFit": "A compelling 3-4 sentence paragraph explaining EXACTLY why this candidate is a great fit for this specific role. Be specific, mention the candidate's actual skills and how they align with the job requirements. This should feel personalized, NOT generic.",
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2",
    "Specific actionable recommendation 3"
  ],
  "interviewTips": [
    "Specific tip for interview at this company",
    "Tip 2"
  ],
  "confidenceLevel": "high"
}

IMPORTANT: The "whyFit" field is the MOST critical. Make it feel like a personal career advisor wrote it. Mention specific skills and experiences.`;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return this._parseJSON(responseText);
    } catch (error) {
      console.error('Gemini matchJob error:', error.message);
      return this._mockJobMatch();
    }
  }

  /**
   * ──────────────────────────────────────────────
   * 4. JOB SEARCH — AI-powered job recommendations
   * ──────────────────────────────────────────────
   */
  async generateJobSearchQueries(candidateProfile) {
    const model = this._getModel();
    if (!model) return this._mockSearchQueries(candidateProfile);

    const prompt = `Based on this candidate's profile, generate optimal job search queries.

CANDIDATE:
Skills: ${(candidateProfile.skills || []).join(', ')}
Experience: ${JSON.stringify(candidateProfile.experience || []).slice(0, 500)}
Desired Roles: ${(candidateProfile.desiredRoles || []).join(', ') || 'Not specified'}

Return JSON:
{
  "queries": [
    {"query": "search query 1", "platform": "linkedin", "priority": "high"},
    {"query": "search query 2", "platform": "naukri", "priority": "high"},
    {"query": "search query 3", "platform": "indeed", "priority": "medium"}
  ],
  "suggestedTitles": ["Job Title 1", "Job Title 2", "Job Title 3"],
  "topCompanies": ["Company 1", "Company 2", "Company 3"],
  "marketInsight": "Brief insight about current job market for this profile"
}`;

    try {
      const result = await model.generateContent(prompt);
      return this._parseJSON(result.response.text());
    } catch (error) {
      console.error('Gemini searchQueries error:', error.message);
      return this._mockSearchQueries(candidateProfile);
    }
  }

  /**
   * ─────────────────────────────────
   * 4.5. AI RESUME GENERATION
   * ─────────────────────────────────
   */
  async generateResumeContent(profileData) {
    const model = this._getModel();
    if (!model) return this._mockOptimization();

    const prompt = `You are an elite career coach and ATS optimization expert. 
The user wants an extremely highly optimized resume that guarantees an ATS score of 90+ for top tech jobs.

Often users just provide basic details (Name, Degree, a few Skills). It is YOUR JOB to magically expand those minimal details into a highly professional, dense, and impressive resume.

User Raw Data:
Name: ${profileData.fullName || 'User'}
Title: ${profileData.title || 'Software Professional'}
Skills: ${(profileData.skills && profileData.skills.length ? profileData.skills : ['Programming', 'Software Development']).join(', ')}
Raw Experience: ${JSON.stringify(profileData.experience || [])}
Raw Projects: ${JSON.stringify(profileData.projects || [])}

INSTRUCTIONS:
1. SUMMARY: Write a highly compelling 3-4 sentence professional summary focusing on impact and the provided skills. It must sound like a top 1% candidate.
2. EXPERIENCE: If their experience description is weak or empty, INVENT highly realistic, action-verb driven, quantified industry-standard bullet points based on their 'Role' and 'Skills'. Example: "Architected a scalable microservices backend using [UserSkill], reducing latency by 40%". 
3. PROJECTS: Elevate project descriptions to sound technically complex and business-critical.
Make the final output ATS-perfect.

Return STRICTLY this JSON object:
{
  "summary": "...",
  "experience": [
    {
      "company": "Company Name",
      "position": "Title",
      "duration": "Duration",
      "bullets": ["Action-oriented, quantified achievement 1", "Action-oriented, quantified achievement 2", "Metric-driven bullet 3"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "description": "High-impact description of the project detailing tech stack and results."
    }
  ]
}`;

    try {
      const result = await model.generateContent(prompt);
      return this._parseJSON(result.response.text());
    } catch (error) {
      console.error('Gemini generateResumeContent error:', error.message);
      throw error;
    }
  }

  /**
   * ─────────────────────────────────
   * 5. COVER LETTER GENERATION
   * ─────────────────────────────────
   */
  async generateCoverLetter(candidateProfile, jobData) {
    const model = this._getModel();
    if (!model) return this._mockCoverLetter();

    const prompt = `Write a professional, compelling cover letter for this candidate applying to this job.

CANDIDATE:
Name: ${candidateProfile.name || 'Candidate'}
Skills: ${(candidateProfile.skills || []).join(', ')}
Experience: ${JSON.stringify(candidateProfile.experience || []).slice(0, 800)}
Summary: ${candidateProfile.summary || ''}

JOB:
Title: ${jobData.title}
Company: ${jobData.company?.name || jobData.company}
Description: ${jobData.description?.slice(0, 800)}

Return JSON:
{
  "coverLetter": "Full cover letter text here (3-4 paragraphs, professional tone)",
  "subject": "Email subject line",
  "highlights": ["Key point 1 emphasized", "Key point 2 emphasized"]
}

The cover letter should:
- Be 250-350 words
- Open with a compelling hook
- Mention specific company achievements/values
- Connect candidate's experience to job requirements
- End with a confident call to action`;

    try {
      const result = await model.generateContent(prompt);
      return this._parseJSON(result.response.text());
    } catch (error) {
      console.error('Gemini coverLetter error:', error.message);
      return this._mockCoverLetter();
    }
  }

  /**
   * ─────────────────────────────────
   * 6. INTERVIEW PREP
   * ─────────────────────────────────
   */
  async generateInterviewPrep(candidateProfile, jobData) {
    const model = this._getModel();
    if (!model) return this._mockInterviewPrep();

    const prompt = `Generate interview preparation material for this candidate.

CANDIDATE SKILLS: ${(candidateProfile.skills || []).join(', ')}
JOB TITLE: ${jobData.title}
COMPANY: ${jobData.company?.name || jobData.company}
JOB DESCRIPTION: ${jobData.description?.slice(0, 600)}

Return JSON:
{
  "technicalQuestions": [
    {"question": "Q1", "suggestedAnswer": "How to approach this", "difficulty": "medium"},
    {"question": "Q2", "suggestedAnswer": "Approach", "difficulty": "hard"}
  ],
  "behavioralQuestions": [
    {"question": "Q1", "starMethod": {"situation": "", "task": "", "action": "", "result": ""}},
    {"question": "Q2", "starMethod": {"situation": "", "task": "", "action": "", "result": ""}}
  ],
  "companyResearch": {
    "aboutCompany": "Brief about the company",
    "recentNews": "Any notable mentions",
    "culture": "Company culture insights"
  },
  "salaryRange": {
    "low": 0,
    "mid": 0,
    "high": 0,
    "currency": "INR",
    "source": "market estimate"
  },
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}`;

    try {
      const result = await model.generateContent(prompt);
      return this._parseJSON(result.response.text());
    } catch (error) {
      console.error('Gemini interviewPrep error:', error.message);
      return this._mockInterviewPrep();
    }
  }

  /**
   * ──────────────────────────────────────────────────────
   * 7. SKILL GAP ANALYSIS — "Learn X → +20% selection chance"
   * ──────────────────────────────────────────────────────
   * Analyzes what skills the candidate is missing for a job,
   * quantifies how much each skill would improve their chances,
   * and provides a learning roadmap.
   */
  async analyzeSkillGap(candidateProfile, jobData) {
    const model = this._getModel();
    if (!model) return this._mockSkillGap(candidateProfile, jobData);

    const prompt = `You are a senior career strategist and technical recruiter with deep knowledge of the tech hiring market.

CANDIDATE PROFILE:
Name: ${candidateProfile.name || 'Candidate'}
Current Skills: ${(candidateProfile.skills || []).join(', ')}
Experience Level: ${candidateProfile.experienceLevel || 'mid'}
Experience: ${JSON.stringify(candidateProfile.experience || []).slice(0, 500)}

TARGET JOB:
Title: ${jobData.title}
Company: ${jobData.company?.name || jobData.company}
Required Skills: ${(jobData.skills || []).join(', ')}
Description: ${jobData.description?.slice(0, 600)}
Experience: ${jobData.experienceYears?.min || 0}-${jobData.experienceYears?.max || 'N/A'} years

ANALYZE the skill gap and return JSON:
{
  "currentMatchPercent": 68,
  "potentialMatchPercent": 95,
  "skillGaps": [
    {
      "skill": "Next.js",
      "importance": "critical",
      "selectionBoost": 20,
      "currentLevel": "none",
      "targetLevel": "intermediate",
      "estimatedLearningTime": "2-3 weeks",
      "reason": "The job specifically requires Next.js for server-side rendering. Learning this could increase your selection chances by ~20%.",
      "freeResources": [
        {"name": "Next.js Official Docs", "url": "https://nextjs.org/learn", "type": "course"},
        {"name": "Vercel YouTube Channel", "url": "https://youtube.com/@vercel", "type": "video"}
      ],
      "quickWin": "Build a small SSR blog with Next.js to add to your portfolio"
    }
  ],
  "strengthsToHighlight": [
    {
      "skill": "React",
      "advantage": "Your React expertise is a strong foundation; Next.js is built on React so the learning curve will be minimal."
    }
  ],
  "overallAdvice": "You are a strong candidate with a 68% match. By investing 4-6 weeks in learning Next.js and TypeScript, you can boost your match to 95% and significantly increase your chances of getting an interview.",
  "prioritizedLearningPath": [
    {"week": "Week 1-2", "focus": "Next.js fundamentals + SSR", "milestone": "Build a portfolio site with Next.js"},
    {"week": "Week 3-4", "focus": "TypeScript with React/Next.js", "milestone": "Convert an existing project to TypeScript"}
  ],
  "timeToReady": "4-6 weeks",
  "competitorInsight": "Most candidates for this role have React + Next.js. Adding Next.js to your skillset puts you in the top 30% of applicants."
}

IMPORTANT RULES:
- Be SPECIFIC about percentage improvements (selectionBoost field)
- Give REALISTIC time estimates
- Provide ACTUAL free learning resources with real URLs
- Make "reason" field conversational and motivating in Hinglish/English mix
- "quickWin" should be a weekend project idea
- Sort skillGaps by importance (critical > important > nice-to-have)`;

    try {
      const result = await model.generateContent(prompt);
      return this._parseJSON(result.response.text());
    } catch (error) {
      console.error('Gemini skillGap error:', error.message);
      return this._mockSkillGap(candidateProfile, jobData);
    }
  }

  // ============================================
  // UTILITY METHODS
  // ============================================

  /**
   * Parse JSON from Gemini response (handles markdown code blocks)
   */
  _parseJSON(text) {
    try {
      // Remove markdown code block wrappers if present
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
      }
      return JSON.parse(cleaned.trim());
    } catch (error) {
      console.error('JSON parse error from Gemini response:', error.message);
      console.error('Raw response:', text.slice(0, 200));
      // Try to find JSON in the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e) {
          // Final fallback
        }
      }
      throw new Error('Failed to parse AI response as JSON');
    }
  }

  // ============================================
  // MOCK RESPONSES (for demo/hackathon without API key)
  // ============================================

  _mockResumeAnalysis(text) {
    const wordCount = text ? text.split(/\s+/).length : 0;
    return {
      name: 'Demo Candidate',
      email: 'demo@quickapply.ai',
      phone: '+91-9876543210',
      location: 'Bangalore, India',
      linkedinUrl: 'linkedin.com/in/demo-candidate',
      githubUrl: 'github.com/demo-candidate',
      portfolioUrl: '',
      summary: 'Passionate software engineer with expertise in full-stack development, AI/ML, and cloud architecture. Proven track record of building scalable applications serving 100K+ users.',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'Machine Learning', 'TypeScript', 'PostgreSQL', 'Git', 'REST APIs'],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'TechCorp India',
          duration: 'Jan 2023 - Present',
          description: 'Led a team of 5 engineers to build a microservices platform handling 1M+ daily requests. Reduced API latency by 40%.',
        },
        {
          title: 'Software Developer',
          company: 'StartupXYZ',
          duration: 'Jun 2021 - Dec 2022',
          description: 'Built React-based dashboard serving 50K+ users. Implemented CI/CD pipeline reducing deployment time by 60%.',
        },
      ],
      education: [
        {
          degree: 'B.Tech in Computer Science',
          institution: 'IIT Delhi',
          year: '2021',
        },
      ],
      certifications: ['AWS Solutions Architect', 'Google Cloud Professional'],
      projects: [
        {
          name: 'AI Chatbot Platform',
          description: 'Built an NLP-powered chatbot using transformer models',
          techStack: ['Python', 'TensorFlow', 'FastAPI', 'Redis'],
        },
      ],
      atsScore: 72,
      atsIssues: ['Missing quantified achievements in some bullet points', 'Summary could be more keyword-rich', 'Add more technical terminology'],
      atsStrengths: ['Good use of action verbs', 'Clear section formatting', 'Relevant skills listed'],
      overallAssessment: 'Strong technical resume with good experience. ATS score can be improved by adding more quantified metrics and industry-specific keywords.',
    };
  }

  _mockOptimization() {
    return {
      optimizedSummary: 'Results-driven Software Engineer with 3+ years of experience in building scalable full-stack applications using React, Node.js, and cloud technologies (AWS/GCP). Proven track record of reducing system latency by 40% and leading cross-functional teams to deliver products serving 100K+ users. Passionate about leveraging AI/ML to solve complex business problems.',
      highlightedSkills: ['React.js', 'Node.js', 'Python', 'AWS', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'Machine Learning', 'CI/CD', 'Microservices', 'System Design'],
      tailoredExperience: [
        'Led development of microservices architecture processing 1M+ daily API requests, achieving 99.9% uptime and 40% latency reduction',
        'Architected and deployed React-based analytics dashboard serving 50K+ active users with real-time data visualization',
        'Implemented automated CI/CD pipeline using Jenkins & Docker, reducing deployment time by 60% and eliminating manual errors',
        'Designed ML-powered recommendation engine increasing user engagement by 25% using collaborative filtering',
      ],
      atsScore: 91,
      keywordsAdded: ['microservices', 'CI/CD', 'agile', 'scalable', 'cross-functional', 'data-driven'],
      keywordsFromJob: ['full-stack', 'React', 'Node.js', 'AWS', 'scalable', 'team leadership', 'agile'],
      optimizationNotes: [
        'Added quantified metrics to all bullet points (%, numbers, scale)',
        'Mirrored keywords from job description: microservices, CI/CD, scalable',
        'Strengthened summary with role-specific value proposition',
        'Reordered skills to prioritize job-relevant technologies',
      ],
      beforeAfterComparison: {
        scoreBefore: 72,
        scoreAfter: 91,
        improvements: [
          'ATS keyword density increased from 45% to 82%',
          'All experience bullets now contain quantified achievements',
          'Summary rewritten to match job requirements',
        ],
      },
    };
  }

  _mockJobMatch() {
    return {
      overallScore: 85,
      skillMatch: 88,
      experienceMatch: 82,
      educationMatch: 90,
      matchingSkills: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'AWS', 'Docker'],
      missingSkills: ['Kubernetes', 'GraphQL'],
      whyFit: "You're an excellent match for this role because your 3+ years of full-stack development experience directly aligns with their need for a Senior Engineer. Your proven ability to build scalable microservices (1M+ daily requests) and lead engineering teams demonstrates the technical depth and leadership they're seeking. Your React and Node.js expertise, combined with your AWS certifications, makes you stand out from other candidates.",
      recommendations: [
        'Highlight your microservices experience — it directly matches their architecture',
        'Mention your team leadership experience (5 engineers) in the cover letter',
        'Learn Kubernetes basics before the interview — it is listed as a nice-to-have',
      ],
      interviewTips: [
        'Prepare a system design example using microservices architecture',
        'Be ready to discuss your CI/CD pipeline implementation in detail',
        'Research the company recent product launches and mention them',
      ],
      confidenceLevel: 'high',
    };
  }

  _mockSearchQueries(profile) {
    const skills = profile?.skills || ['JavaScript', 'React', 'Node.js'];
    return {
      queries: [
        { query: `${skills[0]} Developer`, platform: 'linkedin', priority: 'high' },
        { query: `Full Stack Engineer ${skills.slice(0, 3).join(' ')}`, platform: 'naukri', priority: 'high' },
        { query: `Software Engineer Remote India`, platform: 'indeed', priority: 'medium' },
      ],
      suggestedTitles: ['Full Stack Developer', 'Software Engineer', 'Backend Developer', 'Frontend Developer'],
      topCompanies: ['Google', 'Microsoft', 'Amazon', 'Flipkart', 'Swiggy', 'Razorpay'],
      marketInsight: 'The demand for full-stack developers with React and Node.js expertise remains strong in India, with a 15% YoY increase in remote positions.',
    };
  }

  _mockCoverLetter() {
    return {
      coverLetter: `Dear Hiring Manager,

I am writing to express my strong interest in the Software Engineer position at your organization. With over 3 years of hands-on experience building scalable full-stack applications and a proven track record of delivering high-impact solutions, I am confident in my ability to contribute meaningfully to your team.

In my current role as a Senior Software Engineer, I have led the development of microservices-based platforms handling over 1 million daily API requests, achieving 99.9% uptime. I spearheaded the implementation of automated CI/CD pipelines that reduced deployment cycles by 60%, demonstrating my commitment to engineering excellence and operational efficiency.

What excites me most about this opportunity is the chance to work on products that scale to millions of users while leveraging cutting-edge technologies. My experience with React, Node.js, AWS, and Machine Learning, combined with my passion for clean, maintainable code, aligns perfectly with your team's technical stack and engineering culture.

I would welcome the opportunity to discuss how my skills and experiences can contribute to your team's success. Thank you for considering my application.

Best regards,
Candidate`,
      subject: 'Application for Software Engineer Position — Experienced Full-Stack Developer',
      highlights: ['Led microservices platform handling 1M+ daily requests', 'Reduced deployment time by 60% with CI/CD automation', 'Full-stack expertise: React, Node.js, AWS, ML'],
    };
  }

  _mockInterviewPrep() {
    return {
      technicalQuestions: [
        { question: 'Explain the event loop in Node.js and how it handles asynchronous operations.', suggestedAnswer: 'Discuss the call stack, callback queue, microtask queue, and how libuv manages I/O operations. Use examples with setTimeout vs Promises.', difficulty: 'medium' },
        { question: 'How would you design a URL shortening service like bit.ly?', suggestedAnswer: 'Discuss hashing algorithms, database design (NoSQL for reads), caching layer (Redis), API design, and scalability considerations.', difficulty: 'hard' },
        { question: 'What are the differences between SQL and NoSQL databases? When would you choose one over the other?', suggestedAnswer: 'Compare ACID vs BASE, schema flexibility, scalability patterns, and use cases. Give examples from your projects.', difficulty: 'easy' },
      ],
      behavioralQuestions: [
        { question: 'Tell me about a time you had to meet a tight deadline.', starMethod: { situation: 'Product launch was moved up by 2 weeks', task: 'Had to deliver the core API in half the time', action: 'Prioritized features, set up parallel workstreams, did daily standups', result: 'Delivered on time with 0 critical bugs' } },
        { question: 'Describe a situation where you disagreed with a team member.', starMethod: { situation: 'Disagreement on database choice for new project', task: 'Needed to reach consensus on tech stack', action: 'Organized a tech comparison meeting with benchmarks', result: 'Team agreed on the data-driven choice, project succeeded' } },
      ],
      companyResearch: {
        aboutCompany: 'Leading technology company focused on scalable consumer products.',
        recentNews: 'Recently raised Series B funding and expanding engineering team.',
        culture: 'Fast-paced, innovation-driven environment with emphasis on ownership and impact.',
      },
      salaryRange: { low: 800000, mid: 1200000, high: 1800000, currency: 'INR', source: 'market estimate' },
      tips: [
        'Practice coding problems on LeetCode (Medium difficulty) for 30 minutes daily',
        'Prepare 3 strong STAR method stories from your experience',
        'Research the company interviewer on LinkedIn before the call',
      ],
    };
  }

  _mockSkillGap(candidateProfile, jobData) {
    const candidateSkills = (candidateProfile?.skills || ['JavaScript', 'React', 'Node.js']).map(s => s.toLowerCase());
    const jobSkills = (jobData?.skills || ['React', 'Node.js', 'TypeScript', 'Next.js', 'GraphQL']);
    const missing = jobSkills.filter(s => !candidateSkills.includes(s.toLowerCase()));
    const matching = jobSkills.filter(s => candidateSkills.includes(s.toLowerCase()));

    const gapDetails = {
      'TypeScript': {
        importance: 'critical',
        selectionBoost: 22,
        estimatedLearningTime: '2-3 weeks',
        reason: 'TypeScript ab industry standard ban chuka hai. Agar aap TypeScript seekh lo toh selection chance ~22% badh jayega kyunki almost saari modern companies TypeScript use karti hain.',
        freeResources: [
          { name: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/', type: 'documentation' },
          { name: 'Matt Pocock TypeScript Course', url: 'https://www.totaltypescript.com/tutorials', type: 'course' },
        ],
        quickWin: 'Apne ek existing React project ko JavaScript se TypeScript mein convert karo — weekend project!',
      },
      'Next.js': {
        importance: 'critical',
        selectionBoost: 20,
        estimatedLearningTime: '2-3 weeks',
        reason: 'Aapne apply toh kiya, par agar aap Next.js seekh lo toh selection chance 20% badh jayega. React aata hai toh Next.js bahut jaldi aa jayega!',
        freeResources: [
          { name: 'Next.js Learn Course', url: 'https://nextjs.org/learn', type: 'course' },
          { name: 'Vercel YouTube Channel', url: 'https://youtube.com/@vercel', type: 'video' },
        ],
        quickWin: 'Ek SSR portfolio website banao Next.js se — deploy on Vercel for free!',
      },
      'GraphQL': {
        importance: 'important',
        selectionBoost: 12,
        estimatedLearningTime: '1-2 weeks',
        reason: 'GraphQL ek nice-to-have skill hai is job ke liye. REST APIs aate hain toh GraphQL ka concept jaldi samajh aa jayega. ~12% boost milega.',
        freeResources: [
          { name: 'How to GraphQL', url: 'https://www.howtographql.com/', type: 'course' },
          { name: 'Apollo GraphQL Docs', url: 'https://www.apollographql.com/docs/', type: 'documentation' },
        ],
        quickWin: 'Ek simple GraphQL API banao with Apollo Server — movie database ke liye!',
      },
      'Kubernetes': {
        importance: 'nice-to-have',
        selectionBoost: 8,
        estimatedLearningTime: '3-4 weeks',
        reason: 'Kubernetes DevOps ke liye important hai. Docker aata hai toh Kubernetes ka basics 3-4 weeks mein aa jayega. ~8% improvement.',
        freeResources: [
          { name: 'Kubernetes Official Tutorials', url: 'https://kubernetes.io/docs/tutorials/', type: 'documentation' },
          { name: 'KodeKloud Free Labs', url: 'https://kodekloud.com/', type: 'hands-on' },
        ],
        quickWin: 'Minikube install karo aur apne existing Docker app ko locally Kubernetes pe deploy karo.',
      },
      'Docker': {
        importance: 'important',
        selectionBoost: 15,
        estimatedLearningTime: '1-2 weeks',
        reason: 'Docker containerization ka basic tool hai. Seekh lo toh deployment skills dikhti hain aur ~15% improvement aata hai.',
        freeResources: [
          { name: 'Docker Getting Started', url: 'https://docs.docker.com/get-started/', type: 'documentation' },
          { name: 'TechWorld with Nana', url: 'https://youtube.com/@TechWorldwithNana', type: 'video' },
        ],
        quickWin: 'Apne Node.js backend ko Dockerize karo — Dockerfile + docker-compose banao!',
      },
      'Redis': {
        importance: 'important',
        selectionBoost: 10,
        estimatedLearningTime: '1 week',
        reason: 'Redis caching ke liye bahut useful hai. Backend mein Redis add karne se performance 10x improve hota hai. ~10% boost.',
        freeResources: [
          { name: 'Redis University', url: 'https://university.redis.com/', type: 'course' },
          { name: 'Redis Official Docs', url: 'https://redis.io/docs/', type: 'documentation' },
        ],
        quickWin: 'Apne API responses ko Redis se cache karo — response time 100ms se 5ms ho jayega!',
      },
      'PostgreSQL': {
        importance: 'important',
        selectionBoost: 12,
        estimatedLearningTime: '2 weeks',
        reason: 'PostgreSQL enterprise-grade SQL database hai. MongoDB ke saath SQL bhi aana chahiye. ~12% improvement.',
        freeResources: [
          { name: 'PostgreSQL Tutorial', url: 'https://www.postgresqltutorial.com/', type: 'course' },
          { name: 'Supabase Docs', url: 'https://supabase.com/docs', type: 'documentation' },
        ],
        quickWin: 'Supabase pe ek project banao — PostgreSQL + Auth free mein milta hai!',
      },
      'AWS': {
        importance: 'critical',
        selectionBoost: 18,
        estimatedLearningTime: '4-6 weeks',
        reason: 'AWS cloud ka king hai. EC2, S3, Lambda seekh lo toh bahut saari jobs unlock ho jayengi. ~18% boost.',
        freeResources: [
          { name: 'AWS Free Tier', url: 'https://aws.amazon.com/free/', type: 'hands-on' },
          { name: 'AWS Skill Builder', url: 'https://skillbuilder.aws/', type: 'course' },
        ],
        quickWin: 'AWS Free Tier pe apna backend deploy karo — EC2 + RDS + S3!',
      },
    };

    const skillGaps = missing.slice(0, 5).map((skill, idx) => {
      const detail = gapDetails[skill] || {
        importance: idx < 2 ? 'critical' : idx < 4 ? 'important' : 'nice-to-have',
        selectionBoost: Math.max(5, 25 - idx * 5),
        estimatedLearningTime: '2-3 weeks',
        reason: `${skill} seekhne se aapka profile aur strong hoga is role ke liye. ~${Math.max(5, 25 - idx * 5)}% boost milega.`,
        freeResources: [
          { name: `${skill} Official Docs`, url: `https://www.google.com/search?q=${encodeURIComponent(skill + ' tutorial')}`, type: 'documentation' },
        ],
        quickWin: `Ek small project banao using ${skill} aur apne GitHub pe push karo.`,
      };

      return {
        skill,
        ...detail,
        currentLevel: 'none',
        targetLevel: 'intermediate',
      };
    });

    const currentMatch = matching.length > 0 ? Math.round((matching.length / jobSkills.length) * 100) : 45;
    const totalBoost = skillGaps.reduce((sum, g) => sum + g.selectionBoost, 0);

    return {
      currentMatchPercent: currentMatch,
      potentialMatchPercent: Math.min(98, currentMatch + totalBoost),
      skillGaps,
      strengthsToHighlight: matching.slice(0, 4).map(skill => ({
        skill,
        advantage: `Aapka ${skill} expertise is role ke liye perfect match hai. Ise resume mein highlight zaroor karo!`,
      })),
      overallAdvice: `Aap ek strong candidate ho with ${currentMatch}% match. Agar aap ${missing.slice(0, 2).join(' aur ')} seekh lo toh match ${Math.min(98, currentMatch + totalBoost)}% tak pahunch sakta hai. Estimated time: 4-6 weeks of focused learning.`,
      prioritizedLearningPath: [
        { week: 'Week 1-2', focus: `${missing[0] || 'Core Skills'} fundamentals`, milestone: `Build a mini-project using ${missing[0] || 'new tech'}` },
        { week: 'Week 3-4', focus: `${missing[1] || 'Advanced Concepts'} deep dive`, milestone: `Integrate ${missing[1] || 'new skill'} into existing project` },
        { week: 'Week 5-6', focus: 'Portfolio polish + practice', milestone: 'Deploy 2 projects showcasing new skills' },
      ],
      timeToReady: '4-6 weeks',
      competitorInsight: `Most candidates for ${jobData?.title || 'this role'} already know ${missing.slice(0, 2).join(' and ')}. Learning these puts you in the top 25% of applicants.`,
    };
  }
  /**
   * ─────────────────────────────────
   * 8. ENHANCE TEXT SNIPPET
   * ─────────────────────────────────
   * Rewrites specific text into professional resume format.
   */
  async enhanceDescription(text, type = 'experience') {
    const model = this._getModel();
    if (!model) return text; // fallback

    const prompt = `You are an elite Resume Writer.
The user wrote this rough description for their ${type} section:
"""${text}"""

Rewrite it to be extremely professional, action-oriented, and ATS-friendly.
Format it as a few punchy bullet points. Do not include introductory text, just return the polished string. Ensure it uses strong industry keywords and sounds like a top-tier professional.`;

    try {
      const result = await model.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      console.error('Gemini enhance text error:', error.message);
      return text;
    }
  }

  /**
   * ─────────────────────────────────
   * 9. MAGIC AI PROFILE AUTO-FILL
   * ─────────────────────────────────
   * Generates a complete, structured profile JSON from a brief sentence.
   */
  async autoFillProfile(promptText) {
    const model = this._getModel();
    if (!model) return this._mockAutoFillProfile(promptText);

    const prompt = `You are a world-class HR consultant and senior resume builder. 
The user wants to auto-fill their entire resume profile based on a brief statement:
"""
${promptText}
"""

YOUR TASK:
Generate a complete, highly impressive, and realistic professional profile customized to their statement.
magically expand their simple details into a dense, senior-sounding tech profile.

Return STRICTLY a JSON object with this structure (do not wrap in markdown or code blocks, just return pure JSON):
{
  "title": "Professional Title (e.g. MERN Stack Engineer or Python Developer)",
  "summary": "Professional Summary (3 compelling sentences focusing on action, skills, and business value)",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6", "skill7", "skill8"],
  "experience": [
    {
      "company": "Realistic Tech Company Name (e.g. InnovateLabs, TechSolutions)",
      "role": "Role Title (e.g. Junior Developer, Engineering Intern)",
      "duration": "Jan 2024 - Present",
      "description": "Developed robust features utilizing React and Node.js. Optimized database queries, reducing response times by 30%. Collaborated with agile team to deliver high-quality components."
    }
  ],
  "projects": [
    {
      "name": "Project Name 1",
      "techStack": "React.js, Node.js, MongoDB",
      "description": "Architected a full-featured web app with secure JWT authentication and real-time dashboard analytics. Deployed on AWS with 40% speed optimization.",
      "link": "https://github.com/username/project-one"
    },
    {
      "name": "Project Name 2",
      "techStack": "Express, Redux, PostgreSQL",
      "description": "Built a scalable REST API utilizing Redis caching to reduce latency. Integrated third-party payment gateways with comprehensive unit testing.",
      "link": "https://github.com/username/project-two"
    }
  ],
  "certifications": ["AWS Certified Cloud Practitioner", "Google Advanced React Developer"],
  "education": [
    {
      "institution": "State Technical University",
      "degree": "Bachelor of Technology in Computer Science",
      "year": "2020 - 2024"
    }
  ]
}`;

    try {
      const result = await model.generateContent(prompt);
      return this._parseJSON(result.response.text());
    } catch (error) {
      console.error('Gemini autoFillProfile error:', error.message);
      return this._mockAutoFillProfile(promptText);
    }
  }

  /**
   * Resilient fallback mock generator for Profile Auto-fill (works offline / without API key)
   */
  _mockAutoFillProfile(promptText) {
    const text = (promptText || '').toLowerCase();
    
    // Default fallback templates based on keywords
    let title = "Full Stack Developer";
    let summary = "Versatile and results-driven Software Engineer with hands-on expertise in building responsive web applications. Proven ability to architect clean frontends and optimize robust server APIs. Passionate about modern development best practices and delivering business impact.";
    let skills = ['JavaScript', 'React', 'Node.js', 'Express', 'MongoDB', 'Git', 'REST APIs', 'TypeScript', 'CSS3', 'HTML5'];
    let expRole = "Full Stack Engineering Intern";
    let expCompany = "WebCrafters India";
    let expDesc = "Assisted in building responsive React frontends, improving load speeds by 25%.\nCollaborated on Express/MongoDB APIs, creating secure token-based user authentications.\nParticipated in daily scrum meetings and wrote comprehensive documentation.";
    let p1Name = "QuickApply.AI Dashboard";
    let p1Tech = "React, Node.js, Express, Puppeteer";
    let p1Desc = "Designed an automated application tracking system reducing form filling times by 90%. Configured Puppeteer automation to auto-fill job fields locally.";
    let p2Name = "FinTrack - Personal Wealth App";
    let p2Tech = "React, Chart.js, MongoDB, Express";
    let p2Desc = "Developed a real-time money tracking system with interactive charts and dynamic budget alerts. Secured data with bcrypt hashing.";
    let certs = ["Google UX Design Professional Certificate", "Meta Front-End Developer Specialization"];
    let eduInst = "Delhi Technological University";
    let eduDegree = "B.Tech in Computer Science and Engineering";
    let eduYear = "2021 - 2025";

    if (text.includes('python') || text.includes('django') || text.includes('ml') || text.includes('data')) {
      title = "Python & Machine Learning Developer";
      summary = "Analytical Python Developer specializing in backend engineering, data pipelines, and machine learning solutions. Adept at designing scalable REST APIs and processing complex datasets with high accuracy. Committed to clean code standards and automation.";
      skills = ['Python', 'Django', 'FastAPI', 'PostgreSQL', 'Pandas', 'NumPy', 'Scikit-Learn', 'Docker', 'REST APIs', 'Git'];
      expRole = "Python Development Trainee";
      expCompany = "DataPulse Solutions";
      expDesc = "Designed high-performance REST APIs using FastAPI and PostgreSQL, serving 10K+ monthly requests.\nDeveloped automated web scraping scripts to extract and sanitize unstructured web data.\nBuilt interactive data visualization dashboards using Streamlit.";
      p1Name = "Auto-Scrape & Data Analyzer";
      p1Tech = "Python, Pandas, BeautifulSoup, PostgreSQL";
      p1Desc = "Created an automated scraping pipeline extracting real-time e-commerce prices, reducing collection costs by 50%. Analysed price trend correlations.";
      p2Name = "Predictive Housing Analytics Engine";
      p2Tech = "Python, Scikit-Learn, Flask, NumPy";
      p2Desc = "Trained a linear regression model forecasting house prices with 92% prediction accuracy. Built a user-friendly Flask API wrapper.";
      certs = ["Python for Data Science (IBM)", "DeepLearning.AI TensorFlow Developer Certificate"];
    } else if (text.includes('java') || text.includes('spring') || text.includes('backend')) {
      title = "Java Backend Engineer";
      summary = "Dedicated Java Developer focusing on robust enterprise backend development. Highly proficient in Spring Boot, microservices architecture, and relational database systems. Strong understanding of OOP design patterns, multithreading, and RESTful principles.";
      skills = ['Java', 'Spring Boot', 'Spring MVC', 'Hibernate', 'PostgreSQL', 'MySQL', 'REST APIs', 'Maven', 'Git', 'JUnit'];
      expRole = "Java Backend Intern";
      expCompany = "TechCore Systems";
      expDesc = "Built robust CRUD APIs with Spring Boot and JPA, ensuring seamless data persistence on PostgreSQL.\nRefactored database tables and queries, achieving a 20% latency reduction in search functionalities.\nWrote extensive JUnit test cases, increasing overall code coverage to 85%.";
      p1Name = "E-Commerce Microservices Backend";
      p1Tech = "Java, Spring Boot, PostgreSQL, Eureka, Spring Cloud";
      p1Desc = "Architected a decoupled payment and ordering microservices pipeline. Implemented Service Discovery using Netflix Eureka with circuit breakers.";
      p2Name = "TaskManager Enterprise API";
      p2Tech = "Java, Spring Security, Hibernate, MySQL";
      p2Desc = "Engineered a secure task delegation portal with role-based auth (Admin, Manager, User). Configured Hibernate ORM for efficient mapping.";
      certs = ["Oracle Certified Associate: Java SE Programmer", "Spring Framework Masterclass (Udemy)"];
    } else if (text.includes('front') || text.includes('react') || text.includes('ui') || text.includes('css')) {
      title = "Frontend Engineer";
      summary = "Creative and pixel-perfect Frontend Developer with deep expertise in React.js, TailwindCSS, and state management. Passionate about crafting intuitive UI/UX journeys and optimizing web performance for low-bandwidth environments. Driven by user feedback.";
      skills = ['React.js', 'JavaScript', 'TypeScript', 'TailwindCSS', 'Redux Toolkit', 'HTML5', 'CSS3', 'Figma', 'Git', 'Vite'];
      expRole = "Frontend Developer Intern";
      expCompany = "PixelCraft Agency";
      expDesc = "Developed responsive, pixel-perfect user interface components from Figma layouts using React and TailwindCSS.\nIntegrated REST APIs, managing complex client-side state transitions with Redux Toolkit.\nOptimized images and lazy-loaded modules, boosting Google Lighthouse score from 70 to 95.";
      p1Name = "Cyberpunk HUD Dashboard UI";
      p1Tech = "React, Framer Motion, TailwindCSS, Lucide Icons";
      p1Desc = "Created a stunning dark-theme futuristic administrative portal featuring rich hover micro-animations and custom SVG charts.";
      p2Name = "CollabDoc - Realtime Markup Tool";
      p2Tech = "React, Socket.io, Express, CSS Grid";
      p2Desc = "Built an interactive drawing and comment board allowing simultaneous users to annotate design docs in real time.";
      certs = ["Meta Front-End Developer Certificate", "Responsive Web Design (freeCodeCamp)"];
    }

    return {
      title,
      summary,
      skills,
      experience: [
        {
          company: expCompany,
          role: expRole,
          duration: "Jan 2024 - Present",
          description: expDesc
        }
      ],
      projects: [
        {
          name: p1Name,
          techStack: p1Tech,
          description: p1Desc,
          link: "https://github.com/username/project-one"
        },
        {
          name: p2Name,
          techStack: p2Tech,
          description: p2Desc,
          link: "https://github.com/username/project-two"
        }
      ],
      certifications: certs,
      education: [
        {
          institution: eduInst,
          degree: eduDegree,
          year: eduYear
        }
      ]
    };
  }
}

module.exports = new GeminiService();

