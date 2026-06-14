import React, { useState } from 'react'
import { supabase } from '../../lib/supabase'

function calcTMB(p) {
  if (!p?.peso_inicial_kg || !p?.altura_cm || !p?.edad) return null
  return Math.round(88.362 + (13.397*p.peso_inicial_kg) + (4.799*p.altura_cm) - (5.677*p.edad))
}

export default function Profile({ profile, setProfile, onNavigate }) {
  const [seccion, setSeccion] = useState('main')
  const [form, setForm] = useState({...profile})
  const [medidas, setMedidas] = useState({ peso:'', grasa:'', cintura:'', cadera:'' })
  const [guardando, setGuardando] = useState(false)
  const [histPeso, setHistPeso] = useState([])
  const tmb = calcTMB(profile)

  async function cargarHistPeso() {
    const uid = (await supabase.auth.getUser()).data.user?.id
    const { data } = await supabase.from('peso_registros').select('*').eq('user_id',uid).order('fecha',{ascending:false}).limit(10)
    setHistPeso(data||[])
  }

  async function guardarPerfil() {
    setGuardando(true)
    const { data } = await supabase.from('profiles').update({
      nombre:form.nombre, edad:parseInt(form.edad), altura_cm:parseInt(form.altura_cm),
      meta_peso_kg:parseFloat(form.meta_peso_kg), meta_calorias:parseInt(form.meta_calorias),
      nivel_actividad:form.nivel_actividad
    }).eq('id',profile.id).select().single()
    if (data) setProfile(data)
    setSeccion('main')
    setGuardando(false)
  }

  async function guardarMedidas() {
    if (!medidas.peso) { alert('El peso es obligatorio'); return }
    setGuardando(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const registro = { user_id:uid, peso_kg:parseFloat(medidas.peso), fecha:new Date().toISOString().split('T')[0] }
    if (medidas.grasa) registro.porcentaje_grasa = parseFloat(medidas.grasa)
    if (medidas.cintura) registro.cintura_cm = parseFloat(medidas.cintura)
    if (medidas.cadera) registro.cadera_cm = parseFloat(medidas.cadera)
    if (medidas.grasa && medidas.peso) registro.masa_muscular_kg = +(parseFloat(medidas.peso)*(1-parseFloat(medidas.grasa)/100)).toFixed(2)
    await supabase.from('peso_registros').insert(registro)
    await supabase.from('profiles').update({ peso_inicial_kg:parseFloat(medidas.peso) }).eq('id',profile.id)
    setProfile({ ...profile, peso_inicial_kg:parseFloat(medidas.peso) })
    setMedidas({ peso:'', grasa:'', cintura:'', cadera:'' })
    cargarHistPeso()
    setGuardando(false)
    alert('✅ Medidas guardadas')
  }

  async function signOut() { await supabase.auth.signOut() }

  const pesoActual = profile?.peso_inicial_kg
  const metaPeso = profile?.meta_peso_kg
  const progresoPeso = metaPeso && pesoActual ? Math.min(100,Math.round(((82-pesoActual)/(82-metaPeso))*100)) : 0

  if (seccion === 'editar') return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => setSeccion('main')}>← Perfil</button>
        <button className="btn btn-primary btn-sm" onClick={guardarPerfil} disabled={guardando}>{guardando?'...':'Guardar'}</button>
      </div>
      <div className="page-content">
        {[['nombre','Nombre','text'],['edad','Edad','number'],['altura_cm','Altura (cm)','number'],['meta_peso_kg','Peso meta (kg)','number'],['meta_calorias','Meta calórica (kcal)','number']].map(([k,l,t]) => (
          <React.Fragment key={k}>
            <div className="section-label">{l}</div>
            <input className="input" type={t} value={form[k]||''} onChange={e=>setForm(f=>({...f,[k]:e.target.value}))} />
          </React.Fragment>
        ))}
        <div className="section-label">Nivel de actividad</div>
        {['sedentario','ligero','moderado','activo','muy activo'].map(n => (
          <button key={n} className={`sel-btn ${form.nivel_actividad===n?'active':''}`} onClick={()=>setForm(f=>({...f,nivel_actividad:n}))}>
            <div className="sel-btn-title" style={{textTransform:'capitalize'}}>{n}</div>
          </button>
        ))}
      </div>
    </div>
  )

  if (seccion === 'medidas') return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={() => setSeccion('main')}>← Perfil</button>
        <span className="page-title">Medidas corporales</span>
      </div>
      <div className="page-content">
        <div className="card" style={{marginBottom:12}}>
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Registrar medidas de hoy</div>
          {[['peso','Peso actual (kg) *','78.4'],['grasa','% grasa corporal','19.2'],['cintura','Cintura (cm)','84'],['cadera','Cadera (cm)','98']].map(([k,l,ph]) => (
            <React.Fragment key={k}>
              <div className="section-label">{l}</div>
              <input className="input" type="number" step="0.1" placeholder={ph} value={medidas[k]} onChange={e=>setMedidas(m=>({...m,[k]:e.target.value}))} />
            </React.Fragment>
          ))}
          {medidas.peso && medidas.grasa && (
            <div style={{background:'#E1F5EE',borderRadius:10,padding:'10px 12px',marginBottom:10}}>
              <div style={{fontSize:12,color:'#085041'}}>Masa muscular estimada</div>
              <div style={{fontSize:20,fontWeight:700,color:'#1D9E75'}}>{(parseFloat(medidas.peso)*(1-parseFloat(medidas.grasa)/100)).toFixed(1)} kg</div>
            </div>
          )}
          <button className="btn btn-primary" onClick={guardarMedidas} disabled={guardando}>{guardando?'Guardando...':'Guardar medidas'}</button>
        </div>
        {histPeso.length > 0 && (
          <div className="card">
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Historial</div>
            {histPeso.map((r,i) => (
              <div key={r.id} className="info-row">
                <div>
                  <div style={{fontSize:12,fontWeight:500}}>{new Date(r.fecha+'T12:00:00').toLocaleDateString('es',{day:'numeric',month:'short',year:'numeric'})}</div>
                  {r.cintura_cm && <div style={{fontSize:11,color:'#888780'}}>Cintura {r.cintura_cm}cm · Cadera {r.cadera_cm}cm</div>}
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontSize:14,fontWeight:600}}>{r.peso_kg} kg</div>
                  {r.porcentaje_grasa && <div style={{fontSize:11,color:'#BA7517'}}>{r.porcentaje_grasa}% grasa</div>}
                  {r.masa_muscular_kg && <div style={{fontSize:11,color:'#1D9E75'}}>{r.masa_muscular_kg.toFixed(1)} kg músculo</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-title">Mi perfil</div>
        <button className="btn btn-secondary btn-sm" onClick={() => setSeccion('editar')}>✏️ Editar</button>
      </div>
      <div className="page-content">
        <div style={{textAlign:'center',marginBottom:14}}>
          <div style={{width:54,height:54,borderRadius:'50%',background:'#E1F5EE',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 8px',fontSize:26}}>👤</div>
          <div style={{fontSize:16,fontWeight:700}}>{profile?.nombre}</div>
          <div style={{fontSize:11,color:'#888780'}}>Miembro desde junio 2025</div>
          {metaPeso && <div style={{display:'inline-flex',alignItems:'center',gap:4,background:'#E1F5EE',color:'#085041',fontSize:11,padding:'4px 10px',borderRadius:20,marginTop:6}}>🎯 Meta: {metaPeso} kg</div>}
        </div>
        <div className="card">
          {[['👤 Edad',`${profile?.edad} años`],['📏 Altura',`${profile?.altura_cm} cm`],['⚖️ Peso actual',`${pesoActual} kg`],['🎯 Peso meta',`${metaPeso} kg`],['🔥 Meta calórica',`${profile?.meta_calorias?.toLocaleString()} kcal/día`],['❤️ TMB',tmb?`${tmb.toLocaleString()} kcal/día`:'—'],['🏃 Actividad',profile?.nivel_actividad||'—']].map(([l,v]) => (
            <div key={l} className="info-row"><span className="info-row-label">{l}</span><span className="info-row-value">{v}</span></div>
          ))}
        </div>
        <div className="card">
          <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>Progreso hacia meta</div>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:12,marginBottom:4}}>
            <span style={{color:'#888780'}}>Peso</span><span style={{fontWeight:600}}>{pesoActual} → {metaPeso} kg</span>
          </div>
          <div className="progress-track"><div className="progress-fill" style={{width:`${progresoPeso}%`,background:'#1D9E75'}}></div></div>
          <div style={{fontSize:11,color:'#888780',marginTop:2}}>{progresoPeso}% del camino</div>
        </div>
        <div className="section-label">Análisis y herramientas</div>
        {[
          { icon:'📏', title:'Registrar medidas corporales', sub:'peso, % grasa, cintura, cadera', action:()=>{setSeccion('medidas');cargarHistPeso()} },
          { icon:'📈', title:'Inferencias estadísticas', sub:'proyecciones corto · mediano · largo', action:()=>onNavigate('inferencias') },
          { icon:'☁️', title:'Backup OneDrive', sub:'Sincronizado automáticamente', right:'✅', action:()=>{} },
        ].map(item => (
          <div key={item.title} className="quick-btn" style={{marginBottom:7}} onClick={item.action}>
            <span style={{fontSize:20}}>{item.icon}</span>
            <div style={{flex:1}}><div className="quick-btn-title">{item.title}</div><div className="quick-btn-sub">{item.sub}</div></div>
            <span style={{fontSize:16,color:item.right?'#1D9E75':'#888780'}}>{item.right||'›'}</span>
          </div>
        ))}
        <button className="btn btn-secondary" onClick={signOut} style={{marginTop:12,color:'#E24B4A',borderColor:'#E24B4A'}}>Cerrar sesión</button>
      </div>
    </div>
  )
}
