// src/lib/home-training-consts.js

// Enumeraciones “de facto”
export const EQUIPMENT = /** @type {const} */ ({
  MINIMO: 'minimo',
  BASICO: 'basico',
  AVANZADO: 'avanzado'
})

export const STYLE = /** @type {const} */ ({
  FUNCIONAL: 'funcional',
  HIIT: 'hiit',
  FUERZA: 'fuerza'
})

// Etiquetas/chips visibles por equipamiento
export const EQUIPMENT_LABELS = {
  [EQUIPMENT.MINIMO]: ['Peso corporal', 'Toallas', 'Silla/Sofá', 'Pared'],
  [EQUIPMENT.BASICO]: ['Mancuernas ajustables', 'Bandas elásticas', 'Esterilla', 'Banco/Step'],
  [EQUIPMENT.AVANZADO]: ['Barra dominadas', 'Kettlebells', 'TRX', 'Discos olímpicos']
}

// Guías/guardarailes por estilo
export const STYLE_GUIDELINES = {
  hiit: [
    'Incluye calentamiento 5–10 min y vuelta a la calma 5–10 min.',
    'Intervalos de 15 s a 4 min a alta intensidad (~RPE 8–9).',
    'Relación trabajo/descanso: 1:1 a 1:2 según nivel.',
    'Volumen de alta intensidad total 10–20 min en sesión de 20–35 min.',
    'Varía el tipo de intervalos (Tabata, EMOM, bloques 30/30, 40/20…).'
  ],
  funcional: [
    'Prioriza patrones: sentadilla, bisagra de cadera, zancada, empuje, tracción, rotación/antirrotación.',
    'Incluye varios planos de movimiento y trabajo unilateral/balance.',
    'Formato circuito/EMOM: 4–6 ejercicios, 30–45 s o 8–12 reps, 30–60 s descanso.',
    'Core integrado en la mayoría de ejercicios.'
  ],
  fuerza: [
    'Prioriza multiarticulares; luego accesorios.',
    'Rangos para fuerza: ≤6 reps, 2–6 series; descanso 2–5 min.',
    'Sin 1RM, usa RPE 7–9 o cargas que permitan 3–6 reps exigentes.',
    'Accesorios a 6–12 reps, 60–90 s descanso cuando aplique.'
  ]
}
