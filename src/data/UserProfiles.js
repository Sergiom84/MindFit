// Base de datos falsa de usuarios para MindFit App
export const userProfiles = {
  javier: {
    // Datos básicos del perfil
    id: 'javier',
    nombre: 'Javier',
    apellido: 'García',
    email: 'javier.garcia@email.com',
    avatar: null, // null = usar iniciales, string = URL de foto
    iniciales: 'JG',
    nivel: 'principiante',
    edad: 22,
    sexo: 'masculino',
    peso: 68,
    altura: 175,
    objetivo: 'ganar masa muscular',
    experiencia: '3 meses',
    
    // Datos de salud y condición física
    historialMedico: 'Sin lesiones previas',
    limitaciones: 'Ninguna',
    fatiga: 'baja',
    sueño: '8h promedio',
    estres: 'bajo',
    rpe: '5/10 promedio',
    
    // Datos nutricionales
    nutricion: {
      calorias: 2200,
      proteina: 'media',
      hidratacion: 'buena',
      suplementos: 'ninguno',
      // Datos expandidos para la sección de nutrición
      objetivo: 'ganar peso',
      imc: 22.2,
      grasaCorporal: 15,
      metabolismoBasal: 1680,
      distribucionMacros: {
        proteinas: 25, // porcentaje
        carbohidratos: 50,
        grasas: 25
      },
      comidasDiarias: 5,
      aguaDiaria: 2.5, // litros
      planNutricional: 'Principiante - Ganancia de masa',
      restricciones: [],
      alergias: [],
      preferencias: ['Sin comida picante', 'Prefiere pollo y pescado'],
      ultimaConsulta: '2024-01-15',
      proximaRevision: '2024-02-15',
      progreso: {
        pesoObjetivo: 75,
        calorias7dias: [2100, 2250, 2200, 2300, 2150, 2400, 2200],
        adherencia: 78, // porcentaje
        mejoras: ['Mejor hidratación', 'Más constante con las comidas']
      }
    },
    
    // IA Adaptativa - Datos de principiante
    panelIA: {
      estadoMetabolico: 'Bueno',
      recuperacionNeural: '72%',
      eficienciaAdaptativa: '+8%',
      proximaRevision: '7 días',
      modoActivo: null,
      alertas: [
        {
          tipo: 'info',
          titulo: 'Bienvenido',
          mensaje: 'Como principiante, te recomendamos empezar con rutinas básicas y enfocarte en la técnica correcta.'
        },
        {
          tipo: 'success',
          titulo: 'Progreso Inicial',
          mensaje: 'Has completado tu primera semana. ¡Excelente constancia para empezar!'
        }
      ]
    },
    
    // Video Corrección - Métricas de principiante
    videoCorreccion: {
      precisionPromedio: '78%',
      sesionesAnalizadas: 8,
      reduccionErrores: '-23%',
      ejerciciosDominados: 3,
      ejerciciosFavoritos: ['sentadilla', 'flexiones'],
      erroresComunes: [
        'Postura en sentadilla',
        'Rango de movimiento incompleto',
        'Velocidad inconsistente'
      ],
      mejoras: [
        'Mejor alineación de rodillas',
        'Mayor profundidad en sentadillas'
      ]
    },
    
    // Entrenamiento en Casa
    entrenamientoCasa: {
      rutinasCompletadas: 12,
      tiempoTotalEntrenamiento: '18h 30min',
      ejerciciosFavoritos: ['Sentadillas', 'Flexiones', 'Plancha'],
      nivelDificultad: 'Básico',
      equipoDisponible: ['Esterilla', 'Mancuernas 5kg'],
      espacioDisponible: 'Sala pequeña',
      horarioPreferido: 'Mañana',
      duracionSesion: '30-45 min'
    },
    
    // Progreso y estadísticas
    progreso: {
      diasActivo: 21,
      rachaActual: 5,
      rachaMaxima: 7,
      pesoInicial: 68,
      pesoActual: 69,
      fuerzaGeneral: 'Aumentando lentamente',
      resistencia: 'Mejorando',
      flexibilidad: 'Básica',
      motivacion: 'Alta',
      // Datos expandidos para la sección de progreso
      overview: {
        weightChange: { value: 1, unit: 'kg', trend: 'up', target: 7 },
        bodyFatChange: { value: -1, unit: '%', trend: 'down', target: -3 },
        muscleGain: { value: 0.8, unit: 'kg', trend: 'up', target: 3 },
        strengthGain: { value: 8, unit: '%', trend: 'up', target: 25 }
      },
      weeklyMetrics: {
        workouts: { completed: 3, planned: 3, consistency: 100 },
        calories: { average: 2150, target: 2200, adherence: 98 },
        sleep: { average: 8.1, target: 8, quality: 'Excelente' },
        recovery: { score: 78, status: 'Buena' }
      },
      strengthProgress: [
        { exercise: 'Sentadilla', current: '45kg', previous: '40kg', change: '+5kg', trend: 'good' },
        { exercise: 'Press Banca', current: '35kg', previous: '30kg', change: '+5kg', trend: 'good' },
        { exercise: 'Peso Muerto', current: '55kg', previous: '50kg', change: '+5kg', trend: 'good' },
        { exercise: 'Press Militar', current: '25kg', previous: '20kg', change: '+5kg', trend: 'excellent' }
      ],
      bodyMetrics: {
        measurements: [
          { part: 'Pecho', current: '92cm', change: '+1cm', trend: 'up' },
          { part: 'Brazos', current: '30cm', change: '+0.5cm', trend: 'up' },
          { part: 'Cintura', current: '78cm', change: '0cm', trend: 'stable' },
          { part: 'Muslos', current: '52cm', change: '+1cm', trend: 'up' }
        ]
      }
    },
    
    // Rutinas personalizadas
    rutinas: {
      actual: 'Principiante Full Body',
      completadas: ['Introducción al Fitness'],
      favoritas: ['Rutina Básica de Fuerza'],
      proximaRecomendada: 'Principiante Plus'
    },

    // Datos de lesiones y prevención
    lesiones: {
      historial: [],
      riesgoActual: 'Bajo',
      zonasVulnerables: ['Hombros (por falta de experiencia)', 'Espalda baja (postura)'],
      prevencion: {
        calentamiento: 'Básico - 10 minutos',
        estiramientos: 'Post-entreno - 5 minutos',
        descanso: 'Adecuado - 48h entre grupos musculares',
        hidratacion: 'Buena',
        nutricion: 'Adecuada para recuperación'
      },
      recomendaciones: [
        'Enfocarse en técnica correcta antes que peso',
        'Incrementar cargas gradualmente',
        'Fortalecer core para proteger espalda baja',
        'Trabajar movilidad de hombros'
      ],
      ejerciciosEvitar: [],
      ejerciciosRecomendados: [
        'Plancha para core',
        'Rotaciones de hombros',
        'Estiramientos de isquiotibiales',
        'Fortalecimiento de glúteos'
      ],
      ultimaEvaluacion: '2024-01-10',
      proximaRevision: '2024-03-10'
    }
  },

  rosa: {
    // Datos básicos del perfil
    id: 'rosa',
    nombre: 'Rosa',
    apellido: 'Martínez',
    email: 'rosa.martinez@email.com',
    avatar: null, // null = usar iniciales, string = URL de foto
    iniciales: 'RM',
    nivel: 'intermedio',
    edad: 34,
    sexo: 'femenino',
    peso: 62,
    altura: 165,
    objetivo: 'tonificar y definir',
    experiencia: '2 años',
    
    // Datos de salud y condición física
    historialMedico: 'Lesión leve en rodilla izquierda (recuperada)',
    limitaciones: 'Evitar impacto alto en rodilla izquierda',
    fatiga: 'media',
    sueño: '7h promedio',
    estres: 'medio',
    rpe: '7/10 promedio',
    
    // Datos nutricionales
    nutricion: {
      calorias: 1800,
      proteina: 'alta',
      hidratacion: 'excelente',
      suplementos: 'proteína en polvo, omega-3',
      // Datos expandidos para la sección de nutrición
      objetivo: 'definición y tonificación',
      imc: 22.8,
      grasaCorporal: 18,
      metabolismoBasal: 1420,
      distribucionMacros: {
        proteinas: 35, // porcentaje
        carbohidratos: 40,
        grasas: 25
      },
      comidasDiarias: 6,
      aguaDiaria: 3.0, // litros
      planNutricional: 'Intermedio - Definición',
      restricciones: ['Bajo en sodio por presión arterial'],
      alergias: [],
      preferencias: ['Comida mediterránea', 'Vegetales de temporada', 'Pescado azul'],
      ultimaConsulta: '2024-01-20',
      proximaRevision: '2024-02-20',
      progreso: {
        pesoObjetivo: 60,
        calorias7dias: [1750, 1850, 1800, 1900, 1750, 1800, 1850],
        adherencia: 92, // porcentaje
        mejoras: ['Excelente control de porciones', 'Mejor timing de nutrientes', 'Hidratación óptima']
      }
    },
    
    // IA Adaptativa - Datos de intermedio
    panelIA: {
      estadoMetabolico: 'Óptimo',
      recuperacionNeural: '85%',
      eficienciaAdaptativa: '+15%',
      proximaRevision: '4 días',
      modoActivo: 'avanzado',
      alertas: [
        {
          tipo: 'success',
          titulo: 'Adaptación Detectada',
          mensaje: 'Tu cuerpo se ha adaptado bien al entrenamiento actual. Incrementando intensidad gradualmente.'
        },
        {
          tipo: 'warning',
          titulo: 'Atención Rodilla',
          mensaje: 'Monitoreo especial en ejercicios de impacto debido a historial de lesión.'
        },
        {
          tipo: 'info',
          titulo: 'Periodización',
          mensaje: 'Entrando en fase de definición. Ajustando volumen e intensidad automáticamente.'
        }
      ]
    },
    
    // Video Corrección - Métricas de intermedio
    videoCorreccion: {
      precisionPromedio: '91%',
      sesionesAnalizadas: 127,
      reduccionErrores: '-58%',
      ejerciciosDominados: 18,
      ejerciciosFavoritos: ['peso muerto', 'sentadilla', 'press banca', 'remo'],
      erroresComunes: [
        'Ligera compensación en hombro derecho',
        'Tempo inconsistente en excéntrica'
      ],
      mejoras: [
        'Excelente técnica en peso muerto',
        'Perfecta alineación en sentadillas',
        'Rango completo de movimiento'
      ]
    },
    
    // Entrenamiento en Casa
    entrenamientoCasa: {
      rutinasCompletadas: 89,
      tiempoTotalEntrenamiento: '156h 45min',
      ejerciciosFavoritos: ['Peso Muerto', 'Hip Thrust', 'Sentadilla Búlgara', 'Plancha Lateral'],
      nivelDificultad: 'Intermedio-Avanzado',
      equipoDisponible: ['Mancuernas ajustables', 'Banda elástica', 'Kettlebell 12kg', 'Esterilla'],
      espacioDisponible: 'Habitación dedicada',
      horarioPreferido: 'Tarde',
      duracionSesion: '45-60 min'
    },
    
    // Progreso y estadísticas
    progreso: {
      diasActivo: 156,
      rachaActual: 12,
      rachaMaxima: 23,
      pesoInicial: 65,
      pesoActual: 62,
      fuerzaGeneral: 'Aumentando consistentemente',
      resistencia: 'Muy buena',
      flexibilidad: 'Buena',
      motivacion: 'Muy alta',
      // Datos expandidos para la sección de progreso
      overview: {
        weightChange: { value: -3, unit: 'kg', trend: 'down', target: -5 },
        bodyFatChange: { value: -4, unit: '%', trend: 'down', target: -6 },
        muscleGain: { value: 1.8, unit: 'kg', trend: 'up', target: 2.5 },
        strengthGain: { value: 22, unit: '%', trend: 'up', target: 30 }
      },
      weeklyMetrics: {
        workouts: { completed: 5, planned: 5, consistency: 100 },
        calories: { average: 1820, target: 1800, adherence: 95 },
        sleep: { average: 7.1, target: 7.5, quality: 'Buena' },
        recovery: { score: 88, status: 'Muy buena' }
      },
      strengthProgress: [
        { exercise: 'Sentadilla', current: '65kg', previous: '55kg', change: '+10kg', trend: 'excellent' },
        { exercise: 'Hip Thrust', current: '80kg', previous: '65kg', change: '+15kg', trend: 'excellent' },
        { exercise: 'Peso Muerto', current: '70kg', previous: '60kg', change: '+10kg', trend: 'excellent' },
        { exercise: 'Press Militar', current: '35kg', previous: '30kg', change: '+5kg', trend: 'good' }
      ],
      bodyMetrics: {
        measurements: [
          { part: 'Pecho', current: '88cm', change: '+1cm', trend: 'up' },
          { part: 'Brazos', current: '28cm', change: '+0.8cm', trend: 'up' },
          { part: 'Cintura', current: '68cm', change: '-3cm', trend: 'down' },
          { part: 'Glúteos', current: '95cm', change: '+2cm', trend: 'up' }
        ]
      }
    },
    
    // Rutinas personalizadas
    rutinas: {
      actual: 'Definición Intermedia',
      completadas: ['Fuerza Básica', 'Hipertrofia Inicial', 'Cardio HIIT'],
      favoritas: ['Upper/Lower Split', 'Full Body Intenso'],
      proximaRecomendada: 'Especialización Glúteo'
    },

    // Datos de lesiones y prevención
    lesiones: {
      historial: [
        {
          tipo: 'Lesión en rodilla izquierda',
          fecha: '2023-03-15',
          gravedad: 'Leve',
          causa: 'Sobrecarga en sentadillas',
          tratamiento: 'Fisioterapia y descanso',
          estado: 'Recuperada completamente',
          duracion: '6 semanas'
        }
      ],
      riesgoActual: 'Medio-Bajo',
      zonasVulnerables: ['Rodilla izquierda (historial)', 'Hombros (volumen alto)'],
      prevencion: {
        calentamiento: 'Completo - 15 minutos con movilidad específica',
        estiramientos: 'Pre y post-entreno - 10 minutos',
        descanso: 'Programado - días de descanso activo',
        hidratacion: 'Excelente',
        nutricion: 'Optimizada para recuperación'
      },
      recomendaciones: [
        'Evitar impacto alto en rodilla izquierda',
        'Fortalecer músculos estabilizadores',
        'Mantener flexibilidad en caderas',
        'Monitorear volumen de entrenamiento'
      ],
      ejerciciosEvitar: ['Saltos de alto impacto', 'Sentadillas profundas con peso alto'],
      ejerciciosRecomendados: [
        'Sentadillas asistidas',
        'Fortalecimiento de cuádriceps',
        'Trabajo de propiocepción',
        'Natación para cardio'
      ],
      ultimaEvaluacion: '2024-01-18',
      proximaRevision: '2024-04-18'
    }
  },

  miguel: {
    // Datos básicos del perfil
    id: 'miguel',
    nombre: 'Miguel',
    apellido: 'Rodríguez',
    email: 'miguel.rodriguez@email.com',
    avatar: null, // null = usar iniciales, string = URL de foto
    iniciales: 'MR',
    nivel: 'avanzado',
    edad: 28,
    sexo: 'masculino',
    peso: 82,
    altura: 180,
    objetivo: 'maximizar rendimiento',
    experiencia: '6 años',
    
    // Datos de salud y condición física
    historialMedico: 'Cirugía de hombro derecho hace 3 años (completamente recuperado)',
    limitaciones: 'Calentamiento específico para hombro derecho',
    fatiga: 'alta',
    sueño: '6.5h promedio',
    estres: 'alto',
    rpe: '8.5/10 promedio',
    
    // Datos nutricionales
    nutricion: {
      calorias: 3200,
      proteina: 'muy alta',
      hidratacion: 'buena',
      suplementos: 'creatina, proteína, pre-entreno, BCAA, vitamina D',
      // Datos expandidos para la sección de nutrición
      objetivo: 'maximizar rendimiento y masa muscular',
      imc: 25.3,
      grasaCorporal: 12,
      metabolismoBasal: 1950,
      distribucionMacros: {
        proteinas: 30, // porcentaje
        carbohidratos: 45,
        grasas: 25
      },
      comidasDiarias: 7,
      aguaDiaria: 4.5, // litros
      planNutricional: 'Avanzado - Rendimiento Deportivo',
      restricciones: [],
      alergias: ['Frutos secos'],
      preferencias: ['Comida alta en proteína', 'Carbohidratos complejos', 'Timing específico'],
      ultimaConsulta: '2024-01-25',
      proximaRevision: '2024-02-10',
      progreso: {
        pesoObjetivo: 85,
        calorias7dias: [3100, 3300, 3200, 3400, 3150, 3250, 3200],
        adherencia: 96, // porcentaje
        mejoras: ['Periodización nutricional perfecta', 'Timing de carbohidratos optimizado', 'Suplementación estratégica']
      }
    },
    
    // IA Adaptativa - Datos de avanzado
    panelIA: {
      estadoMetabolico: 'Regular',
      recuperacionNeural: '68%',
      eficienciaAdaptativa: '+3%',
      proximaRevision: '2 días',
      modoActivo: 'experto',
      alertas: [
        {
          tipo: 'warning',
          titulo: 'Fatiga Acumulada',
          mensaje: 'Se detectan signos de sobreentrenamiento. Recomendando deload week automáticamente.'
        },
        {
          tipo: 'info',
          titulo: 'Microperiodización',
          mensaje: 'Ajustando cargas diariamente basado en HRV y marcadores de recuperación.'
        },
        {
          tipo: 'success',
          titulo: 'Pico de Fuerza',
          mensaje: 'Nuevo PR en peso muerto detectado. Recalculando 1RM para próximos ciclos.'
        }
      ]
    },
    
    // Video Corrección - Métricas de avanzado
    videoCorreccion: {
      precisionPromedio: '96%',
      sesionesAnalizadas: 342,
      reduccionErrores: '-78%',
      ejerciciosDominados: 47,
      ejerciciosFavoritos: ['peso muerto', 'sentadilla', 'press banca', 'dominadas', 'clean & jerk'],
      erroresComunes: [
        'Micro-compensación en press overhead',
        'Timing en movimientos olímpicos'
      ],
      mejoras: [
        'Técnica perfecta en básicos',
        'Excelente control motor',
        'Consistencia en movimientos complejos'
      ]
    },
    
    // Entrenamiento en Casa
    entrenamientoCasa: {
      rutinasCompletadas: 234,
      tiempoTotalEntrenamiento: '387h 20min',
      ejerciciosFavoritos: ['Peso Muerto', 'Sentadilla Frontal', 'Press Militar', 'Muscle-ups'],
      nivelDificultad: 'Experto',
      equipoDisponible: ['Barra olímpica', 'Discos hasta 200kg', 'Rack completo', 'Anillas', 'Kettlebells varios'],
      espacioDisponible: 'Gimnasio casero completo',
      horarioPreferido: 'Madrugada',
      duracionSesion: '90-120 min'
    },
    
    // Progreso y estadísticas
    progreso: {
      diasActivo: 287,
      rachaActual: 8,
      rachaMaxima: 45,
      pesoInicial: 75,
      pesoActual: 82,
      fuerzaGeneral: 'Nivel competitivo',
      resistencia: 'Excelente',
      flexibilidad: 'Muy buena',
      motivacion: 'Extrema',
      // Datos expandidos para la sección de progreso
      overview: {
        weightChange: { value: 7, unit: 'kg', trend: 'up', target: 10 },
        bodyFatChange: { value: -8, unit: '%', trend: 'down', target: -10 },
        muscleGain: { value: 12, unit: 'kg', trend: 'up', target: 15 },
        strengthGain: { value: 85, unit: '%', trend: 'up', target: 100 }
      },
      weeklyMetrics: {
        workouts: { completed: 6, planned: 6, consistency: 100 },
        calories: { average: 3180, target: 3200, adherence: 99 },
        sleep: { average: 7.8, target: 8, quality: 'Muy buena' },
        recovery: { score: 92, status: 'Excelente' }
      },
      strengthProgress: [
        { exercise: 'Sentadilla', current: '180kg', previous: '160kg', change: '+20kg', trend: 'excellent' },
        { exercise: 'Press Banca', current: '140kg', previous: '125kg', change: '+15kg', trend: 'excellent' },
        { exercise: 'Peso Muerto', current: '220kg', previous: '200kg', change: '+20kg', trend: 'excellent' },
        { exercise: 'Press Militar', current: '90kg', previous: '80kg', change: '+10kg', trend: 'excellent' }
      ],
      bodyMetrics: {
        measurements: [
          { part: 'Pecho', current: '115cm', change: '+3cm', trend: 'up' },
          { part: 'Brazos', current: '42cm', change: '+2cm', trend: 'up' },
          { part: 'Cintura', current: '85cm', change: '+1cm', trend: 'up' },
          { part: 'Muslos', current: '68cm', change: '+3cm', trend: 'up' }
        ]
      }
    },
    
    // Rutinas personalizadas
    rutinas: {
      actual: 'Powerlifting Avanzado',
      completadas: ['Strongman', 'Olympic Lifting', 'Powerbuilding', 'Conjugate Method'],
      favoritas: ['Westside Barbell', '5/3/1 BBB', 'Bulgarian Method'],
      proximaRecomendada: 'Peaking Program'
    },

    // Datos de lesiones y prevención
    lesiones: {
      historial: [
        {
          tipo: 'Cirugía de hombro derecho',
          fecha: '2021-08-20',
          gravedad: 'Moderada-Alta',
          causa: 'Desgarro del manguito rotador por sobrecarga',
          tratamiento: 'Cirugía artroscópica + rehabilitación',
          estado: 'Recuperado completamente',
          duracion: '8 meses'
        },
        {
          tipo: 'Distensión lumbar',
          fecha: '2023-11-10',
          gravedad: 'Leve',
          causa: 'Técnica incorrecta en peso muerto',
          tratamiento: 'Fisioterapia y modificación técnica',
          estado: 'Recuperada',
          duracion: '3 semanas'
        }
      ],
      riesgoActual: 'Medio-Alto',
      zonasVulnerables: ['Hombro derecho (historial quirúrgico)', 'Espalda baja (cargas altas)', 'Rodillas (volumen intenso)'],
      prevencion: {
        calentamiento: 'Extenso - 20 minutos con activación específica',
        estiramientos: 'Rutina completa diaria - 15 minutos',
        descanso: 'Periodizado - deload weeks programadas',
        hidratacion: 'Controlada con electrolitos',
        nutricion: 'Antiinflamatoria y recuperación optimizada'
      },
      recomendaciones: [
        'Calentamiento específico para hombro derecho',
        'Monitoreo constante de técnica',
        'Periodización estricta para evitar sobreentrenamiento',
        'Trabajo preventivo de movilidad diario'
      ],
      ejerciciosEvitar: ['Press militar con barra por detrás', 'Dominadas con agarre muy ancho'],
      ejerciciosRecomendados: [
        'Rotaciones externas de hombro',
        'Trabajo de core avanzado',
        'Movilidad torácica',
        'Fortalecimiento de glúteo medio'
      ],
      ultimaEvaluacion: '2024-01-22',
      proximaRevision: '2024-03-22'
    }
  }
};

// Función helper para obtener usuario por ID
export const getUserById = (userId) => {
  return userProfiles[userId] || null;
};

// Función helper para obtener lista de usuarios disponibles
export const getAvailableUsers = () => {
  return Object.keys(userProfiles).map(id => ({
    id,
    nombre: userProfiles[id].nombre,
    nivel: userProfiles[id].nivel,
    avatar: userProfiles[id].avatar,
    iniciales: userProfiles[id].iniciales
  }));
};
