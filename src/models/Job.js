// ============================================
// ApplyFlow.ai — Job Model
// ============================================

const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    index: true,
  },
  company: {
    name: { type: String, required: true, trim: true },
    logo: { type: String, default: '' },
    website: { type: String, default: '' },
    industry: { type: String, default: '' },
  },
  description: {
    type: String,
    required: true,
  },
  requirements: [{ type: String }],
  responsibilities: [{ type: String }],
  skills: [{ type: String }],
  
  location: {
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    country: { type: String, default: 'India' },
    remote: { type: Boolean, default: false },
  },

  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'INR' },
    period: { type: String, enum: ['yearly', 'monthly', 'hourly'], default: 'yearly' },
  },

  type: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote', 'freelance'],
    default: 'full-time',
  },

  experienceLevel: {
    type: String,
    enum: ['fresher', 'junior', 'mid', 'senior', 'lead', 'executive'],
    default: 'mid',
  },

  experienceYears: {
    min: { type: Number, default: 0 },
    max: { type: Number, default: 99 },
  },

  applicationUrl: {
    type: String,
    required: true,
  },

  source: {
    type: String,
    enum: ['linkedin', 'naukri', 'indeed', 'glassdoor', 'company-portal', 'internal'],
    default: 'internal',
  },

  postedAt: { type: Date, default: Date.now },
  expiresAt: { type: Date },
  isActive: { type: Boolean, default: true },

  // AI-generated fields
  aiKeywords: [{ type: String }], // Extracted ATS keywords
  aiDifficultyScore: { type: Number, default: 50 }, // 0-100
}, {
  timestamps: true,
});

// Text index for search
jobSchema.index({ title: 'text', 'company.name': 'text', description: 'text' });
jobSchema.index({ skills: 1 });
jobSchema.index({ type: 1, experienceLevel: 1 });

module.exports = mongoose.model('Job', jobSchema);
