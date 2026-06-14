import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Auth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState('login')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setMsg('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setMsg(error.message)
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setMsg(error.message)
      else setMsg('Revisa tu email para confirmar tu cuenta')
    }
    setLoading(false)
  }

  return (
    <div className="auth-wrap">
      <div className="auth-logo">FitTrack</div>
      <div className="auth-tagline">Tu app personal de fitness y nutrición</div>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: 340 }}>
        <div className="section-label">Email</div>
        <input className="input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="tu@email.com" required />
        <div className="section-label">Contraseña</div>
        <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
        {msg && <div style={{ fontSize: 13, color: msg.includes('email') ? '#1D9E75' : '#E24B4A', marginBottom: 10, textAlign: 'center' }}>{msg}</div>}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ marginBottom: 12 }}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
        <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          style={{ width: '100%', background: 'none', border: 'none', color: '#1D9E75', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>
          {mode === 'login' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Entra'}
        </button>
      </form>
    </div>
  )
}
