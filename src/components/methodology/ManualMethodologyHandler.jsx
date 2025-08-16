// src/components/methodology/ManualMethodologyHandler.jsx
// Maneja el flujo de "Seleccionar metodología" - Modo Manual con IA híbrida
import { useState } from 'react'

export const useManualMethodologyHandler = (currentUser, activarIAAdaptativa, setSuccessData, setError) => {
  const [iaLoading, setIaLoading] = useState(false)
  const [showManualSelectionModal, setShowManualSelectionModal] = useState(false)
  const [pendingMethodology, setPendingMethodology] = useState(null)

  const handleManualCardClick = (methodology) => {
    setPendingMethodology(methodology)
    setShowManualSelectionModal(true)
  }

  const confirmManualSelection = async () => {
    if (!pendingMethodology) return

    try {
      setError(null)
      setIaLoading(true)

      // 1) Construye el perfil para IA híbrida (manual + IA)
      const variablesPrompt = {
        userId: currentUser?.id,
        age: currentUser?.edad,
        sex: currentUser?.sexo,
        heightCm: currentUser?.altura,
        weightKg: currentUser?.peso,
        level: currentUser?.nivel,
        experienceYears: currentUser?.años_entrenando,
        goals: currentUser?.objetivos || [currentUser?.objetivo_principal],
        injuries: [], // se puede rellenar desde /api/injuries si está disponible
        availability: {
          daysPerWeek: currentUser?.diasDisponibles || 3,
          minutesPerSession: currentUser?.tiempoSesion || 60
        },
        preferences: currentUser?.preferencias || {},
        selectedMethodology: pendingMethodology.name // Metodología elegida por el usuario
      }

      console.log('🎯 Activando IA HÍBRIDA con metodología forzada:', pendingMethodology.name, variablesPrompt)

      // 2) Llamar a IA con metodología forzada (modo híbrido)
      const result = await activarIAAdaptativa({
        modo: 'manual',
        variablesPrompt,
        forcedMethodology: pendingMethodology.name // IA debe usar esta metodología
      })

      if (result?.success) {
        console.log('✅ IA híbrida exitosa:', result)
        setSuccessData(result)
      } else {
        console.error('❌ Error IA híbrida:', result)
        setError(result?.error || 'Error al activar IA híbrida')
      }
    } catch (err) {
      console.error('💥 Excepción IA híbrida:', err)
      setError(err.message || 'Error inesperado en IA híbrida')
    } finally {
      setIaLoading(false)
      setShowManualSelectionModal(false)
      setPendingMethodology(null)
    }
  }

  const cancelManualSelection = () => {
    setShowManualSelectionModal(false)
    setPendingMethodology(null)
  }

  return {
    iaLoading,
    showManualSelectionModal,
    pendingMethodology,
    handleManualCardClick,
    confirmManualSelection,
    cancelManualSelection
  }
}
