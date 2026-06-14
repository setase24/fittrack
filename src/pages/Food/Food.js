import React, { useState, useEffect, useRef, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const TIPOS = ['desayuno','almuerzo','cena','snack','otro']

export default function Food({ profile }) {
  const [comidas, setComidas] = useState([])
  const [modo, setModo] = useState('lista')
  const [tipo, setTipo] = useState('almuerzo')
  const [nombre, setNombre] = useState('')
  const [ingredientes, setIngredientes] = useState('')
  const [extra, setExtra] = useState('')
  const [calManual, setCalManual] = useState('')
  const [foto, setFoto] = useState(null)
  const [fotoPreview, setFotoPreview] = useState(null)
  const [analizando, setAnalizando] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [guardando, setGuardando] = useState(false)
  const [modoEntrada, setModoEntrada] = useState('foto')
  const [error, setError] = useState('')
  const fileRef = useRef()
  const today = new Date().toISOString().split('T')[0]

  const fetchComidas = useCallback(async () => {
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { data } = await supabase.from('comidas').select('*').eq('user_id', uid).eq('fecha', today).order('hora')
    setComidas(data || [])
  }, [today])

  useEffect(() => { fetchComidas() }, [fetchComidas])

  function onFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setFoto(file)
    setFotoPreview(URL.createObjectURL(file))
    setResultado(null)
    setError('')
    const h = new Date().getHours()
    setTipo(h < 10 ? 'desayuno' : h < 14 ? 'almuerzo' : h < 19 ? 'cena' : 'snack')
  }

  async function analizar() {
    if (!foto && !nombre) { setError('Sube una foto o escribe el nombre del plato'); return }
    setAnalizando(true)
    setError('')
    try {
      const body = { nombre, ingredientes, extra }
      if (foto) {
        const base64 = await toBase64(foto)
        body.imageBase64 = base64
        body.mediaType = foto.type
      }
      const res = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setResultado(data)
      if (data.nombre) setNombre(data.nombre)
      if (data.ingredientes) setIngredientes(data.ingredientes)
    } catch (e) {
      setError('Error al analizar. Usa el modo manual o intenta de nuevo.')
    }
    setAnalizando(false)
  }

  async function guardar(esManual = false) {
    setGuardando(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    await supabase.from('comidas').insert({
      user_id: uid,
      tipo_comida: tipo,
      nombre_plato: resultado?.nombre || nombre || 'Sin nombre',
      ingredientes: resultado?.ingredientes || ingredientes || null,
      calorias: esManual ? parseInt(calManual) || 0 : resultado?.calorias || 0,
      proteina_g: esManual ? null : resultado?.proteina_g || null,
      carbos_g: esManual ? null : resultado?.carbos_g || null,
      grasas_g: esManual ? null : resultado?.grasas_g || null,
      analizado_por_ia: !esManual && !!resultado
    })
    resetForm()
    fetchComidas()
    setGuardando(false)
  }

  function resetForm() {
    setModo('lista'); setNombre(''); setIngredientes(''); setExtra(''); setCalManual('')
    setFoto(null); setFotoPreview(null); setResultado(null); setError('')
  }

  function toBase64(file) {
    return new Promise((res, rej) => {
      const r = new FileReader()
      r.onload = () => res(r.result.split(',')[1])
      r.onerror = rej
      r.readAsDataURL(file)
    })
  }

  async function eliminar(id) {
    await supabase.from('comidas').delete().eq('id', id)
    fetchComidas()
  }

  const totalCal = comidas.reduce((s, c) => s + c.calorias, 0)
  const totalProt = comidas.reduce((s, c) => s + (c.proteina_g || 0), 0)
  const totalCarb = comidas.reduce((s, c) => s + (c.carbos_g || 0), 0)
  const totalGrasa = comidas.reduce((s, c) => s + (c.grasas_g || 0), 0)

  if (modo === 'registrar') return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={resetForm}>← Comidas</button>
        <span style={{ fontSize:13,color:'#888780' }}>Nueva comida</span>
      </div>
      <div className="page-content">
        <div className="seg-control" style={{ marginBottom:12 }}>
          <button className={`seg-opt ${modoEntrada==='foto'?'active':''}`} onClick={() => setModoEntrada('foto')}>📷 Foto / IA</button>
          <button className={`seg-opt ${modoEntrada==='manual'?'active':''}`} onClick={() => setModoEntrada('manual')}>✏️ Manual</button>
        </div>

        <div className="section-label">¿Qué comida es?</div>
        <div className="chip-row">
          {TIPOS.map(t => <button key={t} className={`chip ${tipo===t?'active':''}`} onClick={() => setTipo(t)} style={{ textTransform:'capitalize' }}>{t}</button>)}
        </div>

        {modoEntrada === 'foto' && <>
          {fotoPreview && <img src={fotoPreview} alt="preview" style={{ width:'100%',borderRadius:14,marginBottom:10,maxHeight:200,objectFit:'cover' }} />}
          <button className="btn btn-secondary" style={{ marginBottom:10 }} onClick={() => fileRef.current.click()}>
            📷 {foto ? 'Cambiar foto' : 'Tomar foto o subir imagen'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={onFoto} />
          <div className="section-label">Nombre del plato (opcional si hay foto)</div>
          <input className="input" placeholder="Arroz con pollo..." value={nombre} onChange={e => setNombre(e.target.value)} />
          <div className="section-label">Ingredientes (opcional)</div>
          <input className="input" placeholder="Arroz, pechuga, ensalada..." value={ingredientes} onChange={e => setIngredientes(e.target.value)} />
          <div className="section-label">Extras (chicles, dulces…)</div>
          <input className="input" placeholder="Chicle Trident × 2..." value={extra} onChange={e => setExtra(e.target.value)} />
          {error && <div style={{ color:'#E24B4A',fontSize:12,marginBottom:8 }}>⚠️ {error}</div>}
          {resultado ? (
            <div>
              <div className="card" style={{ background:'#E1F5EE',border:'none',marginBottom:10 }}>
                <div style={{ fontSize:13,fontWeight:600,color:'#085041',marginBottom:6 }}>Análisis de Claude ✓</div>
                <div style={{ fontSize:24,fontWeight:700,color:'#1D9E75' }}>{resultado.calorias} kcal</div>
                <div style={{ display:'flex',gap:10,marginTop:6,fontSize:12,color:'#0F6E56' }}>
                  <span>Prot. {resultado.proteina_g}g</span>
                  <span>Carbos {resultado.carbos_g}g</span>
                  <span>Grasas {resultado.grasas_g}g</span>
                </div>
                <div style={{ fontSize:11,color:'#0F6E56',marginTop:4 }}>{resultado.nombre}</div>
              </div>
              <button className="btn btn-primary" onClick={() => guardar(false)} disabled={guardando}>{guardando?'Guardando...':'Guardar comida'}</button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={analizar} disabled={analizando}>
              {analizando ? '🤖 Analizando...' : '🤖 Analizar con Claude'}
            </button>
          )}
        </>}

        {modoEntrada === 'manual' && <>
          <div className="section-label">Nombre del plato *</div>
          <input className="input" placeholder="Ej: Bandeja paisa, chicle, café..." value={nombre} onChange={e => setNombre(e.target.value)} />
          <div className="section-label">Ingredientes (opcional)</div>
          <input className="input" placeholder="Ingredientes principales..." value={ingredientes} onChange={e => setIngredientes(e.target.value)} />
          <div className="section-label">Calorías *</div>
          <input className="input" type="number" placeholder="Ej: 5 (chicle), 650 (almuerzo)..." value={calManual} onChange={e => setCalManual(e.target.value)} />
          <button className="btn btn-primary" onClick={() => guardar(true)} disabled={guardando||!nombre}>{guardando?'Guardando...':'Guardar'}</button>
        </>}
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div><div className="page-title">Comidas</div><div className="page-sub">Hoy · {totalCal} kcal</div></div>
        <button className="btn btn-primary btn-sm" onClick={() => setModo('registrar')}>+ Registrar</button>
      </div>
      <div className="page-content">
        {totalCal > 0 && (
          <div className="card" style={{ marginBottom:10 }}>
            <div style={{ display:'flex',justifyContent:'space-between',marginBottom:6 }}>
              <span style={{ fontSize:13,fontWeight:600 }}>Macros del día</span>
              <span style={{ fontSize:13,fontWeight:700,color:'#1D9E75' }}>{totalCal} kcal</span>
            </div>
            <div style={{ display:'flex',gap:8 }}>
              {[['Prot.',Math.round(totalProt),'#1D9E75'],['Carbos',Math.round(totalCarb),'#378ADD'],['Grasas',Math.round(totalGrasa),'#BA7517']].map(([l,v,c]) => (
                <div key={l} style={{ flex:1,background:'#F9F9F7',borderRadius:10,padding:'8px 6px',textAlign:'center' }}>
                  <div style={{ fontSize:10,color:'#888780' }}>{l}</div>
                  <div style={{ fontSize:14,fontWeight:600,color:c }}>{v}g</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {comidas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🍽️</div>
            <div className="empty-title">Sin registros hoy</div>
            <div className="empty-sub">Registra absolutamente todo — cada chicle, cada café, cada comida</div>
            <button className="btn btn-primary" style={{ maxWidth:240,margin:'0 auto' }} onClick={() => setModo('registrar')}>+ Primera comida del día</button>
          </div>
        ) : (
          TIPOS.map(t => {
            const items = comidas.filter(c => c.tipo_comida === t)
            if (!items.length) return null
            return (
              <div key={t} className="card">
                <div style={{ fontSize:12,fontWeight:600,color:'#888780',textTransform:'capitalize',marginBottom:6 }}>{t} · {items.reduce((s,c)=>s+c.calorias,0)} kcal</div>
                {items.map(c => (
                  <div key={c.id} className="food-item">
                    <div className="food-item-header">
                      <div className="food-item-name">{c.nombre_plato}</div>
                      <div style={{ display:'flex',alignItems:'center',gap:8 }}>
                        <div className="food-item-kcal">{c.calorias} kcal</div>
                        <button onClick={() => eliminar(c.id)} style={{ background:'none',border:'none',color:'#E24B4A',cursor:'pointer',fontSize:16,lineHeight:1 }}>×</button>
                      </div>
                    </div>
                    {c.ingredientes && <div className="food-item-detail">{c.ingredientes}</div>}
                    {c.proteina_g > 0 && <div className="food-item-detail">P {Math.round(c.proteina_g)}g · C {Math.round(c.carbos_g)}g · G {Math.round(c.grasas_g)}g</div>}
                    {c.analizado_por_ia && <div style={{ fontSize:10,color:'#1D9E75',marginTop:2 }}>🤖 Analizado con Claude</div>}
                  </div>
                ))}
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
