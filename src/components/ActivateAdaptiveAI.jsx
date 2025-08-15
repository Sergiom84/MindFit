import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useUserContext } from '@/contexts/UserContext'
import {
  Loader2,
  Brain,
  Zap,
  Target,
  Settings,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

const ActivateAdaptiveAI = ({ isOpen, onClose, onResult }) => {
  const { userData, activarIAAdaptativa, isLoading } = useUserContext()
  const [selectedMode, setSelectedMode] = useState(null)
  const [error, setError] = useState(null)

  const modos = [
    {
      id: 'basico',
      label: 'Básico',
      icon: <Target className="w-5 h-5" />,
      description: 'Ajustes semanales basados en progreso',
      features: [
        'Ajustes cada 7 días',
        'Recomendaciones simples',
        'Análisis básico de progreso',
        'Ideal para principiantes'
      ],
      color: 'border-green-400',
      bgColor: 'bg-green-400/10'
    },
    {
      id: 'avanzado',
      label: 'Avanzado',
      icon: <Brain className="w-5 h-5" />,
      description: 'Análisis multifactorial cada 3-5 días',
      features: [
        'Periodización automática',
        'Análisis de fatiga neural',
        'Optimización nutricional',
        'Ajustes cada 3-5 días'
      ],
      color: 'border-yellow-400',
      bgColor: 'bg-yellow-400/10'
    },
    {
      id: 'experto',
      label: 'Experto',
      icon: <Zap className="w-5 h-5" />,
      description: 'Adaptación diaria en tiempo real',
      features: [
        'Microperiodización diaria',
        'Análisis hormonal indirecto',
        'Optimización neural avanzada',
        'Adaptación en tiempo real'
      ],
      color: 'border-red-400',
      bgColor: 'bg-red-400/10'
    },
    {
      id: 'personalizado',
      label: 'Personalizado',
      icon: <Settings className="w-5 h-5" />,
      description: 'Según tus preferencias específicas',
      features: [
        'Configuración personalizada',
        'Frecuencia a medida',
        'Parámetros específicos',
        'Máxima flexibilidad'
      ],
      color: 'border-purple-400',
      bgColor: 'bg-purple-400/10'
    }
  ]

  const handleActivateIA = async () => {
    if (!selectedMode) {
      setError('Por favor selecciona un modo de adaptación')
      return
    }

    setError(null)

    try {
      const result = await activarIAAdaptativa(selectedMode)

      if (result.success) {
        onResult(result.data)
        onClose()
        setSelectedMode(null)
      } else {
        setError(result.error || 'Error al activar IA adaptativa')
      }
    } catch (err) {
      setError('Error de conexión con el servidor')
      console.error('Error:', err)
    }
  }

  const handleClose = () => {
    setSelectedMode(null)
    setError(null)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white flex items-center">
            <Brain className="w-6 h-6 mr-2 text-yellow-400" />
            Activar IA Adaptativa Completa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del usuario */}
          <Card className="bg-gray-800 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white text-lg">Datos del Usuario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Edad</span>
                  <span className="text-white font-medium">{userData.edad} años</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Nivel</span>
                  <span className="text-white font-medium capitalize">{userData.nivel}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Objetivo</span>
                  <span className="text-white font-medium">{userData.objetivo}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Fatiga</span>
                  <span className="text-white font-medium capitalize">{userData.fatiga}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">Sueño</span>
                  <span className="text-white font-medium">{userData.sueño}</span>
                </div>
                <div className="flex flex-col space-y-1">
                  <span className="text-gray-400 text-xs uppercase tracking-wide">RPE</span>
                  <span className="text-white font-medium">{userData.rpe}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selección de modo */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">
              Selecciona el Modo de Adaptación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {modos.map((modo) => (
                <Card
                  key={modo.id}
                  className={`cursor-pointer transition-all hover:scale-105 ${
                    selectedMode === modo.id
                      ? `${modo.color} ${modo.bgColor}`
                      : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                  }`}
                  onClick={() => setSelectedMode(modo.id)}
                >
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`${selectedMode === modo.id ? 'text-white' : 'text-yellow-400'}`}>
                        {modo.icon}
                      </div>
                      <div>
                        <CardTitle className="text-white flex items-center">
                          {modo.label}
                          {selectedMode === modo.id && (
                            <CheckCircle className="w-4 h-4 ml-2 text-green-400" />
                          )}
                        </CardTitle>
                        <p className="text-gray-400 text-sm">{modo.description}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {modo.features.map((feature, idx) => (
                        <li key={idx} className="flex items-center space-x-2 text-sm">
                          <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Información adicional */}
          {selectedMode && (
            <Alert className="border-blue-400 bg-blue-400/10">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-300">
                <strong>Modo {modos.find(m => m.id === selectedMode)?.label} seleccionado:</strong>{' '}
                {modos.find(m => m.id === selectedMode)?.description}
              </AlertDescription>
            </Alert>
          )}

          {/* Error */}
          {error && (
            <Alert className="border-red-400 bg-red-400/10">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                <strong>Error:</strong> {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Botones de acción */}
          <div className="flex space-x-4 pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleActivateIA}
              disabled={!selectedMode || isLoading}
              className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
            >
              {isLoading
                ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analizando...
                </>
                  )
                : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Activar IA Adaptativa
                </>
                  )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ActivateAdaptiveAI
