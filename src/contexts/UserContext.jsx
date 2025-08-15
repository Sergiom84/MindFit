import React, { createContext, useContext, useState } from 'react'
import { useAuth } from './AuthContext'

// Crear el contexto
const UserContext = createContext()

// Hook personalizado para usar el contexto
export const useUserContext = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUserContext debe ser usado dentro de un UserProvider')
  }
  return context
}

// Provider del contexto
export const UserProvider = ({ children }) => {
  const { currentUser, getUserData, updateUserData: updateAuthUserData, replaceUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [adaptivePlan, setPlan] = useState(null)

  // Obtener datos dinámicos del usuario actual
  const userData = currentUser || {}
  const panelIA = getUserData('panelIA') || {}
  const videoCorreccion = getUserData('videoCorreccion') || {}
  const entrenamientoCasa = getUserData('entrenamientoCasa') || {}
  const progreso = getUserData('progreso') || {}
  const rutinas = getUserData('rutinas') || {}
  const metodologiaActiva = getUserData('metodologiaActiva') || null

  // Función para actualizar datos del usuario
  const updateUserProfile = async (newData) => {
    if (!currentUser) return false

    console.log('🔄 Actualizando usuario con datos:', newData)

    // Persistir en backend (PATCH)
    try {
      const response = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      })
      const result = await response.json()

      console.log('🔄 Respuesta del backend:', result)

      if (!response.ok || !result.success) throw new Error(result.error || 'Error al actualizar')

      // Actualizar cada campo individualmente en AuthContext
      // Actualizar estado global con el usuario completo desde backend
      replaceUser(result.user)

      console.log('✅ Usuario actualizado correctamente')
      return result.user
    } catch (e) {
      console.error('❌ Error actualizando usuario en backend:', e)
      return false
    }
  }

  // Función para actualizar el panel IA
  const updatePanelIA = (newPanelData) => {
    if (!currentUser) return false

    const updatedPanelData = {
      ...panelIA,
      ...newPanelData,
      ultimaActualizacion: new Date().toISOString()
    }

    return updateAuthUserData('panelIA', updatedPanelData)
  }

  /*  🔸 FUNCIÓN ACTUALIZADA  🔸 */
  const activarIAAdaptativa = async (modoId) => {
    if (!userData) return { success: false, error: 'Usuario no cargado' }

    setIsLoading(true)
    try {
      /* 1. Lesiones activas (si tuvieras endpoint, cámbialo abajo) */
      let injuries = []
      try {
        const r = await fetch(`/api/injuries/${userData.id}`)
        if (r.ok) injuries = await r.json()
      } catch (_) {}

      /* 2. Payload con LOS 10 CAMPOS pedid-os */
      const variablesPrompt = {
        userId:          userData.id,
        age:             userData.edad,
        sex:             userData.sexo,
        heightCm:        userData.alturaCm,
        weightKg:        userData.pesoKg,
        level:           userData.nivel,
        experienceYears: userData.aniosExperiencia,
        methodology:     userData.metodologia,
        goals:           userData.objetivos,
        injuries                         // ← array
      }

      /* 3. POST al backend real */
      const res = await fetch('/api/activar-ia-adaptativa', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({ modo: modoId, variablesPrompt })
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err.error || 'Error generando plan adaptativo')
      }

      const data = await res.json()
      setPlan(data)
      return { success: true, data }
    } catch (e) {
      console.error('[activarIAAdaptativa]', e)
      return { success: false, error: e.message }
    } finally {
      setIsLoading(false)
    }
  }

  // Función para resetear el panel IA a valores por defecto
  const resetPanelIA = () => {
    if (!currentUser) return false

    const defaultPanelIA = {
      estadoMetabolico: 'Bueno',
      recuperacionNeural: '75%',
      eficienciaAdaptativa: '+5%',
      proximaRevision: '7 días',
      alertas: [],
      ultimaActualizacion: null,
      modoActivo: null
    }

    return updateAuthUserData('panelIA', defaultPanelIA)
  }

  // Función para obtener el color del estado metabólico
  const getEstadoMetabolicoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'óptimo':
        return 'text-green-400'
      case 'bueno':
        return 'text-blue-400'
      case 'regular':
        return 'text-yellow-400'
      case 'necesita ajuste':
        return 'text-red-400'
      default:
        return 'text-gray-400'
    }
  }

  // Función para establecer metodología activa
  const setMetodologiaActiva = (metodologia, fechaInicio, fechaFin) => {
    if (!currentUser) return false

    const metodologiaData = {
      metodologia,
      fechaInicio,
      fechaFin,
      progreso: 0,
      entrenamientosCompletados: 0,
      fechaSeleccion: new Date().toISOString()
    }

    return updateAuthUserData('metodologiaActiva', metodologiaData)
  }

  // Función para actualizar progreso de metodología
  const updateMetodologiaProgress = (nuevoProgreso, entrenamientosCompletados = null) => {
    if (!currentUser || !metodologiaActiva) return false

    const updatedData = {
      ...metodologiaActiva,
      progreso: nuevoProgreso,
      entrenamientosCompletados: entrenamientosCompletados || metodologiaActiva.entrenamientosCompletados || 0,
      ultimaActualizacion: new Date().toISOString()
    }

    return updateAuthUserData('metodologiaActiva', updatedData)
  }

  // Función para completar un entrenamiento
  const completarEntrenamiento = () => {
    if (!currentUser || !metodologiaActiva) return false

    const entrenamientosCompletados = (metodologiaActiva.entrenamientosCompletados || 0) + 1
    const metodologia = metodologiaActiva.metodologia

    // Calcular progreso basado en entrenamientos completados
    const frecuenciaSemanal = parseInt(metodologia.frequency?.split('-')[0]) || 3
    const duracionSemanas = parseInt(metodologia.programDuration?.split('-')[1]) || 8
    const totalEntrenamientos = frecuenciaSemanal * duracionSemanas
    const nuevoProgreso = Math.min((entrenamientosCompletados / totalEntrenamientos) * 100, 100)

    return updateMetodologiaProgress(nuevoProgreso, entrenamientosCompletados)
  }

  // Función para obtener el color de las alertas
  const getAlertColor = (tipo) => {
    switch (tipo) {
      case 'success':
        return 'border-green-400 bg-green-400/10 text-green-300'
      case 'warning':
        return 'border-yellow-400 bg-yellow-400/10 text-yellow-300'
      case 'info':
        return 'border-blue-400 bg-blue-400/10 text-blue-300'
      default:
        return 'border-gray-400 bg-gray-400/10 text-gray-300'
    }
  }

  const value = {
    // Datos del usuario actual (dinámicos)
    userData,
    updateUserData: updateUserProfile,
    updateUserProfile,

    // Panel IA (dinámico)
    panelIA,
    updatePanelIA,
    resetPanelIA,

    // Datos específicos por sección (dinámicos)
    videoCorreccion,
    entrenamientoCasa,
    progreso,
    rutinas,

    // Metodología activa
    metodologiaActiva,
    setMetodologiaActiva,
    updateMetodologiaProgress,
    completarEntrenamiento,

    // Estados
    isLoading,
    adaptivePlan,

    // Funciones
    activarIAAdaptativa,
    getEstadoMetabolicoColor,
    getAlertColor,

    // Información del usuario actual
    currentUser,
    isUserLoggedIn: !!currentUser
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}

export default UserContext
