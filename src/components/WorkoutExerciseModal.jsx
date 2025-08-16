import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Play,
  Pause,
  SkipForward,
  Clock,
  Target,
  Calendar,
  CheckCircle,
  RotateCcw
} from 'lucide-react'

const WorkoutExerciseModal = ({
  exercise,
  exerciseIndex,
  totalExercises,
  onNext,
  onClose,
  isOpen
}) => {
  const [currentPhase, setCurrentPhase] = useState('info') // 'info', 'countdown', 'exercise', 'rest'
  const [timeLeft, setTimeLeft] = useState(0)
  const [currentSet, setCurrentSet] = useState(1)
  const [isActive, setIsActive] = useState(false)

  // Reset states when exercise changes
  useEffect(() => {
    if (isOpen && exercise) {
      setCurrentPhase('info')
      setCurrentSet(1)
      setIsActive(false)
      setTimeLeft(0)
    }
  }, [exercise, isOpen])

  // Timer effect
  useEffect(() => {
    let interval = null

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isActive) {
      // Timer finished
      if (currentPhase === 'countdown') {
        // Start exercise
        if (exercise.tipo === 'tiempo') {
          setCurrentPhase('exercise')
          setTimeLeft(exercise.duracion)
        } else {
          setCurrentPhase('exercise')
          setIsActive(false)
        }
      } else if (currentPhase === 'exercise' && exercise.tipo === 'tiempo') {
        // Exercise finished, start rest
        if (currentSet < exercise.series) {
          setCurrentPhase('rest')
          setTimeLeft(exercise.descanso)
        } else {
          // All sets completed
          setCurrentPhase('completed')
          setIsActive(false)
        }
      } else if (currentPhase === 'rest') {
        // Rest finished, next set
        setCurrentSet(currentSet + 1)
        if (exercise.tipo === 'tiempo') {
          setCurrentPhase('exercise')
          setTimeLeft(exercise.duracion)
        } else {
          setCurrentPhase('exercise')
          setIsActive(false)
        }
      }
    }

    return () => clearInterval(interval)
  }, [isActive, timeLeft, currentPhase, currentSet, exercise])

  const startCountdown = () => {
    setCurrentPhase('countdown')
    setTimeLeft(5) // 5 second countdown
    setIsActive(true)
  }

  const completeRepetitionSet = () => {
    if (currentSet < exercise.series) {
      setCurrentPhase('rest')
      setTimeLeft(exercise.descanso)
      setIsActive(true)
    } else {
      setCurrentPhase('completed')
      setIsActive(false)
    }
  }

  const nextExercise = () => {
    if (exerciseIndex < totalExercises - 1) {
      onNext()
    } else {
      onClose()
    }
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen || !exercise) return null

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-900 border border-yellow-400/20 rounded-lg w-full max-w-[calc(100vw-1rem)] sm:max-w-2xl max-h-[calc(100vh-1rem)] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">
                {exercise.nombre}
              </h2>
              <p className="text-gray-400">
                Ejercicio {exerciseIndex + 1} de {totalExercises}
              </p>
            </div>
            <Button
              onClick={onClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              ✕
            </Button>
          </div>

          {/* Exercise Info Phase */}
          {currentPhase === 'info' && (
            <>
              {/* Exercise Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center bg-gray-800 rounded-lg p-4">
                  <Clock className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">
                    {exercise.tipo === 'tiempo' ? `${exercise.duracion}s` : `${exercise.repeticiones} reps`}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {exercise.tipo === 'tiempo' ? 'Duración' : 'Repeticiones'}
                  </div>
                </div>
                <div className="text-center bg-gray-800 rounded-lg p-4">
                  <Target className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{exercise.series}</div>
                  <div className="text-gray-400 text-sm">Series</div>
                </div>
                <div className="text-center bg-gray-800 rounded-lg p-4">
                  <RotateCcw className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                  <div className="text-white font-semibold">{exercise.descanso}s</div>
                  <div className="text-gray-400 text-sm">Descanso</div>
                </div>
              </div>

              {/* Exercise Description */}
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <h3 className="text-white font-semibold mb-3">Descripción:</h3>
                <p className="text-gray-300 mb-4">{exercise.descripcion}</p>

                {exercise.consejos && exercise.consejos.length > 0 && (
                  <>
                    <h4 className="text-white font-semibold mb-2">Consejos de Técnica:</h4>
                    <div className="space-y-2">
                      {exercise.consejos.map((consejo, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{consejo}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={startCountdown}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3 text-lg font-semibold"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Iniciar Ejercicio
                </Button>
              </div>
            </>
          )}

          {/* Countdown Phase */}
          {currentPhase === 'countdown' && (
            <div className="text-center py-12">
              <h3 className="text-white text-2xl font-semibold mb-4">¡Prepárate!</h3>
              <div className="text-8xl font-bold text-yellow-400 mb-4">
                {timeLeft}
              </div>
              <p className="text-gray-400">Comenzando en...</p>
            </div>
          )}

          {/* Exercise Phase */}
          {currentPhase === 'exercise' && (
            <div className="text-center py-8">
              <h3 className="text-white text-2xl font-semibold mb-2">
                Serie {currentSet} de {exercise.series}
              </h3>
              <h4 className="text-yellow-400 text-xl mb-6">{exercise.nombre}</h4>

              {exercise.tipo === 'tiempo'
                ? (
                <>
                  <div className="text-6xl font-bold text-green-400 mb-4">
                    {formatTime(timeLeft)}
                  </div>
                  <p className="text-gray-400">¡Mantén la posición!</p>
                </>
                  )
                : (
                <>
                  <div className="text-4xl font-bold text-green-400 mb-4">
                    {exercise.repeticiones} repeticiones
                  </div>
                  <p className="text-gray-400 mb-6">Completa las repeticiones a tu ritmo</p>
                  <Button
                    onClick={completeRepetitionSet}
                    className="bg-green-500 text-white hover:bg-green-400 px-6 py-3"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Serie Completada
                  </Button>
                </>
                  )}
            </div>
          )}

          {/* Rest Phase */}
          {currentPhase === 'rest' && (
            <div className="text-center py-12">
              <h3 className="text-white text-2xl font-semibold mb-4">Descanso</h3>
              <div className="text-6xl font-bold text-blue-400 mb-4">
                {formatTime(timeLeft)}
              </div>
              <p className="text-gray-400">
                Serie {currentSet} completada. Siguiente: {currentSet + 1} de {exercise.series}
              </p>
            </div>
          )}

          {/* Completed Phase */}
          {currentPhase === 'completed' && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
              <h3 className="text-white text-2xl font-semibold mb-4">
                ¡Ejercicio Completado!
              </h3>
              <p className="text-gray-400 mb-6">
                Has completado todas las series de {exercise.nombre}
              </p>

              <div className="flex justify-center space-x-4">
                {exerciseIndex < totalExercises - 1
                  ? (
                  <Button
                    onClick={nextExercise}
                    className="bg-yellow-400 text-black hover:bg-yellow-300 px-6 py-3"
                  >
                    <SkipForward className="w-5 h-5 mr-2" />
                    Siguiente Ejercicio
                  </Button>
                    )
                  : (
                  <Button
                    onClick={onClose}
                    className="bg-green-500 text-white hover:bg-green-400 px-6 py-3"
                  >
                    <CheckCircle className="w-5 h-5 mr-2" />
                    Finalizar Entrenamiento
                  </Button>
                    )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default WorkoutExerciseModal
