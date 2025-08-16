// src/components/RoutinesScreen.jsx (Bloque 3)
import React, { useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserContext } from '@/contexts/UserContext'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog.jsx'
import { Dumbbell, Timer, CheckCircle } from 'lucide-react'

const RoutinesScreen = () => {
  const navigate = useNavigate()
  const { metodologiaActiva, completarEntrenamiento } = useUserContext()

  // ---- Estado del temporizador de descanso ----
  const [restOpen, setRestOpen] = useState(false)
  const [restLabel, setRestLabel] = useState('Descanso')
  const [restTotal, setRestTotal] = useState(60)   // en segundos
  const [restLeft, setRestLeft] = useState(60)
  const [restRunning, setRestRunning] = useState(false)
  const restRef = useRef(null) // setInterval id

  // ---- Días completados (solo UI local; el progreso real se guarda en el contexto) ----
  const [completedDays, setCompletedDays] = useState(new Set())

  // Parsea strings tipo "60-90 seg", "45 seg", "90s" a segundos (coge el primer número)
  const parseRestToSeconds = (val) => {
    if (!val) return 60
    if (typeof val === 'number') return val
    const s = String(val).toLowerCase()
    const match = s.match(/(\d+)/)
    const n = match ? parseInt(match[1], 10) : 60
    return n
  }

  const formatSeconds = (sec) => {
    const m = Math.floor(sec / 60)
    const s = sec % 60
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const startRest = (seconds = 60, label = 'Descanso') => {
    const total = Math.max(1, Math.round(seconds))
    setRestLabel(label)
    setRestTotal(total)
    setRestLeft(total)
    setRestOpen(true)
    setRestRunning(true)

    if (restRef.current) clearInterval(restRef.current)
    restRef.current = setInterval(() => {
      setRestLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restRef.current)
          restRef.current = null
          setRestRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const pauseRest = () => {
    if (restRef.current) {
      clearInterval(restRef.current)
      restRef.current = null
    }
    setRestRunning(false)
  }

  const resumeRest = () => {
    if (restRunning || restLeft <= 0) return
    setRestRunning(true)
    restRef.current = setInterval(() => {
      setRestLeft((prev) => {
        if (prev <= 1) {
          clearInterval(restRef.current)
          restRef.current = null
          setRestRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const resetRest = () => {
    pauseRest()
    setRestLeft(restTotal)
  }

  const closeRest = () => {
    pauseRest()
    setRestOpen(false)
  }

  // Defensa mínima por si algo viniera anidado (legacy)
  const active = useMemo(() => {
    if (!metodologiaActiva) return null
    if (!metodologiaActiva.methodology_name && metodologiaActiva.metodologia) {
      // aplanar por si viniera en formato antiguo
      return {
        ...metodologiaActiva,
        methodology_name: metodologiaActiva.metodologia?.methodology_name,
        methodology_data: metodologiaActiva.metodologia?.methodology_data
      }
    }
    return metodologiaActiva
  }, [metodologiaActiva])

  // Si no hay metodología seleccionada, mostramos un mensaje para que elija una
  if (!active || !active.methodology_name) {
    return (
      <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400">Rutinas de Entrenamiento</h1>
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-8 text-center">
            <Dumbbell className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No hay metodología activa</h2>
            <p className="text-gray-400 mb-4">
              Para ver tu rutina, primero elige una metodología o deja que la IA la genere por ti.
            </p>
            <Button
              onClick={() => navigate('/methodologies')}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Ir a Metodologías
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // ---------- Helpers UI ----------
  const todayYMD = new Date().toISOString().slice(0, 10)
  const weeklyRoutine = (() => {
    const aiRoutine = active.methodology_data
    if (aiRoutine && Array.isArray(aiRoutine.dias) && aiRoutine.dias.length > 0) {
      // ✅ rutina generada por IA
      return aiRoutine.dias
    }
    // ⚠️ Fallback a plantillas (por si no llegan días)
    const methodologyRoutines = {
      'Heavy Duty': {
        pattern: [
          { dia: 1, nombre_sesion: 'Pecho y Espalda', ejercicios: [{ nombre: 'Press Inclinado con Mancuernas', series: 1, repeticiones: '6-8 (al fallo)' }, { nombre: 'Jalones en Polea (Pullover)', series: 1, repeticiones: '6-8 (al fallo)' }, { nombre: 'Remo con Barra', series: 1, repeticiones: '6-8 (al fallo)' }] },
          { dia: 2, nombre_sesion: 'Descanso / Recuperación Activa', ejercicios: [] },
          { dia: 3, nombre_sesion: 'Piernas y Hombros', ejercicios: [{ nombre: 'Sentadillas', series: 1, repeticiones: '8-10 (al fallo)' }, { nombre: 'Elevaciones Laterales', series: 1, repeticiones: '8-10 (al fallo)' }, { nombre: 'Press Militar', series: 1, repeticiones: '6-8 (al fallo)' }] },
          { dia: 4, nombre_sesion: 'Descanso / Recuperación Activa', ejercicios: [] },
          { dia: 5, nombre_sesion: 'Brazos y Gemelos', ejercicios: [{ nombre: 'Curl de Bíceps con Barra', series: 1, repeticiones: '6-8 (al fallo)' }, { nombre: 'Extensiones de Tríceps en Polea', series: 1, repeticiones: '8-10 (al fallo)' }, { nombre: 'Elevación de talones', series: 1, repeticiones: '12-15 (al fallo)' }] }
        ]
      },
      Powerlifting: {
        pattern: [
          { dia: 1, nombre_sesion: 'Día de Sentadilla (Pesado)', ejercicios: [{ nombre: 'Sentadilla con Barra', series: 5, repeticiones: '5' }, { nombre: 'Prensa', series: 3, repeticiones: '8-10' }, { nombre: 'Extensiones de Cuádriceps', series: 3, repeticiones: '10-12' }] },
          { dia: 2, nombre_sesion: 'Día de Press Banca (Pesado)', ejercicios: [{ nombre: 'Press de Banca', series: 5, repeticiones: '5' }, { nombre: 'Press Militar', series: 3, repeticiones: '8' }, { nombre: 'Fondos en paralelas', series: 3, repeticiones: 'Máx' }] },
          { dia: 3, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 4, nombre_sesion: 'Día de Peso Muerto (Pesado)', ejercicios: [{ nombre: 'Peso Muerto', series: 5, repeticiones: '5' }, { nombre: 'Remo con Barra', series: 3, repeticiones: '8' }, { nombre: 'Dominadas', series: 3, repeticiones: 'Máx' }] },
          { dia: 5, nombre_sesion: 'Día de Accesorios (Volumen)', ejercicios: [{ nombre: 'Press Inclinado con mancuernas', series: 4, repeticiones: '10-12' }, { nombre: 'Sentadilla Búlgara', series: 3, repeticiones: '10 por pierna' }, { nombre: 'Face Pulls', series: 4, repeticiones: '15' }] }
        ]
      },
      Hipertrofia: {
        pattern: [
          { dia: 1, nombre_sesion: 'Empuje (Push)', ejercicios: [{ nombre: 'Press de Banca', series: 4, repeticiones: '8-12' }, { nombre: 'Press Inclinado con Mancuernas', series: 3, repeticiones: '10-15' }, { nombre: 'Press Militar', series: 3, repeticiones: '8-12' }, { nombre: 'Elevaciones Laterales', series: 4, repeticiones: '12-15' }, { nombre: 'Extensiones de Tríceps', series: 3, repeticiones: '10-15' }] },
          { dia: 2, nombre_sesion: 'Tirón (Pull)', ejercicios: [{ nombre: 'Dominadas o Jalón al Pecho', series: 4, repeticiones: '8-12' }, { nombre: 'Remo con Barra', series: 3, repeticiones: '8-12' }, { nombre: 'Face Pulls', series: 3, repeticiones: '15-20' }, { nombre: 'Curl de Bíceps con Barra', series: 3, repeticiones: '10-15' }] },
          { dia: 3, nombre_sesion: 'Pierna (Leg)', ejercicios: [{ nombre: 'Sentadillas', series: 4, repeticiones: '8-12' }, { nombre: 'Peso Muerto Rumano', series: 3, repeticiones: '10-15' }, { nombre: 'Prensa', series: 3, repeticiones: '10-15' }, { nombre: 'Curl Femoral', series: 3, repeticiones: '12-15' }, { nombre: 'Elevación de Gemelos', series: 4, repeticiones: '15-20' }] },
          { dia: 4, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 5, nombre_sesion: 'Full Body (Opcional)', ejercicios: [{ nombre: 'Peso Muerto', series: 3, repeticiones: '5-8' }, { nombre: 'Press de Banca', series: 3, repeticiones: '8-10' }, { nombre: 'Remo con mancuerna', series: 3, repeticiones: '10-12' }] }
        ]
      },
      Funcional: {
        pattern: [
          { dia: 1, nombre_sesion: 'Circuito Funcional A', ejercicios: [{ nombre: 'Kettlebell Swing', series: 4, repeticiones: '15' }, { nombre: 'Saltos al Cajón (Box Jumps)', series: 4, repeticiones: '12' }, { nombre: 'Flexiones con rotación', series: 4, repeticiones: '10' }, { nombre: 'Plancha isométrica', series: 4, repeticiones: '45 seg' }] },
          { dia: 2, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 3, nombre_sesion: 'Circuito Funcional B', ejercicios: [{ nombre: 'Sentadilla Goblet', series: 4, repeticiones: '15' }, { nombre: 'Battle Ropes', series: 4, repeticiones: '30 seg' }, { nombre: 'Paseo del granjero', series: 4, repeticiones: '30 metros' }, { nombre: 'Burpees', series: 4, repeticiones: '10' }] },
          { dia: 4, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 5, nombre_sesion: 'Core y Estabilidad', ejercicios: [{ nombre: 'Press Pallof', series: 3, repeticiones: '12 por lado' }, { nombre: 'Levantamiento Turco (Turkish Get-up)', series: 3, repeticiones: '5 por lado' }, { nombre: 'Bird-Dog', series: 3, repeticiones: '15 por lado' }] }
        ]
      },
      Oposiciones: {
        pattern: [
          { dia: 1, nombre_sesion: 'Fuerza Específica', ejercicios: [{ nombre: 'Dominadas (con lastre si es necesario)', series: 5, repeticiones: 'Máx (-2 del fallo)' }, { nombre: 'Press de Banca', series: 4, repeticiones: '5-8' }, { nombre: 'Salto Vertical', series: 5, repeticiones: '3 saltos' }] },
          { dia: 2, nombre_sesion: 'Resistencia (Circuito)', ejercicios: [{ nombre: 'Simulacro Course Navette', series: 1, repeticiones: 'Máx nivel' }, { nombre: 'Burpees', series: 3, repeticiones: '15' }, { nombre: 'Carrera continua (40 min)', series: 1, repeticiones: 'Ritmo suave' }] },
          { dia: 3, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 4, nombre_sesion: 'Simulacro de Pruebas', ejercicios: [{ nombre: 'Circuito de Agilidad (simulado)', series: 3, repeticiones: 'Mejor tiempo' }, { nombre: 'Dominadas (test)', series: 1, repeticiones: 'Máx' }, { nombre: 'Salto Horizontal (test)', series: 3, repeticiones: 'Máx distancia' }] }
        ]
      },
      CrossFit: {
        pattern: [
          { dia: 1, nombre_sesion: 'WOD: "Cindy"', ejercicios: [{ nombre: 'AMRAP 20 min (As Many Rounds As Possible)', series: 1, repeticiones: 'Continuo' }, { nombre: '-> 5 Dominadas', series: 1, repeticiones: '5' }, { nombre: '-> 10 Flexiones', series: 1, repeticiones: '10' }, { nombre: '-> 15 Sentadillas al aire', series: 1, repeticiones: '15' }] },
          { dia: 2, nombre_sesion: 'Fuerza y Técnica', ejercicios: [{ nombre: 'Clean and Jerk', series: 1, repeticiones: 'Encontrar 1RM del día' }, { nombre: 'Accesorio: Press de Banca', series: 5, repeticiones: '5' }] },
          { dia: 3, nombre_sesion: 'WOD: "Helen"', ejercicios: [{ nombre: '3 Rondas por tiempo (For Time)', series: 1, repeticiones: 'Máx velocidad' }, { nombre: '-> 400m Carrera', series: 1, repeticiones: '1' }, { nombre: '-> 21 Kettlebell Swings (24/16 kg)', series: 1, repeticiones: '21' }, { nombre: '-> 12 Dominadas', series: 1, repeticiones: '12' }] }
        ]
      },
      Calistenia: {
        pattern: [
          { dia: 1, nombre_sesion: 'Full Body - Básico', ejercicios: [{ nombre: 'Dominadas (o remo invertido)', series: 4, repeticiones: 'Máx' }, { nombre: 'Fondos en paralelas (o en banco)', series: 4, repeticiones: 'Máx' }, { nombre: 'Flexiones', series: 4, repeticiones: 'Máx' }, { nombre: 'Sentadillas Pistol (o con asistencia)', series: 4, repeticiones: 'Máx' }] },
          { dia: 2, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 3, nombre_sesion: 'Core y Habilidades', ejercicios: [{ nombre: 'Progresión de L-Sit', series: 5, repeticiones: '10-20 seg' }, { nombre: 'Progresión de Pino (Handstand)', series: 5, repeticiones: '30-60 seg' }, { nombre: 'Dragon Flags', series: 3, repeticiones: 'Máx' }] },
          { dia: 4, nombre_sesion: 'Full Body - Volumen', ejercicios: [{ nombre: 'Flexiones diamante', series: 3, repeticiones: 'Máx' }, { nombre: 'Dominadas agarre ancho', series: 3, repeticiones: 'Máx' }, { nombre: 'Zancadas', series: 3, repeticiones: '15 por pierna' }, { nombre: 'Elevaciones de piernas colgado', series: 3, repeticiones: 'Máx' }] }
        ]
      },
      'Entrenamiento en Casa': {
        pattern: [
          { dia: 1, nombre_sesion: 'Circuito Full Body A', ejercicios: [{ nombre: 'Sentadillas', series: 4, repeticiones: '20' }, { nombre: 'Flexiones', series: 4, repeticiones: 'Máx' }, { nombre: 'Zancadas alternas', series: 4, repeticiones: '15 por pierna' }, { nombre: 'Plancha', series: 4, repeticiones: '60 seg' }] },
          { dia: 2, nombre_sesion: 'Cardio y Core', ejercicios: [{ nombre: 'Jumping Jacks', series: 3, repeticiones: '60 seg' }, { nombre: 'Burpees', series: 3, repeticiones: '15' }, { nombre: 'Mountain Climbers', series: 3, repeticiones: '45 seg' }, { nombre: 'Crunches', series: 3, repeticiones: '25' }] },
          { dia: 3, nombre_sesion: 'Descanso', ejercicios: [] },
          { dia: 4, nombre_sesion: 'Circuito Full Body B', ejercicios: [{ nombre: 'Puente de glúteos', series: 4, repeticiones: '20' }, { nombre: 'Flexiones declinadas (pies elevados)', series: 4, repeticiones: 'Máx' }, { nombre: 'Remo con toalla/bandas elásticas', series: 4, repeticiones: '15' }, { nombre: 'Sentadilla isométrica (pared)', series: 4, repeticiones: 'Máx tiempo' }] }
        ]
      }
    }
    const fallback = methodologyRoutines[active.methodology_name]?.pattern
    return fallback || methodologyRoutines.Hipertrofia.pattern
  })()

  const methodologyName = active.methodology_name
  const progreso = typeof active.progreso === 'number'
    ? active.progreso
    : Math.round(
        (weeklyRoutine.filter(d => Array.isArray(d.ejercicios) && d.ejercicios.length > 0).length / weeklyRoutine.length) * 100
      )

  // Para botón "Ir al día de hoy"
  const scrollToToday = () => {
    const el = document.querySelector(`[data-date="${todayYMD}"]`)
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
      {/* Resumen del plan */}
      <div className="mb-6">
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-5 grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-gray-400 text-xs">Metodología</p>
              <p className="text-xl font-semibold text-yellow-400">{methodologyName}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Rango</p>
              <p className="text-white">
                {active.fechaInicio} → {active.fechaFin}
              </p>
            </div>
            <div className="flex items-end md:items-center md:justify-end">
              <div className="flex gap-2">
                <Button
                  className="bg-yellow-400 text-black hover:bg-yellow-300"
                  onClick={scrollToToday}
                  title="Ir al día de hoy"
                >
                  Ir al día de hoy
                </Button>
                <Button
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  onClick={() => navigate('/methodologies')}
                  title="Cambiar metodología"
                >
                  Cambiar
                </Button>
              </div>
            </div>
          </CardContent>
          <div className="px-5 pb-5">
            <div className="h-2 rounded bg-gray-800 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{ width: `${Math.max(0, Math.min(100, progreso))}%` }}
                aria-label={`Progreso ${progreso}%`}
              />
            </div>
            <div className="text-right text-xs text-gray-400 mt-1">
              Progreso estimado: <span className="text-yellow-400 font-semibold">{progreso}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Grilla de días */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {weeklyRoutine.map((day, index) => {
          const isToday = day.fecha === todayYMD
          return (
            <Card
              key={index}
              data-date={day.fecha}
              className={`bg-gray-900 border transition-all ${
                isToday
                  ? 'border-yellow-400 ring-2 ring-yellow-400/20'
                  : 'border-gray-700 hover:border-gray-600'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-lg">
                    Día {day.dia}: {day.nombre_sesion}
                  </CardTitle>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      isToday ? 'bg-yellow-400 text-black' : 'bg-gray-800 text-gray-300'
                    }`}
                    title={isToday ? 'Sesión de hoy' : 'Sesión planificada'}
                  >
                    {isToday ? 'HOY' : day.fecha}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="flex-grow pb-5">
                {day.ejercicios && day.ejercicios.length > 0 ? (
                  <ul className="space-y-2 text-sm text-gray-300">
                    {day.ejercicios.map((ex, idx) => (
                      <li key={idx} className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <span className="font-semibold text-white">{ex.nombre}</span>
                          <span className="text-gray-400 block">
                            {ex.series} x {ex.repeticiones}
                            {ex.descanso ? ` • Descanso: ${ex.descanso}` : ''}
                            {ex.peso ? ` • Peso: ${ex.peso}` : ''}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          className="border-gray-600 text-gray-300 hover:bg-gray-800 h-8 px-3"
                          onClick={() => startRest(parseRestToSeconds(ex.descanso), `Descanso — ${ex.nombre}`)}
                          title="Iniciar cuenta atrás de descanso"
                        >
                          <Timer className="w-4 h-4 mr-1" />
                          Descanso
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-400 italic">Día de descanso y recuperación.</p>
                )}

                <div className="mt-4">
                  <Button
                    className={`w-full ${completedDays.has(day.dia) ? 'bg-green-600 hover:bg-green-500' : 'bg-yellow-400 text-black hover:bg-yellow-300'}`}
                    onClick={() => {
                      if (!completedDays.has(day.dia)) {
                        completarEntrenamiento() // <- actualiza progreso en el contexto
                        const next = new Set(completedDays)
                        next.add(day.dia)
                        setCompletedDays(next)
                      }
                    }}
                    title="Marcar este día como completado"
                    disabled={completedDays.has(day.dia)}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    {completedDays.has(day.dia) ? 'Día completado' : 'Marcar día completado'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Modal de cuenta atrás de descanso */}
      <Dialog open={restOpen} onOpenChange={(open) => { if (!open) closeRest() }}>
        <DialogContent className="max-w-sm bg-gray-900 border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-yellow-400 flex items-center gap-2">
              <Timer className="w-4 h-4" /> {restLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center my-4">
            <div className="text-5xl font-bold text-white tabular-nums">
              {formatSeconds(restLeft)}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              Total: {formatSeconds(restTotal)}
            </div>

            <div className="w-full h-2 bg-gray-800 rounded mt-4 overflow-hidden">
              <div
                className="h-full bg-yellow-400 transition-all"
                style={{ width: `${((restTotal - restLeft) / restTotal) * 100}%` }}
              />
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            {restRunning ? (
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={pauseRest}>
                Pausar
              </Button>
            ) : (
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={resumeRest} disabled={restLeft <= 0}>
                Reanudar
              </Button>
            )}
            <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800" onClick={resetRest}>
              Reiniciar
            </Button>
            <Button className="bg-yellow-400 text-black hover:bg-yellow-300" onClick={closeRest}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default RoutinesScreen
