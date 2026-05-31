// ============================================
// ApplyFlow.ai — Dashboard Controller
// Stats, Analytics, and Insights
// ============================================

const User = require('../models/User');
const Application = require('../models/Application');
const geminiService = require('../services/geminiService');
const { inMemoryResumes } = require('./resumeController');

/**
 * Calculate dynamic ATS score based on user profile completeness
 */
const calculateDynamicProfileATSScore = (profile) => {
  if (!profile) return 40;
  
  let score = 40; // baseline for basic profile
  
  // Professional Summary
  if (profile.summary && typeof profile.summary === 'string') {
    const wordCount = profile.summary.trim().split(/\s+/).filter(Boolean).length;
    if (wordCount >= 30) score += 15;
    else if (wordCount > 0) score += 8;
  }
  
  // Skills
  if (profile.skills && Array.isArray(profile.skills)) {
    const skillCount = profile.skills.filter(Boolean).length;
    score += Math.min(skillCount * 2, 20); // max 20 points
  }
  
  // Work Experience
  if (profile.experience && Array.isArray(profile.experience)) {
    const experiences = profile.experience.filter(e => e.company || e.role || e.title);
    const expCount = experiences.length;
    if (expCount > 0) {
      score += 10;
      // Detailed bullet points count
      let totalBullets = 0;
      experiences.forEach(exp => {
        const desc = exp.description || exp.bullets;
        if (desc) {
          if (Array.isArray(desc)) {
            totalBullets += desc.filter(Boolean).length;
          } else if (typeof desc === 'string') {
            totalBullets += desc.split('\n').filter(Boolean).length;
          }
        }
      });
      score += Math.min(totalBullets * 2, 10); // max 10 points
    }
  }
  
  // Projects
  if (profile.projects && Array.isArray(profile.projects)) {
    const projects = profile.projects.filter(p => p.name || p.title);
    score += Math.min(projects.length * 5, 10); // max 10 points
  }
  
  // Education
  if (profile.education && Array.isArray(profile.education)) {
    const education = profile.education.filter(e => e.institution || e.degree);
    if (education.length > 0) score += 5;
  }
  
  // Certifications
  if (profile.certifications && Array.isArray(profile.certifications)) {
    const certs = profile.certifications.filter(c => typeof c === 'string' ? c : c.title);
    if (certs.length > 0) score += 5;
  }
  
  return Math.min(score, 100);
};

/**
 * GET /api/dashboard
 * Get comprehensive dashboard data
 */
const getDashboard = async (req, res) => {
  try {
    let userData = null;
    let applications = [];
    let stats = {
      totalApplications: 0,
      successfulApplications: 0,
      pendingApplications: 0,
      rejectedApplications: 0,
      interviewsCalled: 0,
      averageMatchScore: 0,
      atsScore: 0,
      resumeUploaded: false,
      profileComplete: false,
    };

    // Get user data
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        userData = user;
        const userStats = user.stats || {};
        const userResumes = user.resumes || [];
        const userProfile = user.profile || {};
        stats = {
          ...stats,
          totalApplications: userStats.totalApplications || 0,
          successfulApplications: userStats.successfulApplications || 0,
          pendingApplications: userStats.pendingApplications || 0,
          rejectedApplications: userStats.rejectedApplications || 0,
          interviewsCalled: userStats.interviewsCalled || 0,
          averageMatchScore: userStats.averageMatchScore || 0,
          atsScore: userResumes.find(r => r.isActive)?.atsScore || calculateDynamicProfileATSScore(userProfile),
          resumeUploaded: userResumes.length > 0,
          profileComplete: !!(userProfile.summary && userProfile.skills?.length > 0),
        };
      }
    } catch (dbError) {
      console.log('Dashboard DB fallback:', dbError.message);
      const stored = inMemoryResumes.get(req.user._id || 'default');
      if (stored) {
        stats.resumeUploaded = true;
        stats.atsScore = stored.resume?.atsScore || calculateDynamicProfileATSScore(stored.profile);
        stats.profileComplete = true;
      }
    }

    // Get recent applications
    try {
      applications = await Application.find({ userId: req.user._id })
        .populate('jobId')
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
    } catch (e) {
      // No applications in memory mode
    }

    // Calculate completion progress
    const profileSteps = [
      { name: 'Account Created', done: true },
      { name: 'Resume Uploaded', done: stats.resumeUploaded },
      { name: 'Profile Analyzed', done: stats.profileComplete },
      { name: 'Preferences Set', done: !!(userData?.preferences?.desiredRoles?.length) },
      { name: 'First Application', done: stats.totalApplications > 0 },
    ];
    const completionPercentage = Math.round(
      (profileSteps.filter(s => s.done).length / profileSteps.length) * 100
    );

    res.status(200).json({
      success: true,
      data: {
        user: {
          name: userData?.name || req.user.name || 'User',
          email: userData?.email || req.user.email,
        },
        stats,
        recentApplications: applications,
        profileCompletion: {
          percentage: completionPercentage,
          steps: profileSteps,
        },
        quickActions: [
          { label: '📄 Upload Resume', endpoint: 'POST /api/resume/upload', status: stats.resumeUploaded ? 'done' : 'pending' },
          { label: '🔍 Find Matching Jobs', endpoint: 'GET /api/jobs/match/me', status: 'ready' },
          { label: '⚡ One-Click Apply', endpoint: 'POST /api/apply/one-click', status: 'ready' },
          { label: '🔧 Optimize Resume', endpoint: 'POST /api/resume/optimize', status: 'ready' },
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/dashboard/insights
 * AI-generated career insights
 */
const getInsights = async (req, res) => {
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
    } catch (e) {
      candidateProfile = { skills: ['JavaScript', 'React'], experience: [] };
    }

    const searchAdvice = await geminiService.generateJobSearchQueries(candidateProfile);

    res.status(200).json({
      success: true,
      data: {
        ...searchAdvice,
        tips: [
          '💡 Upload your resume to get personalized job matches',
          '🎯 Set your job preferences for better recommendations',
          '⚡ Use One-Click Apply to save hours of manual form filling',
          '📊 Optimize your resume for each job to boost ATS score by 20-30 points',
        ],
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getDashboard, getInsights };
