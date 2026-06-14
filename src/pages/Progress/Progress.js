import React, { useState } from 'react'

const PIN_CORRECTO = '1234'

export default function Progress({ profile }) {
  const [unlocked, setUnlocked] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)

  function pressPin(n) {
    if (pin.length >= 4) return
    const nuevo = pin + n
    setPin(nuevo)
    setError(false)
    if (nuevo.length === 4) {
      setTimeout(() => {
        if (nuevo === PIN_CORRECTO) { setUnlocked(true); setPin('') }
        else { setError(true); setPin('') }
      }, 200)
    }
  }

  if (!unlocked) return (
    <div>
      <div className="page-header phrow">
        <div className="page-title">Progreso corporal</div>
        <span style={{ fontSize: 18 }}>🔒</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 540, background: 'rgba(0,0,0,0.3)', margin: 12, borderRadius: 18 }}>
        <div style={{ background: 'white', borderRadius: 18, padding: '24px 20px', width: 240, textAlign: 'center' }}>
          <div style={{ fontSize: 30, marginBottom: 8 }}>🔒</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Área privada</div>
          <div style={{ fontSize: 12, color: '#888780', marginBottom: 4 }}>Ingresa tu PIN de 4 dígitos</div>
          {error && <div style={{ fontSize: 12, color: '#E24B4A', marginBottom: 4 }}>PIN incorrecto. Intenta de nuevo.</div>}
          <div className="pin-dots">
            {[0,1,2,3].map(i => <div key={i} className={`pin-dot ${pin.length > i ? 'filled' : ''}`}></div>)}
          </div>
          <div className="pin-pad">
            {[1,2,3,4,5,6,7,8,9].map(n => <div key={n} className="pin-key" onClick={() => pressPin(String(n))}>{n}</div>)}
            <div className="pin-key action" onClick={() => setPin(p => p.slice(0,-1))}>borrar</div>
            <div className="pin-key" onClick={() => pressPin('0')}>0</div>
            <div className="pin-key confirm" onClick={() => { if(pin===PIN_CORRECTO){setUnlocked(true);setPin('')}else{setError(true);setPin('')} }}>OK</div>
          </div>
          <div style={{ fontSize: 10, color: '#CCC', marginTop: 12 }}>PIN de demo: 1234</div>
        </div>
      </div>
    </div>
  )

  const fotos = [
    { fecha: 'Mar 2025', peso: 82.1, grasa: 23.5, color: '#9FE1CB' },
    { fecha: 'Jun 2025', peso: 78.4, grasa: 19.2, color: '#1D9E75' },
  ]

  return (
    <div>
      <div className="page-header" style={{ justifyContent: 'space-between' }}>
        <div className="page-title">Progreso corporal</div>
        <button style={{ background:'none',border:'none',fontSize:18,cursor:'pointer' }} onClick={() => setUnlocked(false)}>🔒</button>
      </div>
      <div className="page-content">
        <div className="banner banner-green">
          <span>☁️</span>
          <span>Fotos guardadas en tu OneDrive · solo visibles aquí</span>
        </div>
        <div className="grid-2">
          {fotos.map(f => (
            <div key={f.fecha}>
              <div style={{ background: f.color, borderRadius: 14, height: 190, display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end', padding: 8 }}>
                <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.25)', color: 'white', padding: '2px 6px', borderRadius: 6 }}>{f.fecha}</span>
              </div>
              <div style={{ fontSize: 11, color: '#888780', textAlign: 'center', marginTop: 4 }}>{f.peso} kg · {f.grasa}% grasa</div>
            </div>
          ))}
          <div>
            <div style={{ background: '#F4F4F2', borderRadius: 14, height: 190, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px dashed #CCC', cursor: 'pointer' }}>
              <span style={{ fontSize: 28 }}>📸</span>
              <div style={{ fontSize: 11, color: '#888780', marginTop: 4 }}>Sep 2025</div>
            </div>
          </div>
          <div>
            <div style={{ background: '#F4F4F2', borderRadius: 14, height: 190, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
              <span style={{ fontSize: 28 }}>🔒</span>
            </div>
          </div>
        </div>
        <div className="card" style={{ marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Tendencia de peso</div>
          {fotos.map((f, i) => (
            <div key={i} className="info-row">
              <span className="info-row-label">{f.fecha}</span>
              <span className="info-row-value">{f.peso} kg · <span style={{ color: '#BA7517' }}>{f.grasa}%</span></span>
            </div>
          ))}
          <div className="info-row">
            <span className="info-row-label">Cambio total</span>
            <span className="info-row-value" style={{ color: '#1D9E75' }}>-3.7 kg · -4.3% grasa</span>
          </div>
        </div>
      </div>
    </div>
  )
}
