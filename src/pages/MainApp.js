import React, { useState } from 'react'
import Home from './Home/Home'
import Food from './Food/Food'
import Workout from './Workout/Workout'
import Progress from './Progress/Progress'
import Profile from './Profile/Profile'

const TABS = [
  { id: 'home', label: 'Inicio', icon: '🏠' },
  { id: 'food', label: 'Comidas', icon: '🍎' },
  { id: 'workout', label: 'Entrenar', icon: '💪' },
  { id: 'photos', label: 'Progreso', icon: '📸' },
  { id: 'profile', label: 'Perfil', icon: '👤' },
]

export default function MainApp({ session, profile, setProfile }) {
  const [tab, setTab] = useState('home')

  const props = { session, profile, setProfile }

  return (
    <div className="app-shell">
      {tab === 'home' && <Home {...props} onNavigate={setTab} />}
      {tab === 'food' && <Food {...props} />}
      {tab === 'workout' && <Workout {...props} />}
      {tab === 'photos' && <Progress {...props} />}
      {tab === 'profile' && <Profile {...props} />}

      <nav className="navbar">
        {TABS.map(t => (
          <button key={t.id} className={`nav-item ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
