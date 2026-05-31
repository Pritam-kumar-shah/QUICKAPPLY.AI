// ============================================
// ApplyFlow.ai — Auth Controller
// Registration, Login, Profile
// ============================================

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// In-memory user store (for hackathon mode without MongoDB)
const inMemoryUsers = new Map();

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and password are required',
      });
    }

    let user;

    try {
      // Try MongoDB
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      user = await User.create({ name, email, password, phone, location });
    } catch (dbError) {
      // Fallback: in-memory
      if (inMemoryUsers.has(email)) {
        return res.status(400).json({ success: false, error: 'Email already registered' });
      }

      const userId = `user_${Date.now()}`;
      user = {
        _id: userId,
        name,
        email,
        phone: phone || '',
        location: location || '',
        profile: { summary: '', skills: [], experience: [], education: [], certifications: [], projects: [] },
        resumes: [],
        preferences: {},
        stats: { totalApplications: 0, successfulApplications: 0, pendingApplications: 0, rejectedApplications: 0, interviewsCalled: 0 },
        createdAt: new Date(),
      };
      inMemoryUsers.set(email, { ...user, password });
    }

    const token = generateToken(user._id, { email: user.email, name: user.name });

    res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to QuickApply.AI 🚀',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          location: user.location,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * POST /api/auth/login
 * Login user
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    let user;
    let isMatch = false;

    try {
      // Try MongoDB
      user = await User.findOne({ email }).select('+password');
      if (user) {
        isMatch = await user.comparePassword(password);
      }
    } catch (dbError) {
      // Fallback: in-memory
      const storedUser = inMemoryUsers.get(email);
      if (storedUser) {
        isMatch = storedUser.password === password;
        if (isMatch) {
          user = { ...storedUser };
          delete user.password;
        }
      }
    }

    if (!user || !isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = generateToken(user._id, { email: user.email, name: user.name });

    res.status(200).json({
      success: true,
      message: 'Login successful! ✅',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
        token,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * GET /api/auth/me
 * Get current user profile
 */
const getMe = async (req, res) => {
  try {
    let user = null;

    try {
      user = await User.findById(req.user._id).lean();
    } catch (dbError) {
      // Find in in-memory users
      const stored = Array.from(inMemoryUsers.values()).find(u => u._id === req.user._id);
      if (stored) {
        user = { ...stored };
      } else {
        user = { _id: req.user._id, name: req.user.name, email: req.user.email };
      }
    }

    if (user) {
      // Merge in-memory resume profile if exists
      try {
        const { inMemoryResumes } = require('./resumeController');
        const inMemResume = inMemoryResumes.get(user._id || 'default');
        if (inMemResume) {
          user.profile = inMemResume.profile;
          if (!user.resumes) user.resumes = [];
          const exists = user.resumes.some(r => r.filename === inMemResume.resume.filename);
          if (!exists) {
            user.resumes.forEach(r => r.isActive = false);
            user.resumes.push(inMemResume.resume);
          }
        }
      } catch (e) {
        console.log('InMemory resume merging error:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * PUT /api/auth/preferences
 * Update user job preferences
 */
const updatePreferences = async (req, res) => {
  try {
    const { desiredRoles, desiredLocations, salaryRange, jobType, experienceLevel, willingToRelocate } = req.body;

    let user;
    try {
      user = await User.findById(req.user._id);
      if (user) {
        user.preferences = {
          ...user.preferences,
          desiredRoles: desiredRoles || user.preferences.desiredRoles,
          desiredLocations: desiredLocations || user.preferences.desiredLocations,
          salaryRange: salaryRange || user.preferences.salaryRange,
          jobType: jobType || user.preferences.jobType,
          experienceLevel: experienceLevel || user.preferences.experienceLevel,
          willingToRelocate: willingToRelocate !== undefined ? willingToRelocate : user.preferences.willingToRelocate,
        };
        await user.save();
      }
    } catch (dbError) {
      user = req.user;
      user.preferences = { desiredRoles, desiredLocations, salaryRange, jobType, experienceLevel, willingToRelocate };
    }

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      data: { preferences: user.preferences },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { register, login, getMe, updatePreferences, inMemoryUsers };
