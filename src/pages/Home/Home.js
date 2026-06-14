import React, { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

function calcTMB(profile) {
  if (!profile.peso_inicial_kg || !profile.altura_cm || !profile.edad) return 1750
  return Math.round(88.362 + (13.397 * profile.peso_inicial_kg) + (4.799 * profile.altura_cm) - (5.677 * profile.edad))
}

export default function Home({ profile, onNavigate }) {
  const [hoy, setHoy] = useState({ calorias: 0, ejercicio: 0, agua: 0, pasos: 0, comidas: [] })
  const today = new Date().toISOString().split('T')[0]
  const tmb = calcTMB(profile)
  const meta = profile.meta_calorias || 1600
  const deficit = (tmb + hoy.ejercicio) - hoy.calorias

  useEffect(() => { fetchHoy() }, [])

  async function fetchHoy() {
    const uid = (await supabase.auth.getUser()).data.user?.id
    const [{ data: comidas }, { data: agua }, { data: pasos }, { data: entrenos }] = await Promise.all([
      supabase.from('comidas').select('*').eq('user_id', uid).eq('fecha', today),
      supabase.from('agua_registros').select('ml').eq('user_id', uid).eq('fecha', today),
      supabase.from('pasos_diarios').select('pasos').eq('user_id', uid).eq('fecha', today).single(),
      supabase.from('entrenamientos').select('calorias_quemadas').eq('user_id', uid).eq('fecha', today)
    ])
    const totalCal = (comidas || []).reduce((s, c) => s + c.calorias, 0)
    const totalAgua = (agua || []).reduce((s, a) => s + a.ml, 0)
    const totalEj = (entrenos || []).reduce((s, e) => s + (e.calorias_quemadas || 0), 0)
    setHoy({ calorias: totalCal, ejercicio: totalEj, agua: totalAgua / 1000, pasos: pasos?.pasos || 0, comidas: comidas || [] })
  }

  async function addAgua() {
    const uid = (await supabase.auth.getUser()).data.user?.id
    await supabase.from('agua_registros').insert({ user_id: uid, ml: 250 })
    setHoy(h => ({ ...h, agua: h.agua + 0.25 }))
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'
  const pct = Math.min(100, Math.round((hoy.calorias / meta) * 100))
  const superavit = hoy.calorias > (tmb + hoy.ejercicio)

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontSize: 13, color: '#888780' }}>{greeting}, <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{profile.nombre}</span></div>
          <div className="page-sub">{new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'short' })}</div>
        </div>
        <button onClick={addAgua} style={{ background: '#E6F1FB', border: 'none', borderRadius: 10, padding: '7px 10px', cursor: 'pointer', fontSize: 12, color: '#185FA5', fontWeight: 600 }}>💧 +250ml</button>
      </div>

      <div className="page-content">
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Balance calórico</div>
              <div style={{ fontSize: 11, color: superavit ? '#E24B4A' : '#1D9E75', marginTop: 1 }}>
                {superavit ? `Superávit ${Math.abs(deficit)} kcal` : `Déficit ${deficit} kcal · en camino`}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: superavit ? '#E24B4A' : '#1D9E75' }}>{hoy.calorias.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: '#888780' }}>de {meta.toLocaleString()} kcal</div>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${pct}%`, background: superavit ? '#E24B4A' : '#1D9E75' }}></div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#888780' }}>
            <span>● Com. {hoy.calorias.toLocaleString()}</span>
            <span>● Ej. {hoy.ejercicio}</span>
            <span>● TMB {tmb.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom: 8 }}>
          {[
            { label: '% grasa', value: '—', sub: 'meta 12–15%', color: '#BA7517', pct: 0 },
            { label: 'Masa muscular', value: '—', sub: 'meta 68 kg', color: '#1D9E75', pct: 0 },
            { label: 'Pasos hoy', value: hoy.pasos.toLocaleString(), sub: 'meta 10,000', color: '#1D9E75', pct: Math.min(100, (hoy.pasos/10000)*100) },
            { label: 'Agua', value: `${hoy.agua.toFixed(1)}L`, sub: 'meta 2.5L', color: '#378ADD', pct: Math.min(100, (hoy.agua/2.5)*100) },
          ].map(m => (
            <div key={m.label} className="metric-card">
              <div className="metric-label">{m.label}</div>
              <div className="metric-value" style={{ color: '#1A1A1A', fontSize: 18 }}>{m.value}</div>
              <div className="progress-track"><div className="progress-fill" style={{ width: `${m.pct}%`, background: m.color }}></div></div>
              <div className="metric-sub">{m.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid-2" style={{ marginBottom: 8 }}>
          {[
            { icon: '📷', title: 'Registrar comida', sub: 'foto o texto', tab: 'food', bg: '#E1F5EE' },
            { icon: '🏋️', title: 'Entrenar', sub: 'gym · run · baile', tab: 'workout', bg: '#E6F1FB' },
            { icon: '📊', title: 'Gráficas calóricas', sub: 'sem · mes · anual', tab: 'graficas', bg: '#FAEEDA' },
            { icon: '🎯', title: 'Metas y progreso', sub: 'peso · grasa · músculo', tab: 'photos', bg: '#EEEDFE' },
          ].map(b => (
            <div key={b.title} className="quick-btn" style={{ background: b.bg }} onClick={() => onNavigate(b.tab)}>
              <span className="quick-btn-icon">{b.icon}</span>
              <div><div className="quick-btn-title">{b.title}</div><div className="quick-btn-sub">{b.sub}</div></div>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginBottom: 0 }}>
          <div style={{ fontSize: 12, color: '#888780', marginBottom: 8 }}>
            Comidas hoy · <span style={{ fontWeight: 600, color: '#1D9E75' }}>{hoy.calorias.toLocaleString()} kcal</span>
          </div>
          {['desayuno','almuerzo','cena','snack'].map(tipo => {
            const items = hoy.comidas.filter(c => c.tipo_comida === tipo)
            const cal = items.reduce((s,c) => s+c.calorias, 0)
            return (
              <div key={tipo} style={{ flex: 1, background: '#F9F9F7', borderRadius: 10, padding: '7px 8px', display: 'inline-block', width: '24%', marginRight: '1%', textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: '#888780', textTransform: 'capitalize' }}>{tipo}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: items.length ? '#1D9E75' : '#CCC' }}>{cal ? `${cal}` : '—'}</div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
