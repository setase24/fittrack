import React, { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function Onboarding({ session, onComplete }) {
  const [step, setStep] = useState(1)
  const [data, setData] = useState({ nombre: '', edad: '', altura_cm: '', peso_inicial_kg: '', meta_peso_kg: '', meta_calorias: 1600, nivel_actividad: 'moderado' })
  const [loading, setLoading] = useState(false)

  function set(field, val) { setData(d => ({ ...d, [field]: val })) }

  async function finish() {
    setLoading(true)
    const { data: profile, error } = await supabase.from('profiles').upsert({
      id: session.user.id,
      ...data,
      edad: parseInt(data.edad),
      altura_cm: parseInt(data.altura_cm),
      peso_inicial_kg: parseFloat(data.peso_inicial_kg),
      meta_peso_kg: parseFloat(data.meta_peso_kg),
      meta_calorias: parseInt(data.meta_calorias)
    }).select().single()
    if (!error) onComplete(profile)
    setLoading(false)
  }

  const niveles = ['sedentario', 'ligero', 'moderado', 'activo', 'muy activo']

  return (
    <div className="onboard-wrap">
      <div className="onboard-step">Paso {step} de 3</div>
      <div style={{ height: 4, background: '#F4F4F2', borderRadius: 2, marginBottom: 28 }}>
        <div style={{ height: '100%', width: `${(step/3)*100}%`, background: '#1D9E75', borderRadius: 2, transition: 'width 0.3s' }}></div>
      </div>

      {step === 1 && <>
        <div className="onboard-title">¡Hola! Cuéntame sobre ti</div>
        <div className="onboard-sub">Estos datos son solo tuyos y se guardan de forma privada.</div>
        <div className="section-label">Tu nombre</div>
        <input className="input" placeholder="Sebastián" value={data.nombre} onChange={e => set('nombre', e.target.value)} />
        <div className="section-label">Edad</div>
        <input className="input" type="number" placeholder="24" value={data.edad} onChange={e => set('edad', e.target.value)} />
        <div className="section-label">Altura (cm)</div>
        <input className="input" type="number" placeholder="175" value={data.altura_cm} onChange={e => set('altura_cm', e.target.value)} />
        <button className="btn btn-primary" onClick={() => setStep(2)} disabled={!data.nombre || !data.edad || !data.altura_cm}>Continuar</button>
      </>}

      {step === 2 && <>
        <div className="onboard-title">Tu peso y meta</div>
        <div className="onboard-sub">Usaremos esto para calcular tu TMB y calorías diarias.</div>
        <div className="section-label">Peso actual (kg)</div>
        <input className="input" type="number" step="0.1" placeholder="78.4" value={data.peso_inicial_kg} onChange={e => set('peso_inicial_kg', e.target.value)} />
        <div className="section-label">Peso meta (kg)</div>
        <input className="input" type="number" step="0.1" placeholder="72.0" value={data.meta_peso_kg} onChange={e => set('meta_peso_kg', e.target.value)} />
        <div className="section-label">Meta calórica diaria (kcal)</div>
        <input className="input" type="number" placeholder="1600" value={data.meta_calorias} onChange={e => set('meta_calorias', e.target.value)} />
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setStep(1)}>Atrás</button>
          <button className="btn btn-primary" onClick={() => setStep(3)} disabled={!data.peso_inicial_kg || !data.meta_peso_kg} style={{ flex: 1 }}>Continuar</button>
        </div>
      </>}

      {step === 3 && <>
        <div className="onboard-title">Nivel de actividad</div>
        <div className="onboard-sub">¿Qué tan activo eres en tu día a día, fuera del ejercicio?</div>
        {niveles.map(n => (
          <button key={n} className={`sel-btn ${data.nivel_actividad === n ? 'active' : ''}`} onClick={() => set('nivel_actividad', n)}>
            <div>
              <div className="sel-btn-title" style={{ textTransform: 'capitalize' }}>{n}</div>
              <div className="sel-btn-sub">{{ sedentario: 'Trabajo de escritorio, poco movimiento', ligero: 'Caminas un poco, trabajo mixto', moderado: 'Activo en el día, trabajo dinámico', activo: 'Mucho movimiento diario', 'muy activo': 'Trabajo físico o deporte doble sesión' }[n]}</div>
            </div>
            {data.nivel_actividad === n && <span style={{ color: '#1D9E75', fontSize: 18 }}>✓</span>}
          </button>
        ))}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setStep(2)}>Atrás</button>
          <button className="btn btn-primary" onClick={finish} disabled={loading} style={{ flex: 1 }}>{loading ? 'Guardando...' : '¡Empezar!'}</button>
        </div>
      </>}
    </div>
  )
}
