import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const ACTIVIDADES = [
  { id: 'gym', icon: '🏋️', label: 'Gym', sub: 'Series y peso', bg: '#E1F5EE', color: '#085041' },
  { id: 'caminadora', icon: '🏃', label: 'Caminadora', sub: 'Intervalos', bg: '#E6F1FB', color: '#0C447C' },
  { id: 'futbol', icon: '⚽', label: 'Fútbol 5', sub: 'Posición y tiempo', bg: '#FAECE7', color: '#712B13' },
  { id: 'baile', icon: '💃', label: 'Baile', sub: 'Salsa · Bachata', bg: '#FBEAF0', color: '#72243E' },
  { id: 'spinning', icon: '🚴', label: 'Spinning', sub: 'Indoor', bg: '#EEEDFE', color: '#3C3489' },
  { id: 'otro', icon: '➕', label: 'Otro', sub: 'Manual', bg: '#F1EFE8', color: '#444441' },
]

const PARTES = ['Brazos','Tren superior','Piernas','Core / abdomen','Full body']
const POSICIONES = ['Portero','Defensa','Mediocampista','Delantero']
const BAILES = ['Salsa','Bachata','Otro']
const INTENSIDADES = ['Suave','Moderada','Intensa']
const CAL_MIN = { gym: 5, caminadora: 8, futbol: 7.5, baile: 6, spinning: 9, otro: 5 }
const CAL_INTENS = { Suave: 0.7, Moderada: 1, Intensa: 1.4 }

export default function Workout({ profile }) {
  const [vista, setVista] = useState('menu')
  const [act, setAct] = useState(null)
  const [form, setForm] = useState({ parte: 'Brazos', inicio: '', fin: '', posicion: 'Mediocampista', baile: 'Salsa', intensidad: 'Moderada', actividad: '' })
  const [ejercicios, setEjercicios] = useState([{ nombre: '', series: 3, reps: 10, kg: 0 }])
  const [intervalos, setIntervalos] = useState([{ min: 10, kmh: 9.5, tipo: 'Correr' }, { min: 2, kmh: 5, tipo: 'Caminar' }])
  const [historial, setHistorial] = useState([])
  const [guardando, setGuardando] = useState(false)
  const today = new Date().toISOString().split('T')[0]
  const peso = profile.peso_inicial_kg || 75

  const fetchHistorial = useCallback(async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { data } = await supabase.from('entrenamientos').select('*').eq('user_id', uid).eq('fecha', today).order('created_at', { ascending: false })
    setHistorial(data || [])
  }, [today])

  useEffect(() => { fetchHistorial() }, [fetchHistorial])

  function calcDuracion() {
    if (!form.inicio || !form.fin) return 0
    const [hi, mi] = form.inicio.split(':').map(Number)
    const [hf, mf] = form.fin.split(':').map(Number)
    return Math.max(0, (hf * 60 + mf) - (hi * 60 + mi))
  }

  function calcCal() {
    const dur = act?.id === 'caminadora'
      ? intervalos.filter(i => i.tipo === 'Correr').reduce((s, i) => s + Number(i.min), 0)
      : calcDuracion()
    const base = (CAL_MIN[act?.id || 'otro'] * peso) / 75
    const mult = CAL_INTENS[form.intensidad] || 1
    return Math.round(dur * base * mult)
  }

  async function eliminarEntreno(id) {
    await supabase.from('entrenamientos').delete().eq('id', id)
    fetchHistorial()
  }

  async function guardar() {
    setGuardando(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const dur = calcDuracion()
    const cal = calcCal()
    const { data: entreno } = await supabase.from('entrenamientos').insert({
      user_id: uid, tipo: act.id,
      subtipo: form.parte || form.posicion || form.baile || form.actividad || null,
      hora_inicio: form.inicio || null, hora_fin: form.fin || null,
      duracion_min: dur, calorias_quemadas: cal, fecha: today
    }).select().single()
    if (entreno && act.id === 'gym') {
      const exs = ejercicios.filter(e => e.nombre).map((e, i) => ({
        entrenamiento_id: entreno.id, nombre: e.nombre,
        series: Number(e.series), repeticiones: Number(e.reps),
        peso_kg: Number(e.kg), orden: i + 1
      }))
      if (exs.length) await supabase.from('ejercicios').insert(exs)
    }
    if (entreno && act.id === 'caminadora') {
      const ints = intervalos.map((iv, i) => ({
        entrenamiento_id: entreno.id, orden: i + 1,
        duracion_min: Number(iv.min), velocidad_kmh: Number(iv.kmh),
        tipo: iv.tipo.toLowerCase()
      }))
      await supabase.from('intervalos_caminadora').insert(ints)
    }
    setVista('menu'); setAct(null)
    setEjercicios([{ nombre: '', series: 3, reps: 10, kg: 0 }])
    setIntervalos([{ min: 10, kmh: 9.5, tipo: 'Correr' }, { min: 2, kmh: 5, tipo: 'Caminar' }])
    setForm({ parte: 'Brazos', inicio: '', fin: '', posicion: 'Mediocampista', baile: 'Salsa', intensidad: 'Moderada', actividad: '' })
    fetchHistorial()
    setGuardando(false)
  }

  if (vista === 'menu') return (
    <div>
      <div className="page-header"><div className="page-title">Entrenar</div></div>
      <div className="page-content">
        <div className="section-label">¿Qué actividad hoy?</div>
        <div className="grid-2" style={{ marginBottom: 10 }}>
          {ACTIVIDADES.map(a => (
            <div key={a.id} className="cat-btn" style={{ background: a.bg }} onClick={() => { setAct(a); setVista('form') }}>
              <div className="cat-btn-icon">{a.icon}</div>
              <div className="cat-btn-label" style={{ color: a.color }}>{a.label}</div>
              <div className="cat-btn-sub" style={{ color: a.color }}>{a.sub}</div>
            </div>
          ))}
        </div>
        {historial.length > 0 && <>
          <div className="section-label">Hoy</div>
          <div className="card">
            {historial.map(e => (
              <div key={e.id} className="workout-item">
                <div className="workout-item-icon" style={{ background: ACTIVIDADES.find(a=>a.id===e.tipo)?.bg||'#F4F4F2' }}>
                  {ACTIVIDADES.find(a=>a.id===e.tipo)?.icon||'💪'}
                </div>
                <div style={{ flex: 1 }}>
                  <div className="workout-item-name">{ACTIVIDADES.find(a=>a.id===e.tipo)?.label} {e.subtipo?`· ${e.subtipo}`:''}</div>
                  <div className="workout-item-sub">{e.duracion_min} min</div>
                </div>
                <div className="workout-item-kcal">-{e.calorias_quemadas} kcal</div>
                <button onClick={() => eliminarEntreno(e.id)} style={{ background:'none',border:'none',color:'#E24B4A',cursor:'pointer',fontSize:16,marginLeft:6 }}>×</button>
              </div>
            ))}
          </div>
        </>}
        {historial.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">💪</div>
            <div className="empty-title">Sin entrenamientos hoy</div>
            <div className="empty-sub">Selecciona una actividad arriba para registrar</div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => setVista('menu')}>← {act?.label}</button>
      </div>
      <div className="page-content">
        {act?.id === 'gym' && <>
          <div className="section-label">Parte del cuerpo</div>
          {PARTES.map(p => (
            <button key={p} className={`sel-btn ${form.parte===p?'active':''}`} onClick={() => setForm(f=>({...f,parte:p}))}>
              <div className="sel-btn-title">{p}</div>
            </button>
          ))}
        </>}
        {act?.id === 'futbol' && <>
          <div className="section-label">Posición</div>
          <div className="grid-2" style={{ marginBottom: 10 }}>
            {POSICIONES.map(p => (
              <button key={p} className={`sel-btn ${form.posicion===p?'active':''}`} onClick={() => setForm(f=>({...f,posicion:p}))}>
                <div className="sel-btn-title">{p}</div>
              </button>
            ))}
          </div>
        </>}
        {act?.id === 'baile' && <>
          <div className="section-label">Tipo de baile</div>
          <div className="chip-row">{BAILES.map(b => <button key={b} className={`chip ${form.baile===b?'active':''}`} onClick={()=>setForm(f=>({...f,baile:b}))}>{b}</button>)}</div>
        </>}
        {['spinning','otro'].includes(act?.id) && <>
          <div className="section-label">Intensidad</div>
          {INTENSIDADES.map(i => (
            <button key={i} className={`sel-btn ${form.intensidad===i?'active':''}`} onClick={()=>setForm(f=>({...f,intensidad:i}))}>
              <div className="sel-btn-title">{i}</div>
            </button>
          ))}
        </>}
        {act?.id === 'otro' && <>
          <div className="section-label">¿Qué actividad?</div>
          <input className="input" placeholder="Yoga, natación, boxeo..." value={form.actividad} onChange={e=>setForm(f=>({...f,actividad:e.target.value}))} />
        </>}

        <div className="section-label">Horario</div>
        <div style={{ display:'flex',gap:10,marginBottom:10 }}>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11,color:'#888780',marginBottom:4 }}>Inicio</div>
            <input className="input" style={{ marginBottom:0 }} type="time" value={form.inicio} onChange={e=>setForm(f=>({...f,inicio:e.target.value}))} />
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:11,color:'#888780',marginBottom:4 }}>Fin</div>
            <input className="input" style={{ marginBottom:0 }} type="time" value={form.fin} onChange={e=>setForm(f=>({...f,fin:e.target.value}))} />
          </div>
        </div>

        {act?.id === 'gym' && <>
          <div className="section-label">Ejercicios · {form.parte}</div>
          <div className="card">
            {ejercicios.map((e, i) => (
              <div key={i} className="ex-row">
                <div className="ex-icon">💪</div>
                <input style={{ flex:1,border:'none',outline:'none',fontSize:12,background:'transparent' }} placeholder="Ejercicio..." value={e.nombre} onChange={ev=>setEjercicios(ex=>ex.map((x,j)=>j===i?{...x,nombre:ev.target.value}:x))} />
                <input className="ex-input" value={e.series} onChange={ev=>setEjercicios(ex=>ex.map((x,j)=>j===i?{...x,series:ev.target.value}:x))} />
                <span className="ex-unit">ser</span>
                <input className="ex-input" value={e.reps} onChange={ev=>setEjercicios(ex=>ex.map((x,j)=>j===i?{...x,reps:ev.target.value}:x))} />
                <span className="ex-unit">rep</span>
                <input className="ex-input" value={e.kg} onChange={ev=>setEjercicios(ex=>ex.map((x,j)=>j===i?{...x,kg:ev.target.value}:x))} />
                <span className="ex-unit">kg</span>
              </div>
            ))}
            <button style={{ width:'100%',background:'none',border:'none',color:'#378ADD',fontSize:12,padding:'8px 0',cursor:'pointer' }}
              onClick={()=>setEjercicios(e=>[...e,{nombre:'',series:3,reps:10,kg:0}])}>+ Añadir ejercicio</button>
          </div>
        </>}

        {act?.id === 'caminadora' && <>
          <div className="section-label">Intervalos</div>
          {intervalos.map((iv, i) => (
            <div key={i} className="int-row">
              <div className="int-num">{i+1}</div>
              <input className="int-input" placeholder="min" value={iv.min} onChange={e=>setIntervalos(iv=>iv.map((x,j)=>j===i?{...x,min:e.target.value}:x))} />
              <input className="int-input" placeholder="km/h" value={iv.kmh} onChange={e=>setIntervalos(iv=>iv.map((x,j)=>j===i?{...x,kmh:e.target.value}:x))} />
              <select className="int-input" value={iv.tipo} onChange={e=>setIntervalos(iv=>iv.map((x,j)=>j===i?{...x,tipo:e.target.value}:x))} style={{ padding:'4px' }}>
                {['Correr','Caminar','Descanso'].map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
          ))}
          <button style={{ background:'none',border:'none',color:'#378ADD',fontSize:12,cursor:'pointer',padding:'6px 0' }}
            onClick={()=>setIntervalos(i=>[...i,{min:5,kmh:8,tipo:'Correr'}])}>+ Añadir intervalo</button>
        </>}

        <div className="card" style={{ background:'#F0FBF7',border:'none',marginTop:8 }}>
          <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center' }}>
            <div>
              <div style={{ fontSize:12,color:'#888780' }}>{act?.label} · {calcDuracion()} min</div>
              <div style={{ fontSize:11,color:'#1D9E75' }}>basado en tu peso ({peso}kg)</div>
            </div>
            <div style={{ fontSize:24,fontWeight:700,color:'#1D9E75' }}>~{calcCal()} kcal</div>
          </div>
        </div>
        <button className="btn btn-primary" onClick={guardar} disabled={guardando}
          style={{ background: act?.color||'#1D9E75', marginTop:4 }}>
          {guardando?'Guardando...':`Guardar · ~${calcCal()} kcal`}
        </button>
      </div>
    </div>
  )
}
