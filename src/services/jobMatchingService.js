// ============================================
// ApplyFlow.ai — Job Matching Engine
// Matches candidates with the best jobs using AI
// ============================================

const Job = require('../models/Job');
const geminiService = require('./geminiService');

class JobMatchingService {
  /**
   * Find best matching jobs for a candidate
   */
  async findMatchingJobs(candidateProfile, options = {}) {
    const {
      limit = 20,
      minMatchScore = 50,
      includeAnalysis = true,
    } = options;

    try {
      // Step 1: Get all active jobs (in production, this would be more sophisticated)
      let jobs = await this._getAvailableJobs(candidateProfile);

      // Step 2: Calculate match scores
      const scoredJobs = await Promise.all(
        jobs.map(async (job) => {
          const quickScore = this._calculateQuickScore(candidateProfile, job);
          return { job, quickScore };
        })
      );

      // Step 3: Sort by score and filter
      const topJobs = scoredJobs
        .filter(item => item.quickScore >= minMatchScore)
        .sort((a, b) => b.quickScore - a.quickScore)
        .slice(0, limit);

      // Step 4: Get detailed AI analysis for top matches (top 5)
      if (includeAnalysis) {
        const analysisPromises = topJobs.slice(0, 5).map(async (item) => {
          try {
            const aiMatch = await geminiService.matchJobToCandidate(candidateProfile, item.job);
            item.aiAnalysis = aiMatch;
            item.finalScore = aiMatch.overallScore || item.quickScore;
          } catch (err) {
            item.aiAnalysis = null;
            item.finalScore = item.quickScore;
          }
          return item;
        });

        await Promise.all(analysisPromises);
      }

      // Re-sort after AI analysis
      topJobs.sort((a, b) => (b.finalScore || b.quickScore) - (a.finalScore || a.quickScore));

      return topJobs.map(item => ({
        job: item.job,
        matchScore: item.finalScore || item.quickScore,
        quickScore: item.quickScore,
        aiAnalysis: item.aiAnalysis || null,
      }));
    } catch (error) {
      console.error('Job matching error:', error.message);
      throw error;
    }
  }

  /**
   * Quick algorithmic scoring (no AI, fast)
   */
  _calculateQuickScore(candidate, job) {
    let score = 0;
    const candidateSkills = (candidate.skills || []).map(s => s.toLowerCase());
    const jobSkills = (job.skills || []).map(s => s.toLowerCase());

    // Skill match (40% weight)
    if (jobSkills.length > 0) {
      const matchedSkills = candidateSkills.filter(s => 
        jobSkills.some(js => js.includes(s) || s.includes(js))
      );
      const skillScore = (matchedSkills.length / jobSkills.length) * 100;
      score += Math.min(skillScore, 100) * 0.4;
    } else {
      score += 20; // No skills listed = neutral
    }

    // Experience level match (20% weight)
    if (candidate.experienceLevel && job.experienceLevel) {
      const levels = ['fresher', 'junior', 'mid', 'senior', 'lead', 'executive'];
      const candIdx = levels.indexOf(candidate.experienceLevel);
      const jobIdx = levels.indexOf(job.experienceLevel);
      if (candIdx >= 0 && jobIdx >= 0) {
        const diff = Math.abs(candIdx - jobIdx);
        score += Math.max(0, (3 - diff) / 3 * 100) * 0.2;
      }
    } else {
      score += 10;
    }

    // Job type match (10% weight)
    if (candidate.preferences?.jobType && job.type) {
      if (candidate.preferences.jobType === job.type) score += 10;
    } else {
      score += 5;
    }

    // Location match (15% weight)
    if (job.location?.remote) {
      score += 15; // Remote jobs always match
    } else if (candidate.preferences?.desiredLocations?.length) {
      const jobLocation = `${job.location?.city || ''} ${job.location?.state || ''}`.toLowerCase();
      const locMatch = candidate.preferences.desiredLocations.some(loc => 
        jobLocation.includes(loc.toLowerCase()) || loc.toLowerCase().includes(jobLocation.trim())
      );
      if (locMatch) score += 15;
    } else {
      score += 7;
    }

    // Title relevance (15% weight)
    if (candidate.preferences?.desiredRoles?.length) {
      const jobTitle = job.title.toLowerCase();
      const titleMatch = candidate.preferences.desiredRoles.some(role =>
        jobTitle.includes(role.toLowerCase()) || role.toLowerCase().includes(jobTitle)
      );
      if (titleMatch) score += 15;
    } else {
      score += 7;
    }

    return Math.round(Math.min(score, 100));
  }

  /**
   * Get available jobs from database
   */
  async _getAvailableJobs(candidateProfile) {
    try {
      // Try MongoDB first
      const query = { isActive: true };
      
      // Add skill-based filtering if possible
      if (candidateProfile.skills?.length) {
        query.skills = { 
          $in: candidateProfile.skills.map(s => new RegExp(s, 'i')) 
        };
      }

      const jobs = await Job.find(query)
        .sort({ postedAt: -1 })
        .limit(100)
        .lean();

      if (jobs.length > 0) return jobs;
    } catch (err) {
      // MongoDB not available, use seed data
    }

    // Fallback: return seeded sample jobs
    return this._getSampleJobs();
  }

  /**
   * Sample jobs for hackathon demo
   */
  _getSampleJobs() {
    return [
      {
        _id: 'job_001',
        title: 'Senior Full Stack Developer',
        company: { name: 'Razorpay', logo: '', website: 'https://razorpay.com', industry: 'FinTech' },
        description: 'Build and scale payment infrastructure serving millions of merchants. Work with React, Node.js, and microservices architecture on our core platform.',
        requirements: ['5+ years of software development', 'Expert in React and Node.js', 'Experience with distributed systems'],
        skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'Microservices'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: true },
        salary: { min: 2500000, max: 4500000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'senior',
        experienceYears: { min: 5, max: 10 },
        applicationUrl: 'https://razorpay.com/careers',
        source: 'company-portal',
        aiKeywords: ['payments', 'fintech', 'scale', 'microservices', 'distributed systems'],
        aiDifficultyScore: 75,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_002',
        title: 'Frontend Engineer - React',
        company: { name: 'Swiggy', logo: '', website: 'https://swiggy.com', industry: 'FoodTech' },
        description: 'Join the consumer experience team to build intuitive, performant UI for 50M+ users. Work on order tracking, search, and restaurant discovery features.',
        requirements: ['3+ years React experience', 'Strong CSS/animation skills', 'Experience with state management'],
        skills: ['React', 'JavaScript', 'TypeScript', 'CSS', 'Redux', 'Next.js', 'GraphQL', 'Performance Optimization'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: false },
        salary: { min: 1800000, max: 3200000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'mid',
        experienceYears: { min: 3, max: 6 },
        applicationUrl: 'https://careers.swiggy.com',
        source: 'company-portal',
        aiKeywords: ['frontend', 'consumer', 'UX', 'performance', 'mobile-first'],
        aiDifficultyScore: 60,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_003',
        title: 'Backend Engineer - Python',
        company: { name: 'Zerodha', logo: '', website: 'https://zerodha.com', industry: 'FinTech' },
        description: 'Build trading platform backend handling 15M+ daily orders. Work with Python, Go, and high-performance systems.',
        requirements: ['Strong Python expertise', 'Experience with high-throughput systems', 'Understanding of financial markets is a plus'],
        skills: ['Python', 'Go', 'PostgreSQL', 'Redis', 'Kafka', 'Docker', 'Linux', 'REST APIs'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: true },
        salary: { min: 2000000, max: 4000000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'mid',
        experienceYears: { min: 3, max: 7 },
        applicationUrl: 'https://zerodha.com/careers',
        source: 'company-portal',
        aiKeywords: ['trading', 'high-throughput', 'backend', 'scalable'],
        aiDifficultyScore: 70,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_004',
        title: 'Machine Learning Engineer',
        company: { name: 'Flipkart', logo: '', website: 'https://flipkart.com', industry: 'E-Commerce' },
        description: 'Design and deploy ML models for product recommendations, search ranking, and fraud detection. Work with large-scale data pipelines.',
        requirements: ['MS/PhD in CS or related field', 'Strong ML fundamentals', '2+ years industry ML experience'],
        skills: ['Python', 'TensorFlow', 'PyTorch', 'Spark', 'SQL', 'Machine Learning', 'Deep Learning', 'NLP', 'AWS'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: false },
        salary: { min: 2500000, max: 5000000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'mid',
        experienceYears: { min: 2, max: 6 },
        applicationUrl: 'https://flipkart.com/careers',
        source: 'company-portal',
        aiKeywords: ['ML', 'recommendations', 'data science', 'deep learning', 'NLP'],
        aiDifficultyScore: 80,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_005',
        title: 'DevOps Engineer',
        company: { name: 'PhonePe', logo: '', website: 'https://phonepe.com', industry: 'FinTech' },
        description: 'Manage infrastructure for India largest UPI platform. Build CI/CD pipelines, manage Kubernetes clusters, and ensure 99.99% uptime.',
        requirements: ['3+ years DevOps experience', 'Expert in Kubernetes and Docker', 'AWS/GCP certification preferred'],
        skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'CI/CD', 'Linux', 'Monitoring', 'Python', 'Bash'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: false },
        salary: { min: 2000000, max: 3800000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'mid',
        experienceYears: { min: 3, max: 7 },
        applicationUrl: 'https://phonepe.com/careers',
        source: 'company-portal',
        aiKeywords: ['DevOps', 'infrastructure', 'CI/CD', 'cloud', 'reliability'],
        aiDifficultyScore: 65,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_006',
        title: 'Software Development Engineer - Fresher',
        company: { name: 'Google', logo: '', website: 'https://google.com', industry: 'Technology' },
        description: 'Join Google as a new graduate SDE. Work on products used by billions of people worldwide. Strong focus on algorithms, system design, and code quality.',
        requirements: ['B.Tech/M.Tech in CS or related field', 'Strong DSA skills', 'Experience with at least one programming language'],
        skills: ['C++', 'Java', 'Python', 'Data Structures', 'Algorithms', 'System Design', 'Problem Solving'],
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India', remote: false },
        salary: { min: 1500000, max: 2500000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'fresher',
        experienceYears: { min: 0, max: 1 },
        applicationUrl: 'https://careers.google.com',
        source: 'company-portal',
        aiKeywords: ['new grad', 'algorithms', 'coding', 'large scale', 'innovation'],
        aiDifficultyScore: 90,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_007',
        title: 'React Native Developer',
        company: { name: 'CRED', logo: '', website: 'https://cred.club', industry: 'FinTech' },
        description: 'Build beautiful, performant mobile experiences for CRED members. Focus on animations, user experience, and clean architecture.',
        requirements: ['3+ years React Native experience', 'Published app on App Store/Play Store', 'Strong UI/UX sensibility'],
        skills: ['React Native', 'JavaScript', 'TypeScript', 'iOS', 'Android', 'Redux', 'Animations', 'REST APIs'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: true },
        salary: { min: 2200000, max: 4000000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'mid',
        experienceYears: { min: 3, max: 6 },
        applicationUrl: 'https://cred.club/careers',
        source: 'company-portal',
        aiKeywords: ['mobile', 'React Native', 'UI/UX', 'fintech', 'design'],
        aiDifficultyScore: 65,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_008',
        title: 'Data Engineer',
        company: { name: 'Ola', logo: '', website: 'https://olacabs.com', industry: 'MobilityTech' },
        description: 'Build data pipelines processing petabytes of ride data. Work with real-time streaming, data warehousing, and analytics infrastructure.',
        requirements: ['3+ years data engineering experience', 'Expert in Spark and Kafka', 'Strong SQL skills'],
        skills: ['Python', 'Spark', 'Kafka', 'SQL', 'Airflow', 'AWS EMR', 'Hive', 'Data Warehousing', 'ETL'],
        location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: false },
        salary: { min: 1800000, max: 3500000, currency: 'INR', period: 'yearly' },
        type: 'full-time',
        experienceLevel: 'mid',
        experienceYears: { min: 3, max: 7 },
        applicationUrl: 'https://ola.com/careers',
        source: 'company-portal',
        aiKeywords: ['data pipeline', 'streaming', 'big data', 'analytics'],
        aiDifficultyScore: 70,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_009',
        title: 'Full Stack Developer - Remote',
        company: { name: 'Toptal', logo: '', website: 'https://toptal.com', industry: 'Freelance Platform' },
        description: 'Join the elite network of freelance developers. Work with global startups and enterprises on cutting-edge projects. Fully remote.',
        requirements: ['4+ years full-stack experience', 'Expert in at least one frontend + backend framework', 'Strong communication skills'],
        skills: ['React', 'Angular', 'Node.js', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker', 'Git'],
        location: { city: 'Remote', state: '', country: 'Global', remote: true },
        salary: { min: 4000000, max: 8000000, currency: 'INR', period: 'yearly' },
        type: 'remote',
        experienceLevel: 'senior',
        experienceYears: { min: 4, max: 10 },
        applicationUrl: 'https://toptal.com/apply',
        source: 'company-portal',
        aiKeywords: ['remote', 'freelance', 'elite', 'global', 'full-stack'],
        aiDifficultyScore: 85,
        postedAt: new Date(),
        isActive: true,
      },
      {
        _id: 'job_010',
        title: 'AI/ML Intern',
        company: { name: 'Microsoft', logo: '', website: 'https://microsoft.com', industry: 'Technology' },
        description: 'Summer internship in the AI Research team. Work on cutting-edge NLP and computer vision projects with world-class researchers.',
        requirements: ['Currently pursuing B.Tech/M.Tech', 'Strong Python and ML fundamentals', 'Research publications are a plus'],
        skills: ['Python', 'PyTorch', 'TensorFlow', 'NLP', 'Computer Vision', 'Research', 'Data Analysis'],
        location: { city: 'Hyderabad', state: 'Telangana', country: 'India', remote: false },
        salary: { min: 50000, max: 100000, currency: 'INR', period: 'monthly' },
        type: 'internship',
        experienceLevel: 'fresher',
        experienceYears: { min: 0, max: 1 },
        applicationUrl: 'https://careers.microsoft.com',
        source: 'company-portal',
        aiKeywords: ['intern', 'AI research', 'NLP', 'computer vision', 'summer'],
        aiDifficultyScore: 80,
        postedAt: new Date(),
        isActive: true,
      },
    ];
  }
}

module.exports = new JobMatchingService();
