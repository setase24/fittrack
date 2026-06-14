import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function Graficas({ profile, onBack }) {
  const [periodo, setPeriodo] = useState('semana')
  const [datos, setDatos] = useState([])
  const [stats, setStats] = useState({ avgCal:0, avgDef:0, diasDeficit:0, total:0 })
  const [cargando, setCargando] = useState(true)
  const tmb = profile ? Math.round(88.362+(13.397*(profile.peso_inicial_kg||75))+(4.799*(profile.altura_cm||175))-(5.677*(profile.edad||25))) : 1750

  const fetchDatos = useCallback(async () => {
    setCargando(true)
    const uid = (await supabase.auth.getUser()).data.user?.id
    const hoy = new Date()
    let desde = new Date()
    if (periodo==='semana') desde.setDate(hoy.getDate()-6)
    else if (periodo==='mes') desde.setDate(hoy.getDate()-29)
    else if (periodo==='anual') desde.setMonth(hoy.getMonth()-5)
    else desde.setFullYear(hoy.getFullYear()-2)
    const desdeStr = desde.toISOString().split('T')[0]
    const [{ data: comidas },{ data: entrenos }] = await Promise.all([
      supabase.from('comidas').select('fecha,calorias').eq('user_id',uid).gte('fecha',desdeStr),
      supabase.from('entrenamientos').select('fecha,calorias_quemadas').eq('user_id',uid).gte('fecha',desdeStr)
    ])
    const mapa = {}
    ;(comidas||[]).forEach(c => { if(!mapa[c.fecha]) mapa[c.fecha]={consumido:0,ejercicio:0}; mapa[c.fecha].consumido+=c.calorias })
    ;(entrenos||[]).forEach(e => { if(!mapa[e.fecha]) mapa[e.fecha]={consumido:0,ejercicio:0}; mapa[e.fecha].ejercicio+=(e.calorias_quemadas||0) })
    let labels=[]
    if (periodo==='semana') for(let i=6;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);labels.push(d.toISOString().split('T')[0])}
    else if (periodo==='mes') for(let i=29;i>=0;i--){const d=new Date();d.setDate(d.getDate()-i);labels.push(d.toISOString().split('T')[0])}
    else if (periodo==='anual') for(let i=5;i>=0;i--){const d=new Date();d.setMonth(d.getMonth()-i);labels.push(d.toISOString().slice(0,7))}
    else for(let i=2;i>=0;i--) labels.push(String(new Date().getFullYear()-i))
    const fmt = f => {
      if(periodo==='semana') return new Date(f+'T12:00:00').toLocaleDateString('es',{weekday:'short'})
      if(periodo==='mes') return new Date(f+'T12:00:00').toLocaleDateString('es',{day:'numeric',month:'short'})
      if(periodo==='anual') return new Date(f+'-01').toLocaleDateString('es',{month:'short'})
      return f
    }
    let processed
    if(periodo==='anual'){
      const mm={}; Object.entries(mapa).forEach(([f,v])=>{const m=f.slice(0,7);if(!mm[m])mm[m]={c:0,e:0,n:0};mm[m].c+=v.consumido;mm[m].e+=v.ejercicio;mm[m].n++})
      processed=labels.map(l=>({label:fmt(l),consumido:Math.round((mm[l]?.c||0)/(mm[l]?.n||1)),ejercicio:Math.round((mm[l]?.e||0)/(mm[l]?.n||1))}))
    } else if(periodo==='historico'){
      const aa={}; Object.entries(mapa).forEach(([f,v])=>{const a=f.slice(0,4);if(!aa[a])aa[a]={c:0,e:0,n:0};aa[a].c+=v.consumido;aa[a].e+=v.ejercicio;aa[a].n++})
      processed=labels.map(l=>({label:l,consumido:Math.round((aa[l]?.c||0)/(aa[l]?.n||1)),ejercicio:Math.round((aa[l]?.e||0)/(aa[l]?.n||1))}))
    } else {
      processed=labels.map(l=>({label:fmt(l),consumido:mapa[l]?.consumido||0,ejercicio:mapa[l]?.ejercicio||0}))
    }
    setDatos(processed)
    const cd=processed.filter(d=>d.consumido>0)
    if(cd.length>0){
      const avgCal=Math.round(cd.reduce((s,d)=>s+d.consumido,0)/cd.length)
      const defs=cd.map(d=>(tmb+d.ejercicio)-d.consumido)
      setStats({avgCal,avgDef:Math.round(defs.reduce((s,d)=>s+d,0)/defs.length),diasDeficit:defs.filter(d=>d>0).length,total:cd.length})
    }
    setCargando(false)
  }, [periodo, tmb])

  useEffect(()=>{fetchDatos()},[fetchDatos])

  return (
    <div>
      <div className="page-header">
        <button className="back-btn" onClick={onBack}>← Inicio</button>
        <span className="page-title">Gráficas calóricas</span>
      </div>
      <div className="page-content">
        <div className="seg-control">
          {[['semana','Semana'],['mes','Mes'],['anual','Anual'],['historico','Histórico']].map(([k,l])=>
            <button key={k} className={`seg-opt ${periodo===k?'active':''}`} onClick={()=>setPeriodo(k)}>{l}</button>)}
        </div>
        {cargando ? <div style={{textAlign:'center',padding:40,color:'#888780'}}>Cargando...</div>
        : datos.every(d=>d.consumido===0) ? (
          <div className="empty-state">
            <div className="empty-icon">📊</div>
            <div className="empty-title">Sin datos aún</div>
            <div className="empty-sub">Registra comidas y entrenamientos para ver tus gráficas</div>
          </div>
        ) : (<>
          <div className="grid-2" style={{marginBottom:10}}>
            <div style={{background:'#E1F5EE',borderRadius:14,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:'#0F6E56'}}>Prom. consumido</div>
              <div style={{fontSize:18,fontWeight:700,color:'#085041'}}>{stats.avgCal?.toLocaleString()} kcal</div>
            </div>
            <div style={{background:stats.avgDef>=0?'#E1F5EE':'#FCEBEB',borderRadius:14,padding:'10px 12px'}}>
              <div style={{fontSize:10,color:stats.avgDef>=0?'#0F6E56':'#A32D2D'}}>Déficit promedio</div>
              <div style={{fontSize:18,fontWeight:700,color:stats.avgDef>=0?'#085041':'#E24B4A'}}>{stats.avgDef>=0?'+':''}{stats.avgDef} kcal</div>
            </div>
          </div>
          <div className="card">
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Consumido vs Ejercicio</div>
            <div style={{display:'flex',gap:12,marginBottom:8,fontSize:11}}>
              <span><span style={{width:10,height:10,borderRadius:2,background:'#1D9E75',display:'inline-block',marginRight:4}}></span>Consumido</span>
              <span><span style={{width:10,height:10,borderRadius:2,background:'#378ADD',display:'inline-block',marginRight:4}}></span>Ejercicio</span>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={datos} margin={{top:0,right:0,left:-20,bottom:0}}>
                <XAxis dataKey="label" tick={{fontSize:9}}/>
                <YAxis tick={{fontSize:9}} tickFormatter={v=>v>=1000?`${(v/1000).toFixed(1)}k`:v}/>
                <Tooltip formatter={(v,n)=>[`${v} kcal`,n==='consumido'?'Consumido':'Ejercicio']}/>
                <Bar dataKey="consumido" fill="#1D9E75" radius={[3,3,0,0]}/>
                <Bar dataKey="ejercicio" fill="#378ADD" radius={[3,3,0,0]}/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card">
            <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Déficit neto</div>
            <ResponsiveContainer width="100%" height={140}>
              <LineChart data={datos.map(d=>({...d,deficit:(tmb+d.ejercicio)-d.consumido}))} margin={{top:0,right:0,left:-20,bottom:0}}>
                <XAxis dataKey="label" tick={{fontSize:9}}/>
                <YAxis tick={{fontSize:9}}/>
                <Tooltip formatter={(v)=>[`${v} kcal`,'Déficit']}/>
                <Line type="monotone" dataKey="deficit" stroke="#534AB7" strokeWidth={2} dot={{r:3}}/>
              </LineChart>
            </ResponsiveContainer>
            <div style={{fontSize:11,color:'#888780',marginTop:4}}>Días en déficit: {stats.diasDeficit} de {stats.total}</div>
          </div>
        </>)}
      </div>
    </div>
  )
}
