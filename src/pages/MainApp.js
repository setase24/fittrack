import React, { useState } from 'react'
import Home from './Home/Home'
import Food from './Food/Food'
import Workout from './Workout/Workout'
import Progress from './Progress/Progress'
import Profile from './Profile/Profile'
import Graficas from './Graficas/Graficas'
import Inferencias from './Inferencias/Inferencias'

const TABS = [
  { id:'home', label:'Inicio', icon:'🏠' },
  { id:'food', label:'Comidas', icon:'🍎' },
  { id:'workout', label:'Entrenar', icon:'💪' },
  { id:'photos', label:'Progreso', icon:'📸' },
  { id:'profile', label:'Perfil', icon:'👤' },
]

export default function MainApp({ session, profile, setProfile }) {
  const [tab, setTab] = useState('home')
  const [subPage, setSubPage] = useState(null)
  const props = { session, profile, setProfile }

  function navigate(dest) {
    if (TABS.find(t=>t.id===dest)) { setTab(dest); setSubPage(null) }
    else setSubPage(dest)
  }

  if (subPage === 'graficas') return (
    <div className="app-shell">
      <Graficas {...props} onBack={() => { setSubPage(null); setTab('home') }} />
    </div>
  )

  if (subPage === 'inferencias') return (
    <div className="app-shell">
      <Inferencias {...props} onBack={() => { setSubPage(null); setTab('profile') }} />
    </div>
  )

  return (
    <div className="app-shell">
      {tab === 'home' && <Home {...props} onNavigate={navigate} />}
      {tab === 'food' && <Food {...props} />}
      {tab === 'workout' && <Workout {...props} />}
      {tab === 'photos' && <Progress {...props} />}
      {tab === 'profile' && <Profile {...props} onNavigate={navigate} />}
      <nav className="navbar">
        {TABS.map(t => (
          <button key={t.id} className={`nav-item ${tab===t.id&&!subPage?'active':''}`} onClick={() => navigate(t.id)}>
            <span style={{fontSize:20}}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
