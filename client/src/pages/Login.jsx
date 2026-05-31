import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Zap, Eye, EyeOff, ArrowLeft } from 'lucide-react'
import api from '../api'

export default function Login({ onAuth, isRegisterMode = false }) {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(isRegisterMode)
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = isRegister
        ? await api.register(form)
        : await api.login({ email: form.email, password: form.password })

      if (res.success) {
        onAuth(res.data.token, res.data.user)
      } else {
        setError(res.error || 'Something went wrong')
      }
    } catch (err) {
      setError('Server connection failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <motion.div
        className="login-card hud-frame"
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="corner-bl" />
        <div className="corner-br" />

        {/* Back to Home */}
        <div style={{ marginBottom: 16 }}>
          <button className="btn-hud" style={{ padding: '6px 12px', fontSize: '0.55rem' }} onClick={() => navigate('/')}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><ArrowLeft size={12} /> HOME</span>
          </button>
        </div>

        {/* Logo */}
        <motion.div
          className="login-logo"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <div style={{
            width: 60, height: 60, margin: '0 auto 16px',
            borderRadius: 12,
            background: 'linear-gradient(135deg, rgba(0,240,255,0.2), rgba(168,85,247,0.2))',
            border: '1px solid rgba(0,240,255,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 30px rgba(0,240,255,0.2)',
          }}>
            <Zap size={28} color="#00f0ff" />
          </div>
          <h1>QUICKAPPLY.AI</h1>
          <p>STOP FILLING FORMS. START GETTING INTERVIEWS.</p>
        </motion.div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <AnimatePresence mode="wait">
            {isRegister && (
              <motion.div
                className="form-group"
                key="name"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className="form-label">Full Name</label>
                <input
                  className="hud-input"
                  type="text"
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required={isRegister}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="hud-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="hud-input"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(0,240,255,0.4)',
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                padding: '10px 14px', marginBottom: 16, borderRadius: 4,
                background: 'rgba(255,51,102,0.1)', border: '1px solid rgba(255,51,102,0.3)',
                color: '#ff3366', fontFamily: 'var(--font-mono)', fontSize: '0.75rem',
              }}
            >
              {error}
            </motion.div>
          )}

          <motion.button
            className="btn-hud primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', padding: '14px', fontSize: '0.8rem' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                  style={{ display: 'inline-block' }}
                >
                  ⚡
                </motion.span>
                {isRegister ? 'Initializing...' : 'Authenticating...'}
              </span>
            ) : (
              isRegister ? '⚡ CREATE ACCOUNT' : '⚡ ACCESS DASHBOARD'
            )}
          </motion.button>
        </form>

        <div className="login-divider">
          <span>{isRegister ? 'ALREADY REGISTERED?' : 'NEW RECRUIT?'}</span>
        </div>

        <button
          className="btn-hud"
          onClick={() => { setIsRegister(!isRegister); setError(''); }}
          style={{ width: '100%', padding: '12px' }}
        >
          {isRegister ? 'LOGIN TO DASHBOARD' : 'REGISTER NOW'}
        </button>
      </motion.div>
    </div>
  )
}
