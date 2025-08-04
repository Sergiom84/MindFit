// API para manejo de feedback de postura con GPT-4o
// Integración con OpenAI API (usando fetch para compatibilidad con build)

// Función para llamar a OpenAI usando fetch (compatible con build)
async function callOpenAI(messages, options = {}) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 600,
      ...options
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Función para llamar a OpenAI con prompt personalizado
async function callOpenAIWithPrompt(promptId, version, variables) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: {
        id: promptId,
        version: version
      },
      variables: variables
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI Prompt API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

// Clase de respaldo para simulación (si no hay API key)
class MockOpenAI {
  constructor(config) {
    this.apiKey = config.apiKey;
  }

  async createCompletion(params) {
    // Simulación de respuesta de GPT-4o
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockResponse = this.generateMockResponse(params);
        resolve({
          choices: [{
            message: {
              content: mockResponse
            }
          }]
        });
      }, 1500); // Simular latencia de API
    });
  }

  generateMockResponse(params) {
    const { variables } = params;
    const ejercicio = variables?.ejercicio_actual || 'ejercicio';
    const errores = variables?.resumen_errores || '';
    const datos = variables?.datos_pose || '';
    const usuario = variables?.usuario || 'usuario';
    const nivel = variables?.nivel || 'principiante';

    // Generar feedback personalizado basado en los datos
    let feedback = `¡Hola ${usuario}! He analizado tu sesión de ${ejercicio}.\n\n`;

    if (errores && errores.length > 0) {
      feedback += `📊 **Análisis Técnico:**\n`;
      
      if (errores.includes('Rodillas hacia adentro')) {
        feedback += `• **Rodillas valgo detectado**: Enfócate en empujar las rodillas hacia afuera durante el descenso. Imagina que hay una banda elástica alrededor de tus rodillas que debes estirar.\n\n`;
      }
      
      if (errores.includes('Falta de profundidad')) {
        feedback += `• **Profundidad insuficiente**: Intenta descender hasta que tus caderas estén por debajo de tus rodillas. Practica con una caja o banco detrás para referencia.\n\n`;
      }
      
      if (errores.includes('Espalda curvada')) {
        feedback += `• **Postura de espalda**: Mantén el pecho alto y los hombros hacia atrás. Activa tu core antes de iniciar el movimiento.\n\n`;
      }
    } else {
      feedback += `✅ **¡Excelente técnica!** No se detectaron errores significativos en tu ejecución.\n\n`;
    }

    // Agregar datos específicos si están disponibles
    if (datos) {
      feedback += `📈 **Métricas de Rendimiento:**\n${datos}\n\n`;
    }

    // Recomendaciones personalizadas por nivel
    feedback += `🎯 **Recomendaciones para tu nivel ${nivel}:**\n`;
    
    switch (nivel.toLowerCase()) {
      case 'principiante':
        feedback += `• Enfócate en dominar el patrón de movimiento antes que en el peso\n`;
        feedback += `• Practica el ejercicio sin peso adicional hasta perfeccionar la técnica\n`;
        feedback += `• Realiza 2-3 series de 8-12 repeticiones\n`;
        break;
      case 'intermedio':
        feedback += `• Mantén la progresión gradual en peso mientras conservas la técnica\n`;
        feedback += `• Incorpora variaciones del ejercicio para mayor desarrollo\n`;
        feedback += `• Considera periodización en tus entrenamientos\n`;
        break;
      case 'avanzado':
        feedback += `• Perfecciona los detalles técnicos para maximizar eficiencia\n`;
        feedback += `• Experimenta con diferentes tempos y rangos de movimiento\n`;
        feedback += `• Integra técnicas avanzadas como pausa o tempo controlado\n`;
        break;
    }

    feedback += `\n💡 **Próximos pasos:**\n`;
    feedback += `• Continúa practicando con la corrección sugerida\n`;
    feedback += `• Graba otra sesión en 2-3 entrenamientos para evaluar progreso\n`;
    feedback += `• Mantén consistencia en tu técnica\n\n`;
    
    feedback += `🤖 *Análisis generado por IA adaptativa - Personalizado para ${usuario}*`;

    return feedback;
  }
}

// Función principal para obtener feedback de postura
export async function getPoseFeedback(metrics, userVariables) {
  try {
    // Verificar si tenemos API key real
    const hasRealApiKey = import.meta.env.VITE_OPENAI_API_KEY &&
                         import.meta.env.VITE_OPENAI_API_KEY.startsWith('sk-');

    // Preparar variables para el prompt
    const promptVariables = {
      usuario: userVariables.usuario || 'Usuario',
      nivel: userVariables.nivel || 'principiante',
      objetivo: userVariables.objetivo || 'mejorar_tecnica',
      ejercicio_actual: metrics.ejercicio || 'ejercicio',
      resumen_errores: metrics.erroresDetectados?.join(', ') || 'ninguno',
      datos_pose: formatPoseData(metrics)
    };

    let completion;

    if (hasRealApiKey) {
      // ✅ CONEXIÓN REAL A OPENAI CON TU PROMPT ID ESPECÍFICO
      console.log('🤖 Conectando a OpenAI con prompt personalizado...');

      try {
        // Intentar usar el prompt personalizado primero
        const promptVariablesForAPI = {
          usuario: promptVariables.usuario,
          nivel: promptVariables.nivel,
          objetivo: promptVariables.objetivo,
          ejercicio_actual: promptVariables.ejercicio_actual,
          resumen_errores: promptVariables.resumen_errores,
          datos_pose: promptVariables.datos_pose,
          // Variables adicionales que tu prompt pueda necesitar
          repeticiones: metrics.repeticiones || 0,
          precision: metrics.precision || 0,
          angulo_rodilla: metrics.anguloMinRodilla || 'N/A',
          tempo_concentrico: metrics.tempoConc || 'N/A',
          tempo_excentrico: metrics.tempoEcc || 'N/A'
        };

        completion = await callOpenAIWithPrompt(
          import.meta.env.VITE_OPENAI_PROMPT_ID || "pmpt_688fd23d27448193b5bfbb2c4ef9548103c68f1f6b84e824",
          parseInt(import.meta.env.VITE_OPENAI_PROMPT_VERSION) || 2,
          promptVariablesForAPI
        );

        console.log('✅ Respuesta recibida de OpenAI con prompt personalizado');

      } catch (promptError) {
        console.warn('⚠️ Error con prompt personalizado, usando chat.completions:', promptError.message);

        // Fallback a chat.completions si el prompt personalizado falla
        const messages = [
          {
            role: "system",
            content: `Eres un entrenador personal experto en biomecánica y análisis de movimiento.
                     Analiza los datos de postura del usuario y proporciona feedback constructivo,
                     específico y personalizado. Usa un tono motivador pero técnicamente preciso.

                     Estructura tu respuesta así:
                     📊 **Análisis Técnico:** [errores detectados]
                     📈 **Métricas de Rendimiento:** [datos específicos]
                     🎯 **Recomendaciones:** [consejos personalizados]
                     💡 **Próximos pasos:** [acciones concretas]`
          },
          {
            role: "user",
            content: `Analiza esta sesión de entrenamiento:
                     Usuario: ${promptVariables.usuario}
                     Nivel: ${promptVariables.nivel}
                     Ejercicio: ${promptVariables.ejercicio_actual}
                     Errores detectados: ${promptVariables.resumen_errores}
                     Datos técnicos: ${promptVariables.datos_pose}`
          }
        ];

        completion = await callOpenAI(messages, {
          temperature: 0.7,
          max_tokens: 600
        });

        console.log('✅ Respuesta recibida de OpenAI con chat.completions');
      }
    } else {
      // Usar simulación si no hay API key
      console.log('🔄 Usando simulación (no hay API key configurada)');
      const mockOpenAI = new MockOpenAI({ apiKey: 'mock-key' });
      completion = await mockOpenAI.createCompletion({ variables: promptVariables });
    }

    return {
      success: true,
      feedback: completion.choices[0].message.content,
      timestamp: new Date().toISOString(),
      metrics: metrics
    };

  } catch (error) {
    console.error('Error getting pose feedback:', error);
    
    // Fallback con feedback básico
    return {
      success: false,
      feedback: generateFallbackFeedback(metrics, userVariables),
      timestamp: new Date().toISOString(),
      metrics: metrics,
      error: error.message
    };
  }
}

// Formatear datos de postura para el prompt
function formatPoseData(metrics) {
  let dataString = '';
  
  if (metrics.anguloMinRodilla) {
    dataString += `Ángulo mínimo de rodilla: ${metrics.anguloMinRodilla}°. `;
  }
  
  if (metrics.tempoConc && metrics.tempoEcc) {
    dataString += `Tempo concéntrico: ${metrics.tempoConc}s, excéntrico: ${metrics.tempoEcc}s. `;
  }
  
  if (metrics.precision) {
    dataString += `Precisión general: ${metrics.precision}%. `;
  }
  
  if (metrics.repeticiones) {
    dataString += `Repeticiones completadas: ${metrics.repeticiones}. `;
  }

  return dataString || 'Datos técnicos no disponibles';
}

// Feedback de respaldo si falla la API
function generateFallbackFeedback(metrics, userVariables) {
  const ejercicio = metrics.ejercicio || 'ejercicio';
  const usuario = userVariables.usuario || 'Usuario';
  
  let feedback = `¡Hola ${usuario}! He analizado tu sesión de ${ejercicio}.\n\n`;
  
  if (metrics.erroresDetectados && metrics.erroresDetectados.length > 0) {
    feedback += `Áreas de mejora detectadas:\n`;
    metrics.erroresDetectados.forEach(error => {
      feedback += `• ${error}\n`;
    });
    feedback += `\n`;
  } else {
    feedback += `¡Excelente ejecución! No se detectaron errores significativos.\n\n`;
  }
  
  feedback += `Continúa practicando y mantén la consistencia en tu técnica.\n`;
  feedback += `🤖 Análisis básico - Reintenta para obtener feedback detallado de IA.`;
  
  return feedback;
}

// Función para enviar métricas al backend (simulada)
export async function sendMetricsToBackend(metrics, userId) {
  try {
    // En producción, esto sería una llamada real a tu API
    const response = await fetch('/api/pose-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify({
        userId: userId,
        metrics: metrics,
        timestamp: new Date().toISOString()
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, data };
    } else {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error sending metrics to backend:', error);
    return { success: false, error: error.message };
  }
}

// Función para obtener historial de sesiones
export async function getSessionHistory(userId, limit = 10) {
  try {
    // Simulación de datos de historial
    const mockHistory = Array.from({ length: Math.min(limit, 5) }, (_, i) => ({
      id: Date.now() - i * 86400000, // IDs basados en timestamp
      userId: userId,
      exercise: ['Sentadilla', 'Press de Banca', 'Peso Muerto'][i % 3],
      timestamp: new Date(Date.now() - i * 86400000).toISOString(),
      metrics: {
        repeticiones: 8 + Math.floor(Math.random() * 5),
        precision: 85 + Math.floor(Math.random() * 15),
        erroresDetectados: i % 2 === 0 ? ['Rodillas hacia adentro'] : []
      },
      feedback: `Sesión ${i + 1} completada con éxito. Continúa mejorando tu técnica.`
    }));

    return { success: true, history: mockHistory };
  } catch (error) {
    console.error('Error getting session history:', error);
    return { success: false, error: error.message, history: [] };
  }
}

// Configuración de WebRTC para streaming de video (opcional)
export const webRTCConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' }
  ]
};

// Utilidades para análisis de video
export const videoUtils = {
  // Configuración óptima de cámara para análisis de postura
  getCameraConstraints: () => ({
    video: {
      width: { ideal: 640 },
      height: { ideal: 480 },
      frameRate: { ideal: 30 },
      facingMode: 'user'
    },
    audio: false
  }),

  // Validar soporte del navegador
  checkBrowserSupport: () => {
    const hasWebcam = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    const hasWebGL = !!window.WebGLRenderingContext;
    const hasWorkers = !!window.Worker;
    
    return {
      webcam: hasWebcam,
      webgl: hasWebGL,
      workers: hasWorkers,
      fullSupport: hasWebcam && hasWebGL && hasWorkers
    };
  }
};

export default {
  getPoseFeedback,
  sendMetricsToBackend,
  getSessionHistory,
  webRTCConfig,
  videoUtils
};
