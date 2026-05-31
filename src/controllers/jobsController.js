// ============================================
// ApplyFlow.ai — Jobs Controller
// Search, Match, List, and Get Job Details
// ============================================

const Job = require('../models/Job');
const User = require('../models/User');
const jobMatchingService = require('../services/jobMatchingService');
const geminiService = require('../services/geminiService');
const { inMemoryResumes } = require('./resumeController');

/**
 * GET /api/jobs
 * List all available jobs with filtering
 */
const getJobs = async (req, res) => {
  try {
    const {
      search,
      type,
      experienceLevel,
      location,
      remote,
      skills,
      page = 1,
      limit = 20,
    } = req.query;

    let jobs = [];

    try {
      // Try MongoDB
      const query = { isActive: true };

      if (search) {
        query.$text = { $search: search };
      }
      if (type) query.type = type;
      if (experienceLevel) query.experienceLevel = experienceLevel;
      if (remote === 'true') query['location.remote'] = true;
      if (location) {
        query['location.city'] = new RegExp(location, 'i');
      }
      if (skills) {
        const skillArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillArray.map(s => new RegExp(s, 'i')) };
      }

      jobs = await Job.find(query)
        .sort({ postedAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .lean();
    } catch (dbError) {
      // Fallback: sample jobs
      jobs = jobMatchingService._getSampleJobs();

      // Apply basic filtering on sample data
      if (search) {
        const searchLower = search.toLowerCase();
        jobs = jobs.filter(j =>
          j.title.toLowerCase().includes(searchLower) ||
          j.company.name.toLowerCase().includes(searchLower) ||
          j.description.toLowerCase().includes(searchLower)
        );
      }
      if (type) jobs = jobs.filter(j => j.type === type);
      if (experienceLevel) jobs = jobs.filter(j => j.experienceLevel === experienceLevel);
      if (remote === 'true') jobs = jobs.filter(j => j.location?.remote === true);
      if (skills) {
        const skillArray = skills.split(',').map(s => s.trim().toLowerCase());
        jobs = jobs.filter(j =>
          j.skills.some(js => skillArray.some(s => js.toLowerCase().includes(s)))
        );
      }
    }

    res.status(200).json({
      success: true,
      data: {
        jobs,
        count: jobs.length,
        page: parseInt(page),
        totalPages: Math.ceil(jobs.length / parseInt(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/jobs/:id
 * Get single job details
 */
const getJobById = async (req, res) => {
  try {
    let job;

    try {
      job = await Job.findById(req.params.id).lean();
    } catch (dbError) {
      // Search sample jobs
      const sampleJobs = jobMatchingService._getSampleJobs();
      job = sampleJobs.find(j => j._id === req.params.id);
    }

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    res.status(200).json({ success: true, data: { job } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/jobs/match/me
 * AI-powered job matching for current user
 */
const getMatchedJobs = async (req, res) => {
  try {
    // Build candidate profile from user data
    let candidateProfile = {};

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        candidateProfile = {
          name: user.name,
          skills: user.profile?.skills || [],
          experience: user.profile?.experience || [],
          education: user.profile?.education || [],
          summary: user.profile?.summary || '',
          preferences: user.preferences || {},
          experienceLevel: user.preferences?.experienceLevel || 'mid',
        };
      }
    } catch (dbError) {
      // Use in-memory data
      const stored = inMemoryResumes.get(req.user._id || 'default');
      if (stored?.profile) {
        candidateProfile = {
          ...stored.profile,
          preferences: req.user.preferences || {},
          experienceLevel: req.user.preferences?.experienceLevel || 'mid',
        };
      }
    }

    // If still no profile, use a default
    if (!candidateProfile.skills || candidateProfile.skills.length === 0) {
      candidateProfile = {
        name: req.user.name || 'Candidate',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        experience: [],
        education: [],
        summary: 'Software Developer',
        preferences: {},
        experienceLevel: 'mid',
      };
    }

    console.log('🔍 Finding matched jobs for:', candidateProfile.name);
    const matchedJobs = await jobMatchingService.findMatchingJobs(candidateProfile, {
      limit: parseInt(req.query.limit) || 10,
      minMatchScore: parseInt(req.query.minScore) || 30,
      includeAnalysis: req.query.analyze !== 'false',
    });

    res.status(200).json({
      success: true,
      message: `Found ${matchedJobs.length} matched jobs for you! 🎯`,
      data: {
        matches: matchedJobs,
        totalMatched: matchedJobs.length,
        candidateSkills: candidateProfile.skills,
      },
    });
  } catch (error) {
    console.error('Job matching error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/jobs/search/ai
 * AI-generated job search queries
 */
const aiJobSearch = async (req, res) => {
  try {
    let candidateProfile = {};

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        candidateProfile = {
          skills: user.profile?.skills || [],
          experience: user.profile?.experience || [],
          desiredRoles: user.preferences?.desiredRoles || [],
        };
      }
    } catch (dbError) {
      const stored = inMemoryResumes.get(req.user._id || 'default');
      candidateProfile = stored?.profile || { skills: ['JavaScript', 'React'] };
    }

    const searchQueries = await geminiService.generateJobSearchQueries(candidateProfile);

    res.status(200).json({
      success: true,
      data: searchQueries,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getJobs, getJobById, getMatchedJobs, aiJobSearch };
