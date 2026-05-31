// ============================================
// QuickApply.AI — API Client
// ============================================

const API_BASE = 'http://localhost:5000/api';

const getHeaders = () => {
  const token = localStorage.getItem('quickapply_token') || localStorage.getItem('applyflow_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const api = {
  // Auth
  register: async (data) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    });
    return res.json();
  },

  getMe: async () => {
    const res = await fetch(`${API_BASE}/auth/me`, { headers: getHeaders() });
    return res.json();
  },

  // Jobs
  getJobs: async (params = '') => {
    const res = await fetch(`${API_BASE}/jobs?${params}`, { headers: getHeaders() });
    return res.json();
  },

  getMatchedJobs: async () => {
    const res = await fetch(`${API_BASE}/jobs/match/me?limit=10&analyze=true`, { headers: getHeaders() });
    return res.json();
  },

  // Apply
  oneClickApply: async (jobId, mode = 'simulation') => {
    const res = await fetch(`${API_BASE}/apply/one-click`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ jobId, mode }),
    });
    return res.json();
  },

  getSkillGap: async (jobId) => {
    const res = await fetch(`${API_BASE}/apply/skill-gap/${jobId}`, {
      method: 'POST', headers: getHeaders(),
    });
    return res.json();
  },

  getInterviewPrep: async (jobId) => {
    const res = await fetch(`${API_BASE}/apply/interview-prep/${jobId}`, {
      method: 'POST', headers: getHeaders(),
    });
    return res.json();
  },

  getHistory: async () => {
    const res = await fetch(`${API_BASE}/apply/history`, { headers: getHeaders() });
    return res.json();
  },

  // Dashboard
  getDashboard: async () => {
    const res = await fetch(`${API_BASE}/dashboard`, { headers: getHeaders() });
    return res.json();
  },

  getInsights: async () => {
    const res = await fetch(`${API_BASE}/dashboard/insights`, { headers: getHeaders() });
    return res.json();
  },

  // Resume
  uploadResume: async (file) => {
    const token = localStorage.getItem('quickapply_token') || localStorage.getItem('applyflow_token');
    const formData = new FormData();
    formData.append('resume', file);
    const res = await fetch(`${API_BASE}/resume/upload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    return res.json();
  },

  optimizeResume: async (data) => {
    const res = await fetch(`${API_BASE}/resume/optimize`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(data),
    });
    return res.json();
  },

  // AI Resume Generation
  generateResume: async (profileData) => {
    const res = await fetch(`${API_BASE}/resume/generate`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify(profileData),
    });
    return res.json();
  },

  enhanceDescription: async (text, type = 'experience') => {
    const res = await fetch(`${API_BASE}/resume/enhance`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ text, type }),
    });
    return res.json();
  },

  // AI Magic Profile Auto-Fill
  autoFillProfile: async (prompt) => {
    const res = await fetch(`${API_BASE}/resume/auto-fill`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ prompt }),
    });
    return res.json();
  },

  // AI Interview Simulator
  startInterview: async (jobId) => {
    const res = await fetch(`${API_BASE}/apply/interview/start`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ jobId }),
    });
    return res.json();
  },

  submitInterviewAnswer: async (jobId, answerText) => {
    const res = await fetch(`${API_BASE}/apply/interview/answer`, {
      method: 'POST', headers: getHeaders(), body: JSON.stringify({ jobId, answerText }),
    });
    return res.json();
  },

  // Health
  health: async () => {
    const res = await fetch(`${API_BASE}/health`);
    return res.json();
  },
};

export default api;
