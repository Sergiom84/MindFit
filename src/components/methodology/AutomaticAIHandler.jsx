// src/components/methodology/AutomaticAIHandler.jsx
// Maneja el flujo de "Activar IA" - Modo Automático
import { useState } from 'react'

export const useAutomaticAIHandler = (currentUser, activarIAAdaptativa, setSuccessData, setError) => {
  const [iaLoading, setIaLoading] = useState(false)

  const handleActivateAutomaticIA = async () => {
    try {
      setError(null)
      setIaLoading(true)

      // 1) Construye el perfil para IA automática
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
        // Preferencia SUAVE (opcional)
        preference: currentUser?.metodologia_preferida
          ? { favoriteMethodology: currentUser.metodologia_preferida, weight: 0.2 }
          : null
      }

      console.log('🤖 Activando IA AUTOMÁTICA con perfil:', variablesPrompt)

      // 2) Llamar a IA con modo automático (sin forzar metodología)
      const result = await activarIAAdaptativa({
        modo: 'automatico',
        variablesPrompt,
        forcedMethodology: null // IA elige libremente
      })

      if (result?.success) {
        console.log('✅ IA automática exitosa:', result)
        setSuccessData(result)
      } else {
        console.error('❌ Error IA automática:', result)
        setError(result?.error || 'Error al activar IA automática')
      }
    } catch (err) {
      console.error('💥 Excepción IA automática:', err)
      setError(err.message || 'Error inesperado en IA automática')
    } finally {
      setIaLoading(false)
    }
  }

  return {
    iaLoading,
    handleActivateAutomaticIA
  }
}
