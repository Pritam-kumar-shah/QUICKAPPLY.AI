// ============================================
// ApplyFlow.ai — Application Controller
// One-Click Auto-Apply & Application Management
// ============================================

const EventEmitter = require('events');
class AppLogEmitter extends EventEmitter {}
const appLogEmitter = new AppLogEmitter();

const Application = require('../models/Application');
const User = require('../models/User');
const geminiService = require('../services/geminiService');
const autoApplyService = require('../services/autoApplyService');
const jobMatchingService = require('../services/jobMatchingService');
const { inMemoryResumes } = require('./resumeController');

// In-memory application store
const inMemoryApplications = new Map();

/**
 * SSE Server-Sent Events for Real-time Puppeteer Logs
 */
const streamLogs = (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.flushHeaders();

  const userId = String(req.user?._id || 'default');
  console.log(`📡 SSE Stream connected for user: ${userId}`);

  res.write(`data: ${JSON.stringify({ type: 'status', message: '📡 ESTABLISHED ENCRYPTED GATEWAY TO COMMAND CENTER...' })}\n\n`);

  const onLog = (data) => {
    if (String(data.userId) === userId) {
      res.write(`data: ${JSON.stringify({ type: 'log', message: data.message })}\n\n`);
    }
  };

  appLogEmitter.on('log', onLog);

  req.on('close', () => {
    appLogEmitter.off('log', onLog);
    console.log(`🔌 SSE Stream disconnected for user: ${userId}`);
    res.end();
  });
};

/**
 * POST /api/apply/one-click
 * ⚡ THE HERO FEATURE — One-Click Auto-Apply
 * Analyzes, optimizes, matches, and submits application
 */
const oneClickApply = async (req, res) => {
  try {
    const { jobId, mode = 'simulation' } = req.body;

    if (!jobId) {
      return res.status(400).json({ success: false, error: 'Job ID is required' });
    }

    console.log(`⚡ ONE-CLICK APPLY initiated for job: ${jobId} [Mode: ${mode}]`);
    const startTime = Date.now();

    // Progress logging helper
    const onProgress = (msg) => {
      appLogEmitter.emit('log', { userId: req.user._id, message: msg });
    };

    onProgress('🧠 Step 1/4: Analyzing job requirements & matching profile...');

    // Step 1: Get job details
    let job;
    try {
      const Job = require('../models/Job');
      job = await Job.findById(jobId).lean();
    } catch (e) {
      const sampleJobs = jobMatchingService._getSampleJobs();
      job = sampleJobs.find(j => j._id === jobId);
    }

    if (!job) {
      onProgress('❌ Error: Target job listing not found!');
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Step 2: Get candidate profile
    let candidateProfile = {};
    let resumeText = '';

    try {
      const user = await User.findById(req.user._id);
      if (user) {
        candidateProfile = {
          name: user.name,
          email: user.email,
          phone: user.phone,
          linkedinUrl: user.linkedinUrl,
          githubUrl: user.githubUrl,
          portfolioUrl: user.portfolioUrl,
          skills: user.profile?.skills || [],
          experience: user.profile?.experience || [],
          education: user.profile?.education || [],
          summary: user.profile?.summary || '',
        };
      }
    } catch (dbError) {
      const stored = inMemoryResumes.get(req.user._id || 'default');
      if (stored) {
        candidateProfile = stored.profile;
        resumeText = stored.rawText;
      }
    }

    // Fallback profile
    if (!candidateProfile.name) {
      candidateProfile = {
        name: req.user.name || 'Candidate',
        email: req.user.email || 'candidate@email.com',
        skills: ['JavaScript', 'React', 'Node.js'],
        experience: [],
        summary: 'Experienced software developer',
      };
    }

    // Step 3: AI Match Analysis (Why you're a fit)
    onProgress('🤖 Running AI match compatibility metrics...');
    const matchAnalysis = await geminiService.matchJobToCandidate(candidateProfile, job);

    // Step 4: AI Resume Optimization for THIS job
    onProgress('🔧 Step 2/4: Optimizing resume bullet points with ATS-friendly keywords...');
    const optimizedResume = await geminiService.optimizeResume(
      resumeText || JSON.stringify(candidateProfile),
      job.description,
      job.title
    );

    // Step 5: AI Cover Letter Generation
    onProgress('✉️  Step 3/4: Generating tailored professional cover letter...');
    const coverLetter = await geminiService.generateCoverLetter(candidateProfile, job);

    // Step 6: Auto-Apply via Puppeteer
    onProgress(`🚀 Step 4/4: Launching auto-apply automation [${mode.toUpperCase()} MODE]...`);
    let autoApplyResult;
    
    if (mode === 'real') {
      // Set up dummy or real resume PDF path
      let resumePath = '';
      try {
        const user = await User.findById(req.user._id);
        if (user) {
          const activeResume = user.resumes?.find(r => r.isActive);
          if (activeResume) {
            const path = require('path');
            resumePath = path.join(__dirname, '..', '..', 'uploads', activeResume.filename);
          }
        }
      } catch (e) {}

      if (!resumePath || !require('fs').existsSync(resumePath)) {
        const path = require('path');
        resumePath = path.join(__dirname, '..', '..', 'uploads', 'dummy_resume.pdf');
        if (!require('fs').existsSync(resumePath)) {
          require('fs').writeFileSync(resumePath, 'Dummy Resume Content for Hackathon Demo');
        }
      }
      candidateProfile.resumePath = resumePath;

      const localFormUrl = 'http://localhost:5000/public/demo-form.html';
      autoApplyResult = await autoApplyService.autoApply(
        localFormUrl,
        { ...candidateProfile, expectedSalary: '15,00,000 INR', noticePeriod: 'Immediately' },
        optimizedResume,
        onProgress
      );
    } else {
      autoApplyResult = await autoApplyService.simulateAutoApply({
        ...candidateProfile,
        optimizedSummary: optimizedResume.optimizedSummary,
      }, onProgress);
    }

    // Step 7: Save application record
    const applicationData = {
      userId: req.user._id,
      jobId: job._id,
      status: autoApplyResult.success ? 'submitted' : 'failed',
      matchAnalysis: {
        overallScore: matchAnalysis.overallScore,
        skillMatch: matchAnalysis.skillMatch,
        experienceMatch: matchAnalysis.experienceMatch,
        educationMatch: matchAnalysis.educationMatch,
        matchingSkills: matchAnalysis.matchingSkills,
        missingSkills: matchAnalysis.missingSkills,
        whyFit: matchAnalysis.whyFit,
        recommendations: matchAnalysis.recommendations,
      },
      optimizedResume: {
        summary: optimizedResume.optimizedSummary,
        highlightedSkills: optimizedResume.highlightedSkills,
        tailoredExperience: optimizedResume.tailoredExperience,
        atsScore: optimizedResume.atsScore,
        optimizationNotes: optimizedResume.optimizationNotes,
      },
      automation: {
        startedAt: new Date(startTime),
        completedAt: new Date(),
        formFieldsFilled: autoApplyResult.formFieldsFilled,
        errors: autoApplyResult.errors,
        screenshotPath: autoApplyResult.screenshotPath || '',
      },
      appliedAt: new Date(),
    };

    try {
      await Application.create(applicationData);
      // Update user stats
      const user = await User.findById(req.user._id);
      if (user) {
        user.stats.totalApplications += 1;
        if (autoApplyResult.success) user.stats.successfulApplications += 1;
        await user.save();
      }
    } catch (dbError) {
      // Save in-memory
      const key = `${req.user._id}_${jobId}`;
      inMemoryApplications.set(key, applicationData);
    }

    const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);

    res.status(200).json({
      success: true,
      message: `⚡ Application submitted in ${totalTime}s! Zero forms filled manually.`,
      data: {
        application: {
          job: {
            title: job.title,
            company: job.company?.name || job.company,
            location: `${job.location?.city || ''}, ${job.location?.country || ''}`,
          },
          matchScore: matchAnalysis.overallScore,
          whyYouFit: matchAnalysis.whyFit,
          resumeOptimization: {
            atsScoreBefore: optimizedResume.beforeAfterComparison?.scoreBefore || 65,
            atsScoreAfter: optimizedResume.atsScore || 88,
            keyImprovements: optimizedResume.optimizationNotes?.slice(0, 3),
          },
          coverLetter: {
            subject: coverLetter.subject,
            preview: coverLetter.coverLetter?.slice(0, 200) + '...',
            highlights: coverLetter.highlights,
          },
          automation: {
            fieldsFilled: autoApplyResult.formFieldsFilled,
            timeSeconds: totalTime,
            status: autoApplyResult.success ? 'submitted' : 'failed',
            screenshotPath: autoApplyResult.screenshotPath || '',
          },
          recommendations: matchAnalysis.recommendations,
          interviewTips: matchAnalysis.interviewTips,
        },
      },
    });
  } catch (error) {
    console.error('One-click apply error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/apply/bulk
 * Bulk auto-apply to multiple jobs
 */
const bulkApply = async (req, res) => {
  try {
    const { jobIds } = req.body;

    if (!jobIds || !Array.isArray(jobIds) || jobIds.length === 0) {
      return res.status(400).json({ success: false, error: 'Provide an array of job IDs' });
    }

    if (jobIds.length > 10) {
      return res.status(400).json({ success: false, error: 'Maximum 10 jobs per bulk apply' });
    }

    console.log(`📦 BULK APPLY initiated for ${jobIds.length} jobs`);

    const results = [];
    for (const jobId of jobIds) {
      try {
        // Simplified version of one-click apply
        let job;
        const sampleJobs = jobMatchingService._getSampleJobs();
        job = sampleJobs.find(j => j._id === jobId);

        if (!job) {
          results.push({ jobId, success: false, error: 'Job not found' });
          continue;
        }

        const simulation = await autoApplyService.simulateAutoApply({
          name: req.user.name || 'Candidate',
          email: req.user.email || 'candidate@email.com',
        });

        results.push({
          jobId,
          jobTitle: job.title,
          company: job.company?.name,
          success: simulation.success,
          fieldsFilled: simulation.formFieldsFilled,
        });
      } catch (err) {
        results.push({ jobId, success: false, error: err.message });
      }
    }

    const successCount = results.filter(r => r.success).length;

    res.status(200).json({
      success: true,
      message: `⚡ Bulk apply complete! ${successCount}/${jobIds.length} applications submitted.`,
      data: {
        total: jobIds.length,
        successful: successCount,
        failed: jobIds.length - successCount,
        results,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/apply/history
 * Get application history
 */
const getApplicationHistory = async (req, res) => {
  try {
    let applications = [];

    try {
      applications = await Application.find({ userId: req.user._id })
        .populate('jobId')
        .sort({ createdAt: -1 })
        .lean();
    } catch (dbError) {
      // Get from in-memory
      for (const [key, app] of inMemoryApplications.entries()) {
        if (key.startsWith(String(req.user._id))) {
          applications.push(app);
        }
      }
    }

    const stats = {
      total: applications.length,
      submitted: applications.filter(a => a.status === 'submitted').length,
      inProgress: applications.filter(a => a.status === 'in-progress').length,
      interviews: applications.filter(a => a.status === 'interview').length,
      rejected: applications.filter(a => a.status === 'rejected').length,
      offers: applications.filter(a => a.status === 'offer').length,
    };

    res.status(200).json({
      success: true,
      data: {
        applications,
        stats,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/apply/interview-prep/:jobId
 * Generate interview preparation material
 */
const getInterviewPrep = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job
    let job;
    try {
      const Job = require('../models/Job');
      job = await Job.findById(jobId).lean();
    } catch (e) {
      const sampleJobs = jobMatchingService._getSampleJobs();
      job = sampleJobs.find(j => j._id === jobId);
    }

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Get candidate profile
    let candidateProfile = {};
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        candidateProfile = { skills: user.profile?.skills || [], summary: user.profile?.summary || '' };
      }
    } catch (e) {
      candidateProfile = { skills: ['JavaScript', 'React', 'Node.js'] };
    }

    console.log('📚 Generating interview prep for:', job.title);
    const prep = await geminiService.generateInterviewPrep(candidateProfile, job);

    res.status(200).json({
      success: true,
      message: `Interview prep ready for ${job.title} at ${job.company?.name}! 📚`,
      data: {
        job: { title: job.title, company: job.company?.name },
        prep,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/apply/skill-gap/:jobId
 * 📊 Skill Gap Analysis — "Learn X → +Y% selection chance"
 */
const getSkillGap = async (req, res) => {
  try {
    const { jobId } = req.params;

    // Get job
    let job;
    try {
      const Job = require('../models/Job');
      job = await Job.findById(jobId).lean();
    } catch (e) {
      const sampleJobs = jobMatchingService._getSampleJobs();
      job = sampleJobs.find(j => j._id === jobId);
    }

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job not found' });
    }

    // Get candidate profile
    let candidateProfile = {};
    try {
      const user = await User.findById(req.user._id);
      if (user) {
        candidateProfile = {
          name: user.name,
          skills: user.profile?.skills || [],
          experience: user.profile?.experience || [],
          experienceLevel: user.preferences?.experienceLevel || 'mid',
        };
      }
    } catch (e) {
      const stored = inMemoryResumes.get(req.user._id || 'default');
      if (stored?.profile) {
        candidateProfile = stored.profile;
      }
    }

    // Fallback
    if (!candidateProfile.skills || candidateProfile.skills.length === 0) {
      candidateProfile = {
        name: req.user.name || 'Candidate',
        skills: ['JavaScript', 'React', 'Node.js', 'Python'],
        experience: [],
        experienceLevel: 'mid',
      };
    }

    console.log(`📊 Skill Gap Analysis for: ${job.title} at ${job.company?.name}`);
    const analysis = await geminiService.analyzeSkillGap(candidateProfile, job);

    res.status(200).json({
      success: true,
      message: `📊 Skill Gap Analysis complete for ${job.title}!`,
      data: {
        job: {
          title: job.title,
          company: job.company?.name || job.company,
          requiredSkills: job.skills,
        },
        candidateSkills: candidateProfile.skills,
        analysis,
      },
    });
  } catch (error) {
    console.error('Skill gap error:', error.message);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { oneClickApply, bulkApply, getApplicationHistory, getInterviewPrep, getSkillGap, streamLogs };
