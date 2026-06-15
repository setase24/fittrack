import { useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const TOKEN_KEY = 'googlefit_token'
const TOKEN_EXPIRY_KEY = 'googlefit_token_expiry'
const CONECTADO_KEY = 'googlefit_conectado'

function getTokenGuardado() {
  const token = localStorage.getItem(TOKEN_KEY)
  const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY)
  if (!token || !expiry) return null
  if (Date.now() > parseInt(expiry)) {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    return null
  }
  return token
}

function guardarToken(token, expiresIn = 3600) {
  localStorage.setItem(TOKEN_KEY, token)
  localStorage.setItem(TOKEN_EXPIRY_KEY, String(Date.now() + (expiresIn - 60) * 1000))
}

export function useGoogleFit() {
  const [cargando, setCargando] = useState(false)

  const sincronizarPasos = useCallback(async (forzarLogin = false) => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID
    if (!clientId) return null
    setCargando(true)
    try {
      // Usar token guardado si existe y no está expirado
      let token = forzarLogin ? null : getTokenGuardado()
      if (!token) {
        token = await obtenerToken(clientId)
        if (!token) { setCargando(false); return null }
        guardarToken(token)
      }
      const res = await fetch('/api/google-fit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: token })
      })
      const data = await res.json()
      // Si el token expiró, pedir uno nuevo
      if (data.error && data.error.includes('401')) {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRY_KEY)
        const nuevoToken = await obtenerToken(clientId)
        if (!nuevoToken) { setCargando(false); return null }
        guardarToken(nuevoToken)
        const res2 = await fetch('/api/google-fit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken: nuevoToken })
        })
        const data2 = await res2.json()
        if (data2.pasos !== undefined) {
          await guardarPasosSupabase(data2.pasos)
          setCargando(false)
          return data2.pasos
        }
      }
      if (data.pasos !== undefined) {
        await guardarPasosSupabase(data.pasos)
        setCargando(false)
        return data.pasos
      }
    } catch (e) {
      console.error('Google Fit error:', e)
    }
    setCargando(false)
    return null
  }, [])

  const estaConectado = () => !!localStorage.getItem(CONECTADO_KEY)

  const desconectar = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(TOKEN_EXPIRY_KEY)
    localStorage.removeItem(CONECTADO_KEY)
  }

  return { sincronizarPasos, cargando, estaConectado, desconectar }
}

async function guardarPasosSupabase(pasos) {
  const uid = (await supabase.auth.getUser()).data.user?.id
  const today = new Date().toISOString().split('T')[0]
  await supabase.from('pasos_diarios').upsert({ user_id: uid, pasos, fecha: today })
}

function obtenerToken(clientId) {
  return new Promise((resolve) => {
    const tokenGuardado = getTokenGuardado()
    if (tokenGuardado) { resolve(tokenGuardado); return }
    const scope = 'https://www.googleapis.com/auth/fitness.activity.read'
    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: window.location.origin,
      response_type: 'token',
      scope,
      prompt: 'none' // No pedir login si ya hay sesión activa de Google
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
          const p = new URLSearchParams(hash.substring(1))
          const token = p.get('access_token')
          const expiresIn = parseInt(p.get('expires_in') || '3600')
          guardarToken(token, expiresIn)
          popup.close()
          resolve(token)
        }
        // Si redirige a página de error (token expirado con prompt=none)
        if (popup.location.href.includes('error=interaction_required')) {
          clearInterval(interval)
          popup.close()
          // Reintentar con prompt normal
          obtenerTokenConLogin(clientId).then(resolve)
        }
      } catch (e) {}
    }, 500)
    setTimeout(() => { clearInterval(interval); popup?.close(); resolve(null) }, 30000)
  })
}

function obtenerTokenConLogin(clientId) {
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
    const popup = window.open(url, 'googlefit2', `width=${w},height=${h},left=${left},top=${top}`)
    if (!popup) { resolve(null); return }
    const interval = setInterval(() => {
      try {
        if (popup.closed) { clearInterval(interval); resolve(null); return }
        const hash = popup.location.hash
        if (hash && hash.includes('access_token')) {
          clearInterval(interval)
          const p = new URLSearchParams(hash.substring(1))
          const token = p.get('access_token')
          const expiresIn = parseInt(p.get('expires_in') || '3600')
          guardarToken(token, expiresIn)
          popup.close()
          resolve(token)
        }
      } catch (e) {}
    }, 500)
    setTimeout(() => { clearInterval(interval); popup?.close(); resolve(null) }, 120000)
  })
}
