import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import './index.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('quickapply_token') || localStorage.getItem('applyflow_token') || null)

  const handleAuth = (newToken, userData) => {
    localStorage.setItem('quickapply_token', newToken)
    if (userData) localStorage.setItem('quickapply_user', JSON.stringify(userData))
    setToken(newToken)
  }

  const handleLogout = () => {
    localStorage.removeItem('quickapply_token')
    localStorage.removeItem('quickapply_user')
    localStorage.removeItem('applyflow_token')
    localStorage.removeItem('applyflow_user')
    setToken(null)
  }

  return (
    <BrowserRouter>
      <div className="hud-bg" />
      <div className="scan-line" />

      <Routes>
        {/* Public Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={
          token ? <Navigate to="/dashboard" replace /> : <Login onAuth={handleAuth} />
        } />
        <Route path="/register" element={
          token ? <Navigate to="/dashboard" replace /> : <Login onAuth={handleAuth} isRegisterMode />
        } />

        {/* Protected */}
        <Route path="/dashboard" element={
          token ? <Dashboard onLogout={handleLogout} /> : <Navigate to="/login" replace />
        } />
        <Route path="/profile" element={
          token ? <Profile /> : <Navigate to="/login" replace />
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App
