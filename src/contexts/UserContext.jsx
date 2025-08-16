import React, { createContext, useContext, useState, useCallback } from 'react'
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
      ...(panelIA || {}),
      ...(newPanelData || {}),
      ultimaActualizacion: new Date().toISOString()
    }

    return updateAuthUserData('panelIA', updatedPanelData)
  }

  /*  🔸 FUNCIÓN ACTUALIZADA  🔸 */
  const activarIAAdaptativa = async (input) => {
    try {
      // Normaliza entrada
      let modo = 'automatico'
      let variablesPrompt = {}
      let forcedMethodology = null

      if (typeof input === 'string') {
        modo = input
      } else if (input && typeof input === 'object') {
        modo = input.modo || 'automatico'
        variablesPrompt = input.variablesPrompt || {}
        forcedMethodology = input.forcedMethodology || null
      }

      const body = { modo, variablesPrompt }
      if (forcedMethodology) body.forcedMethodology = forcedMethodology

      const response = await fetch('/api/activar-ia-adaptativa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Error en IA')

      return data // { success, modo, respuestaIA, metodologia }
    } catch (err) {
      console.error('activarIAAdaptativa :: error', err)
      return { success: false, error: err.message || 'Fallo al activar IA' }
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
  const setMetodologiaActiva = (metodologiaPlan, fechaInicio, fechaFin) => {
    if (!currentUser) return false;

    const metodologiaData = {
      ...metodologiaPlan, // 👈 aquí ya vienen methodology_name y methodology_data al nivel raíz
      fechaInicio,
      fechaFin,
      progreso: 0,
      entrenamientosCompletados: 0,
      fechaSeleccion: new Date().toISOString(),
      generadaPorIA: metodologiaPlan.generadaPorIA || true, // conservar bandera de IA
      respuestaCompleta: metodologiaPlan.respuestaCompleta || null // guardar respuesta IA entera
    };

    return updateAuthUserData("metodologiaActiva", metodologiaData);
  };

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
    
    // Calcular progreso basado en los días planificados reales
    let totalEntrenamientos = 4; // Valor por defecto
    
    try {
      if (metodologiaActiva.methodology_data && metodologiaActiva.methodology_data.dias) {
        // Usar la longitud real del array de días planificados
        totalEntrenamientos = metodologiaActiva.methodology_data.dias.length;
      } else if (metodologiaActiva.metodologia) {
        // Fallback al cálculo anterior si no hay datos de días
        const frecuenciaSemanal = parseInt(metodologiaActiva.metodologia.frequency?.split('-')[0]) || 3
        const duracionSemanas = parseInt(metodologiaActiva.metodologia.programDuration?.split('-')[1]) || 8
        totalEntrenamientos = frecuenciaSemanal * duracionSemanas
      }
    } catch (error) {
      console.warn('Error calculando total de entrenamientos:', error)
      // Mantener el valor por defecto
    }

    const nuevoProgreso = Math.min((entrenamientosCompletados / totalEntrenamientos) * 100, 100)
    
    console.log('Completando entrenamiento:', {
      entrenamientosCompletados,
      totalEntrenamientos,
      nuevoProgreso: nuevoProgreso.toFixed(1) + '%'
    })

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
