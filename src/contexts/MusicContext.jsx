// src/contexts/MusicContext.jsx
import React, { createContext, useContext, useMemo, useState, useEffect } from 'react'

const MusicContext = createContext(null)

const DEFAULT_STATE = {
  preferredProvider: 'spotify',
  connections: { spotify: false, apple: false, youtube: false, device: true },
  adaptiveMode: 'auto',
  rules: { fuerza: 'alto', cardio: 'medio', movilidad: 'suave' }
}

const STORAGE_KEY = 'mf_music_settings'

export function MusicProvider ({ children }) {
  const [state, setState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved ? JSON.parse(saved) : DEFAULT_STATE
    } catch {
      return DEFAULT_STATE
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  const setPreferredProvider = (provider) =>
    setState((s) => ({ ...s, preferredProvider: provider }))

  const connect = (provider) =>
    setState((s) => ({ ...s, connections: { ...s.connections, [provider]: true } }))

  const disconnect = (provider) =>
    setState((s) => ({ ...s, connections: { ...s.connections, [provider]: false } }))

  const setAdaptiveMode = (mode) =>
    setState((s) => ({ ...s, adaptiveMode: mode }))

  const setRule = (tipo, valor) =>
    setState((s) => ({ ...s, rules: { ...s.rules, [tipo]: valor } }))

  const reset = () => setState(DEFAULT_STATE)

  // Guarda en backend (upsert)
  const saveToBackend = async (userId) => {
    if (!userId) return { ok: false, error: 'Falta userId' }
    try {
      const res = await fetch('/api/music/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          preferred_provider: state.preferredProvider,
          connections: state.connections,
          adaptive_mode: state.adaptiveMode,
          rules: state.rules
        })
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        return { ok: false, error: err.error || 'Error al guardar' }
      }
      return { ok: true }
    } catch (e) {
      console.error('Error guardando ajustes musicales:', e)
      return { ok: false, error: e.message }
    }
  }

  const getMusicProfileForSession = (tipoSesion) => {
    const pref = state.rules[tipoSesion] || 'medio'
    const bpmRange = pref === 'alto' ? [140, 175] : pref === 'medio' ? [115, 140] : [80, 110]
    return { provider: state.preferredProvider, adaptiveMode: state.adaptiveMode, intensity: pref, bpmRange }
  }

  const value = useMemo(
    () => ({
      state,
      setPreferredProvider,
      connect,
      disconnect,
      setAdaptiveMode,
      setRule,
      reset,
      saveToBackend,
      getMusicProfileForSession
    }),
    [state]
  )

  return <MusicContext.Provider value={value}>{children}</MusicContext.Provider>
}

export function useMusic () {
  const ctx = useContext(MusicContext)
  if (!ctx) throw new Error('useMusic debe usarse dentro de <MusicProvider>')
  return ctx
}
