import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog.jsx'
import { Alert, AlertDescription } from '@/components/ui/alert.jsx'
import { 
  User, 
  Dumbbell, 
  Calendar, 
  Apple, 
  Heart, 
  TrendingUp, 
  Settings,
  Play,
  Pause,
  SkipForward,
  Volume2,
  Home,
  ChevronRight,
  Target,
  Activity,
  Zap,
  Trophy,
  Clock,
  BarChart3,
  Lock,
  Unlock,
  AlertTriangle,
  Camera,
  Music,
  CheckCircle,
  XCircle,
  Brain,
  Smartphone
} from 'lucide-react'
import './App.css'
import AIAdaptiveSection from './components/AIAdaptiveSection'
import HomeTrainingSection from './components/HomeTrainingSection'
import VideoCorrectionSection from './components/VideoCorrectionSection'

// Enhanced Floating Music Bubble Component
const MusicBubble = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 20 })
  const [isDragging, setIsDragging] = useState(false)
  const [currentPhase, setCurrentPhase] = useState('activation') // activation, main, cooldown
  const [autoPlaylist, setAutoPlaylist] = useState(true)

  const musicPhases = {
    activation: { name: 'Activación', color: 'bg-orange-400', music: 'Música Energética' },
    main: { name: 'Trabajo Principal', color: 'bg-red-500', music: 'Playlists Potentes' },
    cooldown: { name: 'Vuelta a la Calma', color: 'bg-blue-400', music: 'Sonidos Relajantes' }
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - 30,
        y: e.clientY - 30
      })
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging])

  return (
    <div 
      className={`fixed z-50 w-16 h-16 ${musicPhases[currentPhase].color} rounded-full shadow-lg cursor-move flex items-center justify-center hover:scale-110 transition-all duration-200`}
      style={{ left: position.x, top: position.y }}
      onMouseDown={handleMouseDown}
      title={`${musicPhases[currentPhase].name}: ${musicPhases[currentPhase].music}`}
    >
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsPlaying(!isPlaying)}
        className="p-0 w-full h-full text-white hover:bg-transparent"
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </Button>
      
      {/* Phase indicator */}
      <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
        <Music size={10} className="text-black" />
      </div>
    </div>
  )
}

// Navigation Component
const Navigation = () => {
  const location = useLocation()
  
  const navItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/methodologies', icon: Dumbbell, label: 'Metodologías' },
    { path: '/routines', icon: Calendar, label: 'Rutinas' },
    { path: '/nutrition', icon: Apple, label: 'Nutrición' },
    { path: '/injuries', icon: Heart, label: 'Lesiones' },
    { path: '/progress', icon: TrendingUp, label: 'Progreso' },
    { path: '/settings', icon: Settings, label: 'Ajustes' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-yellow-400/20 z-40">
      <div className="flex justify-around items-center py-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = location.pathname === item.path
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-yellow-400' 
                  : 'text-gray-400 hover:text-yellow-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

// Version Selection Modal Component
const VersionSelectionModal = ({ methodology, onSelect }) => {
  const [selectedVersion, setSelectedVersion] = useState(null)
  const [showWarning, setShowWarning] = useState(false)
  const [userLevel] = useState('Principiante') // This would come from user profile

  const versions = {
    adapted: {
      name: 'Versión Adaptada',
      icon: <Lock className="w-5 h-5" />,
      intensity: 'Moderada',
      volume: 'Bajo a medio',
      risk: 'Bajo',
      frequency: 'Menor (más descanso)',
      rest: 'Personalizado según recuperación',
      level: 'Principiante / Intermedio',
      adaptation: 'Alta (ajustes frecuentes y progresivos)',
      recommended: userLevel === 'Principiante'
    },
    strict: {
      name: 'Versión Estricta',
      icon: <Unlock className="w-5 h-5" />,
      intensity: 'Alta',
      volume: 'Medio a alto',
      risk: 'Alto si no se regula',
      frequency: 'Mayor (más estímulo semanal)',
      rest: 'Estándar por la metodología',
      level: 'Intermedio avanzado / Competición',
      adaptation: 'Alta (pero bajo riesgo de colapso inicial)',
      recommended: userLevel !== 'Principiante'
    }
  }

  const handleVersionSelect = (version) => {
    setSelectedVersion(version)
    if (version === 'strict' && userLevel === 'Principiante') {
      setShowWarning(true)
    } else {
      setShowWarning(false)
    }
  }

  const confirmSelection = () => {
    onSelect(selectedVersion)
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-yellow-400 text-black hover:bg-yellow-300">
          Seleccionar Versión
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl bg-gray-900 border-yellow-400/20">
        <DialogHeader>
          <DialogTitle className="text-yellow-400">Selección de Versión - {methodology}</DialogTitle>
          <DialogDescription className="text-gray-300">
            Elige la versión que mejor se adapte a tu nivel y objetivos
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          {Object.entries(versions).map(([key, version]) => (
            <Card 
              key={key}
              className={`cursor-pointer transition-all ${
                selectedVersion === key 
                  ? 'border-yellow-400 bg-yellow-400/10' 
                  : 'border-gray-600 hover:border-yellow-400/50'
              } ${version.recommended ? 'ring-2 ring-green-400' : ''}`}
              onClick={() => handleVersionSelect(key)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {version.icon}
                    <CardTitle className="text-white">{version.name}</CardTitle>
                  </div>
                  {version.recommended && (
                    <Badge className="bg-green-400 text-black">Recomendado</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-400">Intensidad:</span>
                    <p className="text-white">{version.intensity}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Volumen:</span>
                    <p className="text-white">{version.volume}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Riesgo:</span>
                    <p className="text-white">{version.risk}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">Nivel:</span>
                    <p className="text-white">{version.level}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showWarning && (
          <Alert className="border-orange-400 bg-orange-400/10">
            <AlertTriangle className="h-4 w-4 text-orange-400" />
            <AlertDescription className="text-orange-300">
              ⚠️ Advertencia: Has seleccionado la versión estricta siendo principiante. 
              Esto puede aumentar el riesgo de lesiones o sobreentrenamiento. 
              Se recomienda usar la versión adaptada durante 4-6 semanas mínimo.
            </AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-2 mt-6">
          <Button 
            onClick={confirmSelection}
            disabled={!selectedVersion}
            className="bg-yellow-400 text-black hover:bg-yellow-300"
          >
            Confirmar Selección
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Home Screen
const HomeScreen = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const navigate = useNavigate()

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated background effect */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(circle at ${mousePosition.x}px ${mousePosition.y}px, yellow 0%, transparent 50%)`
        }}
      />
      
      {/* Hero Section */}
      <div className="relative z-10 pt-20 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
            MindFit
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Tu entrenador personal inteligente que adapta rutinas, nutrición y seguimiento 
            automáticamente según tu progreso y objetivos.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <Card 
              className="bg-black/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors cursor-pointer"
              onClick={() => navigate('/ai-adaptive')}
            >
              <CardHeader>
                <Brain className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">IA Adaptativa Avanzada</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Análisis en tiempo real de evolución anatómica y metabólica
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-black/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors cursor-pointer"
              onClick={() => navigate('/home-training')}
            >
              <CardHeader>
                <Smartphone className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Entrenamiento en Casa</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Modalidad multifuncional con bandas, mancuernas y peso corporal
                </p>
              </CardContent>
            </Card>
            
            <Card 
              className="bg-black/50 border-yellow-400/20 hover:border-yellow-400/40 transition-colors cursor-pointer"
              onClick={() => navigate('/video-correction')}
            >
              <CardHeader>
                <Camera className="w-8 h-8 text-yellow-400 mb-2" />
                <CardTitle className="text-white">Corrección por Video IA</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400">
                  Análisis de técnica en tiempo real con feedback inmediato
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

// Enhanced Profile Screen
const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('basic')

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Perfil de Usuario</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-6">
          <TabsTrigger value="basic">Básicos</TabsTrigger>
          <TabsTrigger value="body">Composición</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <User className="mr-2 text-yellow-400" />
                Datos Básicos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400">Edad</label>
                  <p className="text-white font-semibold">28 años</p>
                </div>
                <div>
                  <label className="text-gray-400">Peso Actual</label>
                  <p className="text-white font-semibold">75 kg</p>
                </div>
                <div>
                  <label className="text-gray-400">Estatura</label>
                  <p className="text-white font-semibold">1.78 m</p>
                </div>
                <div>
                  <label className="text-gray-400">Sexo</label>
                  <p className="text-white font-semibold">Masculino</p>
                </div>
                <div>
                  <label className="text-gray-400">IMC</label>
                  <p className="text-white font-semibold">23.7 <span className="text-green-400 text-sm">(Normal)</span></p>
                </div>
                <div>
                  <label className="text-gray-400">Nivel de Actividad</label>
                  <p className="text-white font-semibold">Moderadamente Activo</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Experiencia en Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400">Nivel Actual</label>
                  <Badge className="bg-yellow-400 text-black">Amateur</Badge>
                </div>
                <div>
                  <label className="text-gray-400">Años Entrenando</label>
                  <p className="text-white">3 años</p>
                </div>
                <div>
                  <label className="text-gray-400">Metodología Preferida</label>
                  <p className="text-white">Hipertrofia</p>
                </div>
                <div>
                  <label className="text-gray-400">Frecuencia Semanal</label>
                  <p className="text-white">4-5 días</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="mr-2 text-yellow-400" />
                Composición Corporal Detallada
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400">Grasa Corporal</label>
                  <p className="text-white font-semibold">15% <span className="text-green-400 text-sm">(Saludable)</span></p>
                </div>
                <div>
                  <label className="text-gray-400">Masa Muscular</label>
                  <p className="text-white font-semibold">58.5 kg</p>
                </div>
                <div>
                  <label className="text-gray-400">Agua Corporal</label>
                  <p className="text-white font-semibold">62%</p>
                </div>
                <div>
                  <label className="text-gray-400">Metabolismo Basal</label>
                  <p className="text-white font-semibold">1,680 kcal</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Medidas Corporales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-gray-400">Cintura</label>
                  <p className="text-white font-semibold">82 cm</p>
                </div>
                <div>
                  <label className="text-gray-400">Pecho</label>
                  <p className="text-white font-semibold">98 cm</p>
                </div>
                <div>
                  <label className="text-gray-400">Brazos</label>
                  <p className="text-white font-semibold">35 cm</p>
                </div>
                <div>
                  <label className="text-gray-400">Muslos</label>
                  <p className="text-white font-semibold">58 cm</p>
                </div>
                <div>
                  <label className="text-gray-400">Cuello</label>
                  <p className="text-white font-semibold">38 cm</p>
                </div>
                <div>
                  <label className="text-gray-400">Antebrazos</label>
                  <p className="text-white font-semibold">28 cm</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Heart className="mr-2 text-yellow-400" />
                Historial Médico y Salud
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400">Presión Arterial</label>
                  <p className="text-white font-semibold">120/80 <span className="text-green-400 text-sm">(Normal)</span></p>
                </div>
                <div>
                  <label className="text-gray-400">Frecuencia Cardíaca Reposo</label>
                  <p className="text-white font-semibold">65 bpm</p>
                </div>
                <div>
                  <label className="text-gray-400">Alergias</label>
                  <p className="text-white font-semibold">Ninguna conocida</p>
                </div>
                <div>
                  <label className="text-gray-400">Medicamentos</label>
                  <p className="text-white font-semibold">Ninguno</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Lesiones y Limitaciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">Dolor lumbar leve</p>
                    <p className="text-gray-400 text-sm">Recuperado - Marzo 2024</p>
                  </div>
                  <Badge variant="outline" className="border-green-400 text-green-400">Recuperado</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-white">Sin limitaciones actuales</p>
                    <p className="text-gray-400 text-sm">Evaluación IA continua</p>
                  </div>
                  <Badge className="bg-green-400 text-black">Activo</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="mr-2 text-yellow-400" />
                Objetivos y Metas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400">Objetivo Principal</label>
                  <p className="text-white font-semibold">Ganar masa muscular magra</p>
                </div>
                <div>
                  <label className="text-gray-400">Meta de Peso</label>
                  <p className="text-white font-semibold">80 kg (+5 kg)</p>
                  <Progress value={60} className="mt-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-1">Progreso: 60%</p>
                </div>
                <div>
                  <label className="text-gray-400">Meta de Grasa Corporal</label>
                  <p className="text-white font-semibold">12% (-3%)</p>
                  <Progress value={40} className="mt-2 bg-gray-700" />
                  <p className="text-sm text-gray-400 mt-1">Progreso: 40%</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Preferencias de Entrenamiento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400">Enfoque Seleccionado</label>
                  <p className="text-white">Powerlifter amateur saludable</p>
                </div>
                <div>
                  <label className="text-gray-400">Horario Preferido</label>
                  <p className="text-white">Mañana (7:00-9:00)</p>
                </div>
                <div>
                  <label className="text-gray-400">Comidas diarias</label>
                  <p className="text-white">4 comidas</p>
                </div>
                <div>
                  <label className="text-gray-400">Suplementación</label>
                  <p className="text-white">Proteína + Creatina</p>
                </div>
              </div>

              <div>
                <label className="text-gray-400">Alimentos excluidos</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="border-red-400 text-red-400">Lácteos</Badge>
                  <Badge variant="outline" className="border-red-400 text-red-400">Gluten</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Enhanced Methodologies Screen
const MethodologiesScreen = () => {
  const [selectedMethodology, setSelectedMethodology] = useState(null)
  const [expandedMethod, setExpandedMethod] = useState(null)

  const methodologies = [
    {
      name: "Heavy Duty",
      description: "Entrenamiento de alta intensidad con descansos prolongados desarrollado por Mike Mentzer",
      focus: "Intensidad máxima",
      homeCompatible: true,
      principles: [
        "Intensidad máxima en cada serie",
        "Descansos de 4-7 días entre entrenamientos",
        "Pocas series por grupo muscular",
        "Fallo muscular controlado"
      ],
      benefits: [
        "Máximo estímulo con mínimo volumen",
        "Ideal para recuperación lenta",
        "Previene sobreentrenamiento",
        "Eficiente en tiempo"
      ],
      targetAudience: "Intermedios y avanzados con buena técnica",
      frequency: "2-3 entrenamientos por semana",
      duration: "45-60 minutos por sesión",
      scientificBasis: "Basado en la teoría de supercompensación y adaptación muscular óptima"
    },
    {
      name: "Powerlifting",
      description: "Enfoque en maximizar fuerza en sentadilla, press de banca y peso muerto",
      focus: "Fuerza máxima",
      homeCompatible: false,
      principles: [
        "Especificidad en los 3 levantamientos",
        "Periodización de intensidad",
        "Técnica perfecta prioritaria",
        "Progresión gradual de cargas"
      ],
      benefits: [
        "Fuerza funcional máxima",
        "Densidad ósea mejorada",
        "Confianza y disciplina mental",
        "Base sólida para otros deportes"
      ],
      targetAudience: "Todos los niveles con acceso a gimnasio completo",
      frequency: "3-5 entrenamientos por semana",
      duration: "90-120 minutos por sesión",
      scientificBasis: "Principios de sobrecarga progresiva y adaptaciones neuromusculares"
    },
    {
      name: "Hipertrofia",
      description: "Maximización del crecimiento muscular a través de volumen y tensión mecánica",
      focus: "Volumen muscular",
      homeCompatible: true,
      principles: [
        "Volumen de entrenamiento elevado",
        "Rango de repeticiones 8-15",
        "Tensión mecánica sostenida",
        "Frecuencia 2x por semana por grupo"
      ],
      benefits: [
        "Aumento visible de masa muscular",
        "Mejora del metabolismo basal",
        "Fortalecimiento articular",
        "Mejora de la composición corporal"
      ],
      targetAudience: "Principiantes a avanzados buscando masa muscular",
      frequency: "4-6 entrenamientos por semana",
      duration: "60-90 minutos por sesión",
      scientificBasis: "Síntesis proteica muscular y adaptaciones metabólicas"
    },
    {
      name: "Funcional",
      description: "Movimientos multiarticulares aplicables a actividades de la vida diaria",
      focus: "Funcionalidad",
      homeCompatible: true,
      principles: [
        "Movimientos multiplanares",
        "Integración de cadenas musculares",
        "Estabilidad y movilidad",
        "Transferencia a vida diaria"
      ],
      benefits: [
        "Mejora de coordinación",
        "Prevención de lesiones",
        "Funcionalidad en actividades diarias",
        "Equilibrio y estabilidad"
      ],
      targetAudience: "Todos los niveles, especial para principiantes y rehabilitación",
      frequency: "3-5 entrenamientos por semana",
      duration: "45-75 minutos por sesión",
      scientificBasis: "Principios de biomecánica y control motor"
    },
    {
      name: "HIIT (Alta Intensidad)",
      description: "Intervalos de alta intensidad para maximizar quema de grasa y condición cardiovascular",
      focus: "Acondicionamiento",
      homeCompatible: true,
      principles: [
        "Intervalos de alta intensidad",
        "Descansos activos cortos",
        "Efecto EPOC post-ejercicio",
        "Variabilidad de ejercicios"
      ],
      benefits: [
        "Quema de grasa acelerada",
        "Mejora cardiovascular rápida",
        "Eficiencia temporal",
        "Versatilidad de ejercicios"
      ],
      targetAudience: "Intermedios con buena base cardiovascular",
      frequency: "3-4 sesiones por semana",
      duration: "20-45 minutos por sesión",
      scientificBasis: "Metabolismo anaeróbico y consumo excesivo de oxígeno post-ejercicio",
      isNew: true
    },
    {
      name: "Entrenamiento en Casa",
      description: "Modalidad multifuncional con bandas, mancuernas y peso corporal adaptada al hogar",
      focus: "Adaptabilidad",
      homeCompatible: true,
      principles: [
        "Equipamiento mínimo máximo resultado",
        "Adaptación al espacio disponible",
        "Progresión con resistencia variable",
        "Flexibilidad horaria total"
      ],
      benefits: [
        "Conveniencia y accesibilidad",
        "Ahorro de tiempo y dinero",
        "Privacidad total",
        "Flexibilidad de horarios"
      ],
      targetAudience: "Todos los niveles sin acceso a gimnasio",
      frequency: "4-6 entrenamientos por semana",
      duration: "30-60 minutos por sesión",
      scientificBasis: "Adaptaciones musculares con resistencia progresiva variable",
      isNew: true
    }
  ]

  const handleMethodologySelect = (methodology) => {
    setSelectedMethodology(methodology)
  }

  const toggleMethodExpansion = (index) => {
    setExpandedMethod(expandedMethod === index ? null : index)
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Metodologías de Entrenamiento</h1>

      <div className="space-y-4">
        {methodologies.map((method, index) => (
          <Card key={index} className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <CardTitle className="text-white">{method.name}</CardTitle>
                    {method.isNew && (
                      <Badge className="bg-green-400 text-black">Nuevo</Badge>
                    )}
                    {method.homeCompatible && (
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        <Smartphone className="w-3 h-3 mr-1" />
                        Casa
                      </Badge>
                    )}
                  </div>
                  <CardDescription className="text-gray-400">{method.description}</CardDescription>

                  {/* Quick Info */}
                  <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
                    <div>
                      <span className="text-gray-500">Frecuencia:</span>
                      <p className="text-gray-300">{method.frequency}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Duración:</span>
                      <p className="text-gray-300">{method.duration}</p>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleMethodExpansion(index)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <ChevronRight
                    className={`transition-transform ${expandedMethod === index ? 'rotate-90' : ''}`}
                  />
                </Button>
              </div>
            </CardHeader>

            {/* Expanded Content */}
            {expandedMethod === index && (
              <CardContent className="border-t border-gray-700 pt-4">
                <Tabs defaultValue="principles" className="w-full">
                  <TabsList className="grid w-full grid-cols-4 bg-gray-800">
                    <TabsTrigger value="principles" className="text-xs">Principios</TabsTrigger>
                    <TabsTrigger value="benefits" className="text-xs">Beneficios</TabsTrigger>
                    <TabsTrigger value="target" className="text-xs">Dirigido a</TabsTrigger>
                    <TabsTrigger value="science" className="text-xs">Ciencia</TabsTrigger>
                  </TabsList>

                  <TabsContent value="principles" className="mt-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">Principios Fundamentales</h4>
                    <ul className="space-y-1">
                      {method.principles.map((principle, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                          <span className="text-yellow-400 mr-2">•</span>
                          {principle}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="benefits" className="mt-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">Beneficios Principales</h4>
                    <ul className="space-y-1">
                      {method.benefits.map((benefit, idx) => (
                        <li key={idx} className="text-gray-300 text-sm flex items-start">
                          <span className="text-green-400 mr-2">✓</span>
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </TabsContent>

                  <TabsContent value="target" className="mt-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">Público Objetivo</h4>
                    <p className="text-gray-300 text-sm">{method.targetAudience}</p>
                  </TabsContent>

                  <TabsContent value="science" className="mt-4">
                    <h4 className="text-yellow-400 font-semibold mb-2">Base Científica</h4>
                    <p className="text-gray-300 text-sm">{method.scientificBasis}</p>
                  </TabsContent>
                </Tabs>
              </CardContent>
            )}

            <CardContent className="pt-0">
              <div className="flex justify-between items-center">
                <Badge className="bg-yellow-400/20 text-yellow-400">{method.focus}</Badge>
                <VersionSelectionModal
                  methodology={method.name}
                  onSelect={(version) => handleMethodologySelect({...method, version})}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMethodology && (
        <Card className="mt-6 bg-green-900/20 border-green-400/20">
          <CardHeader>
            <CardTitle className="text-green-400">Metodología Seleccionada</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white">
              {selectedMethodology.name} - Versión {selectedMethodology.version === 'adapted' ? 'Adaptada' : 'Estricta'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Enhanced Routines Screen
const RoutinesScreen = () => {
  const [showVideoCorrection, setShowVideoCorrection] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState(null)
  const [activeDay, setActiveDay] = useState('day1')

  const weeklyRoutine = {
    day1: {
      name: "Tren Superior - Fuerza",
      date: "Lunes, 29 Julio 2024",
      focus: "Pecho, Hombros, Tríceps",
      exercises: [
        {
          id: 1,
          name: "Press de Banca",
          sets: "4",
          reps: "6-8",
          weight: "70kg",
          hasVideo: true,
          muscleGroup: "Pecho",
          difficulty: "Intermedio",
          equipment: "Barra",
          lastPerformance: { weight: "67.5kg", reps: "8,7,6,6", feeling: "Buena" },
          progression: "+2.5kg desde la semana pasada"
        },
        {
          id: 2,
          name: "Press Militar",
          sets: "3",
          reps: "8-10",
          weight: "45kg",
          hasVideo: true,
          muscleGroup: "Hombros",
          difficulty: "Intermedio",
          equipment: "Barra",
          lastPerformance: { weight: "42.5kg", reps: "10,9,8", feeling: "Excelente" },
          progression: "+2.5kg desde la semana pasada"
        },
        {
          id: 3,
          name: "Fondos en Paralelas",
          sets: "3",
          reps: "12-15",
          weight: "Corporal",
          hasVideo: true,
          muscleGroup: "Tríceps",
          difficulty: "Principiante",
          equipment: "Paralelas",
          lastPerformance: { weight: "Corporal", reps: "15,13,12", feeling: "Buena" },
          progression: "Mantener reps, próxima semana añadir peso"
        },
        {
          id: 4,
          name: "Remo con Barra",
          sets: "4",
          reps: "8-10",
          weight: "60kg",
          hasVideo: true,
          muscleGroup: "Espalda",
          difficulty: "Intermedio",
          equipment: "Barra",
          lastPerformance: { weight: "57.5kg", reps: "10,9,8,8", feeling: "Buena" },
          progression: "+2.5kg desde la semana pasada"
        }
      ]
    },
    day2: {
      name: "Tren Inferior - Fuerza",
      date: "Miércoles, 31 Julio 2024",
      focus: "Cuádriceps, Glúteos, Isquiotibiales",
      exercises: [
        {
          id: 5,
          name: "Sentadillas",
          sets: "4",
          reps: "8-10",
          weight: "80kg",
          hasVideo: true,
          muscleGroup: "Cuádriceps",
          difficulty: "Intermedio",
          equipment: "Barra",
          lastPerformance: { weight: "77.5kg", reps: "10,9,8,8", feeling: "Excelente" },
          progression: "+2.5kg desde la semana pasada"
        },
        {
          id: 6,
          name: "Peso Muerto",
          sets: "3",
          reps: "5",
          weight: "100kg",
          hasVideo: true,
          muscleGroup: "Isquiotibiales",
          difficulty: "Avanzado",
          equipment: "Barra",
          lastPerformance: { weight: "95kg", reps: "5,5,4", feeling: "Buena" },
          progression: "+5kg desde la semana pasada"
        },
        {
          id: 7,
          name: "Prensa de Piernas",
          sets: "3",
          reps: "12-15",
          weight: "120kg",
          hasVideo: true,
          muscleGroup: "Cuádriceps",
          difficulty: "Principiante",
          equipment: "Máquina",
          lastPerformance: { weight: "115kg", reps: "15,14,12", feeling: "Buena" },
          progression: "+5kg desde la semana pasada"
        }
      ]
    }
  }

  const currentDay = weeklyRoutine[activeDay]

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Rutina de Entrenamiento</h1>

      {/* Day Selector */}
      <div className="flex space-x-2 mb-6 overflow-x-auto">
        {Object.entries(weeklyRoutine).map(([dayKey, day]) => (
          <Button
            key={dayKey}
            variant={activeDay === dayKey ? "default" : "outline"}
            onClick={() => setActiveDay(dayKey)}
            className={`min-w-fit ${
              activeDay === dayKey
                ? 'bg-yellow-400 text-black'
                : 'border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/10'
            }`}
          >
            {day.name.split(' - ')[0]}
          </Button>
        ))}
      </div>

      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">{currentDay.name}</CardTitle>
              <CardDescription className="text-gray-400">{currentDay.date}</CardDescription>
              <Badge className="mt-2 bg-blue-400/20 text-blue-400">{currentDay.focus}</Badge>
            </div>
            <Button
              onClick={() => setShowVideoCorrection(!showVideoCorrection)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              {showVideoCorrection ? 'Detener' : 'Corrección IA'}
            </Button>
          </div>
        </CardHeader>
      </Card>

      {showVideoCorrection && (
        <Card className="bg-purple-900/20 border-purple-400/20 mb-6">
          <CardHeader>
            <CardTitle className="text-purple-400 flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Corrección de Técnica por Video IA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Cámara activada</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Análisis de postura en tiempo real</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span className="text-white">Detección de ángulos articulares</span>
              </div>
              <Alert className="border-blue-400 bg-blue-400/10">
                <AlertDescription className="text-blue-300">
                  💡 Mantén el dispositivo estable y asegúrate de estar completamente visible en el encuadre
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {currentDay.exercises.map((exercise, index) => (
          <Card key={exercise.id} className="bg-gray-900 border-yellow-400/20">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-white font-semibold">{exercise.name}</h3>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        exercise.difficulty === 'Principiante' ? 'border-green-400 text-green-400' :
                        exercise.difficulty === 'Intermedio' ? 'border-yellow-400 text-yellow-400' :
                        'border-red-400 text-red-400'
                      }`}
                    >
                      {exercise.difficulty}
                    </Badge>
                  </div>
                  <p className="text-gray-400 text-sm">{exercise.sets} series × {exercise.reps} reps</p>
                  <p className="text-gray-500 text-xs">{exercise.muscleGroup} • {exercise.equipment}</p>

                  {/* Last Performance */}
                  <div className="mt-2 p-2 bg-gray-800 rounded text-xs">
                    <p className="text-gray-400">Última sesión: {exercise.lastPerformance.weight}</p>
                    <p className="text-gray-400">Reps: {exercise.lastPerformance.reps}</p>
                    <p className="text-blue-400">{exercise.progression}</p>
                  </div>
                </div>

                <div className="text-right space-y-2 ml-4">
                  <p className="text-yellow-400 font-bold text-lg">{exercise.weight}</p>
                  <div className="flex flex-col space-y-1">
                    <Button
                      size="sm"
                      className="bg-yellow-400 text-black hover:bg-yellow-300"
                      onClick={() => setSelectedExercise(exercise)}
                    >
                      VER
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                    >
                      EDITAR
                    </Button>
                    {showVideoCorrection && (
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
                        <Camera className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {showVideoCorrection && (
                <div className="mt-4 p-3 bg-purple-900/20 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-300 text-sm">Estado de técnica:</span>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span className="text-green-400 text-sm">Correcta</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-purple-300">
                    ✓ Rango de movimiento completo • ✓ Postura correcta • ✓ Velocidad adecuada
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Enhanced Nutrition Screen
const NutritionScreen = () => {
  const [activeNutritionTab, setActiveNutritionTab] = useState('overview')
  const [selectedMeal, setSelectedMeal] = useState(null)

  const nutritionData = {
    dailyCalories: 2450,
    targetCalories: 2500,
    macros: {
      protein: { current: 150, target: 160, percentage: 94 },
      carbs: { current: 300, target: 320, percentage: 94 },
      fats: { current: 80, target: 85, percentage: 94 }
    },
    meals: [
      {
        id: 1,
        name: "Desayuno",
        time: "08:00",
        calories: 650,
        foods: [
          { name: "Avena", amount: "80g", calories: 304, protein: 10.7, carbs: 54.8, fats: 6.9 },
          { name: "Plátano", amount: "1 mediano", calories: 105, protein: 1.3, carbs: 27, fats: 0.4 },
          { name: "Proteína Whey", amount: "30g", calories: 120, protein: 24, carbs: 2, fats: 1 },
          { name: "Almendras", amount: "20g", calories: 121, protein: 4.4, carbs: 4.6, fats: 10.5 }
        ]
      },
      {
        id: 2,
        name: "Almuerzo",
        time: "13:00",
        calories: 720,
        foods: [
          { name: "Pechuga de Pollo", amount: "150g", calories: 231, protein: 43.5, carbs: 0, fats: 5.1 },
          { name: "Arroz Integral", amount: "100g", calories: 216, protein: 5, carbs: 45, fats: 1.8 },
          { name: "Brócoli", amount: "200g", calories: 68, protein: 5.7, carbs: 13.6, fats: 0.7 },
          { name: "Aceite de Oliva", amount: "10ml", calories: 90, protein: 0, carbs: 0, fats: 10 }
        ]
      }
    ],
    supplements: [
      { name: "Proteína Whey", dosage: "30g", timing: "Post-entreno", status: "Recomendado por IA", priority: "high" },
      { name: "Creatina", dosage: "5g", timing: "Diario", status: "Recomendado por IA", priority: "high" },
      { name: "Omega-3", dosage: "1000mg", timing: "Con comida", status: "Sugerido", priority: "medium" },
      { name: "Vitamina D3", dosage: "2000 UI", timing: "Mañana", status: "Sugerido", priority: "medium" },
      { name: "Magnesio", dosage: "400mg", timing: "Noche", status: "Opcional", priority: "low" }
    ]
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Nutrición y Dietas</h1>

      <Tabs value={activeNutritionTab} onValueChange={setActiveNutritionTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="meals">Comidas</TabsTrigger>
          <TabsTrigger value="supplements">Suplementos</TabsTrigger>
          <TabsTrigger value="tracking">Seguimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-yellow-400" />
                Gasto Calórico Diario (IA Adaptativa)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-3xl font-bold text-yellow-400">{nutritionData.dailyCalories}</p>
                <p className="text-gray-400">calorías consumidas</p>
                <p className="text-sm text-green-400 mt-2">
                  Meta: {nutritionData.targetCalories} kcal • Ajustado automáticamente según evolución
                </p>
                <Progress
                  value={(nutritionData.dailyCalories / nutritionData.targetCalories) * 100}
                  className="mt-3 bg-gray-700"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Macronutrientes Inteligentes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Proteínas</span>
                  <span className="text-white">{nutritionData.macros.protein.current}g / {nutritionData.macros.protein.target}g</span>
                </div>
                <Progress value={nutritionData.macros.protein.percentage} className="bg-gray-700" />
                <p className="text-xs text-gray-500 mt-1">{nutritionData.macros.protein.percentage}% completado</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Carbohidratos</span>
                  <span className="text-white">{nutritionData.macros.carbs.current}g / {nutritionData.macros.carbs.target}g</span>
                </div>
                <Progress value={nutritionData.macros.carbs.percentage} className="bg-gray-700" />
                <p className="text-xs text-gray-500 mt-1">{nutritionData.macros.carbs.percentage}% completado</p>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-400">Grasas</span>
                  <span className="text-white">{nutritionData.macros.fats.current}g / {nutritionData.macros.fats.target}g</span>
                </div>
                <Progress value={nutritionData.macros.fats.percentage} className="bg-gray-700" />
                <p className="text-xs text-gray-500 mt-1">{nutritionData.macros.fats.percentage}% completado</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="meals" className="space-y-6">
          <div className="grid gap-4">
            {nutritionData.meals.map((meal) => (
              <Card key={meal.id} className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-white">{meal.name}</CardTitle>
                      <CardDescription className="text-gray-400">{meal.time} • {meal.calories} kcal</CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedMeal(meal)}
                      className="border-yellow-400/20 text-yellow-400 hover:bg-yellow-400/10"
                    >
                      Ver Detalle
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {meal.foods.slice(0, 2).map((food, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-300">{food.name} ({food.amount})</span>
                        <span className="text-gray-400">{food.calories} kcal</span>
                      </div>
                    ))}
                    {meal.foods.length > 2 && (
                      <p className="text-xs text-gray-500">+{meal.foods.length - 2} alimentos más</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supplements" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Suplementación Personalizada IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {nutritionData.supplements.map((supplement, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-800 rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-white font-semibold">{supplement.name}</h4>
                        <Badge
                          className={`text-xs ${
                            supplement.priority === 'high' ? 'bg-red-400 text-black' :
                            supplement.priority === 'medium' ? 'bg-yellow-400 text-black' :
                            'bg-gray-400 text-black'
                          }`}
                        >
                          {supplement.priority === 'high' ? 'Esencial' :
                           supplement.priority === 'medium' ? 'Recomendado' : 'Opcional'}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm">{supplement.dosage} • {supplement.timing}</p>
                      <p className="text-blue-400 text-xs">{supplement.status}</p>
                    </div>
                    <Button size="sm" className="bg-yellow-400 text-black hover:bg-yellow-300">
                      Comprar
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                Seguimiento Nutricional IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">7</p>
                    <p className="text-gray-400 text-sm">días consecutivos</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">94%</p>
                    <p className="text-gray-400 text-sm">adherencia promedio</p>
                  </div>
                </div>

                <Alert className="border-blue-400 bg-blue-400/10">
                  <AlertDescription className="text-blue-300">
                    🤖 IA detectó patrón óptimo. Manteniendo distribución actual de macronutrientes.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <h4 className="text-white font-semibold">Ajustes Automáticos Esta Semana:</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="text-green-400">✓ Aumentadas proteínas +10g (mejor recuperación)</li>
                    <li className="text-blue-400">→ Carbohidratos mantenidos (energía estable)</li>
                    <li className="text-yellow-400">⚡ Sugerido: Omega-3 para reducir inflamación</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Enhanced Injuries and Adaptations Screen
const InjuriesScreen = () => {
  const [activeInjuryTab, setActiveInjuryTab] = useState('status')
  const [showReportModal, setShowReportModal] = useState(false)

  const injuryData = {
    currentStatus: {
      active: 0,
      recovering: 1,
      riskFactors: 2
    },
    history: [
      {
        id: 1,
        type: "Dolor lumbar leve",
        severity: "Leve",
        date: "Marzo 2024",
        status: "Recuperado",
        adaptations: [
          "Eliminado peso muerto convencional",
          "Añadido peso muerto sumo",
          "Reducida intensidad en sentadillas",
          "Incorporados ejercicios de movilidad lumbar"
        ],
        recoveryTime: "6 semanas",
        aiActions: "IA adaptó rutina automáticamente y monitoreó progreso"
      },
      {
        id: 2,
        type: "Tensión en hombro derecho",
        severity: "Leve",
        date: "Enero 2024",
        status: "Recuperado",
        adaptations: [
          "Modificado press militar por press con mancuernas",
          "Añadidos ejercicios de movilidad escapular",
          "Reducido volumen de press de banca"
        ],
        recoveryTime: "4 semanas",
        aiActions: "Detección temprana por análisis de video IA"
      }
    ],
    riskFactors: [
      {
        factor: "Movilidad de cadera limitada",
        risk: "Medio",
        impact: "Puede afectar sentadillas y peso muerto",
        prevention: "Rutina de movilidad diaria implementada",
        status: "En seguimiento"
      },
      {
        factor: "Desequilibrio muscular hombros",
        risk: "Bajo",
        impact: "Posible tensión en press de banca",
        prevention: "Ejercicios correctivos añadidos",
        status: "Mejorando"
      }
    ],
    preventiveActions: [
      "Calentamiento dinámico personalizado",
      "Ejercicios correctivos integrados",
      "Monitoreo de RPE por ejercicio",
      "Análisis de técnica por video IA",
      "Ajustes automáticos de volumen/intensidad"
    ]
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Lesiones y Adaptaciones</h1>

      <Tabs value={activeInjuryTab} onValueChange={setActiveInjuryTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-6">
          <TabsTrigger value="status">Estado</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="prevention">Prevención</TabsTrigger>
          <TabsTrigger value="adaptations">Adaptaciones</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="w-5 h-5 mr-2 text-yellow-400" />
                Estado Actual (Monitoreado por IA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">{injuryData.currentStatus.active}</p>
                  <p className="text-gray-400 text-sm">Lesiones activas</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">{injuryData.currentStatus.recovering}</p>
                  <p className="text-gray-400 text-sm">En recuperación</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-orange-400">{injuryData.currentStatus.riskFactors}</p>
                  <p className="text-gray-400 text-sm">Factores de riesgo</p>
                </div>
              </div>

              <div className="flex items-center space-x-2 mb-3">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span className="text-white">Sin lesiones activas</span>
              </div>

              <Alert className="border-green-400 bg-green-400/10">
                <AlertDescription className="text-green-300">
                  🤖 IA monitorea automáticamente tu feedback y ajusta la rutina preventivamente.
                  Sistema de detección temprana activo.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Factores de Riesgo Detectados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {injuryData.riskFactors.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-gray-800 rounded">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-white font-semibold">{risk.factor}</h4>
                      <Badge
                        className={`${
                          risk.risk === 'Alto' ? 'bg-red-400 text-black' :
                          risk.risk === 'Medio' ? 'bg-yellow-400 text-black' :
                          'bg-green-400 text-black'
                        }`}
                      >
                        Riesgo {risk.risk}
                      </Badge>
                    </div>
                    <p className="text-gray-400 text-sm mb-1">{risk.impact}</p>
                    <p className="text-blue-400 text-xs">{risk.prevention}</p>
                    <p className="text-green-400 text-xs mt-1">Estado: {risk.status}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <div className="space-y-4">
            {injuryData.history.map((injury) => (
              <Card key={injury.id} className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white">{injury.type}</CardTitle>
                      <CardDescription className="text-gray-400">{injury.date} • {injury.recoveryTime}</CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className={`${
                        injury.status === 'Recuperado' ? 'border-green-400 text-green-400' :
                        injury.status === 'En recuperación' ? 'border-yellow-400 text-yellow-400' :
                        'border-red-400 text-red-400'
                      }`}
                    >
                      {injury.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Adaptaciones Aplicadas:</h4>
                      <ul className="space-y-1">
                        {injury.adaptations.map((adaptation, idx) => (
                          <li key={idx} className="text-gray-300 text-sm flex items-start">
                            <span className="text-blue-400 mr-2">•</span>
                            {adaptation}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="p-2 bg-blue-900/20 rounded">
                      <p className="text-blue-400 text-sm">{injury.aiActions}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="prevention" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                Sistema de Prevención Activa
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {injuryData.preventiveActions.map((action, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                    <CheckCircle className="w-5 h-5 text-green-400" />
                    <span className="text-white">{action}</span>
                  </div>
                ))}
              </div>

              <Alert className="mt-4 border-blue-400 bg-blue-400/10">
                <AlertDescription className="text-blue-300">
                  💡 El sistema IA analiza patrones de movimiento, fatiga y feedback para prevenir lesiones antes de que ocurran.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adaptations" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Adaptaciones Automáticas Activas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-green-900/20 rounded">
                  <h4 className="text-green-400 font-semibold mb-2">Adaptaciones por Movilidad de Cadera</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="text-gray-300">• Sentadillas con rango reducido temporalmente</li>
                    <li className="text-gray-300">• Ejercicios de movilidad añadidos al calentamiento</li>
                    <li className="text-gray-300">• Peso muerto sumo priorizado sobre convencional</li>
                  </ul>
                </div>

                <div className="p-3 bg-blue-900/20 rounded">
                  <h4 className="text-blue-400 font-semibold mb-2">Monitoreo Continuo</h4>
                  <ul className="space-y-1 text-sm">
                    <li className="text-gray-300">• RPE monitoreado por ejercicio</li>
                    <li className="text-gray-300">• Análisis de técnica por video IA</li>
                    <li className="text-gray-300">• Ajustes automáticos de volumen según recuperación</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button
        className="w-full mt-6 bg-yellow-400 text-black hover:bg-yellow-300"
        onClick={() => setShowReportModal(true)}
      >
        <Heart className="mr-2" size={16} />
        Reportar Nueva Lesión o Molestia
      </Button>
    </div>
  )
}

const ProgressScreen = () => {
  const [activeProgressTab, setActiveProgressTab] = useState('overview')

  const progressData = {
    overview: {
      weightChange: { value: 3, unit: 'kg', trend: 'up', target: 5 },
      bodyFatChange: { value: -2, unit: '%', trend: 'down', target: -3 },
      muscleGain: { value: 2.1, unit: 'kg', trend: 'up', target: 3 },
      strengthGain: { value: 15, unit: '%', trend: 'up', target: 20 }
    },
    weeklyMetrics: {
      workouts: { completed: 4, planned: 4, consistency: 100 },
      calories: { average: 2400, target: 2450, adherence: 98 },
      sleep: { average: 7.2, target: 8, quality: 'Buena' },
      recovery: { score: 85, status: 'Óptima' }
    },
    strengthProgress: [
      { exercise: 'Sentadilla', current: '80kg', previous: '70kg', change: '+10kg', trend: 'excellent' },
      { exercise: 'Press Banca', current: '70kg', previous: '65kg', change: '+5kg', trend: 'good', weakness: true },
      { exercise: 'Peso Muerto', current: '100kg', previous: '85kg', change: '+15kg', trend: 'excellent' },
      { exercise: 'Press Militar', current: '45kg', previous: '40kg', change: '+5kg', trend: 'good' }
    ],
    bodyMetrics: {
      measurements: [
        { part: 'Pecho', current: '98cm', change: '+2cm', trend: 'up' },
        { part: 'Brazos', current: '35cm', change: '+1.5cm', trend: 'up' },
        { part: 'Cintura', current: '82cm', change: '-1cm', trend: 'down' },
        { part: 'Muslos', current: '58cm', change: '+2cm', trend: 'up' }
      ]
    },
    aiInsights: [
      {
        type: 'success',
        title: 'Progreso Óptimo Detectado',
        message: 'La IA detectó progreso óptimo. Manteniendo rutina actual con ajustes menores.',
        action: 'Continuar protocolo actual'
      },
      {
        type: 'warning',
        title: 'Punto Débil Identificado',
        message: 'Press de banca progresando más lento. IA redirigiendo volumen para equilibrar desarrollo.',
        action: 'Aumentar frecuencia de press de banca'
      },
      {
        type: 'info',
        title: 'Optimización Nutricional',
        message: 'Patrón de adherencia excelente. Sugerido aumento de 50 kcal para acelerar ganancia muscular.',
        action: 'Ajustar calorías automáticamente'
      }
    ]
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Seguimiento y Evolución</h1>

      <Tabs value={activeProgressTab} onValueChange={setActiveProgressTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 mb-6">
          <TabsTrigger value="overview">Resumen</TabsTrigger>
          <TabsTrigger value="strength">Fuerza</TabsTrigger>
          <TabsTrigger value="body">Físico</TabsTrigger>
          <TabsTrigger value="insights">IA Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Brain className="mr-2 text-yellow-400" />
                Análisis IA en Tiempo Real
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {progressData.overview.weightChange.value > 0 ? '+' : ''}{progressData.overview.weightChange.value}{progressData.overview.weightChange.unit}
                  </p>
                  <p className="text-gray-400">Peso ganado</p>
                  <Progress value={(Math.abs(progressData.overview.weightChange.value) / progressData.overview.weightChange.target) * 100} className="mt-2 bg-gray-700" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-yellow-400">
                    {progressData.overview.bodyFatChange.value}{progressData.overview.bodyFatChange.unit}
                  </p>
                  <p className="text-gray-400">Grasa corporal</p>
                  <Progress value={(Math.abs(progressData.overview.bodyFatChange.value) / Math.abs(progressData.overview.bodyFatChange.target)) * 100} className="mt-2 bg-gray-700" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <p className="text-xl font-bold text-green-400">+{progressData.overview.muscleGain.value}{progressData.overview.muscleGain.unit}</p>
                  <p className="text-gray-400 text-sm">Masa muscular</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-blue-400">+{progressData.overview.strengthGain.value}{progressData.overview.strengthGain.unit}</p>
                  <p className="text-gray-400 text-sm">Fuerza general</p>
                </div>
              </div>

              <Alert className="mt-4 border-blue-400 bg-blue-400/10">
                <AlertDescription className="text-blue-300">
                  🤖 {progressData.aiInsights[0].message}
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Clock className="mr-2 text-yellow-400" />
                Métricas Semanales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Entrenamientos</span>
                    <span className="text-white">{progressData.weeklyMetrics.workouts.completed}/{progressData.weeklyMetrics.workouts.planned}</span>
                  </div>
                  <Progress value={progressData.weeklyMetrics.workouts.consistency} className="bg-gray-700" />
                  <p className="text-xs text-green-400 mt-1">{progressData.weeklyMetrics.workouts.consistency}% consistencia</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Calorías promedio</span>
                    <span className="text-white">{progressData.weeklyMetrics.calories.average}</span>
                  </div>
                  <Progress value={progressData.weeklyMetrics.calories.adherence} className="bg-gray-700" />
                  <p className="text-xs text-green-400 mt-1">{progressData.weeklyMetrics.calories.adherence}% adherencia</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Sueño promedio</span>
                    <span className="text-white">{progressData.weeklyMetrics.sleep.average}h</span>
                  </div>
                  <Progress value={(progressData.weeklyMetrics.sleep.average / progressData.weeklyMetrics.sleep.target) * 100} className="bg-gray-700" />
                  <p className="text-xs text-yellow-400 mt-1">Calidad: {progressData.weeklyMetrics.sleep.quality}</p>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-400">Recuperación</span>
                    <Badge className="bg-green-400 text-black">{progressData.weeklyMetrics.recovery.status}</Badge>
                  </div>
                  <Progress value={progressData.weeklyMetrics.recovery.score} className="bg-gray-700" />
                  <p className="text-xs text-green-400 mt-1">Score: {progressData.weeklyMetrics.recovery.score}/100</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strength" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="mr-2 text-yellow-400" />
                Progreso de Fuerza y Puntos Débiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {progressData.strengthProgress.map((exercise, idx) => (
                  <div key={idx} className="p-3 bg-gray-800 rounded">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-white font-semibold">{exercise.exercise}</h4>
                      <div className="flex items-center space-x-2">
                        <span className="text-white">{exercise.current}</span>
                        <Badge
                          className={`text-xs ${
                            exercise.trend === 'excellent' ? 'bg-green-400 text-black' :
                            exercise.trend === 'good' ? 'bg-yellow-400 text-black' :
                            'bg-red-400 text-black'
                          }`}
                        >
                          {exercise.change}
                        </Badge>
                        {exercise.weakness && (
                          <Badge className="bg-orange-400 text-black text-xs">Punto débil</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Anterior: {exercise.previous}</span>
                      <span className={`${
                        exercise.trend === 'excellent' ? 'text-green-400' :
                        exercise.trend === 'good' ? 'text-yellow-400' :
                        'text-red-400'
                      }`}>
                        {exercise.trend === 'excellent' ? 'Excelente progreso' :
                         exercise.trend === 'good' ? 'Buen progreso' : 'Necesita atención'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <Alert className="mt-4 border-orange-400 bg-orange-400/10">
                <AlertDescription className="text-orange-300">
                  🎯 IA redirigiendo volumen hacia press de banca para equilibrar desarrollo muscular
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="mr-2 text-yellow-400" />
                Evolución Corporal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {progressData.bodyMetrics.measurements.map((measurement, idx) => (
                  <div key={idx} className="p-3 bg-gray-800 rounded">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">{measurement.part}</span>
                      <div className="text-right">
                        <p className="text-white font-semibold">{measurement.current}</p>
                        <p className={`text-xs ${
                          measurement.trend === 'up' ? 'text-green-400' : 'text-blue-400'
                        }`}>
                          {measurement.change}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-900/20 rounded">
                <h4 className="text-blue-400 font-semibold mb-2">Análisis de Composición Corporal</h4>
                <ul className="space-y-1 text-sm">
                  <li className="text-gray-300">• Ganancia muscular equilibrada en tren superior</li>
                  <li className="text-gray-300">• Reducción de grasa abdominal progresiva</li>
                  <li className="text-gray-300">• Desarrollo proporcional mantenido</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="space-y-4">
            {progressData.aiInsights.map((insight, idx) => (
              <Card key={idx} className={`bg-gray-900 ${
                insight.type === 'success' ? 'border-green-400/20' :
                insight.type === 'warning' ? 'border-orange-400/20' :
                'border-blue-400/20'
              }`}>
                <CardHeader>
                  <CardTitle className={`flex items-center ${
                    insight.type === 'success' ? 'text-green-400' :
                    insight.type === 'warning' ? 'text-orange-400' :
                    'text-blue-400'
                  }`}>
                    {insight.type === 'success' ? <CheckCircle className="mr-2" /> :
                     insight.type === 'warning' ? <AlertTriangle className="mr-2" /> :
                     <Brain className="mr-2" />}
                    {insight.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 mb-3">{insight.message}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-400">Acción recomendada:</span>
                    <Badge className="bg-yellow-400 text-black">{insight.action}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="mr-2 text-yellow-400" />
                Logros y Hitos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-2 bg-green-900/20 rounded">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <div>
                    <p className="text-white font-semibold">¡Peso muerto 100kg alcanzado!</p>
                    <p className="text-gray-400 text-sm">Hace 2 días</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-blue-900/20 rounded">
                  <CheckCircle className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-white font-semibold">4 semanas de consistencia perfecta</p>
                    <p className="text-gray-400 text-sm">Hace 1 semana</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-2 bg-purple-900/20 rounded">
                  <Target className="w-5 h-5 text-purple-400" />
                  <div>
                    <p className="text-white font-semibold">Meta de composición corporal 60% completada</p>
                    <p className="text-gray-400 text-sm">Progreso continuo</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const SettingsScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Ajustes y Configuración</h1>
      
      <div className="space-y-4">
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Music className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Configuración Musical</span>
              </div>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Corrección por Video IA</span>
              </div>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Notificaciones</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Unidades de medida</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Backup de datos</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Privacidad</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Acerca de</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/methodologies" element={<MethodologiesScreen />} />
          <Route path="/routines" element={<RoutinesScreen />} />
          <Route path="/nutrition" element={<NutritionScreen />} />
          <Route path="/injuries" element={<InjuriesScreen />} />
          <Route path="/progress" element={<ProgressScreen />} />
          <Route path="/settings" element={<SettingsScreen />} />
          <Route path="/ai-adaptive" element={<AIAdaptiveSection />} />
          <Route path="/home-training" element={<HomeTrainingSection />} />
          <Route path="/video-correction" element={<VideoCorrectionSection />} />
        </Routes>
        <Navigation />
        <MusicBubble />
      </div>
    </Router>
  )
}

export default App


