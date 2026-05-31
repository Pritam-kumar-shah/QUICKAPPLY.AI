// ============================================
// ApplyFlow.ai — Seed Sample Jobs to MongoDB
// Run: npm run seed
// ============================================

const mongoose = require('mongoose');
const config = require('../config/index');
const Job = require('../models/Job');

const sampleJobs = [
  {
    title: 'Senior Full Stack Developer',
    company: { name: 'Razorpay', logo: '', website: 'https://razorpay.com', industry: 'FinTech' },
    description: 'Build and scale payment infrastructure serving millions of merchants. Work with React, Node.js, and microservices architecture on our core platform.',
    requirements: ['5+ years of software development', 'Expert in React and Node.js', 'Experience with distributed systems'],
    responsibilities: ['Design and implement scalable APIs', 'Lead technical architecture decisions', 'Mentor junior developers'],
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
  },
  {
    title: 'Frontend Engineer - React',
    company: { name: 'Swiggy', logo: '', website: 'https://swiggy.com', industry: 'FoodTech' },
    description: 'Join the consumer experience team to build intuitive, performant UI for 50M+ users. Work on order tracking, search, and restaurant discovery features.',
    requirements: ['3+ years React experience', 'Strong CSS/animation skills', 'Experience with state management'],
    responsibilities: ['Build reusable UI components', 'Optimize web performance', 'Collaborate with design team'],
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
  },
  {
    title: 'Machine Learning Engineer',
    company: { name: 'Flipkart', logo: '', website: 'https://flipkart.com', industry: 'E-Commerce' },
    description: 'Design and deploy ML models for product recommendations, search ranking, and fraud detection. Work with large-scale data pipelines.',
    requirements: ['MS/PhD in CS or related field', 'Strong ML fundamentals', '2+ years industry ML experience'],
    responsibilities: ['Build and deploy ML models', 'Design data pipelines', 'Research new algorithms'],
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
  },
  {
    title: 'Software Development Engineer - Fresher',
    company: { name: 'Google', logo: '', website: 'https://google.com', industry: 'Technology' },
    description: 'Join Google as a new graduate SDE. Work on products used by billions of people worldwide.',
    requirements: ['B.Tech/M.Tech in CS', 'Strong DSA skills', 'Experience with at least one programming language'],
    responsibilities: ['Design and implement features', 'Write clean maintainable code', 'Participate in code reviews'],
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
  },
  {
    title: 'DevOps Engineer',
    company: { name: 'PhonePe', logo: '', website: 'https://phonepe.com', industry: 'FinTech' },
    description: 'Manage infrastructure for India\'s largest UPI platform. Build CI/CD pipelines, manage Kubernetes clusters.',
    requirements: ['3+ years DevOps experience', 'Expert in Kubernetes and Docker', 'AWS/GCP certification preferred'],
    responsibilities: ['Manage cloud infrastructure', 'Build automation tools', 'Ensure system reliability'],
    skills: ['Kubernetes', 'Docker', 'AWS', 'Terraform', 'Jenkins', 'CI/CD', 'Linux', 'Monitoring', 'Python'],
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India', remote: false },
    salary: { min: 2000000, max: 3800000, currency: 'INR', period: 'yearly' },
    type: 'full-time',
    experienceLevel: 'mid',
    experienceYears: { min: 3, max: 7 },
    applicationUrl: 'https://phonepe.com/careers',
    source: 'company-portal',
    aiKeywords: ['DevOps', 'infrastructure', 'CI/CD', 'cloud', 'reliability'],
    aiDifficultyScore: 65,
  },
];

const seedJobs = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ Connected to MongoDB');

    await Job.deleteMany({});
    console.log('🗑️  Cleared existing jobs');

    await Job.insertMany(sampleJobs);
    console.log(`✅ Seeded ${sampleJobs.length} sample jobs`);

    await mongoose.connection.close();
    console.log('✅ Done! Database seeded successfully.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedJobs();
