// API endpoint for analyzing user performance and suggesting difficulty adjustments
// Refactor: use backend endpoint to avoid exposing OpenAI key in client

export const analyzePerformance = async (exerciseData, userFeedback, userProfile, methodology) => {
  try {
    const prompt = `
Eres un entrenador personal experto especializado en la metodología ${methodology.name}. 
Analiza el rendimiento del usuario y determina si necesita ajustes en la dificultad.

DATOS DEL USUARIO:
- Nivel: ${userProfile.nivel || 'Intermedio'}
- Experiencia: ${userProfile.experiencia || 'Intermedio'} 
- Años entrenando: ${userProfile.años_entrenando || '2-3 años'}
- Objetivo: ${userProfile.objetivo_principal || 'Ganar músculo'}

EJERCICIO ACTUAL:
- Tipo: ${exerciseData.type}
- Ejercicios: ${exerciseData.exercises.join(', ')}
- Progreso actual: ${exerciseData.completed}/${exerciseData.total}

FEEDBACK DEL USUARIO: ${userFeedback}

METODOLOGÍA: ${methodology.name}
- Intensidad: ${methodology.intensity}
- Volumen: ${methodology.volume}
- Frecuencia: ${methodology.frequency}

Basándote en esta información, determina:
1. ¿Necesita ajuste de dificultad? (sí/no)
2. ¿Qué tipo de ajuste? (aumentar/disminuir)
3. ¿Qué tan confiable es esta recomendación? (0-1)
4. Sugerencias específicas para los próximos entrenamientos

Responde en formato JSON:
{
  "shouldAdjust": boolean,
  "recommendation": "increase" | "decrease" | "maintain",
  "confidence": number,
  "suggestions": {
    "weight": "ajuste en kg",
    "reps": "ajuste en repeticiones", 
    "sets": "ajuste en series",
    "rest": "ajuste en descanso"
  },
  "reasoning": "explicación breve del análisis"
}
`

    const apiBase = import.meta.env.VITE_API_URL || ''
    const r = await fetch(`${apiBase}/api/activar-ia-adaptativa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo: 'ANALISIS_RENDIMIENTO', variablesPrompt: { prompt } })
    })
    const j = await r.json()
    const content = j?.respuestaIA ? JSON.stringify(j.respuestaIA) : '{"shouldAdjust":false,"recommendation":"maintain","confidence":0.5,"suggestions":{}}'
    const analysis = JSON.parse(content)
    return analysis

  } catch (error) {
    console.error('Error in AI analysis:', error)
    
    // Fallback logic if AI fails
    const fallbackAnalysis = {
      shouldAdjust: userFeedback === 'too_easy' || userFeedback === 'too_hard',
      recommendation: userFeedback === 'too_easy' ? 'increase' : 
                    userFeedback === 'too_hard' ? 'decrease' : 'maintain',
      confidence: 0.6,
      suggestions: {
        weight: userFeedback === 'too_easy' ? '+2.5kg' : 
               userFeedback === 'too_hard' ? '-2.5kg' : '0kg',
        reps: userFeedback === 'too_easy' ? '+1' : 
              userFeedback === 'too_hard' ? '-1' : '0',
        sets: '0',
        rest: userFeedback === 'too_hard' ? '+30s' : '0s'
      },
      reasoning: 'Análisis basado en feedback directo del usuario (modo fallback)'
    }
    
    return fallbackAnalysis
  }
}

// Mock API endpoint function (since we can't create actual API routes in Vite)
export const mockAnalyzePerformanceAPI = async (requestData) => {
  const { exercise, feedback, userProfile, methodology } = requestData
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  return analyzePerformance(exercise, feedback, userProfile, methodology)
}
