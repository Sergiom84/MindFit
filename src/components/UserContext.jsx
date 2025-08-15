// src/contexts/UserContext.jsx
import React, { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { useAuth } from './AuthContext'

// Detecta base de API: si hay VITE_API_URL lo usa, si no usa el mismo origen
const API_BASE = import.meta?.env?.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL.replace(/\/+$/, '')}/api`
  : '/api'

const UserContext = createContext(null)

export const UserProvider = ({ children }) => {
  const { getCurrentUserInfo } = useAuth()
  // Estado local con los datos “extendidos” del usuario (los que pinta ProfileScreen)
  const [userData, setUserData] = useState(() => getCurrentUserInfo?.() || null)

  /**
   * updateUserProfile
   * - Hace PATCH al backend con los cambios
   * - Actualiza userData con la respuesta (refresco inmediato del UI)
   * - Devuelve true/false
   */
  const updateUserProfile = useCallback(async (patch) => {
    try {
      const current = getCurrentUserInfo?.()
      if (!current?.id) {
        console.warn('[UserContext] No hay currentUser.id para PATCH')
        return false
      }

      const res = await fetch(`${API_BASE}/users/${current.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch || {})
      })

      if (!res.ok) {
        const err = await res.text().catch(() => '')
        console.error('[UserContext] PATCH error:', res.status, err)
        return false
      }

      const json = await res.json()
      if (!json?.success || !json?.user) {
        console.error('[UserContext] Respuesta inesperada:', json)
        return false
      }

      // Actualiza el estado local: esto refresca inmediatamente lo que renderiza ProfileScreen
      setUserData((prev) => ({ ...(prev || {}), ...(json.user || {}) }))
      return true
    } catch (e) {
      console.error('[UserContext] PATCH exception:', e)
      return false
    }
  }, [getCurrentUserInfo])

  // Por si quieres asignar todo el user desde fuera (cargas, resets, etc.)
  const setAllUserData = useCallback((data) => {
    setUserData(data || null)
  }, [])

  const value = useMemo(() => ({
    userData,
    setAllUserData,
    updateUserProfile
  }), [userData, setAllUserData, updateUserProfile])

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>
}

export const useUserContext = () => {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUserContext must be used within <UserProvider>')
  return ctx
}
