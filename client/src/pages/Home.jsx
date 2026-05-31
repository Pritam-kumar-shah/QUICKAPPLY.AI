import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Target, TrendingUp, FileText, Shield, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } }

export default function Home() {
  const navigate = useNavigate()
  const isLoggedIn = !!localStorage.getItem('quickapply_token') || !!localStorage.getItem('applyflow_token')

  return (
    <div className="landing-page">
      {/* ── Nav ── */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">⚡ QUICKAPPLY.AI</div>
        <div className="landing-nav-links">
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
          {isLoggedIn ? (
            <button className="btn-hud primary" style={{ padding: '8px 16px', fontSize: '0.6rem' }} onClick={() => navigate('/dashboard')}>
              DASHBOARD
            </button>
          ) : (
            <>
              <button className="btn-hud" style={{ padding: '8px 14px', fontSize: '0.6rem' }} onClick={() => navigate('/login')}>
                LOGIN
              </button>
              <button className="btn-hud primary" style={{ padding: '8px 14px', fontSize: '0.6rem' }} onClick={() => navigate('/register')}>
                GET STARTED
              </button>
            </>
          )}
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="hero-section">
        <motion.div className="hero-content" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.15 } } }}>
          <motion.div className="hero-badge" variants={fadeUp}>
            <Sparkles size={12} /> AI-POWERED JOB AUTOMATION
          </motion.div>

          <motion.h1 className="hero-title" variants={fadeUp}>
            Stop Filling Forms.<br />
            <span className="gradient-text">Start Getting Interviews.</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={fadeUp}>
            QuickApply.AI uses Gemini AI to analyze your resume, find perfect job matches,
            optimize your ATS score, and auto-apply to jobs in seconds — not hours.
          </motion.p>

          <motion.div className="hero-buttons" variants={fadeUp}>
            <button className="btn-hud primary" style={{ padding: '14px 28px', fontSize: '0.75rem' }} onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={16} /> {isLoggedIn ? 'GO TO DASHBOARD' : 'START FREE — NO CARD NEEDED'}
              </span>
            </button>
            <button className="btn-hud" style={{ padding: '14px 28px', fontSize: '0.75rem' }} onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                SEE FEATURES <ArrowRight size={14} />
              </span>
            </button>
          </motion.div>

          <motion.div className="hero-stats" variants={fadeUp}>
            {[
              { value: '10x', label: 'FASTER APPLYING' },
              { value: '85%+', label: 'ATS SCORE AVG' },
              { value: '50+', label: 'JOBS MATCHED' },
              { value: '< 3s', label: 'PER APPLICATION' },
            ].map((s, i) => (
              <div key={i} className="hero-stat">
                <div className="hero-stat-value">{s.value}</div>
                <div className="hero-stat-label">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── Features ── */}
      <section className="features-section" id="features">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          EVERYTHING YOU NEED TO LAND YOUR DREAM JOB
        </motion.h2>

        <div className="features-grid">
          {[
            {
              icon: '⚡', color: 'var(--hud-cyan)',
              bg: 'rgba(0,240,255,0.1)',
              title: 'One-Click Auto-Apply',
              desc: 'AI fills every form field, optimizes your resume, generates a cover letter, and submits — all in under 3 seconds.',
            },
            {
              icon: '🎯', color: 'var(--hud-green)',
              bg: 'rgba(0,255,136,0.1)',
              title: 'AI Job Matching',
              desc: 'Gemini AI scans thousands of listings and ranks them by % match to your skills, experience, and preferences.',
            },
            {
              icon: '📊', color: 'var(--hud-purple)',
              bg: 'rgba(168,85,247,0.1)',
              title: 'Skill Gap Analysis',
              desc: '"Learn Next.js → +20% selection boost." Get personalized learning paths with free resources and timelines.',
            },
            {
              icon: '🛡️', color: 'var(--hud-blue)',
              bg: 'rgba(0,102,255,0.1)',
              title: 'ATS Score Optimizer',
              desc: 'AI rewrites your resume to beat Applicant Tracking Systems. Average score boost: 25+ points.',
            },
            {
              icon: '📝', color: 'var(--hud-gold)',
              bg: 'rgba(255,215,0,0.1)',
              title: 'AI Resume Builder',
              desc: 'Fill your profile — AI generates a professional, job-ready resume. Download as PDF instantly.',
            },
            {
              icon: '🎤', color: 'var(--hud-magenta)',
              bg: 'rgba(255,0,170,0.1)',
              title: 'Interview Preparation',
              desc: 'AI generates likely questions, ideal answers, and company-specific research for every job you apply to.',
            },
          ].map((f, i) => (
            <motion.div
              key={i}
              className="feature-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="feature-icon" style={{ background: f.bg, border: `1px solid ${f.color}30` }}>
                {f.icon}
              </div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="features-section" id="how">
        <motion.h2 initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
          HOW IT WORKS
        </motion.h2>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          {[
            { step: '01', title: 'Create Profile', desc: 'Add your skills, experience, and projects. AI builds your resume automatically.' },
            { step: '02', title: 'AI Scans Jobs', desc: 'Gemini analyzes 10,000+ listings and ranks best matches for you.' },
            { step: '03', title: 'Review Matches', desc: 'See % match, skill gaps, and what to learn to boost your chances.' },
            { step: '04', title: 'One-Click Apply', desc: 'AI optimizes resume, writes cover letter, fills forms, and submits. Done.' },
          ].map((s, i) => (
            <motion.div
              key={i}
              className="hud-card"
              style={{ textAlign: 'center', padding: 28 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12 }}
            >
              <div style={{
                fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 900,
                color: 'var(--hud-cyan)', textShadow: '0 0 30px rgba(0,240,255,0.3)',
                marginBottom: 12,
              }}>{s.step}</div>
              <div style={{ fontFamily: 'var(--font-heading)', fontSize: '1.1rem', fontWeight: 700, color: 'var(--hud-white)', marginBottom: 8 }}>
                {s.title}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'rgba(224,240,255,0.5)', lineHeight: 1.6 }}>
                {s.desc}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '60px 24px 80px', textAlign: 'center' }}>
        <motion.div
          className="hud-card"
          style={{ maxWidth: 600, margin: '0 auto', padding: 40, border: '1px solid var(--border-active)' }}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
        >
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1rem, 3vw, 1.4rem)', fontWeight: 800, color: 'var(--hud-white)', marginBottom: 12, letterSpacing: '0.08em' }}>
            READY TO AUTOMATE YOUR JOB SEARCH?
          </div>
          <div style={{ fontSize: '0.9rem', color: 'rgba(224,240,255,0.5)', marginBottom: 24, lineHeight: 1.6 }}>
            Join thousands of candidates who stopped wasting time on manual forms.
          </div>
          <button className="btn-hud primary" style={{ padding: '14px 32px', fontSize: '0.75rem' }} onClick={() => navigate(isLoggedIn ? '/dashboard' : '/register')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} /> GET STARTED NOW
            </span>
          </button>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="landing-footer">
        © 2026 QUICKAPPLY.AI — BUILT WITH GEMINI AI • ALL RIGHTS RESERVED
      </footer>
    </div>
  )
}
