// ============================================
// ApplyFlow.ai — User Model
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: 100,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
    select: false, // Never return password in queries
  },
  phone: { type: String, trim: true },
  location: { type: String, trim: true },
  linkedinUrl: { type: String, trim: true },
  githubUrl: { type: String, trim: true },
  portfolioUrl: { type: String, trim: true },

  // Parsed resume data (populated by AI)
  profile: {
    summary: { type: String, default: '' },
    skills: [{ type: String }],
    experience: [{
      title: String,
      company: String,
      duration: String,
      description: String,
    }],
    education: [{
      degree: String,
      institution: String,
      year: String,
    }],
    certifications: [{ type: String }],
    projects: [{
      name: String,
      description: String,
      techStack: [String],
    }],
  },

  // Resume file references
  resumes: [{
    filename: String,
    originalName: String,
    uploadedAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
    atsScore: { type: Number, default: 0 },
  }],

  // Job preferences
  preferences: {
    desiredRoles: [{ type: String }],
    desiredLocations: [{ type: String }],
    salaryRange: {
      min: Number,
      max: Number,
      currency: { type: String, default: 'INR' },
    },
    jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
      default: 'full-time',
    },
    experienceLevel: {
      type: String,
      enum: ['fresher', 'junior', 'mid', 'senior', 'lead'],
      default: 'fresher',
    },
    willingToRelocate: { type: Boolean, default: false },
  },

  // Stats
  stats: {
    totalApplications: { type: Number, default: 0 },
    successfulApplications: { type: Number, default: 0 },
    pendingApplications: { type: Number, default: 0 },
    rejectedApplications: { type: Number, default: 0 },
    interviewsCalled: { type: Number, default: 0 },
  },
}, {
  timestamps: true,
});

// Hash password before save
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
