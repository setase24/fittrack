import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { useGoogleFit } from '../../hooks/useGoogleFit'

function calcTMB(p) {
  if (!p?.peso_inicial_kg || !p?.altura_cm || !p?.edad) return 1750
  return Math.round(88.362 + (13.397*p.peso_inicial_kg) + (4.799*p.altura_cm) - (5.677*p.edad))
}

export default function Home({ profile, onNavigate }) {
  const [hoy, setHoy] = useState({ calorias:0, ejercicio:0, agua:0, pasos:0, comidas:[] })
  const [googleConectado, setGoogleConectado] = useState(false)
  const { sincronizarPasos, cargando: cargandoFit } = useGoogleFit()
  const today = new Date().toISOString().split('T')[0]
  const tmb = calcTMB(profile)
  const meta = profile?.meta_calorias || 1600
  const totalGasto = tmb + hoy.ejercicio
  const deficit = totalGasto - hoy.calorias
  const superavit = hoy.calorias > totalGasto
  const pct = Math.min(100, Math.round((hoy.calorias / meta) * 100))

  const fetchHoy = useCallback(async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id
    if (!uid) return
    const [{ data: comidas },{ data: agua },{ data: pasos },{ data: entrenos }] = await Promise.all([
      supabase.from('comidas').select('*').eq('user_id',uid).eq('fecha',today),
      supabase.from('agua_registros').select('ml').eq('user_id',uid).eq('fecha',today),
      supabase.from('pasos_diarios').select('pasos').eq('user_id',uid).eq('fecha',today).maybeSingle(),
      supabase.from('entrenamientos').select('calorias_quemadas').eq('user_id',uid).eq('fecha',today)
    ])
    const totalCal = (comidas||[]).reduce((s,c)=>s+c.calorias,0)
    const totalAgua = (agua||[]).reduce((s,a)=>s+a.ml,0)
    const totalEj = (entrenos||[]).reduce((s,e)=>s+(e.calorias_quemadas||0),0)
    setHoy({ calorias:totalCal, ejercicio:totalEj, agua:totalAgua/1000, pasos:pasos?.pasos||0, comidas:comidas||[] })
    const fitConectado = localStorage.getItem('googlefit_conectado')
    setGoogleConectado(!!fitConectado)
  }, [today])

  useEffect(() => { fetchHoy() }, [fetchHoy])

  async function addAgua() {
    const uid = (await supabase.auth.getUser()).data.user?.id
    await supabase.from('agua_registros').insert({ user_id:uid, ml:250 })
    setHoy(h => ({ ...h, agua: Math.round((h.agua+0.25)*10)/10 }))
  }

  async function conectarGoogleFit() {
    const pasos = await sincronizarPasos()
    if (pasos !== null) {
      localStorage.setItem('googlefit_conectado','1')
      setGoogleConectado(true)
      setHoy(h => ({ ...h, pasos }))
      alert(`✅ Google Fit conectado! ${pasos.toLocaleString()} pasos hoy.`)
    } else {
      alert('No se pudo conectar con Google Fit. Intenta de nuevo.')
    }
  }

  async function sincronizarAhora() {
    const pasos = await sincronizarPasos()
    if (pasos !== null) setHoy(h => ({ ...h, pasos }))
  }

  async function registrarPasosManual() {
    const val = prompt(`Pasos actuales: ${hoy.pasos}\n\n¿Cuántos pasos llevas hoy?`)
    if (!val || isNaN(val)) return
    const uid = (await supabase.auth.getUser()).data.user?.id
    await supabase.from('pasos_diarios').upsert({ user_id:uid, pasos:parseInt(val), fecha:today })
    setHoy(h => ({ ...h, pasos: parseInt(val) }))
  }

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'

  return (
    <div>
      <div className="page-header">
        <div>
          <div style={{ fontSize:13,color:'#888780' }}>{greeting}, <span style={{ fontWeight:600,color:'#1A1A1A' }}>{profile?.nombre}</span></div>
          <div className="page-sub">{new Date().toLocaleDateString('es-CO',{weekday:'long',day:'numeric',month:'short'})}</div>
        </div>
        <button onClick={addAgua} style={{ background:'#E6F1FB',border:'none',borderRadius:10,padding:'7px 10px',cursor:'pointer',fontSize:12,color:'#185FA5',fontWeight:600 }}>💧 +250ml</button>
      </div>
      <div className="page-content">
        <div className="card">
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:8 }}>
            <div>
              <div style={{ fontSize:13,fontWeight:600 }}>Balance calórico</div>
              <div style={{ fontSize:11,color:superavit?'#E24B4A':'#1D9E75',marginTop:1 }}>
                {superavit ? `Superávit ${Math.abs(deficit)} kcal ⚠️` : `Déficit ${deficit} kcal · en camino ✓`}
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:22,fontWeight:700,color:superavit?'#E24B4A':'#1D9E75' }}>{hoy.calorias.toLocaleString()}</div>
              <div style={{ fontSize:11,color:'#888780' }}>de {meta.toLocaleString()} kcal</div>
            </div>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width:`${pct}%`,background:superavit?'#E24B4A':'#1D9E75' }}></div>
          </div>
          <div style={{ display:'flex',justifyContent:'space-between',fontSize:10,color:'#888780' }}>
            <span>● Com. {hoy.calorias.toLocaleString()}</span>
            <span>● Ej. {hoy.ejercicio}</span>
            <span>● TMB {tmb.toLocaleString()}</span>
          </div>
        </div>

        <div className="grid-2" style={{ marginBottom:8 }}>
          <div className="metric-card">
            <div className="metric-label">% grasa</div>
            <div className="metric-value" style={{ fontSize:18 }}>—</div>
            <div className="progress-track"><div className="progress-fill" style={{ width:'0%',background:'#BA7517' }}></div></div>
            <div className="metric-sub">Registra en Perfil</div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Masa muscular</div>
            <div className="metric-value" style={{ fontSize:18 }}>—</div>
            <div className="progress-track"><div className="progress-fill" style={{ width:'0%',background:'#1D9E75' }}></div></div>
            <div className="metric-sub">Registra en Perfil</div>
          </div>
          <div className="metric-card" style={{ cursor:'pointer' }}
            onClick={googleConectado ? sincronizarAhora : conectarGoogleFit}>
            <div className="metric-label">
              {googleConectado ? '👣 Pasos hoy' : '👣 Pasos — toca para conectar'}
            </div>
            <div className="metric-value" style={{ fontSize:18 }}>
              {cargandoFit ? '...' : hoy.pasos.toLocaleString()}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width:`${Math.min(100,(hoy.pasos/10000)*100)}%`,background:'#1D9E75' }}></div>
            </div>
            <div className="metric-sub">
              {googleConectado ? 'Google Fit ✓ · toca para sincronizar' : 'Conectar Google Fit'}
            </div>
          </div>
          <div className="metric-card">
            <div className="metric-label">Agua</div>
            <div className="metric-value" style={{ fontSize:18 }}>{hoy.agua.toFixed(1)}<span className="metric-unit">L</span></div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width:`${Math.min(100,(hoy.agua/2.5)*100)}%`,background:'#378ADD' }}></div>
            </div>
            <div className="metric-sub">meta 2.5L · botón ↑</div>
          </div>
        </div>

        {!googleConectado && (
          <div style={{ background:'#FAEEDA',borderRadius:14,padding:'10px 12px',marginBottom:8,display:'flex',alignItems:'center',gap:8,cursor:'pointer' }} onClick={conectarGoogleFit}>
            <span style={{ fontSize:20 }}>🦶</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:12,fontWeight:600,color:'#633806' }}>Conecta Google Fit para pasos automáticos</div>
              <div style={{ fontSize:11,color:'#854F0B' }}>Toca aquí · solo se pide permiso una vez</div>
            </div>
            <span style={{ color:'#633806',fontSize:14 }}>›</span>
          </div>
        )}

        <div className="grid-2" style={{ marginBottom:8 }}>
          <div className="quick-btn" onClick={() => onNavigate('food')}>
            <span className="quick-btn-icon">📷</span>
            <div><div className="quick-btn-title">Registrar comida</div><div className="quick-btn-sub">foto con IA o manual</div></div>
          </div>
          <div className="quick-btn" onClick={() => onNavigate('workout')}>
            <span className="quick-btn-icon">🏋️</span>
            <div><div className="quick-btn-title">Entrenar</div><div className="quick-btn-sub">gym · run · baile</div></div>
          </div>
          <div className="quick-btn" onClick={() => onNavigate('graficas')}>
            <span className="quick-btn-icon">📊</span>
            <div><div className="quick-btn-title">Gráficas calóricas</div><div className="quick-btn-sub">sem · mes · anual</div></div>
          </div>
          <div className="quick-btn" onClick={() => onNavigate('photos')}>
            <span className="quick-btn-icon">🎯</span>
            <div><div className="quick-btn-title">Metas y progreso</div><div className="quick-btn-sub">peso · grasa · músculo</div></div>
          </div>
        </div>

        <div className="card" style={{ marginBottom:0 }}>
          <div style={{ fontSize:12,color:'#888780',marginBottom:8 }}>
            Comidas hoy · <span style={{ fontWeight:600,color:'#1D9E75' }}>{hoy.calorias.toLocaleString()} kcal</span>
          </div>
          <div style={{ display:'flex',gap:5 }}>
            {['desayuno','almuerzo','cena','snack'].map(tipo => {
              const items = hoy.comidas.filter(c=>c.tipo_comida===tipo)
              const cal = items.reduce((s,c)=>s+c.calorias,0)
              return (
                <div key={tipo} style={{ flex:1,background:'#F9F9F7',borderRadius:10,padding:'7px 5px',textAlign:'center' }}>
                  <div style={{ fontSize:10,color:'#888780',textTransform:'capitalize' }}>{tipo}</div>
                  <div style={{ fontSize:12,fontWeight:600,color:items.length?'#1D9E75':'#CCC' }}>{cal||'—'}</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
