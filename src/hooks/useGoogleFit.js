import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useGoogleFit() {
  const [cargando, setCargando] = useState(false)

  const sincronizarPasos = useCallback(async () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    if (!clientId) return null
    setCargando(true)
    try {
      const token = await obtenerToken(clientId)
      if (!token) { setCargando(false); return null }
      const res = await fetch('/api/google-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      })
      const data = await res.json()
      if (data.pasos !== undefined) {
        const uid = (await supabase.auth.getUser()).data.user?.id
        const today = new Date().toISOString().split('T')[0]
        await supabase.from('pasos_diarios').upsert({ user_id: uid, pasos: data.pasos, fecha: today })
        setCargando(false)
        return data.pasos
      }
    } catch (e) {
      console.error('Google Fit error:', e)
    }
    setCargando(false)
    return null
  }, [])

  return { sincronizarPasos, cargando }
}

function obtenerToken(clientId) {
  return new Promise((resolve) => {
    const scope = 'https://www.googleapis.com/auth/fitness.activity.read'
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: window.location.origin,
      response_type: 'token',
      scope,
      prompt: 'consent'
    })
    const url = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
    const w = 500, h = 600
    const left = window.screenX + (window.outerWidth - w) / 2
    const top = window.screenY + (window.outerHeight - h) / 2
    const popup = window.open(url, 'googlefit', `width=${w},height=${h},left=${left},top=${top}`)
    if (!popup) { resolve(null); return }
    const interval = setInterval(() => {
      try {
        if (popup.closed) { clearInterval(interval); resolve(null); return }
        const hash = popup.location.hash
        if (hash && hash.includes('access_token')) {
          clearInterval(interval)
          const params2 = new URLSearchParams(hash.substring(1))
          const token = params2.get('access_token')
          popup.close()
          resolve(token)
        }
      } catch (e) {}
    }, 500)
    setTimeout(() => { clearInterval(interval); popup?.close(); resolve(null) }, 120000)
  })
}
