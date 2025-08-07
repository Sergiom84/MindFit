// API endpoint for analyzing user performance and suggesting difficulty adjustments
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
})

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

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "Eres un entrenador personal experto en análisis de rendimiento deportivo y progresión de entrenamientos."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 500
    })

    const analysis = JSON.parse(response.choices[0].message.content)
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
