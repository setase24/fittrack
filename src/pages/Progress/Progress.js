import React, { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../../lib/supabase'

const PIN_CORRECTO = '1234'

export default function Progress({ profile }) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [pinError, setPinError] = useState(false)
  const [registros, setRegistros] = useState([])
  const [fotos, setFotos] = useState([])
  const [cargando, setCargando] = useState(false)
  const [subiendo, setSubiendo] = useState(false)
  const [vista, setVista] = useState('fotos')
  const fileRef = useRef()

  const cargarDatos = useCallback(async () => {
    setCargando(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const [{ data: pesos }, { data: archivos }] = await Promise.all([
      supabase.from('peso_registros').select('*').eq('user_id', uid).order('fecha', { ascending: false }).limit(20),
      supabase.storage.from('progress-photos').list(uid, { sortBy: { column: 'created_at', order: 'desc' } })
    ])
    setRegistros(pesos || [])
    if (archivos) {
      const fotosConUrl = await Promise.all(
        archivos.map(async (f) => {
          const { data } = await supabase.storage.from('progress-photos').createSignedUrl(`${uid}/${f.name}`, 3600)
          return { ...f, url: data?.signedUrl, fecha: f.name.split('_')[0] }
        })
      )
      setFotos(fotosConUrl)
    }
    setCargando(false)
  }, [])

  useEffect(() => { if (unlocked) cargarDatos() }, [unlocked, cargarDatos])

  function pressPin(n) {
    if (pin.length >= 4) return
    const nuevo = pin + n
    setPin(nuevo)
    setPinError(false)
    if (nuevo.length === 4) {
      setTimeout(() => {
        if (nuevo === PIN_CORRECTO) { setUnlocked(true); setPin('') }
        else { setPinError(true); setPin('') }
      }, 200)
    }
  }

  async function subirFoto(e) {
    const file = e.target.files[0]
    if (!file) return
    setSubiendo(true)
    try {
      const uid = (await supabase.auth.getUser()).data.user?.id
      const fecha = new Date().toISOString().split('T')[0]
      const nombreArchivo = `${fecha}_${Date.now()}.jpg`
      const { error } = await supabase.storage.from('progress-photos').upload(`${uid}/${nombreArchivo}`, file, { contentType: file.type, upsert: false })
      if (error) throw error
      await cargarDatos()
      alert('✅ Foto guardada de forma privada en tu cuenta')
    } catch (e) {
      alert('Error al subir la foto: ' + e.message)
    }
    setSubiendo(false)
  }

  async function eliminarFoto(nombre) {
    if (!window.confirm('¿Eliminar esta foto?')) return
    const uid = (await supabase.auth.getUser()).data.user?.id
    await supabase.storage.from('progress-photos').remove([`${uid}/${nombre}`])
    setFotos(f => f.filter(x => x.name !== nombre))
  }

  if (!unlocked) return (
    <div>
      <div className="page-header" style={{ justifyContent:'space-between' }}>
        <div className="page-title">Progreso corporal</div>
        <span style={{ fontSize:18 }}>🔒</span>
      </div>
      <div style={{ display:'flex',alignItems:'center',justifyContent:'center',minHeight:520,background:'rgba(0,0,0,0.3)',margin:12,borderRadius:18 }}>
        <div style={{ background:'white',borderRadius:18,padding:'24px 20px',width:240,textAlign:'center' }}>
          <div style={{ fontSize:30,marginBottom:8 }}>🔒</div>
          <div style={{ fontSize:15,fontWeight:600,marginBottom:4 }}>Área privada</div>
          <div style={{ fontSize:12,color:'#888780',marginBottom:4 }}>Ingresa tu PIN de 4 dígitos</div>
          {pinError && <div style={{ fontSize:12,color:'#E24B4A',marginBottom:4 }}>PIN incorrecto. Intenta de nuevo.</div>}
          <div className="pin-dots">
            {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${pin.length>i?'filled':''}`}></div>)}
          </div>
          <div className="pin-pad">
            {[1,2,3,4,5,6,7,8,9].map(n => <div key={n} className="pin-key" onClick={() => pressPin(String(n))}>{n}</div>)}
            <div className="pin-key action" onClick={() => { setPin(p=>p.slice(0,-1)); setPinError(false) }}>borrar</div>
            <div className="pin-key" onClick={() => pressPin('0')}>0</div>
            <div className="pin-key confirm" onClick={() => { if(pin===PIN_CORRECTO){setUnlocked(true);setPin('')}else{setPinError(true);setPin('')} }}>OK</div>
          </div>
          <div style={{ fontSize:10,color:'#CCC',marginTop:12 }}>PIN: 1234</div>
        </div>
      </div>
    </div>
  )

  const ultimo = registros[0]
  const penultimo = registros[1]
  const cambio = ultimo && penultimo ? (ultimo.peso_kg - penultimo.peso_kg).toFixed(1) : null

  return (
    <div>
      <div className="page-header" style={{ justifyContent:'space-between' }}>
        <div className="page-title">Progreso corporal</div>
        <button style={{ background:'none',border:'none',fontSize:18,cursor:'pointer' }} onClick={() => setUnlocked(false)}>🔒</button>
      </div>

      <div style={{ display:'flex',borderBottom:'0.5px solid rgba(0,0,0,0.08)',background:'white' }}>
        {[['fotos','📸 Fotos'],['medidas','📏 Medidas']].map(([k,l]) => (
          <button key={k} onClick={() => setVista(k)} style={{ flex:1,padding:'10px',border:'none',background:'none',cursor:'pointer',fontSize:13,fontWeight:vista===k?600:400,color:vista===k?'#1D9E75':'#888780',borderBottom:vista===k?'2px solid #1D9E75':'2px solid transparent' }}>{l}</button>
        ))}
      </div>

      <div className="page-content">
        {cargando ? (
          <div style={{ textAlign:'center',padding:40,color:'#888780' }}>Cargando...</div>
        ) : vista === 'fotos' ? (<>
          <div style={{ background:'#E1F5EE',borderRadius:14,padding:'10px 12px',marginBottom:10,display:'flex',alignItems:'center',gap:8 }}>
            <span>🔐</span>
            <div style={{ fontSize:11,color:'#085041' }}>Fotos privadas · guardadas en tu cuenta Supabase · solo visibles con PIN</div>
          </div>

          <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display:'none' }} onChange={subirFoto} />
          <button className="btn btn-primary" style={{ marginBottom:12 }} onClick={() => fileRef.current.click()} disabled={subiendo}>
            {subiendo ? '⏳ Subiendo foto...' : '📸 Tomar foto de progreso'}
          </button>

          {fotos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📸</div>
              <div className="empty-title">Sin fotos aún</div>
              <div className="empty-sub">Toma tu primera foto de progreso. Se guardará de forma privada y segura.</div>
            </div>
          ) : (
            <div className="grid-2">
              {fotos.map(f => (
                <div key={f.name}>
                  <div style={{ position:'relative',borderRadius:14,overflow:'hidden',aspectRatio:'3/4',background:'#F4F4F2' }}>
                    {f.url && <img src={f.url} alt="progreso" style={{ width:'100%',height:'100%',objectFit:'cover' }} />}
                    <div style={{ position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.5))',padding:'8px 8px 6px' }}>
                      <div style={{ fontSize:10,color:'white',fontWeight:500 }}>{f.fecha}</div>
                    </div>
                    <button onClick={() => eliminarFoto(f.name)} style={{ position:'absolute',top:6,right:6,background:'rgba(0,0,0,0.5)',border:'none',borderRadius:'50%',width:24,height:24,color:'white',cursor:'pointer',fontSize:14,display:'flex',alignItems:'center',justifyContent:'center' }}>×</button>
                  </div>
                  {registros.find(r => r.fecha === f.fecha) && (
                    <div style={{ fontSize:10,color:'#888780',textAlign:'center',marginTop:3 }}>
                      {registros.find(r => r.fecha === f.fecha)?.peso_kg} kg
                      {registros.find(r => r.fecha === f.fecha)?.porcentaje_grasa && ` · ${registros.find(r => r.fecha === f.fecha)?.porcentaje_grasa}% grasa`}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>) : (<>
          {ultimo && (
            <div className="grid-2" style={{ marginBottom:10 }}>
              <div style={{ background:'#E1F5EE',borderRadius:14,padding:'12px' }}>
                <div style={{ fontSize:10,color:'#0F6E56' }}>Peso actual</div>
                <div style={{ fontSize:22,fontWeight:700,color:'#085041' }}>{ultimo.peso_kg} <span style={{ fontSize:12 }}>kg</span></div>
                {cambio && <div style={{ fontSize:11,color:parseFloat(cambio)<0?'#1D9E75':'#E24B4A' }}>{parseFloat(cambio)<0?'▼':'▲'} {Math.abs(parseFloat(cambio))} kg vs anterior</div>}
              </div>
              <div style={{ background:'#FAEEDA',borderRadius:14,padding:'12px' }}>
                <div style={{ fontSize:10,color:'#633806' }}>% grasa</div>
                <div style={{ fontSize:22,fontWeight:700,color:'#412402' }}>{ultimo.porcentaje_grasa ? `${ultimo.porcentaje_grasa}%` : '—'}</div>
                {ultimo.masa_muscular_kg && <div style={{ fontSize:11,color:'#633806' }}>Músculo: {ultimo.masa_muscular_kg.toFixed(1)} kg</div>}
              </div>
            </div>
          )}
          {registros.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📏</div>
              <div className="empty-title">Sin medidas registradas</div>
              <div className="empty-sub">Ve a Perfil → Registrar medidas corporales para empezar</div>
            </div>
          ) : (
            <div className="card">
              {registros.map((r, i) => (
                <div key={r.id} className="info-row">
                  <div>
                    <div style={{ fontSize:12,fontWeight:500 }}>{new Date(r.fecha+'T12:00:00').toLocaleDateString('es',{weekday:'short',day:'numeric',month:'short',year:'numeric'})}</div>
                    {r.cintura_cm && <div style={{ fontSize:11,color:'#888780' }}>Cintura {r.cintura_cm}cm · Cadera {r.cadera_cm}cm</div>}
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:14,fontWeight:600 }}>{r.peso_kg} kg</div>
                    {r.porcentaje_grasa && <div style={{ fontSize:11,color:'#BA7517' }}>{r.porcentaje_grasa}% grasa</div>}
                    {r.masa_muscular_kg && <div style={{ fontSize:11,color:'#1D9E75' }}>{r.masa_muscular_kg.toFixed(1)} kg músculo</div>}
                    {i > 0 && <div style={{ fontSize:10,color:r.peso_kg<registros[i-1].peso_kg?'#1D9E75':'#E24B4A' }}>{r.peso_kg<registros[i-1].peso_kg?'▼':'▲'} {Math.abs(r.peso_kg-registros[i-1].peso_kg).toFixed(1)} kg</div>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>)}
      </div>
    </div>
  )
}
