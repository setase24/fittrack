import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

function calcTMB(p) {
  if (!p?.peso_inicial_kg || !p?.altura_cm || !p?.edad) return 1750
  return Math.round(88.362 + (13.397*p.peso_inicial_kg) + (4.799*p.altura_cm) - (5.677*p.edad))
}

export default function Inferencias({ profile, onBack }) {
  const [datos, setDatos] = useState(null)
  const [horizonte, setHorizonte] = useState('corto')
  const [cargando, setCargando] = useState(true)
  const tmb = calcTMB(profile)

  const calcular = useCallback(async () => {
    setCargando(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const hace30 = new Date(); hace30.setDate(hace30.getDate()-30)
    const [{ data: comidas },{ data: entrenos },{ data: pesos }] = await Promise.all([
      supabase.from('comidas').select('fecha,calorias').eq('user_id',uid).gte('fecha',hace30.toISOString().split('T')[0]),
      supabase.from('entrenamientos').select('fecha,calorias_quemadas').eq('user_id',uid).gte('fecha',hace30.toISOString().split('T')[0]),
      supabase.from('peso_registros').select('*').eq('user_id',uid).order('fecha',{ascending:true})
    ])
    const n = new Set([...(comidas||[]).map(c=>c.fecha)]).size
    const avgCal = n > 0 ? Math.round((comidas||[]).reduce((s,c)=>s+c.calorias,0)/n) : 0
    const avgEj = n > 0 ? Math.round((entrenos||[]).reduce((s,e)=>s+(e.calorias_quemadas||0),0)/n) : 0
    const deficitDiario = (tmb + avgEj) - avgCal
    const pesoActual = profile?.peso_inicial_kg || 78
    const metaPeso = profile?.meta_peso_kg || 72
    const kgPorSemana = deficitDiario > 0 ? (deficitDiario * 7) / 7700 : 0
    const semanasParaMeta = kgPorSemana > 0 ? Math.ceil((pesoActual - metaPeso) / kgPorSemana) : null
    const conf = n === 0 ? 0 : n < 7 ? 25 : n < 14 ? 42 : n < 21 ? 60 : 75
    const grasa = pesos?.length > 0 ? pesos[pesos.length-1].porcentaje_grasa : null
    const proyecciones = {
      corto: { label:'1-4 semanas', peso:+(pesoActual-kgPorSemana*4).toFixed(1), grasa:grasa?+(grasa-0.8).toFixed(1):null, ci_peso:n<7?1.8:1.2, ci_grasa:0.8, nota:conf<30?'Muy pocos datos — registra más días para mayor precisión.':'Proyección basada en tu déficit promedio reciente.' },
      mediano: { label:'1-3 meses', peso:+(pesoActual-kgPorSemana*12).toFixed(1), grasa:grasa?+(grasa-2.5).toFixed(1):null, ci_peso:n<14?3.2:2.1, ci_grasa:1.5, nota:'A mediano plazo el déficit calórico acumulado es el factor principal sobre el % grasa.' },
      largo: { label:'6-12 meses', peso:+(Math.max(pesoActual-kgPorSemana*36,metaPeso-1)).toFixed(1), grasa:grasa?+(Math.max(grasa-6,10)).toFixed(1):null, ci_peso:4.2, ci_grasa:2.8, nota:'Plateau esperado mes 4-5. IC amplio en horizontes largos. Ajuste calórico necesario.' }
    }
    setDatos({ n, avgCal, avgEj, deficitDiario, conf, kgPorSemana, semanasParaMeta, proyecciones, pesoActual, metaPeso, grasa, tmb1ano: Math.round(tmb*(profile?.edad>30?0.995:0.999)) })
    setCargando(false)
  }, [profile, tmb])

  useEffect(() => { calcular() }, [calcular])

  if (cargando) return (
    <div>
      <div className="page-header"><button className="back-btn" onClick={onBack}>← Perfil</button><span className="page-title">Inferencias</span></div>
      <div style={{textAlign:'center',padding:60,color:'#888780'}}>Calculando modelos estadísticos...</div>
    </div>
  )

  const proy = datos?.proyecciones[horizonte]

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Perfil</button>
        <div style={{display:'flex',alignItems:'center',gap:8}}>
          <span className="page-title">Inferencias</span>
          <span style={{background:'#EEEDFE',color:'#3C3489',fontSize:10,padding:'2px 7px',borderRadius:20}}>n={datos?.n} días</span>
        </div>
      </div>
      <div className="page-content">
        {datos?.n < 3 ? (
          <div className="empty-state">
            <div className="empty-icon">📈</div>
            <div className="empty-title">Datos insuficientes</div>
            <div className="empty-sub">Necesitas al menos 3 días de registros. Llevas {datos?.n} día{datos?.n!==1?'s':''} registrado.</div>
          </div>
        ) : (<>
          <div className="card" style={{marginBottom:10}}>
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Resumen estadístico</div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:6}}>
              {[['Días registrados',String(datos?.n),'#534AB7'],['Prom. consumido',`${datos?.avgCal?.toLocaleString()} kcal`,'#1D9E75'],['Prom. ejercicio',`${datos?.avgEj} kcal`,'#378ADD'],['Déficit diario',`${datos?.deficitDiario>0?'+':''}${datos?.deficitDiario} kcal`,datos?.deficitDiario>0?'#1D9E75':'#E24B4A']].map(([l,v,c]) => (
                <div key={l} style={{background:'#F9F9F7',borderRadius:10,padding:'8px 10px'}}>
                  <div style={{fontSize:10,color:'#888780'}}>{l}</div>
                  <div style={{fontSize:14,fontWeight:600,color:c}}>{v}</div>
                </div>
              ))}
            </div>
            {datos?.semanasParaMeta && datos?.deficitDiario>0 && (
              <div style={{background:'#E1F5EE',borderRadius:10,padding:'8px 10px',marginTop:8,fontSize:11,color:'#085041'}}>
                🎯 Llegas a {datos?.metaPeso} kg en ~<strong>{datos?.semanasParaMeta} semanas</strong> · {+(datos?.kgPorSemana).toFixed(2)} kg/sem
              </div>
            )}
          </div>
          <div className="seg-control">
            {[['corto','Corto'],['mediano','Mediano'],['largo','Largo']].map(([k,l]) => (
              <button key={k} className={`seg-opt ${horizonte===k?'active':''}`} onClick={()=>setHorizonte(k)}>{l}</button>
            ))}
          </div>
          <div className="card">
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
              <span style={{fontSize:13,fontWeight:600}}>Proyección · {proy?.label}</span>
              <span style={{fontSize:15,fontWeight:700,color:'#534AB7'}}>{datos?.conf}% conf.</span>
            </div>
            <div className="progress-track" style={{height:7,marginBottom:12}}>
              <div className="progress-fill" style={{width:`${datos?.conf}%`,background:'#534AB7'}}></div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,minmax(0,1fr))',gap:6,marginBottom:10}}>
              <div style={{background:'#F9F9F7',borderRadius:10,padding:'8px 6px',textAlign:'center'}}>
                <div style={{fontSize:10,color:'#888780'}}>Peso</div>
                <div style={{fontSize:18,fontWeight:700}}>{proy?.peso} kg</div>
                <div style={{fontSize:10,color:'#888780'}}>±{proy?.ci_peso}</div>
              </div>
              <div style={{background:'#F9F9F7',borderRadius:10,padding:'8px 6px',textAlign:'center'}}>
                <div style={{fontSize:10,color:'#888780'}}>% grasa</div>
                <div style={{fontSize:18,fontWeight:700,color:'#BA7517'}}>{proy?.grasa?`${proy?.grasa}%`:'—'}</div>
                <div style={{fontSize:10,color:'#888780'}}>{proy?.grasa?`±${proy?.ci_grasa}`:'sin datos'}</div>
              </div>
              <div style={{background:'#F9F9F7',borderRadius:10,padding:'8px 6px',textAlign:'center'}}>
                <div style={{fontSize:10,color:'#888780'}}>TMB en 1 año</div>
                <div style={{fontSize:14,fontWeight:700,color:'#534AB7'}}>{datos?.tmb1ano?.toLocaleString()}</div>
                <div style={{fontSize:10,color:'#888780'}}>kcal/día</div>
              </div>
            </div>
            <div style={{background:'#F4F4F2',borderRadius:10,padding:'9px 10px',fontSize:11,color:'#444',lineHeight:1.5}}>{proy?.nota}</div>
          </div>
          {datos?.n < 14 && (
            <div className="banner banner-amber">
              <span>⚠️</span>
              <span>Con {datos?.n} días los IC son amplios. Más datos = proyecciones más precisas.</span>
            </div>
          )}
        </>)}
      </div>
    </div>
  )
}
