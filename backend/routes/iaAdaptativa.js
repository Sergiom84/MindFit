import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

const router = express.Router();

// Inicializar cliente OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Endpoint para activar IA adaptativa
router.post('/activar-ia-adaptativa', async (req, res) => {
  try {
    const { modo, variablesPrompt } = req.body;

    // Validar que se recibieron los datos necesarios
    if (!modo || !variablesPrompt) {
      return res.status(400).json({
        success: false,
        error: 'Faltan datos requeridos: modo y variablesPrompt'
      });
    }

    console.log(`Procesando IA adaptativa - Modo: ${modo}`);
    console.log('Variables del prompt:', variablesPrompt);

    // Llamada al prompt MindBot usando la nueva API de OpenAI
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Eres MindBot, un entrenador personal con IA avanzada especializado en adaptación metabólica y anatómica.

Tu función es analizar los datos del usuario y proporcionar recomendaciones específicas basadas en el modo de adaptación seleccionado.

MODO DE ADAPTACIÓN: ${modo}

Modos disponibles:
- BÁSICO: Ajustes semanales, recomendaciones simples
- AVANZADO: Análisis multifactorial cada 3-5 días, periodización automática
- EXPERTO: Adaptación diaria en tiempo real, microperiodización
- PERSONALIZADO: Según preferencias específicas del usuario

Debes responder en formato JSON con la siguiente estructura:
{
  "estadoMetabolico": "Óptimo|Bueno|Regular|Necesita ajuste",
  "recuperacionNeural": "85%",
  "eficienciaAdaptativa": "+12%",
  "proximaRevision": "X días",
  "recomendacionIA": "Texto de recomendación específica",
  "adaptacionDetectada": "Texto describiendo adaptación detectada",
  "ajustesRecomendados": {
    "calorias": "número o null",
    "volumenEntrenamiento": "aumentar|mantener|reducir",
    "intensidad": "aumentar|mantener|reducir",
    "frecuencia": "aumentar|mantener|reducir"
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
          role: "user",
          content: `Analiza mi situación actual y proporciona recomendaciones para el modo ${modo}:

Datos del usuario:
- Edad: ${variablesPrompt.edad || 'No especificado'}
- Sexo: ${variablesPrompt.sexo || 'No especificado'}
- Nivel: ${variablesPrompt.nivel || 'No especificado'}
- Objetivo: ${variablesPrompt.objetivo || 'No especificado'}
- Historial: ${variablesPrompt.historial || 'No especificado'}
- Progreso: ${variablesPrompt.progreso || 'No especificado'}
- Rutina actual: ${variablesPrompt.rutina || 'No especificado'}
- Nutrición: ${variablesPrompt.nutricion || 'No especificado'}
- Nivel de fatiga: ${variablesPrompt.fatiga || 'No especificado'}
- Calidad del sueño: ${variablesPrompt.sueño || 'No especificado'}
- RPE promedio: ${variablesPrompt.rpe || 'No especificado'}

Modo de adaptación seleccionado: ${modo}

Proporciona un análisis completo y recomendaciones específicas en formato JSON.`
        }
      ],
      max_tokens: 1500,
      temperature: 0.7
    });

    const contenido = response.choices[0].message.content;
    
    // Intentar parsear la respuesta JSON
    let respuestaIA;
    try {
      respuestaIA = JSON.parse(contenido);
    } catch (parseError) {
      console.error('Error parseando respuesta JSON:', parseError);
      // Si no se puede parsear, crear una respuesta de fallback
      respuestaIA = {
        estadoMetabolico: "Bueno",
        recuperacionNeural: "80%",
        eficienciaAdaptativa: "+8%",
        proximaRevision: "7 días",
        recomendacionIA: contenido, // Usar el contenido completo como recomendación
        adaptacionDetectada: "Análisis en progreso. Continuando con protocolo actual.",
        ajustesRecomendados: {
          calorias: null,
          volumenEntrenamiento: "mantener",
          intensidad: "mantener",
          frecuencia: "mantener"
        },
        alertas: [
          {
            tipo: "info",
            titulo: "Análisis Completado",
            mensaje: "Se ha generado un análisis personalizado basado en tus datos."
          }
        ]
      };
    }

    console.log('Análisis de IA adaptativa completado exitosamente');

    res.json({
      success: true,
      modo: modo,
      respuestaIA: respuestaIA,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en IA adaptativa:', error);
    
    res.status(500).json({
      success: false,
      error: `Error al procesar IA adaptativa: ${error.message}`,
      modo: req.body.modo || 'desconocido'
    });
  }
});

// Endpoint para obtener datos de ejemplo del usuario (para testing)
router.get('/datos-usuario-ejemplo', (req, res) => {
  res.json({
    edad: 29,
    sexo: "masculino",
    nivel: "intermedio",
    objetivo: "ganar masa muscular",
    historial: "lesión leve en hombro derecho hace 2 meses",
    progreso: "peso estable, fuerza en aumento",
    rutina: "4 días de fuerza y 2 cardio",
    nutricion: "2,500 kcal, proteína alta, suplemento: creatina",
    fatiga: "media",
    sueño: "6h promedio",
    rpe: "7/10 en piernas, 8/10 en pecho"
  });
});

export default router;
