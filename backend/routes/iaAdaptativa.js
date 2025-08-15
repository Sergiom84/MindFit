import express from 'express'
import OpenAI from 'openai'
import dotenv from 'dotenv'

// Cargar variables de entorno
dotenv.config()

const router = express.Router()

// Inicializar cliente OpenAI solo si hay API key
let openai = null
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'tu_api_key_de_openai_aqui') {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  })
}

// Endpoint para activar IA adaptativa
router.post('/activar-ia-adaptativa', async (req, res) => {
  try {
    const { modo, variablesPrompt } = req.body

    // Validar que se recibieron los datos necesarios
    if (!modo || !variablesPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: modo y variablesPrompt'
      })
    }

    console.log(`Procesando IA adaptativa - Modo: ${modo}`)
    console.log('Variables del prompt:', variablesPrompt)

    // Verificar si OpenAI está disponible
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API no está configurada. Configura OPENAI_API_KEY en backend/.env'
      })
    }

    /* Llamada única obligando a JSON */
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },   // 👈 fuerza JSON válido
      messages: [
        {
          role: 'system',
          content: `Eres MindBot, un entrenador personal con IA avanzada especializado en adaptación metabólica y anatómica.

Tu función es analizar TODOS los datos del usuario y proporcionar recomendaciones específicas basadas en el modo de adaptación seleccionado.

MODO DE ADAPTACIÓN: ${modo}

Modos disponibles:
- BÁSICO: Ajustes semanales, recomendaciones simples
- AVANZADO: Análisis multifactorial cada 3-5 días, periodización automática
- EXPERTO: Adaptación diaria en tiempo real, microperiodización
- PERSONALIZADO: Según preferencias específicas del usuario

INSTRUCCIONES ESPECIALES:
1. CONSIDERA TODAS LAS ALERGIAS Y LIMITACIONES para las recomendaciones
2. RESPETA el historial médico y medicamentos actuales
3. ADAPTA las recomendaciones a la metodología preferida del usuario
4. INCLUYE consideraciones nutricionales basadas en alimentos excluidos
5. AJUSTA la intensidad según el nivel de experiencia y años entrenando
6. CONSIDERA la composición corporal actual vs objetivos
7. ADAPTA horarios según preferencias del usuario

Debes responder en formato JSON con la siguiente estructura:
{
  "estadoMetabolico": "Óptimo|Bueno|Regular|Necesita ajuste",
  "recuperacionNeural": "85%",
  "eficienciaAdaptativa": "+12%",
  "proximaRevision": "X días",
  "recomendacionIA": "Texto de recomendación específica considerando TODAS las limitaciones y alergias",
  "adaptacionDetectada": "Texto describiendo adaptación detectada",
  "ajustesRecomendados": {
    "calorias": "número o null",
    "volumenEntrenamiento": "aumentar|mantener|reducir",
    "intensidad": "aumentar|mantener|reducir",
    "frecuencia": "aumentar|mantener|reducir",
    "metodologia": "sugerencia de ajuste en metodología si aplica",
    "nutricion": "recomendaciones nutricionales específicas"
  },
  "consideracionesMedicas": {
    "alergias": "consideraciones específicas por alergias",
    "limitaciones": "adaptaciones por limitaciones físicas",
    "medicamentos": "interacciones o consideraciones"
  },
  "alertas": [
    {
      "tipo": "success|warning|info",
      "titulo": "Título de la alerta",
      "mensaje": "Mensaje detallado"
    }
  ]
}

Analiza los datos del usuario y proporciona recomendaciones específicas para el modo ${modo}.`
        },
        {
          role: 'user',
          content: `Analiza mi situación actual y proporciona recomendaciones
                    para el modo ${modo}.\n\nDATOS:\n${JSON.stringify(variablesPrompt)}`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    })

    // Procesar respuesta de OpenAI
    let contenido
    if (response.choices && response.choices[0]) {
      // Respuesta de chat.completions
      contenido = response.choices[0].message.content
    } else if (response.content) {
      // Respuesta de prompt personalizado
      contenido = response.content
    } else {
      throw new Error('Formato de respuesta no reconocido')
    }

    // Intentar parsear la respuesta JSON
    let respuestaIA
    try {
      respuestaIA = JSON.parse(contenido)
    } catch (parseError) {
      console.error('Error parseando respuesta JSON:', parseError)
      // Si no se puede parsear, crear una respuesta de fallback
      respuestaIA = {
        estadoMetabolico: 'Bueno',
        recuperacionNeural: '80%',
        eficienciaAdaptativa: '+8%',
        proximaRevision: '7 días',
        recomendacionIA: contenido, // Usar el contenido completo como recomendación
        adaptacionDetectada: 'Análisis en progreso. Continuando con protocolo actual.',
        ajustesRecomendados: {
          calorias: null,
          volumenEntrenamiento: 'mantener',
          intensidad: 'mantener',
          frecuencia: 'mantener'
        },
        alertas: [
          {
            tipo: 'info',
            titulo: 'Análisis Completado',
            mensaje: 'Se ha generado un análisis personalizado basado en tus datos.'
          }
        ]
      }
    }

    console.log('Análisis de IA adaptativa completado exitosamente')

    res.json({
      success: true,
      modo,
      respuestaIA,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error en IA adaptativa:', error)

    res.status(500).json({
      success: false,
      error: `Error al procesar IA adaptativa: ${error.message}`,
      modo: req.body.modo || 'desconocido'
    })
  }
})

// Endpoint para obtener datos de ejemplo del usuario (para testing)
router.get('/datos-usuario-ejemplo', (req, res) => {
  res.json({
    edad: 29,
    sexo: 'masculino',
    nivel: 'intermedio',
    objetivo: 'ganar masa muscular',
    historial: 'lesión leve en hombro derecho hace 2 meses',
    progreso: 'peso estable, fuerza en aumento',
    rutina: '4 días de fuerza y 2 cardio',
    nutricion: '2,500 kcal, proteína alta, suplemento: creatina',
    fatiga: 'media',
    sueño: '6h promedio',
    rpe: '7/10 en piernas, 8/10 en pecho'
  })
})

// Endpoint para recomendación de metodología
router.post('/recomendar-metodologia', async (req, res) => {
  try {
    const { userData, availableMethodologies, equipamiento, tipoEntrenamiento, equipoDisponible, estiloEntrenamiento, datosUsuario } = req.body

    // Validar que se recibieron los datos necesarios (soporte para ambos formatos)
    if ((!userData || !availableMethodologies) && (!equipamiento || !tipoEntrenamiento)) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: userData y availableMethodologies O equipamiento y tipoEntrenamiento'
      })
    }

    // Determinar si es el formato nuevo (entrenamiento en casa) o el formato original
    const isHomeTrainingRequest = equipamiento && tipoEntrenamiento

    console.log('Procesando recomendación de metodología para:',
      isHomeTrainingRequest ? datosUsuario?.nombre : userData?.userName)

    // Verificar si OpenAI está disponible
    if (!openai) {
      return res.status(503).json({
        success: false,
        error: 'OpenAI API no está configurada. Configura OPENAI_API_KEY en backend/.env'
      })
    }

    // Crear prompt específico según el tipo de solicitud
    let methodologyPrompt

    if (isHomeTrainingRequest) {
      const imc =
        datosUsuario?.imc ||
        (datosUsuario?.peso && datosUsuario?.altura
          ? (datosUsuario.peso / Math.pow(datosUsuario.altura / 100, 2)).toFixed(2)
          : 'No calculado')
      // Prompt específico para entrenamiento en casa
      methodologyPrompt = `Eres un entrenador personal experto especializado en entrenamientos en casa. Tu tarea es crear un entrenamiento personalizado y detallado.

INFORMACIÓN DEL USUARIO:
- Nombre: ${datosUsuario?.nombre || 'Usuario'}
- Edad: ${datosUsuario?.edad || 'N/A'}
- Peso: ${datosUsuario?.peso || 'N/A'} kg
- Estatura: ${datosUsuario?.altura || 'N/A'} cm
- Sexo: ${datosUsuario?.sexo || 'N/A'}
- IMC: ${imc}
- Nivel: ${datosUsuario?.nivel || 'intermedio'}
- Nivel de actividad: ${datosUsuario?.nivel_actividad || 'N/A'}
- Años entrenando: ${datosUsuario?.['años_entrenando'] || 'N/A'}
- Objetivo principal: ${datosUsuario?.objetivo_principal || datosUsuario?.objetivos || 'mantener forma'}
- Composición corporal: grasa corporal ${datosUsuario?.composicion_corporal?.grasa_corporal || 'N/A'}%, masa muscular ${datosUsuario?.composicion_corporal?.masa_muscular || 'N/A'} kg, agua corporal ${datosUsuario?.composicion_corporal?.agua_corporal || 'N/A'}%, metabolismo basal ${datosUsuario?.composicion_corporal?.metabolismo_basal || 'N/A'} kcal
- Medidas corporales: cintura ${datosUsuario?.medidas_corporales?.cintura || 'N/A'} cm, pecho ${datosUsuario?.medidas_corporales?.pecho || 'N/A'} cm, brazos ${datosUsuario?.medidas_corporales?.brazos || 'N/A'} cm, muslos ${datosUsuario?.medidas_corporales?.muslos || 'N/A'} cm, cuello ${datosUsuario?.medidas_corporales?.cuello || 'N/A'} cm, antebrazos ${datosUsuario?.medidas_corporales?.antebrazos || 'N/A'} cm
- Limitaciones: ${datosUsuario?.limitaciones?.length > 0 ? datosUsuario.limitaciones.join(', ') : 'Ninguna'}

EQUIPAMIENTO SELECCIONADO: ${equipamiento}
- Equipos disponibles: ${equipoDisponible?.join(', ') || 'peso corporal'}

TIPO DE ENTRENAMIENTO: ${tipoEntrenamiento}
- Estilo: ${estiloEntrenamiento?.name || 'Funcional'}
- Descripción: ${estiloEntrenamiento?.description || 'Movimientos naturales'}
- Duración: ${estiloEntrenamiento?.duration || '30-45 min'}
- Frecuencia: ${estiloEntrenamiento?.frequency || '4-5 días/semana'}
- Enfoque: ${estiloEntrenamiento?.focus || 'Fuerza funcional'}

INSTRUCCIONES:
Crea un entrenamiento estructurado en formato JSON con la siguiente estructura:

{
  "titulo": "Nombre del entrenamiento",
  "descripcion": "Descripción breve",
  "duracionTotal": "30-45 min",
  "frecuencia": "4-5 días/semana",
  "enfoque": "Fuerza funcional y movilidad",
  "ejercicios": [
    {
      "nombre": "Sentadillas con peso corporal",
      "descripcion": "Descripción detallada de la técnica",
      "series": 3,
      "repeticiones": "12-15",
      "duracion": 45,
      "descanso": 60,
      "tipo": "repeticiones",
      "consejos": ["Mantén la espalda recta", "Baja hasta 90 grados"]
    },
    {
      "nombre": "Plancha",
      "descripcion": "Mantén posición de plancha",
      "series": 3,
      "duracion": 30,
      "descanso": 45,
      "tipo": "tiempo",
      "consejos": ["Mantén el core activado", "Línea recta del cuerpo"]
    }
  ]
}

IMPORTANTE: Responde ÚNICAMENTE en formato JSON válido. Incluye 6-8 ejercicios variados.`
    } else {
      // Prompt original para recomendación de metodología
      methodologyPrompt = `Eres un entrenador personal experto con IA avanzada especializado en seleccionar la metodología de entrenamiento perfecta para cada usuario.

DATOS DEL USUARIO:
- Nombre: ${userData.userName}
- Años entrenando: ${userData.yearsTraining}
- Nivel actual: ${userData.currentLevel}
- Edad: ${userData.age} años
- Peso: ${userData.weight} kg
- Altura: ${userData.height} cm
- Grasa corporal: ${userData.bodyFat}%
- Objetivo principal: ${userData.goal}
- Frecuencia semanal disponible: ${userData.frequency} días
- Limitaciones/lesiones: ${userData.injuries}
- Alergias: ${userData.allergies}
- Medicamentos: ${userData.medications}
- Metodología preferida: ${userData.preferredMethodology}
- Entrena en casa: ${userData.homeTraining ? 'Sí' : 'No'}

METODOLOGÍAS DISPONIBLES:
${availableMethodologies.map(m => `
- ${m.name}: ${m.description}
  * Enfoque: ${m.focus}
  * Compatible con casa: ${m.homeCompatible ? 'Sí' : 'No'}
  * Público objetivo: ${m.targetAudience}
  * Frecuencia: ${m.frequency}
  * Duración por sesión: ${m.duration}
  * Duración del programa: ${m.programDuration}
`).join('')}

INSTRUCCIONES:
1. Analiza CUIDADOSAMENTE el perfil del usuario
2. Considera TODAS las limitaciones médicas y físicas
3. Respeta las preferencias y disponibilidad de tiempo
4. Selecciona la metodología MÁS APROPIADA
5. Proporciona una explicación DETALLADA y PERSONALIZADA

Responde en formato JSON:
{
  "recommendedMethodology": "Nombre exacto de la metodología recomendada",
  "reason": "Explicación detallada y personalizada de por qué esta metodología es perfecta para ${userData.userName}",
  "confidence": 95,
  "keyFactors": [
    "Factor 1 que influyó en la decisión",
    "Factor 2 que influyó en la decisión",
    "Factor 3 que influyó en la decisión"
  ],
  "alternatives": [
    {
      "methodology": "Nombre de metodología alternativa",
      "reason": "Por qué sería segunda opción"
    }
  ],
  "warnings": [
    "Cualquier advertencia o consideración especial"
  ]
}`
    }

    // Llamada a OpenAI
    let response
    try {
      response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: methodologyPrompt
          },
          {
            role: 'user',
            content: `Por favor, ${isHomeTrainingRequest
              ? `genera un entrenamiento personalizado para ${datosUsuario?.nombre || 'el usuario'}`
              : `recomienda la mejor metodología de entrenamiento para ${userData?.userName || 'el usuario'} basándote en toda la información proporcionada`}.`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    } catch (openaiError) {
      console.error('Error llamando a OpenAI:', openaiError)
      return res.status(500).json({
        success: false,
        error: `Error en el servicio de IA: ${openaiError.message}`
      })
    }

    const contenido = response.choices[0].message.content.trim()
    console.log('Respuesta de OpenAI para metodología:', contenido)

    if (isHomeTrainingRequest) {
      // Para entrenamientos en casa, parsear el JSON del entrenamiento
      let entrenamientoGenerado
      try {
        entrenamientoGenerado = JSON.parse(contenido)
      } catch (parseError) {
        console.error('Error parseando entrenamiento JSON:', parseError)
        // Fallback si no se puede parsear
        entrenamientoGenerado = {
          titulo: `${tipoEntrenamiento === 'functional' ? 'Funcional' : tipoEntrenamiento === 'hiit' ? 'HIIT' : 'Fuerza'} en Casa`,
          descripcion: 'Entrenamiento personalizado adaptado a tu equipamiento',
          duracionTotal: '30-45 min',
          frecuencia: '4-5 días/semana',
          enfoque: 'Fuerza funcional y movilidad',
          ejercicios: [
            {
              nombre: 'Sentadillas con peso corporal',
              descripcion: 'Ejercicio básico para piernas y glúteos',
              series: 3,
              repeticiones: '12-15',
              duracion: 45,
              descanso: 60,
              tipo: 'repeticiones',
              consejos: ['Mantén la espalda recta', 'Baja hasta 90 grados']
            }
          ]
        }
      }

      res.json({
        success: true,
        entrenamiento: entrenamientoGenerado,
        equipamiento,
        tipoEntrenamiento,
        shouldCreateProgram: true, // Indicar que se debe crear programa
        timestamp: new Date().toISOString()
      })
    } else {
      // Para el formato original, intentar parsear la respuesta JSON
      let recomendacion
      try {
        recomendacion = JSON.parse(contenido)
      } catch (parseError) {
        console.error('Error parseando respuesta JSON:', parseError)
        // Fallback si no se puede parsear
        recomendacion = {
          recommendedMethodology: 'Entrenamiento en Casa',
          reason: `Basándome en tu perfil, ${userData.userName}, recomiendo comenzar con entrenamiento en casa para establecer una base sólida.`,
          confidence: 75,
          keyFactors: ['Flexibilidad de horarios', 'Adaptabilidad', 'Progresión gradual'],
          alternatives: [],
          warnings: ['Consulta con un profesional si tienes dudas']
        }
      }

      // Validar que la metodología recomendada existe
      if (availableMethodologies) {
        const methodologyExists = availableMethodologies.some(m =>
          m.name.toLowerCase() === recomendacion.recommendedMethodology.toLowerCase()
        )

        if (!methodologyExists) {
          recomendacion.recommendedMethodology = 'Entrenamiento en Casa'
          recomendacion.reason = `He ajustado la recomendación a una metodología disponible. ${recomendacion.reason}`
        }
      }

      res.json({
        success: true,
        ...recomendacion,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Error en recomendación de metodología:', error)
    res.status(500).json({
      success: false,
      error: `Error interno del servidor: ${error.message}`
    })
  }
})

export default router
