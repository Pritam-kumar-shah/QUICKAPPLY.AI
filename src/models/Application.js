// ============================================
// ApplyFlow.ai — Application Model
// ============================================

const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
  },

  // Application status lifecycle
  status: {
    type: String,
    enum: ['queued', 'in-progress', 'submitted', 'failed', 'interview', 'rejected', 'offer'],
    default: 'queued',
  },

  // AI matching analysis
  matchAnalysis: {
    overallScore: { type: Number, default: 0 }, // 0-100
    skillMatch: { type: Number, default: 0 },
    experienceMatch: { type: Number, default: 0 },
    educationMatch: { type: Number, default: 0 },
    matchingSkills: [{ type: String }],
    missingSkills: [{ type: String }],
    whyFit: { type: String, default: '' }, // AI-generated "Why you're a fit" paragraph
    recommendations: [{ type: String }],
  },

  // Optimized resume data for THIS specific job
  optimizedResume: {
    summary: { type: String, default: '' },
    highlightedSkills: [{ type: String }],
    tailoredExperience: [{ type: String }],
    atsScore: { type: Number, default: 0 },
    optimizationNotes: [{ type: String }],
  },

  // Auto-apply tracking
  automation: {
    startedAt: Date,
    completedAt: Date,
    screenshotPath: { type: String, default: '' },
    formFieldsFilled: { type: Number, default: 0 },
    errors: [{ type: String }],
    retryCount: { type: Number, default: 0 },
  },

  appliedAt: { type: Date },
  notes: { type: String, default: '' },
}, {
  timestamps: true,
});

// Prevent duplicate applications
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
