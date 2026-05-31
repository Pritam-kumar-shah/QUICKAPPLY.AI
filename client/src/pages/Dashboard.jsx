import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Zap, BarChart3, FileText,
  LogOut, Search, TrendingUp, Target, BookOpen, ChevronRight,
  CheckCircle2, AlertTriangle, Clock, Sparkles, Shield, ArrowUpRight,
  Upload, History, RefreshCw, X, ExternalLink, Menu, UserCircle, Mic
} from 'lucide-react'
import api from '../api'

/* ═══════════════════════════════════════════
   AI SCANNER OVERLAY — Jarvis-style animation
   ═══════════════════════════════════════════ */
function AIScanner({ steps, currentStep, status, liveLogs = [] }) {
  const terminalEndRef = useRef(null)
  
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [liveLogs])

  return (
    <motion.div
      className="ai-scanner-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div
        className="scanner-ring"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
      >
        <div className="scanner-dot" />
      </motion.div>

      <motion.div
        className="scanner-status"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {status === 'processing' ? 'AI AUTOMATION IN ACTION...' : status === 'done' ? '✓ SUBMISSION RECEIVED' : 'INITIALIZING...'}
      </motion.div>

      {/* Modern Live Log Terminal */}
      <motion.div 
        className="hud-card"
        style={{ 
          width: '90%', 
          maxWidth: '600px', 
          background: 'rgba(5, 8, 15, 0.95)', 
          border: '1px solid var(--border-active)', 
          boxShadow: '0 0 20px rgba(0, 240, 255, 0.2)',
          padding: 16,
          marginTop: 20,
          fontFamily: 'var(--font-mono)'
        }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0, 240, 255, 0.1)', paddingBottom: 6, marginBottom: 10 }}>
          <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--hud-cyan)' }}>📟 LIVE AUTOMATION TERMINAL // SECURE_PACKET_LINK</span>
          <span style={{ fontSize: '0.55rem', color: 'rgba(0, 240, 255, 0.4)' }}>LOGGING_ON</span>
        </div>
        <div style={{ 
          height: '180px', 
          overflowY: 'auto', 
          fontSize: '0.72rem', 
          lineHeight: 1.5, 
          color: 'var(--hud-green)', 
          textShadow: '0 0 4px rgba(0, 255, 136, 0.3)',
          textAlign: 'left',
          paddingRight: 6
        }}>
          {liveLogs.map((log, idx) => (
            <div key={idx} style={{ marginBottom: 4 }}>
              <span style={{ color: 'rgba(0, 255, 136, 0.5)' }}>&gt;</span> {log}
            </div>
          ))}
          {liveLogs.length === 0 && (
            <div style={{ color: 'rgba(0, 240, 255, 0.4)' }}>&gt; Awaiting initial frame handshake...</div>
          )}
          <div ref={terminalEndRef} />
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   ATS GAUGE — Circular SVG progress
   ═══════════════════════════════════════════ */
function ATSGauge({ score, size = 180 }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 80 ? '#00ff88' : score >= 60 ? '#00f0ff' : '#ff6600'

  return (
    <div className="ats-gauge" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`atsGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00f0ff" />
            <stop offset="50%" stopColor="#0066ff" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
        </defs>
        <circle className="ats-gauge-bg" cx={size/2} cy={size/2} r={radius} />
        <motion.circle
          className="ats-gauge-fill"
          cx={size/2} cy={size/2} r={radius}
          strokeDasharray={circumference}
          stroke={`url(#atsGrad-${size})`}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        />
      </svg>
      <div className="ats-score-text">
        <motion.span
          className="ats-score-number"
          style={{ color }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          {score}
        </motion.span>
        <span className="ats-score-label">ATS SCORE</span>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════
   STAT CARD — Animated number display
   ═══════════════════════════════════════════ */
function StatCard({ label, value, icon: Icon, color, delay = 0, subtext }) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -4 }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={color ? {
            background: `linear-gradient(135deg, ${color}, ${color}88)`,
            WebkitBackgroundClip: 'text', backgroundClip: 'text', WebkitTextFillColor: 'transparent'
          } : {}}>
            {value}
          </div>
          {subtext && <div className="stat-change">{subtext}</div>}
        </div>
        {Icon && (
          <div style={{
            width: 36, height: 36, borderRadius: 8,
            background: `${color || 'rgba(0,240,255,0.1)'}15`,
            border: `1px solid ${color || 'rgba(0,240,255,0.2)'}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Icon size={18} color={color || '#00f0ff'} />
          </div>
        )}
      </div>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   TOAST COMPONENT — Cybernetic overlay toast
   ═══════════════════════════════════════════ */
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <motion.div
      className={`hud-toast ${type}`}
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        background: 'rgba(5, 8, 15, 0.95)',
        border: `1px solid ${type === 'success' ? 'var(--hud-green, #00ff88)' : type === 'error' ? 'var(--hud-red, #ff3366)' : 'var(--hud-cyan, #00f0ff)'}`,
        boxShadow: `0 0 20px ${type === 'success' ? 'rgba(0, 255, 136, 0.2)' : type === 'error' ? 'rgba(255, 51, 102, 0.2)' : 'rgba(0, 240, 255, 0.2)'}`,
        padding: '12px 20px',
        borderRadius: 4,
        color: '#e0f0ff',
        fontFamily: 'var(--font-display, sans-serif)',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: 10
      }}
    >
      <span>{type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <div style={{ flex: 1 }}>{message}</div>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ff3366', cursor: 'pointer', fontSize: '1rem', marginLeft: 10, padding: 0 }}>×</button>
    </motion.div>
  )
}

/* ═══════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════ */
export default function Dashboard({ onLogout }) {
  const navigate = useNavigate()
  
  // Retrieve user from localStorage
  const [user, setUser] = useState(null)
  useEffect(() => {
    try {
      const stored = localStorage.getItem('applyflow_user') || localStorage.getItem('quickapply_user')
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (e) {
      console.error('Error parsing stored user data', e)
    }
  }, [])

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeView, setActiveView] = useState('dashboard')
  const [dashStats, setDashStats] = useState(null)
  const [jobs, setJobs] = useState([])
  const [applyHistory, setApplyHistory] = useState([])
  const [scanning, setScanning] = useState(false)
  const [scanSteps, setScanSteps] = useState([])
  const [scanStep, setScanStep] = useState(0)
  const [scanStatus, setScanStatus] = useState('idle')
  const [matchedJobs, setMatchedJobs] = useState([])
  const [toast, setToast] = useState(null)
  const [liveLogs, setLiveLogs] = useState([])
  const [applyResult, setApplyResult] = useState(null)
  const [interviewJob, setInterviewJob] = useState(null)
  const [interviewFinished, setInterviewFinished] = useState(false)
  const [interviewScorecard, setInterviewScorecard] = useState(null)
  const [interviewHistory, setInterviewHistory] = useState([])
  const [interviewLoading, setInterviewLoading] = useState(false)
  const [interviewInput, setInterviewInput] = useState('')
  const [selectedJob, setSelectedJob] = useState(null)
  const [skillGap, setSkillGap] = useState(null)
  const [loadingAction, setLoadingAction] = useState(null)
  const [uploadStatus, setUploadStatus] = useState('idle')
  const [applyMode, setApplyMode] = useState('simulation')
  const [atsReportModal, setAtsReportModal] = useState(false)
  const [atsReportData, setAtsReportData] = useState(null)

  const fileInputRef = useRef(null)
  const closeSidebar = () => setSidebarOpen(false)
  const switchView = (id) => { setActiveView(id); closeSidebar(); }

  // ── Load initial data ──
  useEffect(() => {
    loadDashboard()
    loadJobs()
    loadHistory()
  }, [])

  const loadDashboard = async () => {
    try {
      const res = await api.getDashboard()
      if (res.success) setDashStats(res.data)
    } catch (e) { /* fallback */ }
  }

  const loadJobs = async () => {
    try {
      const res = await api.getJobs()
      if (res.success) setJobs(res.data.jobs || [])
    } catch (e) { console.error('Failed to load jobs') }
  }

  const loadHistory = async () => {
    try {
      const res = await api.getHistory()
      if (res.success) setApplyHistory(res.data?.applications || [])
    } catch (e) { /* no history yet */ }
  }

  // ── Scanner Animation ──
  const runScanner = (steps) => {
    return new Promise((resolve) => {
      setScanning(true)
      setScanSteps(steps)
      setScanStep(0)
      setScanStatus('processing')

      let step = 0
      const interval = setInterval(() => {
        step++
        setScanStep(step)
        if (step >= steps.length) {
          clearInterval(interval)
          setScanStatus('done')
          setTimeout(() => {
            setScanning(false)
            resolve()
          }, 500)
        }
      }, 700)
    })
  }

  // ── Action Handlers ──
  const handleMatchJobs = async () => {
    const scanPromise = runScanner([
      'Analyzing your profile...',
      'Scanning 10,000+ job listings...',
      'Running AI match algorithm...',
      'Calculating compatibility scores...',
      'Generating personalized reports...',
    ])

    const dataPromise = api.getMatchedJobs()

    const [, res] = await Promise.all([scanPromise, dataPromise])
    if (res?.success) {
      setMatchedJobs(res.data.matches || [])
      setToast({ message: `${res.data.matches?.length || 0} matched jobs found!`, type: 'success' })
    } else {
      setToast({ message: 'Match scan failed. Try again.', type: 'error' })
    }
    setActiveView('matched')
  }

  const handleOneClickApply = async (jobId, jobInfo) => {
    // Open EventSource SSE link before calling API
    const token = localStorage.getItem('quickapply_token') || localStorage.getItem('applyflow_token')
    const eventSource = new EventSource(`http://localhost:5000/api/apply/live-stream?token=${token}`)
    
    setLiveLogs([])
    setScanning(true)
    setScanStatus('processing')
    setScanSteps(['ESTABLISHING LIVE STREAM PACKET LINK...'])
    setScanStep(0)

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'log') {
          setLiveLogs(prev => [...prev, data.message])
          setScanSteps(prev => {
            const arr = [...prev]
            arr[0] = data.message
            return arr
          })
        }
      } catch (e) {
        console.error('Error parsing SSE event:', e)
      }
    }

    eventSource.onerror = (err) => {
      console.error('SSE Stream Error:', err)
      eventSource.close()
    }

    try {
      const res = await api.oneClickApply(jobId, applyMode)
      eventSource.close()
      
      if (res?.success) {
        setScanStatus('done')
        setTimeout(() => {
          setScanning(false)
          setApplyResult(res.data.application)
          setToast({ message: `⚡ Applied to ${res.data.application?.job?.title} in ${res.data.application?.automation?.timeSeconds}s!`, type: 'success' })
          loadHistory() // refresh history
          loadDashboard() // refresh stats
          setActiveView('result')
        }, 800)
      } else {
        setScanStatus('error')
        setToast({ message: res.error || 'Application failed. Please try again.', type: 'error' })
        setTimeout(() => setScanning(false), 2000)
      }
    } catch (err) {
      eventSource.close()
      setScanStatus('error')
      setToast({ message: 'Application failed. Is the server online?', type: 'error' })
      setTimeout(() => setScanning(false), 2000)
    }
  }

  // ── AI Interview Simulator Action Handlers ──
  const handleStartInterview = async (jobId, jobInfo) => {
    setInterviewJob(jobInfo)
    setInterviewFinished(false)
    setInterviewScorecard(null)
    setInterviewHistory([])
    setInterviewLoading(true)
    setActiveView('interview')
    closeSidebar()
    
    try {
      const res = await api.startInterview(jobId)
      if (res.success && res.data) {
        setInterviewHistory(res.data.history || [])
      } else {
        setToast({ message: res.error || 'Failed to start interview', type: 'error' })
      }
    } catch (e) {
      setToast({ message: 'Failed to start interview. Server error.', type: 'error' })
    }
    setInterviewLoading(false)
  }

  const handleSendInterviewAnswer = async (e) => {
    if (e) e.preventDefault()
    if (!interviewInput.trim() || interviewLoading) return

    const answer = interviewInput.trim()
    setInterviewInput('')
    // Append locally immediately for responsiveness
    setInterviewHistory(prev => [...prev, { role: 'candidate', text: answer }])
    setInterviewLoading(true)

    try {
      const res = await api.submitInterviewAnswer(interviewJob._id, answer)
      if (res.success && res.data) {
        setInterviewHistory(res.data.history || [])
        if (res.data.isFinished) {
          setInterviewFinished(true)
          setInterviewScorecard(res.data.scorecard)
        }
      } else {
        setToast({ message: res.error || 'Failed to submit answer', type: 'error' })
      }
    } catch (err) {
      setToast({ message: 'Failed to communicate with AI recruiter.', type: 'error' })
    }
    setInterviewLoading(false)
  }

  const handleSkillGap = async (jobId, job) => {
    setSelectedJob(job)

    const scanPromise = runScanner([
      'Extracting job requirements...',
      'Mapping your skillset...',
      'Calculating skill deficiencies...',
      'Estimating selection improvement...',
      'Building learning roadmap...',
    ])

    const dataPromise = api.getSkillGap(jobId)

    const [, res] = await Promise.all([scanPromise, dataPromise])
    if (res?.success) {
      setSkillGap(res.data.analysis)
      setToast({ message: '📊 Skill gap analysis complete!', type: 'info' })
    } else {
      setToast({ message: 'Skill gap analysis failed.', type: 'error' })
    }
    setActiveView('skillgap')
  }

  const handleResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setLoadingAction('upload')
    try {
      const res = await api.uploadResume(file)
      if (res.success) {
        setUploadStatus('success')
        const report = res.data?.atsReport || {
          score: res.data?.aiAnalysis?.atsScore || 72,
          grade: 'B',
          issues: res.data?.aiAnalysis?.atsIssues || [],
          strengths: res.data?.aiAnalysis?.atsStrengths || []
        }
        setAtsReportData(report)
        setAtsReportModal(true)
        setToast({ message: `Resume uploaded & analyzed! ATS Score: ${report.score}`, type: 'success' })
        setTimeout(() => setUploadStatus('idle'), 3000)
        loadDashboard()
      } else {
        setToast({ message: res.error || 'Upload failed', type: 'error' })
      }
    } catch (e) {
      setToast({ message: 'Upload failed. Is the backend running?', type: 'error' })
    }
    setLoadingAction(null)
    e.target.value = ''
  }

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'jobs', label: 'Browse Jobs', icon: Briefcase },
    { id: 'matched', label: 'AI Matches', icon: Target, badge: matchedJobs.length || null },
    { id: 'skillgap', label: 'Skill Gap', icon: TrendingUp },
    { id: 'interview', label: 'AI Interviewer', icon: Mic },
    { id: 'result', label: 'Apply Result', icon: Zap },
    { id: 'history', label: 'History', icon: History, badge: applyHistory.length || null },
  ]

  // ── Render ──
  return (
    <div className="app-container">
      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast key="toast" {...toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      {/* Scanner */}
      <AnimatePresence>
        {scanning && <AIScanner steps={scanSteps} currentStep={scanStep} status={scanStatus} liveLogs={liveLogs} />}
      </AnimatePresence>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" accept=".pdf,.doc,.docx" style={{ display: 'none' }} onChange={handleResumeUpload} />

      {/* Mobile Menu Button */}
      <button className="mobile-menu-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
        <Menu size={20} />
      </button>

      {/* Mobile Overlay */}
      <div className={`sidebar-overlay ${sidebarOpen ? 'show' : ''}`} onClick={closeSidebar} />

      <div className="dashboard-grid">
        {/* ═══ SIDEBAR ═══ */}
        <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-logo">
            <div className="logo-icon">⚡</div>
            <div className="logo-text">QUICKAPPLY.AI</div>
          </div>
          <div className="sidebar-tagline">// AI-POWERED JOB ENGINE</div>

          <div className="nav-section-label">NAVIGATION</div>
          {navItems.map(item => (
            <div
              key={item.id}
              className={`nav-item ${activeView === item.id ? 'active' : ''}`}
              onClick={() => switchView(item.id)}
            >
              <item.icon className="nav-icon" size={18} />
              {item.label}
              {item.badge && (
                <span style={{
                  marginLeft: 'auto', fontFamily: 'var(--font-display)', fontSize: '0.6rem',
                  background: 'rgba(0,240,255,0.15)', padding: '2px 6px', borderRadius: 3,
                  color: 'var(--hud-cyan)', fontWeight: 700,
                }}>{item.badge}</span>
              )}
            </div>
          ))}

          <div className="nav-section-label" style={{ marginTop: 8 }}>TOOLS</div>
          <div className="nav-item" onClick={() => { closeSidebar(); navigate('/profile'); }}>
            <UserCircle className="nav-icon" size={18} />
            Profile & Resume
          </div>

          <div style={{ flex: 1 }} />

          {/* User Card */}
          <div style={{
            padding: '14px', borderRadius: 4,
            background: 'rgba(0,240,255,0.03)',
            border: '1px solid rgba(0,240,255,0.1)',
            marginBottom: 10,
          }}>
            <div className="hud-label" style={{ marginBottom: 6 }}>LOGGED IN AS</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 600, color: 'var(--hud-cyan)' }}>
              {user?.name || 'Agent'}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.55rem', color: 'rgba(0,240,255,0.4)', marginTop: 2, wordBreak: 'break-all' }}>
              {user?.email || ''}
            </div>
          </div>

          <div className="nav-item" style={{ color: 'var(--hud-red)' }} onClick={onLogout}>
            <LogOut size={18} />
            Logout
          </div>
        </aside>

        {/* ═══ MAIN CONTENT ═══ */}
        <main className="main-content">
          <AnimatePresence mode="wait">

            {/* ── DASHBOARD VIEW ── */}
            {activeView === 'dashboard' && (
              <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="top-bar">
                  <div>
                    <div className="top-bar-title">COMMAND CENTER</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.4)', marginTop: 4 }}>
                      Welcome back, {user?.name || 'Agent'}. All systems operational.
                    </div>
                  </div>
                  <div className="top-bar-status"><div className="status-dot" /> ONLINE</div>
                </div>

                <div className="stats-grid">
                  <StatCard label="Applications" value={dashStats?.stats?.totalApplications || applyHistory.length || 0} icon={FileText} color="#00f0ff" delay={0.1} subtext={dashStats?.stats?.successfulApplications ? `${dashStats.stats.successfulApplications} successful` : null} />
                  <StatCard label="Jobs Available" value={jobs.length} icon={Briefcase} color="#a855f7" delay={0.2} subtext="Active listings" />
                  <StatCard label="ATS Score" value={dashStats?.stats?.atsScore || 72} icon={Shield} color="#00ff88" delay={0.3} subtext="Avg. compatibility" />
                  <StatCard label="AI Matches" value={matchedJobs.length} icon={Target} color="#ffd700" delay={0.4} subtext={matchedJobs.length ? 'Jobs found for you' : 'Run AI scan'} />
                </div>

                <div className="content-grid">
                  {/* ATS Gauge */}
                  <motion.div className="hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <div className="section-header">
                      <div className="section-title">ATS COMPATIBILITY</div>
                    </div>
                    <div className="ats-gauge-container">
                      <ATSGauge score={dashStats?.stats?.atsScore || 72} />
                      <div style={{ marginTop: 16, textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: (dashStats?.stats?.atsScore || 72) >= 80 ? '#00ff88' : '#00f0ff' }}>
                          GRADE: {(dashStats?.stats?.atsScore || 72) >= 90 ? 'A+' : (dashStats?.stats?.atsScore || 72) >= 80 ? 'A' : (dashStats?.stats?.atsScore || 72) >= 70 ? 'B+' : 'B'}
                        </div>
                        {!dashStats?.stats?.resumeUploaded && (
                          <motion.button
                            className="btn-hud"
                            style={{ marginTop: 12, fontSize: '0.65rem', padding: '8px 16px' }}
                            onClick={() => fileInputRef.current?.click()}
                            whileHover={{ scale: 1.03 }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Upload size={12} /> UPLOAD RESUME FOR REAL SCORE
                            </span>
                          </motion.button>
                        )}
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Actions */}
                  <motion.div className="hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                    <div className="section-header">
                      <div className="section-title">QUICK ACTIONS</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                      <motion.button className="btn-hud primary" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={handleMatchJobs} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Target size={16} /> FIND AI-MATCHED JOBS
                      </motion.button>
                      <motion.button className="btn-hud" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} onClick={() => setActiveView('jobs')} whileHover={{ scale: 1.02 }}>
                        <Briefcase size={16} /> BROWSE ALL JOBS
                      </motion.button>
                      <motion.button
                        className="btn-hud"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loadingAction === 'upload'}
                        whileHover={{ scale: 1.02 }}
                      >
                        <Upload size={16} /> {loadingAction === 'upload' ? 'UPLOADING...' : 'UPLOAD RESUME'}
                      </motion.button>
                    </div>

                    {/* System Status */}
                    <div style={{ marginTop: 20, padding: 14, borderRadius: 4, background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.08)' }}>
                      <div className="hud-label" style={{ marginBottom: 8 }}>SYSTEM STATUS</div>
                      {[
                        { name: 'Gemini AI Engine', status: 'ACTIVE' },
                        { name: 'Job Database', status: `${jobs.length} JOBS` },
                        { name: 'Auto-Apply Engine', status: 'READY' },
                      ].map((s, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', fontFamily: 'var(--font-mono)', fontSize: '0.65rem' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                          <span style={{ color: 'rgba(224,240,255,0.6)' }}>{s.name}</span>
                          <span style={{ marginLeft: 'auto', color: '#00ff88' }}>{s.status}</span>
                        </div>
                      ))}
                    </div>

                    {/* Profile Completion */}
                    {dashStats?.profileCompletion && (
                      <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                          <span className="hud-label">PROFILE COMPLETION</span>
                          <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.7rem', fontWeight: 700, color: 'var(--hud-cyan)' }}>
                            {dashStats.profileCompletion.percentage}%
                          </span>
                        </div>
                        <div className="progress-bar-container" style={{ height: 6 }}>
                          <motion.div
                            className="progress-bar-fill"
                            initial={{ width: 0 }}
                            animate={{ width: `${dashStats.profileCompletion.percentage}%` }}
                            transition={{ duration: 1.5, delay: 0.8 }}
                          />
                        </div>
                      </div>
                    )}
                  </motion.div>
                </div>

                {/* Recent Applications */}
                {applyHistory.length > 0 && (
                  <motion.div className="hud-card" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                    <div className="section-header">
                      <div className="section-title">RECENT APPLICATIONS</div>
                      <button className="btn-hud" style={{ fontSize: '0.6rem', padding: '4px 10px' }} onClick={() => setActiveView('history')}>VIEW ALL</button>
                    </div>
                    {applyHistory.slice(0, 3).map((app, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(0,240,255,0.06)' }}>
                        <CheckCircle2 size={16} color="#00ff88" />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.75rem', fontWeight: 600, color: 'var(--hud-white)' }}>
                            {app.matchAnalysis?.overallScore || 85}% Match
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.6rem', color: 'rgba(0,240,255,0.4)' }}>
                            {app.status}
                          </div>
                        </div>
                        <span className="skill-tag">{app.status}</span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* ── JOBS VIEW ── */}
            {activeView === 'jobs' && (
              <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="top-bar">
                  <div>
                    <div className="top-bar-title">JOB DATABASE</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.4)', marginTop: 4 }}>
                      {jobs.length} active listings • Click any job to apply instantly
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    {/* Hackathon Mode Toggle Selector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(0,240,255,0.03)', border: '1px solid rgba(0,240,255,0.1)', padding: '4px 8px', borderRadius: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(0,240,255,0.5)' }}>AUTOMATION_MODE:</span>
                      <button 
                        className={`btn-hud ${applyMode === 'simulation' ? 'primary' : ''}`} 
                        style={{ padding: '3px 8px', fontSize: '0.55rem', borderRadius: 2 }}
                        onClick={() => setApplyMode('simulation')}
                      >
                        SIMULATION
                      </button>
                      <button 
                        className={`btn-hud ${applyMode === 'real' ? 'primary' : ''}`} 
                        style={{ padding: '3px 8px', fontSize: '0.55rem', borderRadius: 2 }}
                        onClick={() => setApplyMode('real')}
                      >
                        REAL PUPPETEER
                      </button>
                    </div>

                    <motion.button className="btn-hud primary" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={handleMatchJobs} whileHover={{ scale: 1.03 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={12} /> AI MATCH</span>
                    </motion.button>
                    <button className="btn-hud" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={loadJobs}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={12} /> REFRESH</span>
                    </button>
                  </div>
                </div>

                {jobs.length === 0 && (
                  <div className="hud-card" style={{ textAlign: 'center', padding: 48 }}>
                    <Briefcase size={48} color="rgba(0,240,255,0.3)" style={{ margin: '0 auto 16px' }} />
                    <div className="section-title" style={{ marginBottom: 8 }}>LOADING JOBS...</div>
                  </div>
                )}

                {jobs.map((job, i) => (
                  <motion.div key={job._id} className="job-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.06 }}>
                    <div className="job-card-header">
                      <div>
                        <div className="job-title">{job.title}</div>
                        <div className="job-company">{job.company?.name} • {job.location?.city}, {job.location?.country}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                        {job.location?.remote && <span className="match-badge" style={{ fontSize: '0.55rem', padding: '2px 7px' }}>REMOTE</span>}
                        <span className="match-badge" style={{ fontSize: '0.55rem', padding: '2px 7px' }}>{job.type?.toUpperCase()}</span>
                        {job.salary && <span className="match-badge" style={{ fontSize: '0.55rem', padding: '2px 7px' }}>₹{(job.salary.min/100000).toFixed(0)}-{(job.salary.max/100000).toFixed(0)}L</span>}
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'rgba(224,240,255,0.5)', lineHeight: 1.5, marginBottom: 10 }}>
                      {job.description?.slice(0, 180)}...
                    </div>

                    <div className="job-skills">
                      {(job.skills || []).slice(0, 8).map(s => <span key={s} className="skill-tag">{s}</span>)}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                      <motion.button className="btn-hud primary" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={() => handleOneClickApply(job._id, job)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={12} /> ONE-CLICK APPLY</span>
                      </motion.button>
                      <button className="btn-hud" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={() => handleSkillGap(job._id, job)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={12} /> SKILL GAP</span>
                      </button>
                      <button className="btn-hud" style={{ fontSize: '0.65rem', padding: '8px 14px', border: '1px solid rgba(168,85,247,0.3)', color: 'rgba(224,240,255,0.9)' }} onClick={() => handleStartInterview(job._id, job)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mic size={12} color="#a855f7" /> AI INTERVIEW</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── MATCHED JOBS VIEW ── */}
            {activeView === 'matched' && (
              <motion.div key="match" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="top-bar">
                  <div>
                    <div className="top-bar-title">AI-MATCHED JOBS</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.4)', marginTop: 4 }}>
                      {matchedJobs.length} jobs matched to your profile
                    </div>
                  </div>
                  <motion.button className="btn-hud" onClick={handleMatchJobs} style={{ fontSize: '0.65rem', padding: '8px 14px' }} whileHover={{ scale: 1.03 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={12} /> RE-SCAN</span>
                  </motion.button>
                </div>

                {matchedJobs.length === 0 && (
                  <motion.div className="hud-card" style={{ textAlign: 'center', padding: 48 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                    <Target size={48} color="rgba(0,240,255,0.3)" style={{ margin: '0 auto 16px' }} />
                    <div className="section-title" style={{ marginBottom: 8 }}>NO MATCHES YET</div>
                    <div style={{ color: 'rgba(224,240,255,0.5)', fontSize: '0.85rem', marginBottom: 16 }}>Run the AI scanner to find your best job matches</div>
                    <motion.button className="btn-hud primary" onClick={handleMatchJobs} whileHover={{ scale: 1.03 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={14} /> SCAN NOW</span>
                    </motion.button>
                  </motion.div>
                )}

                {matchedJobs.map((match, i) => (
                  <motion.div key={match.job?._id || i} className="job-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                    <div className="job-card-header">
                      <div>
                        <div className="job-title">{match.job?.title}</div>
                        <div className="job-company">{match.job?.company?.name} • {match.job?.location?.city}</div>
                      </div>
                      <span className={`match-badge ${match.matchScore >= 75 ? 'high' : ''}`}>
                        {match.matchScore}% MATCH
                      </span>
                    </div>

                    {match.aiAnalysis?.whyFit && (
                      <div className="whyfit-text" style={{ marginBottom: 12, fontSize: '0.78rem' }}>
                        "{match.aiAnalysis.whyFit}"
                      </div>
                    )}

                    <div className="job-skills">
                      {(match.aiAnalysis?.matchingSkills || []).map(s => <span key={s} className="skill-tag matched">{s} ✓</span>)}
                      {(match.aiAnalysis?.missingSkills || []).map(s => <span key={s} className="skill-tag missing">{s} ✗</span>)}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <motion.button className="btn-hud primary" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={() => handleOneClickApply(match.job?._id, match.job)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={12} /> ONE-CLICK APPLY</span>
                      </motion.button>
                      <button className="btn-hud" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={() => handleSkillGap(match.job?._id, match.job)}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><TrendingUp size={12} /> SKILL GAP</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* ── SKILL GAP VIEW ── */}
            {activeView === 'skillgap' && (
              <motion.div key="gap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {!skillGap ? (
                  <div>
                    <div className="top-bar">
                      <div className="top-bar-title">SKILL GAP ANALYSIS</div>
                    </div>
                    <div className="hud-card" style={{ textAlign: 'center', padding: 48 }}>
                      <TrendingUp size={48} color="rgba(0,240,255,0.3)" style={{ margin: '0 auto 16px' }} />
                      <div className="section-title" style={{ marginBottom: 8 }}>SELECT A JOB</div>
                      <div style={{ color: 'rgba(224,240,255,0.5)', marginBottom: 16 }}>Go to "Browse Jobs" and click "Skill Gap" on any listing</div>
                      <motion.button className="btn-hud" onClick={() => setActiveView('jobs')} whileHover={{ scale: 1.03 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> BROWSE JOBS</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="top-bar">
                      <div>
                        <div className="top-bar-title">SKILL GAP ANALYSIS</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.4)', marginTop: 4 }}>
                          {selectedJob?.title} at {selectedJob?.company?.name}
                        </div>
                      </div>
                      <div className="top-bar-status"><div className="status-dot" /> ANALYSIS COMPLETE</div>
                    </div>

                    {/* Stats */}
                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <StatCard label="Current Match" value={`${skillGap.currentMatchPercent}%`} icon={Target} color="#ff6600" delay={0.1} />
                      <StatCard label="Potential Match" value={`${skillGap.potentialMatchPercent}%`} icon={TrendingUp} color="#00ff88" delay={0.2} />
                      <StatCard label="Time to Ready" value={skillGap.timeToReady} icon={Clock} color="#a855f7" delay={0.3} />
                    </div>

                    {/* Progress Bar */}
                    <motion.div className="hud-card" style={{ marginBottom: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span className="hud-label">MATCH IMPROVEMENT POTENTIAL</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 700, color: 'var(--hud-green)' }}>
                          {skillGap.currentMatchPercent}% → {skillGap.potentialMatchPercent}%
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <div className="progress-bar-container" style={{ flex: 1, height: 10 }}>
                          <motion.div className="progress-bar-fill" initial={{ width: 0 }} animate={{ width: `${skillGap.currentMatchPercent}%` }} transition={{ duration: 1.5, delay: 0.5 }} />
                        </div>
                        <ArrowUpRight size={16} color="#00ff88" />
                        <div className="progress-bar-container" style={{ flex: 1, height: 10, opacity: 0.5 }}>
                          <motion.div className="progress-bar-fill" style={{ background: 'linear-gradient(90deg, #00ff88, #a855f7)' }} initial={{ width: 0 }} animate={{ width: `${skillGap.potentialMatchPercent}%` }} transition={{ duration: 1.5, delay: 0.8 }} />
                        </div>
                      </div>
                    </motion.div>

                    <div className="content-grid">
                      {/* Skill Gaps */}
                      <motion.div className="hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                        <div className="section-header">
                          <div className="section-title">🎯 SKILL GAPS DETECTED</div>
                        </div>
                        {(skillGap.skillGaps || []).map((gap, i) => (
                          <motion.div key={gap.skill} className="skill-gap-item" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}>
                            <div className={`skill-gap-icon ${gap.importance}`}>
                              {gap.importance === 'critical' ? <AlertTriangle size={18} /> : gap.importance === 'important' ? <Target size={18} /> : <BookOpen size={18} />}
                            </div>
                            <div className="skill-gap-info">
                              <div className="skill-gap-name">{gap.skill}</div>
                              <div className="skill-gap-reason">{gap.reason}</div>
                              <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                                <span className="skill-tag">{gap.estimatedLearningTime}</span>
                                <span className="skill-tag" style={{ textTransform: 'capitalize' }}>{gap.importance}</span>
                                {gap.freeResources?.map((r, ri) => (
                                  <a key={ri} href={r.url} target="_blank" rel="noopener noreferrer" className="skill-tag" style={{ textDecoration: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 3 }}>
                                    {r.name} <ExternalLink size={8} />
                                  </a>
                                ))}
                              </div>
                              {gap.quickWin && (
                                <div style={{ marginTop: 6, fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0,255,136,0.6)' }}>
                                  💡 Quick Win: {gap.quickWin}
                                </div>
                              )}
                            </div>
                            <div className="skill-gap-boost">
                              <div className="boost-value">+{gap.selectionBoost}%</div>
                              <div className="boost-label">BOOST</div>
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>

                      {/* Strengths + Learning Path */}
                      <div>
                        <motion.div className="hud-card" style={{ marginBottom: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                          <div className="section-header">
                            <div className="section-title">💪 YOUR STRENGTHS</div>
                          </div>
                          {(skillGap.strengthsToHighlight || []).map((s, i) => (
                            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid rgba(0,240,255,0.06)' }}>
                              <CheckCircle2 size={16} color="#00ff88" style={{ flexShrink: 0, marginTop: 2 }} />
                              <div>
                                <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 600, color: 'var(--hud-green)', marginBottom: 2 }}>{s.skill}</div>
                                <div style={{ fontSize: '0.78rem', color: 'rgba(224,240,255,0.55)', lineHeight: 1.4 }}>{s.advantage}</div>
                              </div>
                            </div>
                          ))}
                        </motion.div>

                        <motion.div className="hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                          <div className="section-header">
                            <div className="section-title">📚 LEARNING ROADMAP</div>
                          </div>
                          <div className="timeline">
                            {(skillGap.prioritizedLearningPath || []).map((step, i) => (
                              <motion.div key={i} className="timeline-item" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.15 }}>
                                <div className="timeline-week">{step.week}</div>
                                <div className="timeline-focus">{step.focus}</div>
                                <div className="timeline-milestone">🏁 {step.milestone}</div>
                              </motion.div>
                            ))}
                          </div>
                          {skillGap.competitorInsight && (
                            <div style={{ marginTop: 16, padding: 12, borderRadius: 4, background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.15)', fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(168,85,247,0.8)', lineHeight: 1.4 }}>
                              💡 {skillGap.competitorInsight}
                            </div>
                          )}
                        </motion.div>
                      </div>
                    </div>

                    {/* AI Advisor */}
                    <motion.div className="hud-card" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}>
                      <div className="section-header">
                        <div className="section-title">🧠 AI ADVISOR RECOMMENDATION</div>
                      </div>
                      <div className="whyfit-text">{skillGap.overallAdvice}</div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                        <motion.button className="btn-hud primary" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={() => handleOneClickApply(selectedJob?._id, selectedJob)} whileHover={{ scale: 1.03 }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Zap size={12} /> APPLY ANYWAY</span>
                        </motion.button>
                        <button className="btn-hud" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={() => setActiveView('jobs')}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={12} /> BROWSE MORE JOBS</span>
                        </button>
                      </div>
                    </motion.div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── APPLY RESULT VIEW ── */}
            {activeView === 'result' && (
              <motion.div key="result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {!applyResult ? (
                  <div>
                    <div className="top-bar"><div className="top-bar-title">ONE-CLICK APPLY</div></div>
                    <div className="hud-card" style={{ textAlign: 'center', padding: 48 }}>
                      <Zap size={48} color="rgba(0,240,255,0.3)" style={{ margin: '0 auto 16px' }} />
                      <div className="section-title" style={{ marginBottom: 8 }}>READY TO APPLY</div>
                      <div style={{ color: 'rgba(224,240,255,0.5)', marginBottom: 16 }}>Select a job and click "One-Click Apply" to start</div>
                      <motion.button className="btn-hud" onClick={() => setActiveView('jobs')} whileHover={{ scale: 1.03 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> BROWSE JOBS</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="top-bar">
                      <div className="top-bar-title">APPLICATION SUBMITTED ⚡</div>
                      <div className="top-bar-status"><div className="status-dot" /> {applyResult.automation?.status?.toUpperCase()}</div>
                    </div>

                    {/* Success Banner */}
                    <motion.div className="hud-card glow-pulse" style={{ textAlign: 'center', padding: 32, marginBottom: 20, border: '1px solid rgba(0,255,136,0.3)' }} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200 }}>
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }} style={{ width: 64, height: 64, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle2 size={32} color="#00ff88" />
                      </motion.div>
                      <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--hud-green)', marginBottom: 8 }}>
                        APPLICATION SUBMITTED SUCCESSFULLY
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(0,240,255,0.5)' }}>
                        {applyResult.job?.title} at {applyResult.job?.company} • {applyResult.automation?.timeSeconds}s • {applyResult.automation?.fieldsFilled} fields auto-filled
                      </div>
                    </motion.div>

                    <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                      <StatCard label="Match Score" value={`${applyResult.matchScore}%`} icon={Target} color="#00ff88" delay={0.3} />
                      <StatCard label="ATS Before" value={applyResult.resumeOptimization?.atsScoreBefore} icon={BarChart3} color="#ff6600" delay={0.4} />
                      <StatCard label="ATS After" value={applyResult.resumeOptimization?.atsScoreAfter} icon={TrendingUp} color="#00ff88" delay={0.5} subtext={`+${(applyResult.resumeOptimization?.atsScoreAfter || 0) - (applyResult.resumeOptimization?.atsScoreBefore || 0)} points`} />
                    </div>

                    <div className="content-grid">
                      {/* Why You Fit */}
                      <motion.div className="hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
                        <div className="section-header"><div className="section-title">WHY YOU FIT</div></div>
                        <div className="whyfit-text">{applyResult.whyYouFit}</div>
                        {applyResult.recommendations && (
                          <div style={{ marginTop: 16 }}>
                            <div className="hud-label" style={{ marginBottom: 8 }}>RECOMMENDATIONS</div>
                            {applyResult.recommendations.map((r, i) => (
                              <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: '0.78rem', color: 'rgba(224,240,255,0.6)' }}>
                                <ChevronRight size={14} color="#00f0ff" style={{ flexShrink: 0, marginTop: 2 }} />
                                {r}
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>

                      {/* Resume Optimization */}
                      <motion.div className="hud-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                        <div className="section-header"><div className="section-title">RESUME OPTIMIZATION</div></div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
                          <ATSGauge score={applyResult.resumeOptimization?.atsScoreAfter || 88} size={120} />
                          <div>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', color: 'var(--hud-green)', marginBottom: 4 }}>
                              +{(applyResult.resumeOptimization?.atsScoreAfter || 88) - (applyResult.resumeOptimization?.atsScoreBefore || 65)} POINTS BOOSTED
                            </div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0,240,255,0.4)' }}>
                              AI-optimized for this job
                            </div>
                          </div>
                        </div>
                        {applyResult.resumeOptimization?.keyImprovements?.map((imp, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, padding: '5px 0', fontSize: '0.78rem', color: 'rgba(224,240,255,0.6)' }}>
                            <CheckCircle2 size={14} color="#00ff88" style={{ flexShrink: 0, marginTop: 2 }} /> {imp}
                          </div>
                        ))}
                      </motion.div>
                    </div>

                    {/* Cover Letter */}
                    {applyResult.coverLetter && (
                      <motion.div className="hud-card" style={{ marginTop: 20 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
                        <div className="section-header"><div className="section-title">AI COVER LETTER</div></div>
                        <div className="hud-label" style={{ marginBottom: 8 }}>SUBJECT: {applyResult.coverLetter.subject}</div>
                        <div style={{ fontSize: '0.83rem', color: 'rgba(224,240,255,0.6)', lineHeight: 1.6, fontStyle: 'italic' }}>
                          {applyResult.coverLetter.preview}
                        </div>
                        {applyResult.coverLetter.highlights && (
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            {applyResult.coverLetter.highlights.map((h, i) => (
                              <span key={i} className="skill-tag matched">{h}</span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Interview Tips */}
                    {applyResult.interviewTips && (
                      <motion.div className="hud-card" style={{ marginTop: 16 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
                        <div className="section-header"><div className="section-title">🎤 INTERVIEW TIPS</div></div>
                        {applyResult.interviewTips.map((tip, i) => (
                          <div key={i} style={{ display: 'flex', gap: 8, padding: '6px 0', fontSize: '0.78rem', color: 'rgba(224,240,255,0.6)' }}>
                            <Sparkles size={14} color="#ffd700" style={{ flexShrink: 0, marginTop: 2 }} /> {tip}
                          </div>
                        ))}
                      </motion.div>
                    )}

                    {/* Puppeteer Screenshot Proof */}
                    {applyResult.automation?.screenshotPath && (
                      <motion.div 
                        className="hud-card" 
                        style={{ marginTop: 16, overflow: 'hidden' }} 
                        initial={{ opacity: 0, y: 20 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ delay: 0.95 }}
                      >
                        <div className="section-header">
                          <div className="section-title" style={{ color: 'var(--hud-cyan)' }}>📸 PUPPETEER SCREENSHOT PROOF (REAL TRANSACTION LOG)</div>
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'rgba(224,240,255,0.6)', marginBottom: 12, lineHeight: 1.5 }}>
                          The Chromium automated robot successfully filled the form fields, uploaded your ATS-optimized resume, and submitted the job application. Here is the high-resolution snapshot captured at the confirmation screen:
                        </div>
                        <div 
                          className="screenshot-viewer"
                          style={{ 
                            border: '1px solid rgba(0, 240, 255, 0.2)', 
                            borderRadius: 4, 
                            maxHeight: '400px', 
                            overflow: 'auto',
                            background: '#04060b'
                          }}
                        >
                          <img 
                            src={`http://localhost:5000${applyResult.automation.screenshotPath}`} 
                            alt="Puppeteer Submission Proof" 
                            style={{ 
                              width: '100%', 
                              display: 'block',
                              transition: 'transform 0.3s ease',
                              cursor: 'zoom-in'
                            }} 
                            onClick={(e) => {
                              e.currentTarget.style.transform = e.currentTarget.style.transform === 'scale(1.5)' ? 'scale(1)' : 'scale(1.5)';
                              e.currentTarget.style.transformOrigin = 'top center';
                            }}
                          />
                        </div>
                        <div style={{ marginTop: 8, fontFamily: 'var(--font-mono)', fontSize: '0.58rem', color: 'rgba(0, 240, 255, 0.4)', textAlign: 'right' }}>
                          CLICK IMAGE TO TOGGLE 1.5x ZOOM
                        </div>
                      </motion.div>
                    )}

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                      <motion.button className="btn-hud primary" onClick={() => setActiveView('jobs')} whileHover={{ scale: 1.03 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> APPLY TO MORE JOBS</span>
                      </motion.button>
                      <button className="btn-hud" onClick={() => setActiveView('history')}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><History size={14} /> VIEW HISTORY</span>
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            )}

            {/* ── AI INTERVIEWER VIEW ── */}
            {activeView === 'interview' && (
              <motion.div key="interview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                {!interviewJob ? (
                  <div>
                    <div className="top-bar">
                      <div className="top-bar-title">AI INTERVIEW SIMULATOR</div>
                    </div>
                    <div className="hud-card" style={{ textAlign: 'center', padding: 48 }}>
                      <Mic size={48} color="rgba(0,240,255,0.3)" style={{ margin: '0 auto 16px' }} />
                      <div className="section-title" style={{ marginBottom: 8 }}>SELECT A TARGET JOB</div>
                      <div style={{ color: 'rgba(224,240,255,0.5)', marginBottom: 16 }}>Go to "Browse Jobs" and click "AI Interview" on any listing to practice with a custom Gemini recruiter!</div>
                      <motion.button className="btn-hud" onClick={() => setActiveView('jobs')} whileHover={{ scale: 1.03 }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> BROWSE JOBS</span>
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="top-bar">
                      <div>
                        <div className="top-bar-title">AI TECHNICAL INTERVIEW SIMULATOR 🎙️</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.4)', marginTop: 4 }}>
                          Recruiting Session for **{interviewJob.title}** at **{interviewJob.company?.name || interviewJob.company}**
                        </div>
                      </div>
                      <div className="top-bar-status" style={{ color: interviewFinished ? '#00ff88' : '#00f0ff' }}>
                        <div className="status-dot" style={{ background: interviewFinished ? '#00ff88' : '#00f0ff', boxShadow: interviewFinished ? '0 0 8px #00ff88' : '0 0 8px #00f0ff' }} />
                        {interviewFinished ? 'INTERVIEW COMPLETE' : 'LIVE CONVERSATION'}
                      </div>
                    </div>

                    {!interviewFinished ? (
                      <div className="hud-card" style={{ padding: 20 }}>
                        {/* Conversation Box */}
                        <div style={{ 
                          height: '350px', 
                          overflowY: 'auto', 
                          border: '1px solid rgba(0, 240, 255, 0.1)', 
                          borderRadius: 4, 
                          background: 'rgba(5, 8, 15, 0.95)',
                          padding: '16px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '14px',
                          marginBottom: '16px'
                        }}>
                          {interviewHistory.map((msg, i) => (
                            <div key={i} style={{ 
                              display: 'flex', 
                              justifyContent: msg.role === 'candidate' ? 'flex-end' : 'flex-start',
                              width: '100%'
                            }}>
                              <div style={{ 
                                maxWidth: '80%',
                                background: msg.role === 'candidate' ? 'rgba(0, 240, 255, 0.04)' : 'rgba(168, 85, 247, 0.04)',
                                border: msg.role === 'candidate' ? '1px solid rgba(0, 240, 255, 0.2)' : '1px solid rgba(168, 85, 247, 0.2)',
                                boxShadow: msg.role === 'candidate' ? '0 0 10px rgba(0, 240, 255, 0.05)' : '0 0 10px rgba(168, 85, 247, 0.05)',
                                padding: '12px 16px',
                                borderRadius: '4px',
                                fontSize: '0.8rem',
                                color: 'var(--hud-white)',
                                lineHeight: '1.5',
                                wordBreak: 'break-word',
                                whiteSpace: 'pre-wrap'
                              }}>
                                <div style={{ 
                                  fontFamily: 'var(--font-mono)', 
                                  fontSize: '0.55rem', 
                                  color: msg.role === 'candidate' ? 'var(--hud-cyan)' : '#a855f7',
                                  marginBottom: '4px',
                                  fontWeight: 'bold'
                                }}>
                                  {msg.role === 'candidate' ? '// YOU (CANDIDATE)' : `// INTERVIEWER (${interviewJob.company?.name || interviewJob.company})`}
                                </div>
                                {msg.text}
                              </div>
                            </div>
                          ))}
                          
                          {interviewLoading && (
                            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                              <div style={{ 
                                background: 'rgba(168, 85, 247, 0.02)', 
                                border: '1px solid rgba(168, 85, 247, 0.1)',
                                padding: '12px 16px',
                                borderRadius: '4px',
                                fontSize: '0.78rem',
                                color: 'rgba(224, 240, 255, 0.5)'
                              }}>
                                <span className="spin" style={{ display: 'inline-block', marginRight: 8 }}>⏳</span>
                                Recruiter is reviewing answer and drafting feedback...
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input Box */}
                        <form onSubmit={handleSendInterviewAnswer} style={{ display: 'flex', gap: 10 }}>
                          <input 
                            className="hud-input" 
                            style={{ flex: 1, fontSize: '0.82rem' }}
                            placeholder={interviewLoading ? "Interviewer is typing..." : "Type your technical or behavioral answer here... Be descriptive!"}
                            value={interviewInput}
                            onChange={e => setInterviewInput(e.target.value)}
                            disabled={interviewLoading}
                            required
                          />
                          <button 
                            type="submit" 
                            className="btn-hud primary"
                            style={{ padding: '8px 20px', fontSize: '0.7rem' }}
                            disabled={interviewLoading || !interviewInput.trim()}
                          >
                            SEND ANSWER
                          </button>
                        </form>
                      </div>
                    ) : (
                      /* Graded Scorecard View */
                      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.4 }}>
                        <div className="hud-card glow-pulse" style={{ textAlign: 'center', padding: 32, marginBottom: 20, border: '1px solid rgba(0,255,136,0.3)' }}>
                          <div style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 16px', background: 'rgba(0,255,136,0.1)', border: '2px solid rgba(0,255,136,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900, color: 'var(--hud-green)' }}>
                              {interviewScorecard?.overallGrade || 'A'}
                            </div>
                          </div>
                          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--hud-green)', marginBottom: 8, letterSpacing: '0.08em' }}>
                            INTERVIEW SCORE: {interviewScorecard?.overallScore || 85}/100
                          </div>
                          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'rgba(0,240,255,0.5)', maxWidth: '500px', margin: '0 auto' }}>
                            Technical Recruiting Assessment Complete for **{interviewJob.title}** at **{interviewJob.company?.name || interviewJob.company}**
                          </div>
                        </div>

                        <div className="content-grid">
                          {/* Key Strengths */}
                          <div className="hud-card">
                            <div className="section-header">
                              <div className="section-title" style={{ color: 'var(--hud-green)' }}>💪 RECRUITER OBSERVED STRENGTHS</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {(interviewScorecard?.strengths || []).map((s, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: 'rgba(224,240,255,0.7)', lineHeight: 1.4 }}>
                                  <CheckCircle2 size={16} color="#00ff88" style={{ flexShrink: 0, marginTop: 2 }} />
                                  {s}
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Weaknesses */}
                          <div className="hud-card">
                            <div className="section-header">
                              <div className="section-title" style={{ color: '#ff6600' }}>🎯 AREAS OF IMPROVEMENT</div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                              {(interviewScorecard?.weaknesses || []).map((w, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: 10, fontSize: '0.8rem', color: 'rgba(224,240,255,0.7)', lineHeight: 1.4 }}>
                                  <AlertTriangle size={16} color="#ff6600" style={{ flexShrink: 0, marginTop: 2 }} />
                                  {w}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Strategic Advisor Feedback */}
                        <div className="hud-card" style={{ marginTop: 20 }}>
                          <div className="section-header">
                            <div className="section-title" style={{ color: 'var(--hud-cyan)' }}>🧠 AI RECRUITER STRATEGIC CAREER ADVICE</div>
                          </div>
                          <div className="whyfit-text" style={{ fontStyle: 'italic', lineHeight: 1.6, fontSize: '0.85rem' }}>
                            "{interviewScorecard?.advisorFeedback}"
                          </div>
                        </div>

                        {/* Final Actions */}
                        <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                          <motion.button className="btn-hud primary" onClick={() => handleStartInterview(interviewJob._id, interviewJob)} whileHover={{ scale: 1.03 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Mic size={14} /> RE-START PRACTICE INTERVIEW</span>
                          </motion.button>
                          <button className="btn-hud" onClick={() => setActiveView('jobs')}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> BROWSE MORE JOBS</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            )}

            {/* ── HISTORY VIEW ── */}
            {activeView === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
                <div className="top-bar">
                  <div>
                    <div className="top-bar-title">APPLICATION HISTORY</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.4)', marginTop: 4 }}>
                      {applyHistory.length} total applications tracked
                    </div>
                  </div>
                  <button className="btn-hud" style={{ fontSize: '0.65rem', padding: '8px 14px' }} onClick={loadHistory}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><RefreshCw size={12} /> REFRESH</span>
                  </button>
                </div>

                {applyHistory.length === 0 ? (
                  <div className="hud-card" style={{ textAlign: 'center', padding: 48 }}>
                    <History size={48} color="rgba(0,240,255,0.3)" style={{ margin: '0 auto 16px' }} />
                    <div className="section-title" style={{ marginBottom: 8 }}>NO APPLICATIONS YET</div>
                    <div style={{ color: 'rgba(224,240,255,0.5)', marginBottom: 16 }}>Use "One-Click Apply" on any job to get started</div>
                    <motion.button className="btn-hud primary" onClick={() => setActiveView('jobs')} whileHover={{ scale: 1.03 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Briefcase size={14} /> BROWSE JOBS</span>
                    </motion.button>
                  </div>
                ) : (
                  applyHistory.map((app, i) => (
                    <motion.div key={i} className="job-card" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                      <div className="job-card-header">
                        <div>
                          <div className="job-title">Application #{i + 1}</div>
                          <div className="job-company">Match Score: {app.matchAnalysis?.overallScore || 'N/A'}%</div>
                        </div>
                        <span className={`match-badge ${app.status === 'submitted' ? 'high' : ''}`}>
                          {app.status?.toUpperCase()}
                        </span>
                      </div>
                      {app.matchAnalysis?.whyFit && (
                        <div className="whyfit-text" style={{ fontSize: '0.78rem', marginTop: 8 }}>
                          "{app.matchAnalysis.whyFit.slice(0, 200)}..."
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                        {(app.matchAnalysis?.matchingSkills || []).slice(0, 5).map(s => (
                          <span key={s} className="skill-tag matched">{s}</span>
                        ))}
                        <span className="skill-tag">ATS: {app.optimizedResume?.atsScore || 'N/A'}</span>
                      </div>
                    </motion.div>
                  ))
                )}
              </motion.div>
            )}

          {/* ATS Report Modal */}
          <AnimatePresence>
            {atsReportModal && atsReportData && (
              <motion.div
                className="ats-report-modal-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  background: 'rgba(2, 4, 8, 0.95)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 10000,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '20px'
                }}
              >
                <motion.div
                  className="hud-card"
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  exit={{ scale: 0.9, y: 20 }}
                  style={{
                    width: '100%',
                    maxWidth: '650px',
                    background: 'rgba(5, 8, 15, 0.98)',
                    border: '1px solid var(--border-active, #00f0ff)',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
                    padding: '24px',
                    position: 'relative',
                    maxHeight: '90vh',
                    overflowY: 'auto'
                  }}
                >
                  {/* Close button */}
                  <button
                    onClick={() => setAtsReportModal(false)}
                    style={{
                      position: 'absolute',
                      top: 16,
                      right: 16,
                      background: 'none',
                      border: 'none',
                      color: 'rgba(0, 240, 255, 0.6)',
                      cursor: 'pointer',
                      padding: 4
                    }}
                  >
                    <X size={20} />
                  </button>

                  <div style={{ borderBottom: '1px solid rgba(0, 240, 255, 0.1)', paddingBottom: 12, marginBottom: 20 }}>
                    <span style={{ fontSize: '0.62rem', fontWeight: 'bold', color: 'var(--hud-cyan, #00f0ff)', fontFamily: 'var(--font-mono)' }}>📟 RESUME ATS COGNITIVE RADAR // METRIC_SYSTEM</span>
                    <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--hud-white, #ffffff)', fontSize: '1.25rem', marginTop: 4, letterSpacing: '0.05em' }}>ATS SCAN COMPLETED</h2>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <ATSGauge score={atsReportData.score} size={140} />
                      <div style={{ marginTop: 10, fontFamily: 'var(--font-display)', fontSize: '0.9rem', fontWeight: 'bold', color: '#00ff88' }}>
                        GRADE: {atsReportData.grade}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'rgba(0, 240, 255, 0.8)', marginBottom: 8, textTransform: 'uppercase' }}>
                        // COGNITIVE ASSESSMENT
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'rgba(224, 240, 255, 0.7)', lineHeight: 1.5 }}>
                        Your resume has been successfully scanned by the parser. Core skills, job histories, and project details have been successfully mapped to our unified database structure.
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                    {/* Strengths */}
                    <div style={{ background: 'rgba(0, 255, 136, 0.02)', border: '1px solid rgba(0, 255, 136, 0.15)', borderRadius: 4, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#00ff88', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: 10 }}>
                        <CheckCircle2 size={14} /> IDENTIFIED STRENGTHS
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {atsReportData.strengths && atsReportData.strengths.length > 0 ? (
                          atsReportData.strengths.map((str, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(224, 240, 255, 0.8)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                              <span style={{ color: '#00ff88' }}>•</span> {str}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'rgba(224, 240, 255, 0.4)' }}>No significant strengths identified yet.</div>
                        )}
                      </div>
                    </div>

                    {/* Issues */}
                    <div style={{ background: 'rgba(255, 102, 0, 0.02)', border: '1px solid rgba(255, 102, 0, 0.15)', borderRadius: 4, padding: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#ff6600', fontFamily: 'var(--font-mono)', fontSize: '0.7rem', fontWeight: 'bold', marginBottom: 10 }}>
                        <AlertTriangle size={14} /> CRITICAL ISSUES
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {atsReportData.issues && atsReportData.issues.length > 0 ? (
                          atsReportData.issues.map((iss, i) => (
                            <div key={i} style={{ fontSize: '0.75rem', color: 'rgba(224, 240, 255, 0.8)', display: 'flex', gap: 6, alignItems: 'flex-start' }}>
                              <span style={{ color: '#ff6600' }}>•</span> {iss}
                            </div>
                          ))
                        ) : (
                          <div style={{ fontSize: '0.75rem', color: 'rgba(0, 255, 136, 0.8)' }}>✓ Clean scan! No critical issues found.</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button
                      className="btn-hud"
                      onClick={() => setAtsReportModal(false)}
                      style={{ fontSize: '0.7rem', padding: '10px 18px' }}
                    >
                      CLOSE REPORT
                    </button>
                    <button
                      className="btn-hud primary"
                      onClick={() => {
                        setAtsReportModal(false);
                        navigate('/profile');
                      }}
                      style={{
                        fontSize: '0.7rem',
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6
                      }}
                    >
                      <span>✏️ VIEW & EDIT PARSED PROFILE</span>
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
