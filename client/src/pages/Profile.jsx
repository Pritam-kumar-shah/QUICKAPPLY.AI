import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  User, Briefcase, Code, GraduationCap, FolderGit2, Download,
  Plus, X, Sparkles, ArrowLeft, ChevronRight, Loader2, FileText
} from 'lucide-react'
import api from '../api'

export default function Profile() {
  const navigate = useNavigate()
  const resumeRef = useRef(null)

  const [profile, setProfile] = useState({
    fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '',
    title: '', summary: '',
    skills: [],
    skillCategories: {
      languages: '',
      frameworks: '',
      tools: '',
      platforms: '',
      softSkills: '',
    },
    experience: [{ company: '', role: '', duration: '', description: '', link: '' }],
    education: [{ institution: '', degree: '', year: '', location: '', gpa: '' }],
    projects: [{ name: '', techStack: '', description: '', link: '' }],
    certifications: [{ title: '', date: '', link: '' }],
  })

  const [skillInput, setSkillInput] = useState('')
  const [certInput, setCertInput] = useState('')
  const [generatedResume, setGeneratedResume] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')
  const [enhancingState, setEnhancingState] = useState(null)
  const [magicInput, setMagicInput] = useState('')
  const [magicLoading, setMagicLoading] = useState(false)
  const [userLoaded, setUserLoaded] = useState(false)

  // ATS and Uploader states
  const [atsScore, setAtsScore] = useState(null)
  const [atsGrade, setAtsGrade] = useState('')
  const [atsStrengths, setAtsStrengths] = useState([])
  const [atsIssues, setAtsIssues] = useState([])
  const [uploadLoading, setUploadLoading] = useState(false)
  const profileFileInputRef = useRef(null)

  // ── Auto-fill from logged-in user on mount ──
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // First try from localStorage
        const storedUser = localStorage.getItem('quickapply_user') || localStorage.getItem('applyflow_user')
        if (storedUser) {
          const u = JSON.parse(storedUser)
          setProfile(prev => ({
            ...prev,
            fullName: prev.fullName || u.name || '',
            email: prev.email || u.email || '',
            phone: prev.phone || u.phone || '',
          }))
        }

        // Then try to get full profile from API
        const res = await api.getMe()
        if (res.success && res.data?.user) {
          const u = res.data.user
          const p = u.profile || {}
          setProfile(prev => ({
            ...prev,
            fullName: u.name || prev.fullName || '',
            email: u.email || prev.email || '',
            phone: u.phone || prev.phone || '',
            linkedin: u.linkedinUrl || prev.linkedin || '',
            github: u.githubUrl || prev.github || '',
            portfolio: u.portfolioUrl || prev.portfolio || '',
            title: p.summary ? '' : prev.title,
            summary: p.summary || prev.summary || '',
            skills: p.skills?.length ? p.skills : prev.skills,
            experience: p.experience?.length ? p.experience.map(e => ({
              company: e.company || '',
              role: e.title || e.role || '',
              duration: e.duration || '',
              description: e.description || '',
              link: '',
            })) : prev.experience,
            education: p.education?.length ? p.education.map(ed => ({
              institution: ed.institution || '',
              degree: ed.degree || '',
              year: ed.year || '',
              location: '',
              gpa: '',
            })) : prev.education,
            projects: p.projects?.length ? p.projects.map(pr => ({
              name: pr.name || '',
              techStack: Array.isArray(pr.techStack) ? pr.techStack.join(', ') : (pr.techStack || ''),
              description: pr.description || '',
              link: pr.link || '',
            })) : prev.projects,
            certifications: p.certifications?.length
              ? p.certifications.map(c => typeof c === 'string' ? { title: c, date: '', link: '' } : c)
              : prev.certifications,
          }))
        }
      } catch (e) {
        console.log('Could not load user profile from server, using defaults.')
      }
      setUserLoaded(true)
    }
    loadUserData()
  }, [])

  // ── Magic AI Auto-Fill Handler ──
  const handleMagicAutoFill = async () => {
    if (!magicInput.trim()) return
    setMagicLoading(true)
    try {
      const res = await api.autoFillProfile(magicInput)
      if (res.success && res.profile) {
        const p = res.profile;
        setProfile(prev => ({
          ...prev,
          title: p.title || prev.title || '',
          summary: p.summary || prev.summary || '',
          skills: p.skills || prev.skills,
          experience: p.experience?.length ? p.experience.map(e => ({
            company: e.company || '',
            role: e.role || e.title || '',
            duration: e.duration || '',
            description: e.description || '',
            link: '',
          })) : prev.experience,
          education: p.education?.length ? p.education.map(ed => ({
            institution: ed.institution || '',
            degree: ed.degree || '',
            year: ed.year || '',
            location: '',
            gpa: '',
          })) : prev.education,
          projects: p.projects?.length ? p.projects.map(pr => ({
            name: pr.name || '',
            techStack: pr.techStack || '',
            description: pr.description || '',
            link: pr.link || '',
          })) : prev.projects,
          certifications: p.certifications?.length
            ? p.certifications.map(c => typeof c === 'string' ? { title: c, date: '', link: '' } : c)
            : prev.certifications,
        }))
      } else {
        alert(res.error || 'Magic Fill failed')
      }
    } catch (e) {
      alert('Failed to connect to AI server. Please make sure the backend is running!')
    }
    setMagicLoading(false)
  }

  // ── Profile Resume Upload & Parse ATS Handler ──
  const handleProfileResumeUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadLoading(true)
    try {
      const res = await api.uploadResume(file)
      if (res.success && res.data) {
        const report = res.data.atsReport || {
          score: res.data.aiAnalysis?.atsScore || 72,
          grade: 'B',
          issues: res.data.aiAnalysis?.atsIssues || [],
          strengths: res.data.aiAnalysis?.atsStrengths || []
        }
        setAtsScore(report.score)
        setAtsGrade(report.grade)
        setAtsStrengths(report.strengths)
        setAtsIssues(report.issues)

        // Auto-fill the profile form state
        const p = res.data.aiAnalysis || {}
        setProfile(prev => ({
          ...prev,
          fullName: p.name || prev.fullName || '',
          summary: p.summary || prev.summary || '',
          skills: p.skills?.length ? p.skills : prev.skills,
          experience: p.experience?.length ? p.experience.map(exp => ({
            company: exp.company || '',
            role: exp.title || exp.role || '',
            duration: exp.duration || '',
            description: exp.description || '',
            link: '',
          })) : prev.experience,
          education: p.education?.length ? p.education.map(ed => ({
            institution: ed.institution || '',
            degree: ed.degree || '',
            year: ed.year || '',
            location: '',
            gpa: '',
          })) : prev.education,
          projects: p.projects?.length ? p.projects.map(pr => ({
            name: pr.name || '',
            techStack: Array.isArray(pr.techStack) ? pr.techStack.join(', ') : (pr.techStack || ''),
            description: pr.description || '',
            link: pr.link || '',
          })) : prev.projects,
          certifications: p.certifications?.length
            ? p.certifications.map(c => typeof c === 'string' ? { title: c, date: '', link: '' } : c)
            : prev.certifications,
        }))
        alert(`Resume uploaded successfully! ATS Compatibility: ${report.score}% (${report.grade}). Profile form has been auto-populated.`)
      } else {
        alert(res.error || 'Upload failed')
      }
    } catch (e) {
      console.error(e)
      alert('Upload failed. Is the backend running?')
    }
    setUploadLoading(false)
    e.target.value = ''
  }

  // ── Helpers ──
  const updateField = (field, value) => setProfile(p => ({ ...p, [field]: value }))
  const updateSkillCategory = (key, value) => setProfile(p => ({
    ...p,
    skillCategories: { ...p.skillCategories, [key]: value }
  }))

  const addSkill = () => {
    if (skillInput.trim() && !profile.skills.includes(skillInput.trim())) {
      updateField('skills', [...profile.skills, skillInput.trim()])
      setSkillInput('')
    }
  }

  const removeSkill = (s) => updateField('skills', profile.skills.filter(x => x !== s))

  const updateArrayItem = (field, index, key, value) => {
    setProfile(p => {
      const arr = [...p[field]]
      arr[index] = { ...arr[index], [key]: value }
      return { ...p, [field]: arr }
    })
  }

  const addArrayItem = (field, template) => {
    setProfile(p => ({ ...p, [field]: [...p[field], template] }))
  }

  const removeArrayItem = (field, index) => {
    setProfile(p => ({ ...p, [field]: p[field].filter((_, i) => i !== index) }))
  }

  // ── Enhance Text Snippet ──
  const handleEnhanceSnippet = async (index, type, text) => {
    if (!text || text.trim().length === 0) return
    setEnhancingState(`${type}-${index}`)
    try {
      const res = await api.enhanceDescription(text, type)
      if (res.success && res.text) {
        updateArrayItem(type, index, 'description', res.text)
      }
    } catch (error) {
      console.error('Enhance failed:', error)
    }
    setEnhancingState(null)
  }

  // ── Generate Resume ──
  const handleGenerate = async () => {
    if (!profile.fullName || profile.skills.length === 0) {
      alert('Please fill at least your name and some skills!')
      return
    }
    setGenerating(true)
    try {
      const res = await api.generateResume(profile)
      if (res.success) {
        setGeneratedResume(res.data.resume)
        setActiveTab('preview')
      } else {
        setGeneratedResume(buildLocalResume(profile))
        setActiveTab('preview')
      }
    } catch (e) {
      setGeneratedResume(buildLocalResume(profile))
      setActiveTab('preview')
    }
    setGenerating(false)
  }

  // ── Download as PDF ──
  const handleDownload = () => {
    if (!resumeRef.current) return
    window.print()
  }

  const tabs = [
    { id: 'basic', label: 'Basic Info', icon: User },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'preview', label: 'Preview Resume', icon: FileText },
  ]

  // ── Helpers for structured skills display ──
  const getSkillsByCategory = () => {
    const cats = profile.skillCategories
    const result = []
    if (cats.languages) result.push({ label: 'Languages', value: cats.languages })
    if (cats.frameworks) result.push({ label: 'Frameworks', value: cats.frameworks })
    if (cats.tools) result.push({ label: 'Tools', value: cats.tools })
    if (cats.platforms) result.push({ label: 'Platforms', value: cats.platforms })
    if (cats.softSkills) result.push({ label: 'Soft Skills', value: cats.softSkills })
    // If none are filled, build from flat skills list
    if (result.length === 0 && profile.skills.length > 0) {
      result.push({ label: 'Core Skills', value: profile.skills.join(', ') })
    }
    return result
  }

  return (
    <div className="app-container" style={{ padding: '20px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn-hud" style={{ padding: '8px 12px' }} onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={14} />
          </button>
          <div>
            <div className="top-bar-title" style={{ fontSize: 'clamp(0.9rem, 2.5vw, 1.3rem)' }}>PROFILE & RESUME BUILDER</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'rgba(0,240,255,0.4)' }}>
              Fill your profile → Generate professional black & white resume
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <motion.button
            className="btn-hud primary"
            style={{ padding: '10px 20px', fontSize: '0.7rem' }}
            onClick={() => { setGeneratedResume(buildLocalResume(profile)); setActiveTab('preview'); }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <FileText size={14} /> PREVIEW RESUME
            </span>
          </motion.button>
          <motion.button
            className="btn-hud primary"
            style={{ padding: '10px 20px', fontSize: '0.7rem' }}
            onClick={handleGenerate}
            disabled={generating}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {generating ? <Loader2 size={14} className="spin" /> : <Sparkles size={14} />}
              {generating ? 'GENERATING...' : 'AI ENHANCE RESUME'}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Magic AI Auto-Fill & PDF ATS Resume Uploader Card */}
      <motion.div
        className="hud-card"
        style={{
          marginBottom: 20,
          padding: '20px',
          border: '1px dashed rgba(0, 240, 255, 0.3)',
          background: 'rgba(0, 240, 255, 0.02)',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.05)'
        }}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="profile-quick-actions-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          {/* Left Column: Natural Language Prompt */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <Sparkles size={14} color="var(--hud-cyan)" />
                <span className="hud-label" style={{ color: 'var(--hud-cyan)', fontWeight: 'bold' }}>⚡ MAGIC AI PROFILE AUTO-FILL</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(224,240,255,0.5)', marginBottom: 12, lineHeight: 1.4 }}>
                Describe yourself in one sentence (e.g. <i>"I am a fresher who knows React and Python"</i>) and watch AI generate your entire profile!
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                className="hud-input"
                style={{ flex: 1, fontSize: '0.8rem' }}
                placeholder="Type your background, e.g. MERN stack developer..."
                value={magicInput}
                onChange={e => setMagicInput(e.target.value)}
                disabled={magicLoading}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleMagicAutoFill(); } }}
              />
              <motion.button
                className="btn-hud primary"
                style={{ padding: '8px 18px', fontSize: '0.65rem' }}
                onClick={handleMagicAutoFill}
                disabled={magicLoading || !magicInput.trim()}
                whileHover={{ scale: 1.02 }}
              >
                {magicLoading ? 'INJECTING...' : '⚡ MAGIC FILL'}
              </motion.button>
            </div>
          </div>

          {/* Right Column: PDF Resume Uploader & ATS */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', paddingLeft: '20px' }} className="profile-upload-col">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <FileText size={14} color="var(--hud-cyan)" />
                <span className="hud-label" style={{ color: 'var(--hud-cyan)', fontWeight: 'bold' }}>📄 UPLOAD RESUME PDF & CHECK ATS</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'rgba(224,240,255,0.5)', marginBottom: 12, lineHeight: 1.4 }}>
                Have an existing resume? Upload it to instantly parse and pre-fill all form details, plus view your detailed ATS Compatibility Score!
              </div>
            </div>
            <div>
              {/* Hidden file input */}
              <input
                ref={profileFileInputRef}
                type="file"
                accept=".pdf,.doc,.docx"
                style={{ display: 'none' }}
                onChange={handleProfileResumeUpload}
              />
              <motion.button
                className="btn-hud primary"
                style={{ width: '100%', padding: '10px 18px', fontSize: '0.68rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                onClick={() => profileFileInputRef.current?.click()}
                disabled={uploadLoading}
                whileHover={{ scale: 1.02 }}
              >
                {uploadLoading ? <Loader2 size={14} className="spin" /> : <Download size={14} style={{ transform: 'rotate(180deg)' }} />}
                {uploadLoading ? 'PARSING PDF RESUME...' : 'UPLOAD RESUME TO CHECK ATS & PRE-FILL'}
              </motion.button>
            </div>
          </div>
        </div>

        {/* ATS Score Indicator */}
        {atsScore !== null && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{ marginTop: 16, padding: 12, borderRadius: 4, background: 'rgba(0, 255, 136, 0.04)', border: '1px solid rgba(0, 255, 136, 0.15)', overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#00ff88', fontWeight: 'bold' }}>
                📟 ATS COMPATIBILITY RADAR COMPLETED // MAPPED_DATA_STAMPED
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.8rem', fontWeight: 'bold', color: '#00ff88' }}>
                SCORE: {atsScore}% [GRADE: {atsGrade}]
              </div>
            </div>
            {atsStrengths.length > 0 && (
              <div style={{ fontSize: '0.68rem', color: 'rgba(224,240,255,0.7)', marginTop: 6 }}>
                <strong>✓ Strengths detected:</strong> {atsStrengths.slice(0, 3).join(', ')}...
              </div>
            )}
            {atsIssues.length > 0 && (
              <div style={{ fontSize: '0.68rem', color: '#ff6600', marginTop: 4 }}>
                <strong>⚠ Suggested improvements:</strong> {atsIssues.slice(0, 2).join(', ')}...
              </div>
            )}
          </motion.div>
        )}
      </motion.div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, overflowX: 'auto', paddingBottom: 4 }}>
        {tabs.map(t => (
          <button
            key={t.id}
            className={`btn-hud ${activeTab === t.id ? 'primary' : ''}`}
            style={{ padding: '8px 14px', fontSize: '0.6rem', display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}
            onClick={() => setActiveTab(t.id)}
          >
            <t.icon size={12} /> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ── Basic Info ── */}
        {activeTab === 'basic' && (
          <motion.div key="basic" className="hud-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>👤 BASIC INFORMATION</div>
            <div className="profile-form-grid">
              <div>
                <label className="form-label">Full Name *</label>
                <input className="hud-input" placeholder="Vikas Gupta" value={profile.fullName} onChange={e => updateField('fullName', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Professional Title</label>
                <input className="hud-input" placeholder="Full Stack Developer" value={profile.title} onChange={e => updateField('title', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input className="hud-input" type="email" placeholder="you@example.com" value={profile.email} onChange={e => updateField('email', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Phone</label>
                <input className="hud-input" placeholder="+91 70700 77077" value={profile.phone} onChange={e => updateField('phone', e.target.value)} />
              </div>
              <div>
                <label className="form-label">LinkedIn</label>
                <input className="hud-input" placeholder="linkedin.com/in/yourname" value={profile.linkedin} onChange={e => updateField('linkedin', e.target.value)} />
              </div>
              <div>
                <label className="form-label">GitHub / Behance / Dribbble</label>
                <input className="hud-input" placeholder="github.com/yourname" value={profile.github} onChange={e => updateField('github', e.target.value)} />
              </div>
              <div className="full-width">
                <label className="form-label">Professional Summary (optional)</label>
                <textarea className="hud-input" placeholder="A brief 2-3 line summary of your experience and goals..." value={profile.summary} onChange={e => updateField('summary', e.target.value)} rows={3} />
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Skills (Structured) ── */}
        {activeTab === 'skills' && (
          <motion.div key="skills" className="hud-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div className="section-title" style={{ marginBottom: 16 }}>💻 SKILLS SUMMARY</div>

            <div style={{ marginBottom: 20, padding: 16, border: '1px solid var(--border-hud)', borderRadius: 'var(--radius)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--hud-cyan)', marginBottom: 12, letterSpacing: '0.1em' }}>
                STRUCTURED SKILLS (for resume categories)
              </div>
              <div className="profile-form-grid">
                <div>
                  <label className="form-label">Languages</label>
                  <input className="hud-input" placeholder="Python, SQL, Java, C++" value={profile.skillCategories.languages} onChange={e => updateSkillCategory('languages', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Frameworks</label>
                  <input className="hud-input" placeholder="React, Node.js, Django, FastAPI" value={profile.skillCategories.frameworks} onChange={e => updateSkillCategory('frameworks', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Tools</label>
                  <input className="hud-input" placeholder="Power BI, Excel, Tableau, Git" value={profile.skillCategories.tools} onChange={e => updateSkillCategory('tools', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Platforms</label>
                  <input className="hud-input" placeholder="PyCharm, VS Code, IntelliJ, AWS" value={profile.skillCategories.platforms} onChange={e => updateSkillCategory('platforms', e.target.value)} />
                </div>
                <div className="full-width">
                  <label className="form-label">Soft Skills</label>
                  <input className="hud-input" placeholder="Rapport Building, Stakeholder Management, Leadership" value={profile.skillCategories.softSkills} onChange={e => updateSkillCategory('softSkills', e.target.value)} />
                </div>
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.65rem', color: 'var(--hud-cyan)', marginBottom: 8, letterSpacing: '0.1em' }}>
              QUICK SKILL TAGS (for AI matching)
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                className="hud-input"
                placeholder="Type a skill and press Enter..."
                value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }}
              />
              <button className="btn-hud" style={{ padding: '8px 14px' }} onClick={addSkill}><Plus size={14} /></button>
            </div>
            <div className="profile-skills-list">
              {profile.skills.map(s => (
                <span key={s} className="profile-skill-tag">
                  {s} <button onClick={() => removeSkill(s)}>×</button>
                </span>
              ))}
              {profile.skills.length === 0 && (
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem', color: 'rgba(0,240,255,0.3)' }}>
                  No skills added yet. Add React, Node.js, Python, etc.
                </span>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Experience ── */}
        {activeTab === 'experience' && (
          <motion.div key="exp" className="hud-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title">💼 WORK EXPERIENCE</div>
              <button className="btn-hud" style={{ padding: '6px 12px', fontSize: '0.6rem' }} onClick={() => addArrayItem('experience', { company: '', role: '', duration: '', description: '', link: '' })}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> ADD</span>
              </button>
            </div>
            {profile.experience.map((exp, i) => (
              <div key={i} style={{ padding: 14, border: '1px solid var(--border-hud)', borderRadius: 'var(--radius)', marginBottom: 12, position: 'relative' }}>
                {profile.experience.length > 1 && (
                  <button style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--hud-red)', cursor: 'pointer' }} onClick={() => removeArrayItem('experience', i)}><X size={14} /></button>
                )}
                <div className="profile-form-grid">
                  <div><label className="form-label">Role / Title</label><input className="hud-input" placeholder="Business Analyst Intern" value={exp.role} onChange={e => updateArrayItem('experience', i, 'role', e.target.value)} /></div>
                  <div><label className="form-label">Company / Organization</label><input className="hud-input" placeholder="WS" value={exp.company} onChange={e => updateArrayItem('experience', i, 'company', e.target.value)} /></div>
                  <div><label className="form-label">Duration</label><input className="hud-input" placeholder="January 24 - March 24" value={exp.duration} onChange={e => updateArrayItem('experience', i, 'duration', e.target.value)} /></div>
                  <div><label className="form-label">Link (optional)</label><input className="hud-input" placeholder="https://company.com" value={exp.link} onChange={e => updateArrayItem('experience', i, 'link', e.target.value)} /></div>
                  <div className="full-width">
                    <label className="form-label">Key Achievements (one per line, use bullet points)</label>
                    <textarea className="hud-input" placeholder="○ Streamlined data collection and reporting procedures, reducing processing time by 20%&#10;○ Implemented process improvements and automation solutions" value={exp.description} onChange={e => updateArrayItem('experience', i, 'description', e.target.value)} rows={4} />
                    <button
                      className="btn-hud secondary"
                      style={{ marginTop: 8, fontSize: '0.65rem', padding: '6px 10px' }}
                      onClick={() => handleEnhanceSnippet(i, 'experience', exp.description)}
                      disabled={enhancingState === `experience-${i}` || !exp.description}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {enhancingState === `experience-${i}` ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} color="var(--hud-cyan)" />}
                        {enhancingState === `experience-${i}` ? 'ENHANCING...' : 'ENHANCE WITH AI'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Education ── */}
        {activeTab === 'education' && (
          <motion.div key="edu" className="hud-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title">🎓 EDUCATION</div>
              <button className="btn-hud" style={{ padding: '6px 12px', fontSize: '0.6rem' }} onClick={() => addArrayItem('education', { institution: '', degree: '', year: '', location: '', gpa: '' })}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> ADD</span>
              </button>
            </div>
            {profile.education.map((edu, i) => (
              <div key={i} style={{ padding: 14, border: '1px solid var(--border-hud)', borderRadius: 'var(--radius)', marginBottom: 12, position: 'relative' }}>
                {profile.education.length > 1 && (
                  <button style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--hud-red)', cursor: 'pointer' }} onClick={() => removeArrayItem('education', i)}><X size={14} /></button>
                )}
                <div className="profile-form-grid">
                  <div><label className="form-label">Institution</label><input className="hud-input" placeholder="Vellore Institute of Technology" value={edu.institution} onChange={e => updateArrayItem('education', i, 'institution', e.target.value)} /></div>
                  <div><label className="form-label">Degree / Program</label><input className="hud-input" placeholder="Master of Computer Application; GPA: 8.06" value={edu.degree} onChange={e => updateArrayItem('education', i, 'degree', e.target.value)} /></div>
                  <div><label className="form-label">Duration</label><input className="hud-input" placeholder="June 2022 - August 2024" value={edu.year} onChange={e => updateArrayItem('education', i, 'year', e.target.value)} /></div>
                  <div><label className="form-label">Location</label><input className="hud-input" placeholder="Chennai, India" value={edu.location} onChange={e => updateArrayItem('education', i, 'location', e.target.value)} /></div>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {/* ── Projects ── */}
        {activeTab === 'projects' && (
          <motion.div key="proj" className="hud-card" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div className="section-title">🚀 PROJECTS & CERTIFICATIONS</div>
              <button className="btn-hud" style={{ padding: '6px 12px', fontSize: '0.6rem' }} onClick={() => addArrayItem('projects', { name: '', techStack: '', description: '', link: '' })}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> ADD PROJECT</span>
              </button>
            </div>
            {profile.projects.map((proj, i) => (
              <div key={i} style={{ padding: 14, border: '1px solid var(--border-hud)', borderRadius: 'var(--radius)', marginBottom: 12, position: 'relative' }}>
                {profile.projects.length > 1 && (
                  <button style={{ position: 'absolute', top: 8, right: 8, background: 'none', border: 'none', color: 'var(--hud-red)', cursor: 'pointer' }} onClick={() => removeArrayItem('projects', i)}><X size={14} /></button>
                )}
                <div className="profile-form-grid">
                  <div><label className="form-label">Project Name</label><input className="hud-input" placeholder="Student Performance Prediction" value={proj.name} onChange={e => updateArrayItem('projects', i, 'name', e.target.value)} /></div>
                  <div><label className="form-label">Link (optional)</label><input className="hud-input" placeholder="https://github.com/..." value={proj.link} onChange={e => updateArrayItem('projects', i, 'link', e.target.value)} /></div>
                  <div className="full-width">
                    <label className="form-label">Description (one achievement per line)</label>
                    <textarea className="hud-input" placeholder="○ Achieved a 96% accuracy in predicting academic performance&#10;○ Managed data integrity by handling missing values and encoding categorical variables" value={proj.description} onChange={e => updateArrayItem('projects', i, 'description', e.target.value)} rows={3} />
                    <button
                      className="btn-hud secondary"
                      style={{ marginTop: 8, fontSize: '0.65rem', padding: '6px 10px' }}
                      onClick={() => handleEnhanceSnippet(i, 'projects', proj.description)}
                      disabled={enhancingState === `projects-${i}` || !proj.description}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        {enhancingState === `projects-${i}` ? <Loader2 size={12} className="spin" /> : <Sparkles size={12} color="var(--hud-cyan)" />}
                        {enhancingState === `projects-${i}` ? 'ENHANCING...' : 'ENHANCE WITH AI'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Certifications Section */}
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div className="section-title">📜 CERTIFICATES</div>
                <button className="btn-hud" style={{ padding: '6px 12px', fontSize: '0.6rem' }} onClick={() => addArrayItem('certifications', { title: '', date: '', link: '' })}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Plus size={12} /> ADD</span>
                </button>
              </div>
              {profile.certifications.map((cert, i) => (
                <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                  <input className="hud-input" style={{ flex: 2 }} placeholder="Programming in Python (Meta)" value={typeof cert === 'string' ? cert : cert.title} onChange={e => updateArrayItem('certifications', i, 'title', e.target.value)} />
                  <input className="hud-input" style={{ flex: 1 }} placeholder="March 2023" value={typeof cert === 'string' ? '' : cert.date} onChange={e => updateArrayItem('certifications', i, 'date', e.target.value)} />
                  <button style={{ background: 'none', border: 'none', color: 'var(--hud-red)', cursor: 'pointer' }} onClick={() => removeArrayItem('certifications', i)}><X size={14} /></button>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ══════════════════════════════════════════
            PROFESSIONAL BLACK & WHITE RESUME PREVIEW
            ══════════════════════════════════════════ */}
        {activeTab === 'preview' && (
          <motion.div key="preview" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 8 }}>
              <div>
                <div className="section-title">📄 PROFESSIONAL RESUME PREVIEW</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.62rem', color: '#00ff88', marginTop: 4 }}>
                  📟 LIVE HUD EDIT ACTIVE — Click directly on any text line or bullet point below to customize!
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <motion.button className="btn-hud primary" onClick={handleDownload} whileHover={{ scale: 1.03 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Download size={14} /> PRINT / DOWNLOAD PDF</span>
                </motion.button>
              </div>
            </div>

            <div className="resume-preview" ref={resumeRef}>
              {/* ── Header: Name ── */}
              <h1 contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>
                {profile.fullName || 'Your Name'}
              </h1>

              {/* ── Contact Info Row ── */}
              <div className="resume-contact-row" contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>
                {profile.linkedin && <span><a href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`} className="resume-link">Linkedin: {profile.linkedin.replace(/https?:\/\//g, '')}</a></span>}
                {profile.github && <span><a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} className="resume-link">GitHub/ Behance / Dribbble</a></span>}
                {profile.email && <><span className="resume-separator">|</span><span>Email: {profile.email}</span></>}
                {profile.phone && <><span className="resume-separator">|</span><span>Mobile: {profile.phone}</span></>}
              </div>

              {/* ── Education ── */}
              {profile.education.some(e => e.institution) && (
                <>
                  <h3 contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>EDUCATION</h3>
                  {profile.education.filter(e => e.institution).map((edu, i) => (
                    <div key={i} className="resume-item">
                      <div className="resume-item-header">
                        <span><strong contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{edu.institution}</strong></span>
                        <span contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{edu.location || ''}</span>
                      </div>
                      <div className="resume-item-header" style={{ fontWeight: 'normal' }}>
                        <span className="resume-item-sub" contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{edu.degree}</span>
                        <span className="resume-item-sub" contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{edu.year}</span>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {/* ── Skills Summary ── */}
              {(getSkillsByCategory().length > 0) && (
                <>
                  <h3 contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>SKILLS SUMMARY</h3>
                  <div className="resume-skills-table">
                    {getSkillsByCategory().map((cat, i) => (
                      <div key={i} className="resume-skills-row">
                        <span className="resume-skills-label" contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>• {cat.label}:</span>
                        <span className="resume-skills-value" contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{cat.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {/* ── Work Experience ── */}
              {profile.experience.some(e => e.company || e.role) && (
                <>
                  <h3 contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>WORK EXPERIENCE</h3>
                  {profile.experience.filter(e => e.company || e.role).map((exp, i) => (
                    <div key={i} className="resume-item">
                      <div className="resume-item-header">
                        <span>
                          <strong contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{exp.role || 'Role'}</strong>
                          {exp.company && <> | <strong contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{exp.company}</strong></>}
                          {exp.link && <> | <a href={exp.link} className="resume-link">LINK</a></>}
                        </span>
                        <span contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{exp.duration}</span>
                      </div>
                      <ul>
                        {(generatedResume?.experience?.[i]?.bullets || 
                          exp.description.split('\n').filter(Boolean).map(line => line.replace(/^[○●•\-–]\s*/, ''))
                        ).map((bullet, j) => (
                          bullet && <li key={j} contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{bullet}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}

              {/* ── Projects ── */}
              {profile.projects.some(p => p.name) && (
                <>
                  <h3 contentEditable={true} suppressContentWarning={true} style={{ outline: 'none' }}>PROJECTS</h3>
                  {profile.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="resume-item">
                      <div className="resume-item-header">
                        <span>
                          <strong contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{proj.name}</strong>
                          {proj.link && <> | <a href={proj.link} className="resume-link">LINK</a></>}
                        </span>
                      </div>
                      <ul>
                        {(generatedResume?.projects?.[i]?.description || proj.description || '').split('\n').filter(Boolean).map((line, j) => (
                          <li key={j} contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{line.replace(/^[○●•\-–]\s*/, '')}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </>
              )}

              {/* ── Certifications ── */}
              {profile.certifications.length > 0 && profile.certifications.some(c => (typeof c === 'string' ? c : c.title)) && (
                <>
                  <h3 contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>CERTIFICATES</h3>
                  {profile.certifications.filter(c => (typeof c === 'string' ? c : c.title)).map((cert, i) => {
                    const title = typeof cert === 'string' ? cert : cert.title
                    const date = typeof cert === 'string' ? '' : cert.date
                    return (
                      <div key={i} className="resume-certs-item">
                        <span contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{title}</span>
                        {date && <span contentEditable={true} suppressContentEditableWarning={true} style={{ outline: 'none' }}>{date}</span>}
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for spinner */}
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── Fallback local resume builder ──
function buildLocalResume(profile) {
  return {
    summary: profile.summary || `Experienced ${profile.title || 'developer'} with expertise in ${profile.skills.slice(0, 3).join(', ')}. Passionate about building scalable applications and solving complex problems.`,
    experience: profile.experience.map(exp => ({
      bullets: exp.description ? exp.description.split('\n').filter(Boolean).map(line => line.replace(/^[○●•\-–]\s*/, '')) : [],
    })),
    projects: profile.projects.map(p => ({
      description: p.description,
    })),
  }
}
