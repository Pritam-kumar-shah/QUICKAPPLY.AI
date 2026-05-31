// ============================================
// QuickApply.AI — Seed Showcase User to MongoDB
// Run: node src/scripts/seedUser.js
// ============================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const config = require('../config/index');
const User = require('../models/User');

const seedUser = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    // Remove existing demo user if any
    await User.deleteMany({ email: { $in: ['demo@quickapply.ai', 'demo@applyflow.ai'] } });
    console.log('🗑️  Cleared existing demo user');

    // Create premium showcase user
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const demoUser = {
      name: 'Pritam Kumar Shah',
      email: 'demo@quickapply.ai',
      password: hashedPassword,
      phone: '+91 98765 43210',
      location: 'Bangalore, Karnataka, India',
      linkedinUrl: 'https://linkedin.com/in/pritam-shah',
      githubUrl: 'https://github.com/pritam-shah',
      portfolioUrl: 'https://pritam.dev',
      profile: {
        summary: 'Innovative Full-Stack Software Engineer with 2+ years of hands-on experience building scale-ready web applications, microservices, and elegant web solutions. Passionate about cybernetic UI, automation scripting, and AI-driven products.',
        skills: [
          'React',
          'Node.js',
          'TypeScript',
          'Python',
          'FastAPI',
          'MongoDB',
          'PostgreSQL',
          'Docker',
          'Kubernetes',
          'AWS',
          'TailwindCSS',
          'Puppeteer'
        ],
        experience: [
          {
            title: 'SDE Intern',
            company: 'Razorpay',
            duration: 'Jan 2026 - Present',
            description: 'Integrated robust checkout microservices serving 10M+ daily hits. Optimized transaction API latency by 18% using Redis caching and bulk queries.'
          },
          {
            title: 'Web Developer Intern',
            company: 'Swiggy',
            duration: 'Jul 2025 - Dec 2025',
            description: 'Refactored internal merchant dashboards using React, Redux Toolkit, and standard Tailwind layouts. Achieved a 98% Lighthouse performance index.'
          }
        ],
        education: [
          {
            degree: 'B.Tech in Computer Science',
            institution: 'Indian Institute of Information Technology',
            year: '2022 - 2026'
          }
        ],
        certifications: [
          'AWS Certified Cloud Practitioner',
          'Google Professional Data Engineer'
        ],
        projects: [
          {
            name: 'QuickApply.AI',
            description: 'AI-powered hackathon portal executing background Puppeteer applications and generating real-time recruting dashboards.',
            techStack: ['React', 'Node.js', 'Puppeteer', 'Gemini AI']
          },
          {
            name: 'Cybernetic HUD Portfolio',
            description: 'A sci-fi glassmorphic dashboard showcasing responsive UI/UX projects with heavy WebGL/Three.js interactivity.',
            techStack: ['Three.js', 'React', 'TailwindCSS']
          }
        ]
      },
      preferences: {
        desiredRoles: ['Full Stack Developer', 'Software Engineer', 'Frontend Engineer'],
        desiredLocations: ['Bangalore', 'Remote', 'Mumbai'],
        salaryRange: {
          min: 1500000,
          max: 3000000,
          currency: 'INR'
        },
        jobType: 'full-time',
        experienceLevel: 'junior',
        willingToRelocate: true
      },
      stats: {
        totalApplications: 14,
        successfulApplications: 4,
        pendingApplications: 8,
        rejectedApplications: 2,
        interviewsCalled: 3
      }
    };

    await User.create(demoUser);
    console.log('✅ Seeded showcase demo user (demo@quickapply.ai / password123)');

    await mongoose.connection.close();
    console.log('✅ Done! Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.stack);
    process.exit(1);
  }
};

seedUser();
