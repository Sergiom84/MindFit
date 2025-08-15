// Refactor: llamar al backend para generar plan nutricional

export const generateNutritionPlan = async (userProfile) => {
  try {
    // Construir el prompt basado en el perfil del usuario
    const prompt = `
      Genera un plan nutricional personalizado para el siguiente usuario:
      
      DATOS DEL USUARIO:
      - Nombre: ${userProfile.nombre}
      - Edad: ${userProfile.edad} años
      - Peso: ${userProfile.peso} kg
      - Altura: ${userProfile.altura} cm
      - Objetivos: ${userProfile.objetivos}
      - Nivel de actividad: ${userProfile.nivelActividad}
      - Tipo de dieta seleccionada: ${userProfile.tipoDieta}
      - Comidas por día: ${userProfile.comidasPorDia}
      - Rutina actual: ${userProfile.rutinaActual}
      - Restricciones alimenticias: ${userProfile.restriccionesAlimenticias.join(', ') || 'Ninguna'}
      - Preferencias alimenticias: ${userProfile.preferenciasAlimenticias.join(', ') || 'Ninguna'}
      
      INSTRUCCIONES:
      1. Calcula las calorías diarias necesarias basándose en sus datos antropométricos y objetivos
      2. Distribuye los macronutrientes apropiadamente según el tipo de dieta seleccionada:
         - Déficit: Más proteína, menos carbohidratos
         - Mantenimiento: Equilibrio balanceado
         - Superávit: Más carbohidratos y calorías totales
      3. Crea un plan de ${userProfile.comidasPorDia} comidas diarias con horarios específicos
      4. Incluye alimentos específicos con cantidades exactas y calorías
      5. Considera las restricciones y preferencias alimenticias
      6. Sugiere suplementos apropiados para el objetivo
      
      FORMATO DE RESPUESTA (JSON):
      {
        "caloriasObjetivo": number,
        "macronutrientes": {
          "proteinas": number,
          "carbohidratos": number,
          "grasas": number
        },
        "comidas": [
          {
            "nombre": "string",
            "hora": "string",
            "totalCalorias": number,
            "alimentos": [
              {
                "nombre": "string",
                "cantidad": "string",
                "calorias": number,
                "proteinas": number,
                "carbohidratos": number,
                "grasas": number
              }
            ]
          }
        ],
        "suplementos": [
          {
            "nombre": "string",
            "dosis": "string",
            "momento": "string",
            "razon": "string"
          }
        ],
        "notas": "string"
      }
      
      Responde únicamente con el JSON válido, sin texto adicional.
    `

    const r = await fetch('/api/activar-ia-adaptativa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ modo: 'PLAN_NUTRICION', variablesPrompt: { userProfile, prompt } })
    })
    const j = await r.json()
    const content = j?.respuestaIA ? JSON.stringify(j.respuestaIA) : '{}'

    try {
      const planData = JSON.parse(content)
      return planData
    } catch (parseError) {
      console.error('Error parsing OpenAI response:', parseError)
      throw new Error('Error al procesar la respuesta de la IA')
    }
  } catch (error) {
    console.error('Error generando plan nutricional:', error)
    throw error
  }
}

// Función auxiliar para calcular BMR (Tasa Metabólica Basal)
export const calculateBMR = (peso, altura, edad, genero) => {
  if (genero === 'masculino') {
    return 88.362 + (13.397 * peso) + (4.799 * altura) - (5.677 * edad)
  } else {
    return 447.593 + (9.247 * peso) + (3.098 * altura) - (4.330 * edad)
  }
}

// Función auxiliar para calcular TDEE (Gasto Energético Total Diario)
export const calculateTDEE = (bmr, nivelActividad) => {
  const factorActividad = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    intenso: 1.725,
    muy_intenso: 1.9
  }

  return bmr * (factorActividad[nivelActividad] || 1.55)
}
