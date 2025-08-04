import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ActivateAdaptiveAI from './ActivateAdaptiveAI'
import { useUserContext } from '@/contexts/UserContext'
import { 
  Brain, 
  TrendingUp, 
  Activity, 
  Target, 
  Zap, 
  BarChart3,
  Clock,
  Heart,
  ChevronRight,
  Info,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

const AIAdaptiveSection = () => {
  const [selectedFeature, setSelectedFeature] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { panelIA, getEstadoMetabolicoColor, getAlertColor } = useUserContext()

  const aiFeatures = [
    {
      id: 'metabolic-analysis',
      title: 'Análisis Metabólico Inteligente',
      icon: <Activity className="w-6 h-6" />,
      description: 'Monitoreo continuo de tu metabolismo basal y adaptación automática de calorías',
      details: {
        overview: 'Sistema avanzado que analiza tu gasto energético en tiempo real',
        benefits: [
          'Ajuste automático de calorías según evolución',
          'Detección de cambios metabólicos',
          'Optimización de timing nutricional',
          'Prevención de mesetas metabólicas'
        ],
        howItWorks: [
          'Análisis de datos biométricos diarios',
          'Correlación con rendimiento y composición corporal',
          'Algoritmos predictivos de adaptación metabólica',
          'Ajustes automáticos cada 3-5 días'
        ]
      }
    },
    {
      id: 'anatomical-evolution',
      title: 'Evolución Anatómica Predictiva',
      icon: <TrendingUp className="w-6 h-6" />,
      description: 'Predicción y adaptación basada en cambios en composición corporal',
      details: {
        overview: 'IA que anticipa cambios corporales y ajusta el programa preventivamente',
        benefits: [
          'Predicción de puntos de estancamiento',
          'Ajuste proactivo de rutinas',
          'Optimización de distribución muscular',
          'Prevención de desequilibrios'
        ],
        howItWorks: [
          'Análisis de medidas corporales semanales',
          'Modelado predictivo de crecimiento muscular',
          'Identificación de grupos musculares rezagados',
          'Rebalanceo automático de volumen de entrenamiento'
        ]
      }
    },
    {
      id: 'neural-adaptation',
      title: 'Adaptación del Sistema Nervioso',
      icon: <Brain className="w-6 h-6" />,
      description: 'Monitoreo de fatiga neural y optimización de recuperación',
      details: {
        overview: 'Sistema que evalúa el estado de tu sistema nervioso central',
        benefits: [
          'Prevención de sobreentrenamiento',
          'Optimización de intensidad diaria',
          'Mejora de la calidad del sueño',
          'Maximización de adaptaciones neurales'
        ],
        howItWorks: [
          'Análisis de variabilidad del rendimiento',
          'Evaluación de sensaciones subjetivas',
          'Monitoreo de patrones de sueño',
          'Ajuste automático de cargas de trabajo'
        ]
      }
    },
    {
      id: 'hormonal-optimization',
      title: 'Optimización Hormonal',
      icon: <Zap className="w-6 h-6" />,
      description: 'Análisis de patrones hormonales y ajuste de protocolos',
      details: {
        overview: 'Evaluación indirecta del estado hormonal a través de marcadores',
        benefits: [
          'Optimización de ventanas anabólicas',
          'Mejora de la recuperación hormonal',
          'Ajuste de frecuencia de entrenamiento',
          'Maximización de síntesis proteica'
        ],
        howItWorks: [
          'Análisis de patrones de energía y libido',
          'Evaluación de calidad del sueño',
          'Monitoreo de cambios de humor',
          'Ajuste de periodización según estado hormonal'
        ]
      }
    }
  ]

  const adaptationLevels = [
    {
      level: 'Básico',
      description: 'Ajustes semanales basados en progreso',
      features: ['Ajuste de peso', 'Modificación de repeticiones', 'Cambio de ejercicios básico'],
      color: 'bg-green-500'
    },
    {
      level: 'Avanzado',
      description: 'Análisis multifactorial cada 3-5 días',
      features: ['Periodización automática', 'Análisis de fatiga', 'Optimización nutricional'],
      color: 'bg-yellow-500'
    },
    {
      level: 'Experto',
      description: 'Adaptación diaria en tiempo real',
      features: ['Microperiodización', 'Análisis hormonal indirecto', 'Optimización neural'],
      color: 'bg-red-500'
    }
  ]

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            IA Adaptativa Avanzada
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Sistema de inteligencia artificial que analiza tu evolución anatómica y metabólica 
            en tiempo real para optimizar continuamente tu entrenamiento y nutrición.
          </p>
        </div>

        {/* Niveles de Adaptación */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {adaptationLevels.map((level, index) => (
            <Card key={index} className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                  <CardTitle className="text-white">{level.level}</CardTitle>
                </div>
                <CardDescription className="text-gray-400">{level.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {level.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Características Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {aiFeatures.map((feature) => (
            <Card 
              key={feature.id} 
              className={`bg-gray-900 border-yellow-400/20 cursor-pointer transition-all hover:border-yellow-400/40 ${
                selectedFeature === feature.id ? 'border-yellow-400 bg-yellow-400/5' : ''
              }`}
              onClick={() => setSelectedFeature(selectedFeature === feature.id ? null : feature.id)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="text-yellow-400">{feature.icon}</div>
                    <div>
                      <CardTitle className="text-white">{feature.title}</CardTitle>
                      <CardDescription className="text-gray-400">{feature.description}</CardDescription>
                    </div>
                  </div>
                  <ChevronRight className={`text-yellow-400 transition-transform ${
                    selectedFeature === feature.id ? 'rotate-90' : ''
                  }`} />
                </div>
              </CardHeader>
              
              {selectedFeature === feature.id && (
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Descripción</h4>
                      <p className="text-gray-300 text-sm">{feature.details.overview}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">Beneficios</h4>
                      <ul className="space-y-1">
                        {feature.details.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm">
                            <CheckCircle className="w-3 h-3 text-green-400" />
                            <span className="text-gray-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="text-white font-semibold mb-2">Cómo Funciona</h4>
                      <ul className="space-y-1">
                        {feature.details.howItWorks.map((step, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-sm">
                            <span className="text-yellow-400 font-bold">{idx + 1}.</span>
                            <span className="text-gray-300">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {/* Panel de Control IA */}
        <Card className="bg-gray-900 border-yellow-400/20 mb-8">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
              Panel de Control IA - Estado Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getEstadoMetabolicoColor(panelIA.estadoMetabolico)}`}>
                  {panelIA.estadoMetabolico}
                </div>
                <div className="text-sm text-gray-400">Estado Metabólico</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-400">{panelIA.recuperacionNeural}</div>
                <div className="text-sm text-gray-400">Recuperación Neural</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-400">{panelIA.eficienciaAdaptativa}</div>
                <div className="text-sm text-gray-400">Eficiencia Adaptativa</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-400">{panelIA.proximaRevision}</div>
                <div className="text-sm text-gray-400">Próxima Revisión</div>
              </div>
            </div>
            {panelIA.modoActivo && (
              <div className="mt-4 text-center">
                <Badge className="bg-yellow-400/20 text-yellow-400">
                  Modo Activo: {panelIA.modoActivo.charAt(0).toUpperCase() + panelIA.modoActivo.slice(1)}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas y Recomendaciones */}
        <div className="space-y-4">
          {panelIA.alertas.map((alerta, index) => (
            <Alert key={index} className={getAlertColor(alerta.tipo)}>
              {alerta.tipo === 'success' && <CheckCircle className="h-4 w-4" />}
              {alerta.tipo === 'warning' && <AlertTriangle className="h-4 w-4" />}
              {alerta.tipo === 'info' && <Info className="h-4 w-4" />}
              <AlertDescription>
                <strong>{alerta.titulo}:</strong> {alerta.mensaje}
              </AlertDescription>
            </Alert>
          ))}
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-3"
          >
            Activar IA Adaptativa Completa
          </Button>
        </div>

        {/* Modal de IA Adaptativa */}
        <ActivateAdaptiveAI
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onResult={(data) => {
            console.log('Resultado de IA:', data);
            // Los datos ya se actualizan automáticamente a través del contexto
          }}
        />
      </div>
    </div>
  )
}

export default AIAdaptiveSection
