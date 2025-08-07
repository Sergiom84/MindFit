import React, { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom'
import { UserProvider, useUserContext } from './contexts/UserContext'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import LoginPage from './components/LoginPage'
import InitialProfileForm from './components/InitialProfileForm'
import UserProfile from './components/UserProfile'
import Avatar, { getAvailableGymIcons } from './components/Avatar'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Progress } from '@/components/ui/progress.jsx'
import { calculateIMC, getIMCCategory, getIMCCategoryColor } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger } from '@/components/ui/dialog.jsx'
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
  Smartphone,
  ImageIcon,
  UserCircle,
  Key,
  Edit,
  Upload,
  Save,
  MousePointer,
  Circle,
  Eye
} from 'lucide-react'
import './App.css'
import AIAdaptiveSection from './components/AIAdaptiveSection'
import HomeTrainingSection from './components/HomeTrainingSection'
import VideoCorrectionSection from './components/VideoCorrectionSection'
import NutritionScreen from './components/NutritionScreen'
import InjuriesScreen from './components/InjuriesScreen'
import ProgressScreen from './components/ProgressScreen'
import OpenAITest from './components/OpenAITest'

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
  const { logout, getCurrentUserInfo } = useAuth()
  const userInfo = getCurrentUserInfo()
  
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

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-yellow-400/20 z-40">
      {/* Navegación principal */}
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
  const [activeTab, setActiveTab] = useState('basic');
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState({});
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const { currentUser, updateUserData } = useAuth();

  // Initialize edited data when entering edit mode
  const handleEditMode = () => {
    setEditedData({ ...currentUser });
    setIsEditing(true);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setEditedData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Save changes
  const handleSave = async () => {
    try {
      await updateUserData(editedData);
      setIsEditing(false);
      setEditedData({});
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setIsEditing(false);
    setEditedData({});
  };

  // Handle password change
  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
    setPasswordError('');
  };

  // Submit password change
  const handlePasswordSubmit = async () => {
    setPasswordError('');
    setPasswordSuccess('');

    // Validations
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setPasswordError('Todos los campos son obligatorios');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Las contraseñas nuevas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      // Aquí iría la llamada al backend para cambiar la contraseña
      // Por ahora simulamos el éxito
      console.log('Changing password...', passwordData);

      // Simular delay de API
      await new Promise(resolve => setTimeout(resolve, 1000));

      setPasswordSuccess('Contraseña actualizada correctamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError('Error al cambiar la contraseña. Inténtalo de nuevo.');
    }
  };

  // Component for editable field
  const EditableField = ({ label, field, value, type = "text", options = null, suffix = "" }) => {
    const displayValue = isEditing ? (editedData[field] || '') : (value || 'No especificado');

    if (!isEditing) {
      return (
        <div>
          <label className="text-gray-400">{label}</label>
          <p className="text-white font-semibold">{displayValue}{suffix}</p>
        </div>
      );
    }

    if (options) {
      return (
        <div>
          <label className="text-gray-400 text-sm">{label}</label>
          <select
            value={editedData[field] || ''}
            onChange={(e) => handleInputChange(field, e.target.value)}
            className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {options.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <div>
        <label className="text-gray-400 text-sm">{label}</label>
        <input
          type={type}
          value={editedData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
          placeholder={`Ingresa ${label.toLowerCase()}`}
        />
      </div>
    );
  };

  if (!currentUser) {
    return <div>Cargando perfil...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Perfil de Usuario</h1>
        <div className="flex space-x-2">
          {isEditing ? (
            <>
              <Button
                onClick={handleSave}
                className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>Guardar</span>
              </Button>
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Cancelar
              </Button>
            </>
          ) : (
            <Button
              onClick={handleEditMode}
              className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Editar Perfil</span>
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-gray-800 mb-6">
          <TabsTrigger value="basic">Básicos</TabsTrigger>
          <TabsTrigger value="body">Composición</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
          <TabsTrigger value="goals">Objetivos</TabsTrigger>
          <TabsTrigger value="personalization">Personalización</TabsTrigger>
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
                <EditableField
                  label="Nombre"
                  field="nombre"
                  value={currentUser.nombre}
                />
                <EditableField
                  label="Apellido"
                  field="apellido"
                  value={currentUser.apellido}
                />
                <div>
                  <label className="text-gray-400">Email</label>
                  <p className="text-white font-semibold">{currentUser.email}</p>
                  {isEditing && <p className="text-xs text-gray-500 mt-1">El email no se puede modificar</p>}
                </div>
                <EditableField
                  label="Edad"
                  field="edad"
                  value={currentUser.edad}
                  type="number"
                  suffix=" años"
                />
                <EditableField
                  label="Peso Actual"
                  field="peso"
                  value={currentUser.peso}
                  type="number"
                  suffix=" kg"
                />
                <EditableField
                  label="Estatura"
                  field="altura"
                  value={currentUser.altura}
                  type="number"
                  suffix=" cm"
                />
                <EditableField
                  label="Sexo"
                  field="sexo"
                  value={currentUser.sexo}
                  options={[
                    { value: 'masculino', label: 'Masculino' },
                    { value: 'femenino', label: 'Femenino' },
                    { value: 'otro', label: 'Otro' }
                  ]}
                />
                <div>
                  <label className="text-gray-400">IMC</label>
                  <p className="text-white font-semibold">
                    {(() => {
                      const calculatedIMC = calculateIMC(currentUser.peso, currentUser.altura);
                      const category = getIMCCategory(calculatedIMC);
                      const colorClass = getIMCCategoryColor(calculatedIMC);

                      return calculatedIMC ? (
                        <>
                          {calculatedIMC}
                          <span className={`${colorClass} text-sm ml-1`}>
                            ({category})
                          </span>
                        </>
                      ) : 'No calculado';
                    })()}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400">Nivel de Actividad</label>
                  <p className="text-white font-semibold">{currentUser.nivel_actividad || 'No especificado'}</p>
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
                  {isEditing ? (
                    <EditableField
                      label="Nivel Actual"
                      field="nivel"
                      value={currentUser.nivel}
                      options={[
                        { value: 'principiante', label: 'Principiante' },
                        { value: 'intermedio', label: 'Intermedio' },
                        { value: 'avanzado', label: 'Avanzado' }
                      ]}
                    />
                  ) : (
                    <div>
                      <label className="text-gray-400">Nivel Actual</label>
                      <Badge className={`${
                        currentUser.nivel === 'principiante' ? 'bg-green-400 text-black' :
                        currentUser.nivel === 'intermedio' ? 'bg-yellow-400 text-black' :
                        'bg-red-400 text-black'
                      }`}>
                        {currentUser.nivel || 'No especificado'}
                      </Badge>
                    </div>
                  )}
                </div>
                <EditableField
                  label="Años Entrenando"
                  field="años_entrenando"
                  value={currentUser.años_entrenando}
                  type="number"
                  suffix=" años"
                />
                <EditableField
                  label="Metodología Preferida"
                  field="metodologia_preferida"
                  value={currentUser.metodologia_preferida}
                  options={[
                    { value: 'powerlifting', label: 'Powerlifting' },
                    { value: 'bodybuilding', label: 'Bodybuilding' },
                    { value: 'crossfit', label: 'CrossFit' },
                    { value: 'calistenia', label: 'Calistenia' },
                    { value: 'entrenamiento_casa', label: 'Entrenamiento en Casa' },
                    { value: 'heavy_duty', label: 'Heavy Duty' },
                    { value: 'funcional', label: 'Entrenamiento Funcional' }
                  ]}
                />
                <EditableField
                  label="Frecuencia Semanal"
                  field="frecuencia_semanal"
                  value={currentUser.frecuencia_semanal}
                  type="number"
                  suffix=" días"
                />
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
                  <p className="text-white font-semibold">
                    {currentUser.grasa_corporal ? (
                      <>
                        {currentUser.grasa_corporal}%
                        <span className="text-green-400 text-sm ml-1">(Saludable)</span>
                      </>
                    ) : 'No especificado'}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400">Masa Muscular</label>
                  <p className="text-white font-semibold">{currentUser.masa_muscular ? `${currentUser.masa_muscular} kg` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Agua Corporal</label>
                  <p className="text-white font-semibold">{currentUser.agua_corporal ? `${currentUser.agua_corporal}%` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Metabolismo Basal</label>
                  <p className="text-white font-semibold">{currentUser.metabolismo_basal ? `${currentUser.metabolismo_basal} kcal` : 'No especificado'}</p>
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
                  <p className="text-white font-semibold">{currentUser.cintura ? `${currentUser.cintura} cm` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Pecho</label>
                  <p className="text-white font-semibold">{currentUser.pecho ? `${currentUser.pecho} cm` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Brazos</label>
                  <p className="text-white font-semibold">{currentUser.brazos ? `${currentUser.brazos} cm` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Muslos</label>
                  <p className="text-white font-semibold">{currentUser.muslos ? `${currentUser.muslos} cm` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Cuello</label>
                  <p className="text-white font-semibold">{currentUser.cuello ? `${currentUser.cuello} cm` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Antebrazos</label>
                  <p className="text-white font-semibold">{currentUser.antebrazos ? `${currentUser.antebrazos} cm` : 'No especificado'}</p>
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
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400">Historial Médico</label>
                  <p className="text-white font-semibold">{currentUser.historial_medico || 'Sin historial médico registrado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Limitaciones</label>
                  <p className="text-white font-semibold">{currentUser.limitaciones || 'Sin limitaciones registradas'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Alergias</label>
                  <p className="text-white font-semibold">{currentUser.alergias || 'Sin alergias registradas'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Medicamentos</label>
                  <p className="text-white font-semibold">{currentUser.medicamentos || 'Sin medicamentos registrados'}</p>
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
                  <p className="text-white font-semibold">{currentUser.objetivo_principal || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Meta de Peso</label>
                  <p className="text-white font-semibold">
                    {currentUser.meta_peso ? `${currentUser.meta_peso} kg` : 'No especificado'}
                    {currentUser.peso && currentUser.meta_peso && (
                      <span className="text-gray-400 ml-2">
                        ({currentUser.meta_peso > currentUser.peso ? '+' : ''}{(currentUser.meta_peso - currentUser.peso).toFixed(1)} kg)
                      </span>
                    )}
                  </p>
                </div>
                <div>
                  <label className="text-gray-400">Meta de Grasa Corporal</label>
                  <p className="text-white font-semibold">
                    {currentUser.meta_grasa ? `${currentUser.meta_grasa}%` : 'No especificado'}
                    {currentUser.grasa_corporal && currentUser.meta_grasa && (
                      <span className="text-gray-400 ml-2">
                        ({currentUser.meta_grasa > currentUser.grasa_corporal ? '+' : ''}{(currentUser.meta_grasa - currentUser.grasa_corporal).toFixed(1)}%)
                      </span>
                    )}
                  </p>
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
                  <p className="text-white">{currentUser.enfoque || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Horario Preferido</label>
                  <p className="text-white">{currentUser.horario_preferido || 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Comidas diarias</label>
                  <p className="text-white">{currentUser.comidas_diarias ? `${currentUser.comidas_diarias} comidas` : 'No especificado'}</p>
                </div>
                <div>
                  <label className="text-gray-400">Suplementación</label>
                  <p className="text-white">{currentUser.suplementacion || 'No especificado'}</p>
                </div>
              </div>

              <div>
                <label className="text-gray-400">Alimentos excluidos</label>
                <p className="text-white mt-2">{currentUser.alimentos_excluidos || 'Ninguno especificado'}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="personalization" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="mr-2 text-yellow-400" />
                Avatar y Personalización
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Avatar del Usuario</h3>
                <div className="flex items-center space-x-6">
                  {/* Current Avatar Display */}
                  <div className="flex flex-col items-center space-y-2">
                    <Avatar
                      avatar={currentUser.avatar}
                      iniciales={currentUser.iniciales}
                      nombre={currentUser.nombre}
                      size="xl"
                      showBorder={true}
                    />
                    <p className="text-sm text-gray-400">Avatar Actual</p>
                  </div>

                  {/* Upload Options */}
                  <div className="flex-1 space-y-3">
                    <Button className="w-full bg-yellow-400 text-black hover:bg-yellow-300 flex items-center justify-center space-x-2">
                      <Upload className="w-4 h-4" />
                      <span>Subir Imagen Personal</span>
                    </Button>

                    {/* Gym Icons Selection */}
                    <div className="space-y-2">
                      <p className="text-sm text-gray-400">O elige un icono de gimnasio:</p>
                      <div className="grid grid-cols-5 gap-2">
                        {getAvailableGymIcons().slice(0, 10).map((iconData) => {
                          const IconComponent = iconData.component;
                          return (
                            <button
                              key={iconData.key}
                              className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
                                currentUser.avatar === iconData.key
                                  ? 'bg-yellow-400 text-black'
                                  : 'bg-gray-700 hover:bg-yellow-400 hover:text-black'
                              }`}
                              onClick={() => {
                                handleInputChange('avatar', iconData.key);
                                handleSave();
                              }}
                              title={iconData.name}
                            >
                              <IconComponent className="w-6 h-6" />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700"></div>

              {/* Password Change Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white flex items-center">
                  <Key className="mr-2 text-yellow-400" />
                  Cambiar Contraseña
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-gray-400 text-sm">Contraseña Actual</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="Ingresa tu contraseña actual"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Nueva Contraseña</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="Ingresa tu nueva contraseña"
                    />
                  </div>
                  <div>
                    <label className="text-gray-400 text-sm">Confirmar Nueva Contraseña</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full mt-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:border-yellow-400 focus:outline-none"
                      placeholder="Confirma tu nueva contraseña"
                    />
                  </div>

                  {/* Error and Success Messages */}
                  {passwordError && (
                    <div className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg p-3">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="text-green-400 text-sm bg-green-400/10 border border-green-400/20 rounded-lg p-3">
                      {passwordSuccess}
                    </div>
                  )}

                  <Button
                    onClick={handlePasswordSubmit}
                    className="bg-green-500 hover:bg-green-600 text-white flex items-center space-x-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>Actualizar Contraseña</span>
                  </Button>
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
  const [selectionMode, setSelectionMode] = useState('automatic') // 'automatic' or 'manual'
  const [showRecommendationModal, setShowRecommendationModal] = useState(false)
  const [showManualSelectionModal, setShowManualSelectionModal] = useState(false)
  const [pendingMethodology, setPendingMethodology] = useState(null)
  const [aiRecommendation, setAiRecommendation] = useState(null)
  const [methodologyProgress, setMethodologyProgress] = useState(0)
  const [startDate, setStartDate] = useState(null)
  const [endDate, setEndDate] = useState(null)
  const { currentUser } = useAuth()
  const { metodologiaActiva, setMetodologiaActiva, updateMetodologiaProgress, completarEntrenamiento } = useUserContext()

  const methodologies = [
    {
      name: "Heavy Duty",
      description: "Entrenamiento de alta intensidad con bajo volumen y máximo descanso",
      detailedDescription: "Metodología desarrollada por Mike Mentzer que revolucionó el entrenamiento con pesas. Se basa en entrenamientos breves pero extremadamente intensos, seguidos de períodos de descanso prolongados para permitir la supercompensación muscular completa.",
      focus: "Intensidad máxima",
      level: "Intermedio-Avanzado",
      homeCompatible: true,
      icon: Zap,
      programDuration: "6-8 semanas",
      frequency: "2-3 días/semana",
      volume: "Muy bajo",
      intensity: "Muy alta",
      principles: [
        "Intensidad máxima en cada serie hasta el fallo muscular",
        "Descansos de 4-7 días entre entrenamientos del mismo grupo muscular",
        "Pocas series por grupo muscular (1-2 series efectivas)",
        "Progresión lenta pero constante en cargas",
        "Enfoque en ejercicios compuestos básicos"
      ],
      benefits: [
        "Máximo estímulo de crecimiento con mínimo volumen de entrenamiento",
        "Ideal para personas con poca disponibilidad de tiempo",
        "Previene el sobreentrenamiento y el burnout",
        "Permite recuperación completa entre sesiones",
        "Desarrolla fuerza mental y concentración extrema"
      ],
      targetAudience: "Intermedios y avanzados con buena técnica y experiencia en fallo muscular",
      duration: "45-60 minutos por sesión",
      scientificBasis: "Basado en la teoría de supercompensación, adaptación específica y el principio de sobrecarga progresiva de Arthur Jones",
      videoPlaceholder: true
    },
    {
      name: "Powerlifting",
      description: "Enfoque en los tres levantamientos básicos: sentadilla, press banca y peso muerto",
      detailedDescription: "Deporte de fuerza que se centra en maximizar la carga en tres movimientos fundamentales. Combina entrenamiento técnico específico con desarrollo de fuerza absoluta, utilizando periodización avanzada para alcanzar picos de rendimiento.",
      focus: "Fuerza máxima",
      level: "Intermedio-Competición",
      homeCompatible: false,
      icon: Trophy,
      programDuration: "12-16 semanas",
      frequency: "4-6 días/semana",
      volume: "Alto",
      intensity: "Alta",
      principles: [
        "Especificidad absoluta en sentadilla, press banca y peso muerto",
        "Periodización lineal o ondulante según objetivos",
        "Técnica perfecta como prioridad número uno",
        "Trabajo de accesorios específico para debilidades",
        "Progresión gradual y medible en cada ciclo"
      ],
      benefits: [
        "Desarrollo de fuerza funcional máxima en patrones básicos",
        "Mejora significativa de la densidad ósea y conectiva",
        "Desarrollo de disciplina mental y concentración extrema",
        "Base sólida de fuerza para cualquier otro deporte",
        "Comunidad competitiva y objetivos medibles claros"
      ],
      targetAudience: "Intermedios a avanzados con acceso a gimnasio completo y experiencia en levantamientos básicos",
      duration: "90-120 minutos por sesión",
      scientificBasis: "Principios de especificidad, sobrecarga progresiva, adaptaciones neuromusculares y periodización del entrenamiento",
      videoPlaceholder: true
    },
    {
      name: "Hipertrofia",
      description: "Entrenamiento orientado al crecimiento muscular con volumen moderado-alto",
      detailedDescription: "Metodología científicamente respaldada para maximizar el crecimiento muscular. Combina tensión mecánica, estrés metabólico y daño muscular controlado para estimular la síntesis proteica y el desarrollo de masa muscular magra.",
      focus: "Volumen muscular",
      level: "Principiante-Avanzado",
      homeCompatible: true,
      icon: Dumbbell,
      programDuration: "8-12 semanas",
      frequency: "4-5 días/semana",
      volume: "Moderado-Alto",
      intensity: "Moderada-Alta",
      principles: [
        "Volumen de entrenamiento optimizado (10-20 series por grupo muscular/semana)",
        "Rango de repeticiones 6-20 con énfasis en 8-15",
        "Tensión mecánica sostenida y tiempo bajo tensión controlado",
        "Frecuencia de 2-3 veces por semana por grupo muscular",
        "Progresión en volumen, intensidad o densidad"
      ],
      benefits: [
        "Aumento significativo y visible de masa muscular",
        "Mejora del metabolismo basal y composición corporal",
        "Fortalecimiento de articulaciones y tejido conectivo",
        "Mejor definición muscular y simetría corporal",
        "Aumento de la autoestima y confianza personal"
      ],
      targetAudience: "Desde principiantes hasta avanzados que buscan maximizar el crecimiento muscular",
      duration: "60-90 minutos por sesión",
      scientificBasis: "Basado en investigación sobre síntesis proteica muscular, mTOR, tensión mecánica y adaptaciones metabólicas",
      videoPlaceholder: true
    },
    {
      name: "Funcional",
      description: "Movimientos naturales y ejercicios que mejoran la funcionalidad diaria",
      detailedDescription: "Entrenamiento basado en patrones de movimiento que replican actividades de la vida cotidiana. Integra múltiples grupos musculares trabajando en diferentes planos de movimiento para mejorar la coordinación, estabilidad y transferencia al rendimiento diario.",
      focus: "Funcionalidad",
      level: "Principiante-Intermedio",
      homeCompatible: true,
      icon: Activity,
      programDuration: "6-10 semanas",
      frequency: "3-4 días/semana",
      volume: "Moderado",
      intensity: "Moderada",
      principles: [
        "Movimientos multiplanares (sagital, frontal, transversal)",
        "Integración de cadenas musculares completas",
        "Desarrollo simultáneo de estabilidad y movilidad",
        "Transferencia directa a actividades de la vida diaria",
        "Progresión desde estabilidad a movilidad dinámica"
      ],
      benefits: [
        "Mejora significativa de coordinación y propiocepción",
        "Prevención efectiva de lesiones cotidianas",
        "Mayor eficiencia en movimientos diarios",
        "Desarrollo de equilibrio y estabilidad core",
        "Rehabilitación y corrección de desequilibrios musculares"
      ],
      targetAudience: "Ideal para principiantes, personas en rehabilitación y atletas buscando transferencia",
      duration: "45-75 minutos por sesión",
      scientificBasis: "Basado en principios de biomecánica, control motor, cadenas cinéticas y neuroplasticidad",
      videoPlaceholder: true
    },
    {
      name: "Oposiciones",
      description: "Preparación física específica para pruebas de oposiciones",
      detailedDescription: "Programa especializado diseñado para superar las pruebas físicas de oposiciones (policía, bomberos, militar, etc.). Combina resistencia cardiovascular, fuerza funcional y agilidad específica según los requerimientos de cada convocatoria.",
      focus: "Acondicionamiento específico",
      level: "Principiante-Intermedio",
      homeCompatible: true,
      icon: Target,
      programDuration: "8-16 semanas",
      frequency: "4-5 días/semana",
      volume: "Alto",
      intensity: "Moderada-Alta",
      principles: [
        "Especificidad según pruebas de la oposición",
        "Periodización hacia fecha de examen",
        "Combinación de resistencia y fuerza funcional",
        "Simulacros de pruebas reales",
        "Progresión gradual y sostenible"
      ],
      benefits: [
        "Preparación específica para superar baremos oficiales",
        "Mejora integral de capacidades físicas requeridas",
        "Desarrollo de resistencia mental bajo presión",
        "Optimización del rendimiento en fecha clave",
        "Reducción del riesgo de lesiones durante pruebas"
      ],
      targetAudience: "Opositores de cuerpos de seguridad, bomberos, militar y similares",
      duration: "60-90 minutos por sesión",
      scientificBasis: "Entrenamiento específico, periodización deportiva y adaptaciones cardiorrespiratorias",
      videoPlaceholder: true
    },
    {
      name: "CrossFit",
      description: "Entrenamiento funcional de alta intensidad con movimientos variados",
      detailedDescription: "Metodología que combina levantamiento olímpico, gimnasia y acondicionamiento metabólico. Busca desarrollar las 10 capacidades físicas generales a través de movimientos funcionales ejecutados a alta intensidad y constantemente variados.",
      focus: "Condición física general",
      level: "Intermedio-Avanzado",
      homeCompatible: false,
      icon: Target,
      programDuration: "8-12 semanas",
      frequency: "3-5 días/semana",
      volume: "Alto",
      intensity: "Alta",
      principles: [
        "Movimientos funcionales constantemente variados",
        "Alta intensidad relativa adaptada al individuo",
        "Escalabilidad universal para todos los niveles",
        "Comunidad y competición como motivación",
        "Medición y registro constante del progreso"
      ],
      benefits: [
        "Desarrollo completo de las 10 capacidades físicas",
        "Mejora dramática de la composición corporal",
        "Versatilidad atlética y preparación física general",
        "Motivación grupal y sentido de comunidad",
        "Transferencia a actividades deportivas y cotidianas"
      ],
      targetAudience: "Intermedios a avanzados con buena base técnica y capacidad de aprendizaje motor",
      duration: "60-75 minutos por sesión",
      scientificBasis: "Adaptaciones metabólicas mixtas, transferencia atlética y principios de entrenamiento concurrente",
      videoPlaceholder: true
    },
    {
      name: "Calistenia",
      description: "Entrenamiento con peso corporal enfocado en control y fuerza relativa",
      detailedDescription: "Arte del movimiento corporal que desarrolla fuerza, flexibilidad y control motor usando únicamente el peso del cuerpo. Progresa desde movimientos básicos hasta habilidades avanzadas como muscle-ups, handstands y human flags.",
      focus: "Fuerza relativa",
      level: "Principiante-Avanzado",
      homeCompatible: true,
      icon: User,
      programDuration: "10-16 semanas",
      frequency: "4-6 días/semana",
      volume: "Moderado-Alto",
      intensity: "Moderada-Alta",
      principles: [
        "Progresión gradual con peso corporal únicamente",
        "Desarrollo de control motor y propiocepción avanzada",
        "Integración de movimientos artísticos y funcionales",
        "Fuerza funcional relativa al peso corporal",
        "Paciencia y consistencia en la progresión"
      ],
      benefits: [
        "Desarrollo de fuerza relativa excepcional",
        "Control corporal y coordinación avanzada",
        "Mejora significativa de flexibilidad y movilidad",
        "Entrenamiento accesible sin necesidad de equipamiento",
        "Desarrollo de habilidades impresionantes y motivadoras"
      ],
      targetAudience: "Desde principiantes hasta avanzados con paciencia para progresión gradual",
      duration: "45-90 minutos por sesión",
      scientificBasis: "Adaptaciones neuromusculares, control motor, plasticidad neural y biomecánica corporal",
      videoPlaceholder: true
    },
    {
      name: "Entrenamiento en Casa",
      description: "Rutinas adaptadas para entrenar en casa con equipamiento mínimo",
      detailedDescription: "Programa versátil diseñado para maximizar resultados con equipamiento básico del hogar. Combina peso corporal, bandas elásticas y objetos domésticos para crear rutinas efectivas adaptadas a cualquier espacio y horario.",
      focus: "Adaptabilidad",
      level: "Principiante-Intermedio",
      homeCompatible: true,
      icon: Home,
      programDuration: "4-8 semanas",
      frequency: "3-5 días/semana",
      volume: "Moderado",
      intensity: "Moderada",
      principles: [
        "Máximo resultado con equipamiento mínimo disponible",
        "Adaptación creativa al espacio y recursos disponibles",
        "Progresión con resistencia variable y peso corporal",
        "Flexibilidad horaria total sin dependencias externas",
        "Sostenibilidad a largo plazo desde casa"
      ],
      benefits: [
        "Conveniencia total y accesibilidad las 24 horas",
        "Ahorro significativo de tiempo y dinero en gimnasios",
        "Privacidad completa y comodidad del hogar",
        "Flexibilidad de horarios adaptada a tu rutina",
        "Eliminación de excusas y barreras para entrenar"
      ],
      targetAudience: "Ideal para todos los niveles sin acceso a gimnasio o con limitaciones de tiempo",
      duration: "30-60 minutos por sesión",
      scientificBasis: "Adaptaciones musculares con resistencia progresiva variable, entrenamiento funcional y biomecánica adaptativa",
      videoPlaceholder: true,
      isNew: true
    }
  ]

  // Función para activar IA y obtener recomendación
  const activateAI = async () => {
    if (!currentUser) return;

    try {
      // Simular llamada a la API de IA para recomendación
      const recommendation = await getAIMethodologyRecommendation(currentUser);
      setAiRecommendation(recommendation);
      setShowRecommendationModal(true);
    } catch (error) {
      console.error('Error obteniendo recomendación de IA:', error);
    }
  };

  // Función para obtener recomendación de IA usando la API real
  const getAIMethodologyRecommendation = async (user) => {
    try {
      // Preparar datos del usuario para la IA
      const userAnalysis = {
        userName: user.nombre || 'Usuario',
        yearsTraining: user.años_entrenando || 0,
        currentLevel: user.nivel || 'principiante',
        injuries: user.limitaciones || 'ninguna',
        goal: user.objetivo_principal || 'mantener forma',
        age: user.edad || 25,
        weight: user.peso || 70,
        height: user.altura || 170,
        bodyFat: user.grasa_corporal || 15,
        frequency: user.frecuencia_semanal || 3,
        preferredMethodology: user.metodologia_preferida || 'ninguna',
        allergies: user.alergias || 'ninguna',
        medications: user.medicamentos || 'ninguno',
        homeTraining: true
      };

      // Llamar a la API de recomendación de metodologías
      const response = await fetch('http://localhost:5000/api/recomendar-metodologia', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData: userAnalysis,
          availableMethodologies: methodologies.map(m => ({
            name: m.name,
            description: m.description,
            focus: m.focus,
            homeCompatible: m.homeCompatible,
            targetAudience: m.targetAudience,
            frequency: m.frequency,
            duration: m.duration,
            programDuration: m.programDuration
          }))
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      const aiResponse = await response.json();

      if (aiResponse.success) {
        // Encontrar la metodología recomendada en nuestro array
        const recommendedMethodology = methodologies.find(m =>
          m.name.toLowerCase() === aiResponse.recommendedMethodology.toLowerCase()
        );

        return {
          methodology: recommendedMethodology || methodologies[0],
          reason: aiResponse.reason,
          analysis: userAnalysis,
          confidence: aiResponse.confidence || 85,
          alternatives: aiResponse.alternatives || []
        };
      } else {
        throw new Error(aiResponse.error || 'Error en la recomendación');
      }
    } catch (error) {
      console.error('Error obteniendo recomendación de IA:', error);

      // Fallback a lógica simple si la API falla
      const analysis = {
        userName: user.nombre || 'Usuario',
        yearsTraining: user.años_entrenando || 0,
        currentLevel: user.nivel || 'principiante',
        injuries: user.limitaciones || 'ninguna',
        goal: user.objetivo_principal || 'mantener forma',
        homeTraining: true
      };

      let recommendedMethodology;
      if (analysis.yearsTraining >= 3 && analysis.currentLevel === 'avanzado') {
        recommendedMethodology = methodologies.find(m => m.name === 'Powerlifting');
      } else if (analysis.goal.includes('peso') || analysis.goal.includes('masa')) {
        recommendedMethodology = methodologies.find(m => m.name === 'Hipertrofia');
      } else if (analysis.injuries !== 'ninguna') {
        recommendedMethodology = methodologies.find(m => m.name === 'Funcional');
      } else {
        recommendedMethodology = methodologies.find(m => m.name === 'Entrenamiento en Casa');
      }

      return {
        methodology: recommendedMethodology,
        reason: `Con ${analysis.yearsTraining} años de experiencia, tu nivel ${analysis.currentLevel} y tu objetivo de ${analysis.goal}, la mejor opción es ${recommendedMethodology.name}.`,
        analysis,
        confidence: 75,
        alternatives: []
      };
    }
  };

  // Función para aceptar recomendación de IA
  const acceptAIRecommendation = () => {
    if (aiRecommendation) {
      selectMethodology(aiRecommendation.methodology, 'ai');
      setShowRecommendationModal(false);
    }
  };

  // Función para seleccionar metodología manualmente
  const handleMethodologySelect = (methodology) => {
    if (selectionMode === 'manual') {
      setPendingMethodology(methodology);
      setShowManualSelectionModal(true);
    }
  };

  // Función para confirmar selección manual
  const confirmManualSelection = () => {
    if (pendingMethodology) {
      selectMethodology(pendingMethodology, 'manual');
      setShowManualSelectionModal(false);
      setPendingMethodology(null);
    }
  };

  // Función unificada para seleccionar metodología
  const selectMethodology = (methodology, source) => {
    setSelectedMethodology(methodology);

    // Establecer el modo de selección
    if (source === 'manual') {
      setSelectionMode('manual');
    } else if (source === 'automatic') {
      setSelectionMode('automatic');
    }

    // Calcular fechas
    const today = new Date();
    const start = new Date(today);
    setStartDate(start);

    // Calcular fecha de finalización basada en la duración del programa
    let durationWeeks = 8; // valor por defecto
    if (methodology.programDuration && typeof methodology.programDuration === 'string') {
      const parts = methodology.programDuration.split('-');
      if (parts.length > 1) {
        const parsed = parseInt(parts[1]);
        if (!isNaN(parsed) && parsed > 0) {
          durationWeeks = parsed;
        }
      }
    }

    const end = new Date(start);
    end.setDate(start.getDate() + (durationWeeks * 7));
    setEndDate(end);

    // Resetear progreso
    setMethodologyProgress(0);

    // Guardar en el contexto global
    setMetodologiaActiva(methodology, start.toISOString(), end.toISOString());
  };

  const toggleMethodExpansion = (index) => {
    setExpandedMethod(expandedMethod === index ? null : index)
  }

  // Función para calcular progreso basado en entrenamientos completados
  const calculateProgress = () => {
    if (!selectedMethodology || !startDate || !endDate) return 0;

    const today = new Date();
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
    const daysPassed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));

    // Simular progreso basado en días transcurridos
    const timeProgress = Math.min((daysPassed / totalDays) * 100, 100);

    // Aquí se podría conectar con datos reales de entrenamientos completados
    // Por ahora usamos el progreso temporal
    return Math.max(0, Math.min(timeProgress, 100));
  };

  // Función para simular completar un entrenamiento
  const completeWorkout = () => {
    // Usar la función del contexto que actualiza automáticamente el progreso
    const success = completarEntrenamiento();

    if (success && metodologiaActiva) {
      // Actualizar el estado local también
      setMethodologyProgress(metodologiaActiva.progreso || 0);
    }
  };

  // Cargar metodología activa al inicializar
  useEffect(() => {
    if (metodologiaActiva && metodologiaActiva.metodologia) {
      setSelectedMethodology(metodologiaActiva.metodologia);
      setStartDate(new Date(metodologiaActiva.fechaInicio));
      setEndDate(new Date(metodologiaActiva.fechaFin));
      setMethodologyProgress(metodologiaActiva.progreso || 0);
    }
  }, [metodologiaActiva]);

  // Actualizar progreso cuando cambie la metodología seleccionada
  useEffect(() => {
    if (selectedMethodology && startDate && endDate) {
      const progress = calculateProgress();
      setMethodologyProgress(progress);
    }
  }, [selectedMethodology, startDate, endDate]);

  // Función para obtener color de la barra según el progreso
  const getProgressColor = (progress) => {
    if (progress < 25) return 'from-red-400 to-red-600';
    if (progress < 50) return 'from-orange-400 to-orange-600';
    if (progress < 75) return 'from-yellow-400 to-yellow-600';
    return 'from-green-400 to-green-600';
  };

  // Función para obtener mensaje motivacional según el progreso
  const getMotivationalMessage = (progress) => {
    if (progress === 0) return '¡Comienza tu transformación hoy!';
    if (progress < 25) return '¡Excelente inicio! Mantén el ritmo.';
    if (progress < 50) return '¡Vas por buen camino! La constancia es clave.';
    if (progress < 75) return '¡Increíble progreso! Ya estás en la recta final.';
    if (progress < 100) return '¡Casi lo logras! El último empujón.';
    return '¡Felicitaciones! Has completado el programa.';
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Metodologías de Entrenamiento</h1>
      <p className="text-gray-400 mb-8">Selecciona la metodología que mejor se adapte a tus objetivos y nivel</p>

      {/* Modo de Selección */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Settings className="mr-2 text-yellow-400" />
            Modo de Selección
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Selección Automática */}
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id="automatic"
              name="selectionMode"
              value="automatic"
              checked={selectionMode === 'automatic'}
              onChange={(e) => setSelectionMode(e.target.value)}
              className="mt-1 w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 focus:ring-yellow-400"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <label htmlFor="automatic" className="text-white font-semibold flex items-center cursor-pointer">
                  <Brain className="mr-2 text-yellow-400" />
                  Selección Automática (Recomendado)
                </label>
                {selectionMode === 'automatic' && (
                  <Button
                    onClick={activateAI}
                    className="bg-yellow-400 text-black hover:bg-yellow-300 flex items-center space-x-2"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Activar IA</span>
                  </Button>
                )}
              </div>
              <p className="text-gray-400 text-sm mt-1">
                La IA asigna automáticamente la versión según tu nivel
              </p>
            </div>
          </div>

          {/* Selección Manual */}
          <div className="flex items-start space-x-3">
            <input
              type="radio"
              id="manual"
              name="selectionMode"
              value="manual"
              checked={selectionMode === 'manual'}
              onChange={(e) => setSelectionMode(e.target.value)}
              className="mt-1 w-4 h-4 text-yellow-400 bg-gray-800 border-gray-600 focus:ring-yellow-400"
            />
            <div className="flex-1">
              <label htmlFor="manual" className="text-white font-semibold flex items-center cursor-pointer">
                <User className="mr-2 text-yellow-400" />
                Elección Manual
              </label>
              <p className="text-gray-400 text-sm mt-1">
                Tú decides entre versión adaptada o estricta
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Banner de Metodología Seleccionada */}
      {selectedMethodology && (
        <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/40 mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                {selectedMethodology.icon && React.createElement(selectedMethodology.icon, { className: "w-8 h-8 text-yellow-400" })}
                <div>
                  <h3 className="text-xl font-bold text-white">
                    {selectionMode === 'automatic'
                      ? `El entrenamiento recomendado es: ${selectedMethodology.name}`
                      : `Entrenamiento seleccionado por ${currentUser?.nombre || 'Usuario'}: ${selectedMethodology.name}`
                    }
                  </h3>
                  <p className="text-gray-300 text-sm">{selectedMethodology.description}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {selectionMode === 'automatic' ? (
                  <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/40">
                    <Brain className="w-3 h-3 mr-1" />
                    IA
                  </Badge>
                ) : (
                  <Badge className="bg-green-400/20 text-green-400 border-green-400/40">
                    <User className="w-3 h-3 mr-1" />
                    Manual
                  </Badge>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-gray-400 text-sm">Fecha de inicio</p>
                  <p className="text-white font-semibold">
                    {startDate ? startDate.toLocaleDateString('es-ES') : 'No definida'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Clock className="w-5 h-5 text-red-400" />
                <div>
                  <p className="text-gray-400 text-sm">Fecha de finalización</p>
                  <p className="text-white font-semibold">
                    {endDate ? endDate.toLocaleDateString('es-ES') : 'No definida'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm">Duración del programa</p>
                  <p className="text-white font-semibold">{selectedMethodology.programDuration}</p>
                </div>
              </div>
            </div>

            {/* Barra de Progreso Mejorada */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Progreso del programa</span>
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold">{Math.round(methodologyProgress)}%</span>
                  {methodologyProgress === 100 && (
                    <Trophy className="w-4 h-4 text-yellow-400" />
                  )}
                </div>
              </div>

              <div className="relative">
                <Progress value={methodologyProgress} className="h-4 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${getProgressColor(methodologyProgress)} rounded-full transition-all duration-500 ease-out relative`}
                    style={{ width: `${methodologyProgress}%` }}
                  >
                    {/* Efecto de brillo */}
                    <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
                  </div>
                </Progress>

                {/* Marcadores de progreso */}
                <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center px-1">
                  {[25, 50, 75].map((milestone) => (
                    <div
                      key={milestone}
                      className={`w-1 h-2 rounded-full ${
                        methodologyProgress >= milestone ? 'bg-white' : 'bg-gray-500'
                      }`}
                      style={{ marginLeft: `${milestone}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Mensaje motivacional */}
              <div className="text-center">
                <p className="text-sm text-gray-300 italic">
                  {getMotivationalMessage(methodologyProgress)}
                </p>
              </div>

              {/* Estadísticas adicionales */}
              <div className="grid grid-cols-3 gap-4 text-center text-xs">
                <div>
                  <p className="text-gray-400">Días restantes</p>
                  <p className="text-white font-semibold">
                    {endDate ? Math.max(0, Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24))) : 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Entrenamientos estimados</p>
                  <p className="text-white font-semibold">
                    {(() => {
                      if (!selectedMethodology) return 0;
                      try {
                        const frequencyParts = selectedMethodology.frequency?.split('-') || ['3'];
                        const durationParts = selectedMethodology.programDuration?.split('-') || ['4', '8'];
                        const frequency = parseInt(frequencyParts[0]) || 3;
                        const weeks = parseInt(durationParts[1]) || 8;
                        return Math.round(methodologyProgress / 100 * frequency * weeks);
                      } catch (error) {
                        return 0;
                      }
                    })()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Racha actual</p>
                  <p className="text-white font-semibold">
                    {Math.floor(methodologyProgress / 10)} días
                  </p>
                </div>
              </div>

              {/* Botón de acción */}
              {methodologyProgress < 100 && (
                <div className="text-center mt-4">
                  <Button
                    onClick={completeWorkout}
                    className="bg-green-500 hover:bg-green-600 text-white px-6 py-2"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Marcar Entrenamiento Completado
                  </Button>
                </div>
              )}

              {methodologyProgress === 100 && (
                <div className="text-center mt-4 p-4 bg-gradient-to-r from-green-400/10 to-green-600/10 border border-green-400/40 rounded-lg">
                  <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                  <p className="text-green-400 font-bold">¡Programa Completado!</p>
                  <p className="text-gray-300 text-sm">¡Felicitaciones por tu dedicación y constancia!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Grid de Metodologías en Cajas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {methodologies.map((method, index) => (
          <Card
            key={index}
            className={`bg-gray-900/90 border-gray-700 hover:border-yellow-400/60 transition-all duration-300 transform hover:scale-105 ${
              selectionMode === 'manual' ? 'cursor-pointer' : ''
            } ${
              selectedMethodology?.name === method.name ? 'border-yellow-400 bg-yellow-400/5 shadow-lg shadow-yellow-400/20' : ''
            }`}
            onClick={() => selectionMode === 'manual' && handleMethodologySelect(method)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between mb-3">
                {method.icon && <method.icon className="w-8 h-8 text-yellow-400" />}
                <Badge
                  variant="outline"
                  className="text-xs px-2 py-1 border-gray-600 text-gray-300"
                >
                  {method.level}
                </Badge>
              </div>

              <CardTitle className="text-white text-xl font-bold mb-2 flex items-center">
                {method.name}
                {selectionMode === 'manual' && selectedMethodology?.name === method.name && (
                  <CheckCircle className="w-5 h-5 ml-2 text-green-400" />
                )}
              </CardTitle>

              <CardDescription className="text-gray-400 text-sm leading-relaxed">
                {method.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Información de entrenamiento */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Frecuencia:</span>
                  <span className="text-white font-medium text-sm">{method.frequency}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Volumen:</span>
                  <span className="text-white font-medium text-sm">{method.volume}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">Intensidad:</span>
                  <span className="text-white font-medium text-sm">{method.intensity}</span>
                </div>
              </div>

              {/* Badges adicionales */}
              <div className="flex flex-wrap gap-2">
                {method.homeCompatible && (
                  <Badge variant="outline" className="border-blue-400 text-blue-400 text-xs">
                    <Home className="w-3 h-3 mr-1" />
                    Casa
                  </Badge>
                )}
                {method.isNew && (
                  <Badge className="bg-green-400 text-black text-xs">Nuevo</Badge>
                )}
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 mt-4">
                <Button
                  variant="outline"
                  className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setExpandedMethod(index);
                  }}
                >
                  Ver Detalles
                </Button>
                <Button
                  className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-black font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMethodologySelect(method);
                  }}
                >
                  Seleccionar Metodología
                </Button>
              </div>
            </CardContent>

          </Card>
        ))}
      </div>

      {/* Modal de detalles expandidos */}
      {expandedMethod !== null && methodologies[expandedMethod] && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-yellow-400/20 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {methodologies[expandedMethod].icon &&
                    React.createElement(methodologies[expandedMethod].icon, { className: "w-8 h-8 text-yellow-400" })
                  }
                  <div>
                    <CardTitle className="text-white text-xl">
                      {methodologies[expandedMethod].name}
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      {methodologies[expandedMethod].description}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedMethod(null)}
                  className="text-gray-400 hover:text-white"
                >
                  ✕
                </Button>
              </div>
            </CardHeader>

            <CardContent>
              {/* Descripción detallada */}
              {methodologies[expandedMethod]?.detailedDescription && (
                <div className="mb-6 p-4 bg-gray-800/50 rounded-lg">
                  <h4 className="text-yellow-400 font-semibold mb-2">Descripción Completa</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    {methodologies[expandedMethod].detailedDescription}
                  </p>
                </div>
              )}

              {/* Video placeholder */}
              {methodologies[expandedMethod]?.videoPlaceholder && (
                <div className="mb-6 p-6 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-600 text-center">
                  <Play className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <h4 className="text-white font-semibold mb-2">Video Explicativo</h4>
                  <p className="text-gray-400 text-sm">
                    Próximamente: Video detallado sobre la metodología {methodologies[expandedMethod].name}
                  </p>
                </div>
              )}

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
                    {methodologies[expandedMethod]?.principles?.map((principle, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <span className="text-yellow-400 mr-2">•</span>
                        {principle}
                      </li>
                    )) || <li className="text-gray-400 text-sm">No hay principios disponibles</li>}
                  </ul>
                </TabsContent>

                <TabsContent value="benefits" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Beneficios Principales</h4>
                  <ul className="space-y-1">
                    {methodologies[expandedMethod]?.benefits?.map((benefit, idx) => (
                      <li key={idx} className="text-gray-300 text-sm flex items-start">
                        <span className="text-green-400 mr-2">✓</span>
                        {benefit}
                      </li>
                    )) || <li className="text-gray-400 text-sm">No hay beneficios disponibles</li>}
                  </ul>
                </TabsContent>

                <TabsContent value="target" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Público Objetivo</h4>
                  <p className="text-gray-300 text-sm">{methodologies[expandedMethod]?.targetAudience || 'No especificado'}</p>
                </TabsContent>

                <TabsContent value="science" className="mt-4">
                  <h4 className="text-yellow-400 font-semibold mb-2">Base Científica</h4>
                  <p className="text-gray-300 text-sm">{methodologies[expandedMethod]?.scientificBasis || 'No especificado'}</p>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-700">
                <Badge className="bg-yellow-400/20 text-yellow-400">{methodologies[expandedMethod]?.focus || 'General'}</Badge>
                <VersionSelectionModal
                  methodology={methodologies[expandedMethod]?.name || 'Metodología'}
                  onSelect={(version) => {
                    if (methodologies[expandedMethod]) {
                      const methodologyWithVersion = {...methodologies[expandedMethod], version};
                      selectMethodology(methodologyWithVersion, 'manual');
                      setExpandedMethod(null);
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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

      {/* Modal de Recomendación de IA */}
      <Dialog open={showRecommendationModal} onOpenChange={setShowRecommendationModal}>
        <DialogContent className="max-w-2xl bg-gray-900 border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center">
              <Brain className="w-6 h-6 mr-2 text-yellow-400" />
              Recomendación de IA Personalizada
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Basado en tu perfil completo, hemos analizado la mejor metodología para ti
            </DialogDescription>
          </DialogHeader>

          {aiRecommendation && (
            <div className="space-y-6">
              {/* Análisis del Usuario */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <User className="w-5 h-5 mr-2 text-blue-400" />
                    Análisis de tu Perfil
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-gray-400">Experiencia:</span>
                      <span className="text-white ml-2">{aiRecommendation.analysis.yearsTraining} años</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Nivel:</span>
                      <span className="text-white ml-2">{aiRecommendation.analysis.currentLevel}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Objetivo:</span>
                      <span className="text-white ml-2">{aiRecommendation.analysis.goal}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Limitaciones:</span>
                      <span className="text-white ml-2">{aiRecommendation.analysis.injuries}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recomendación */}
              <Card className="bg-gradient-to-r from-yellow-400/10 to-yellow-600/10 border-yellow-400/40">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center">
                    <Target className="w-5 h-5 mr-2 text-yellow-400" />
                    Metodología Recomendada
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-4 mb-4">
                    {aiRecommendation.methodology.icon && (
                      <aiRecommendation.methodology.icon className="w-12 h-12 text-yellow-400" />
                    )}
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {aiRecommendation.methodology.name}
                      </h3>
                      <p className="text-gray-300">{aiRecommendation.methodology.description}</p>
                    </div>
                  </div>

                  <div className="bg-gray-800 rounded-lg p-4 mb-4">
                    <p className="text-white font-semibold mb-2">
                      {currentUser?.nombre || 'Usuario'}, {aiRecommendation.reason}
                    </p>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Duración:</span>
                        <span className="text-white ml-2">{aiRecommendation.methodology.programDuration}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Frecuencia:</span>
                        <span className="text-white ml-2">{aiRecommendation.methodology.frequency}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <DialogFooter className="flex space-x-4">
            <Button
              onClick={() => setShowRecommendationModal(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Seleccionar Manualmente
            </Button>
            <Button
              onClick={acceptAIRecommendation}
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Aceptar Recomendación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Selección Manual */}
      <Dialog open={showManualSelectionModal} onOpenChange={setShowManualSelectionModal}>
        <DialogContent className="max-w-2xl bg-gray-900 border-yellow-400/20">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center">
              <User className="w-6 h-6 mr-2 text-yellow-400" />
              Selección Manual de Metodología
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Has elegido {pendingMethodology?.name}. Confirma tu selección para comenzar.
            </DialogDescription>
          </DialogHeader>

          {pendingMethodology && (
            <div className="space-y-6">
              {/* Información de la metodología */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    {pendingMethodology.icon && React.createElement(pendingMethodology.icon, { className: "w-8 h-8 text-yellow-400" })}
                    <div>
                      <CardTitle className="text-white text-xl">{pendingMethodology.name}</CardTitle>
                      <CardDescription className="text-gray-400">{pendingMethodology.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Nivel:</span>
                      <p className="text-white font-medium">{pendingMethodology.level}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Frecuencia:</span>
                      <p className="text-white font-medium">{pendingMethodology.frequency}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Volumen:</span>
                      <p className="text-white font-medium">{pendingMethodology.volume}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Intensidad:</span>
                      <p className="text-white font-medium">{pendingMethodology.intensity}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Mensaje de confirmación */}
              <div className="text-center p-4 bg-green-400/10 border border-green-400/40 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-green-400 font-bold">¡Excelente elección!</p>
                <p className="text-gray-300 text-sm">
                  {pendingMethodology.name} se adapta perfectamente a tus objetivos de entrenamiento.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex space-x-4">
            <Button
              onClick={() => {
                setShowManualSelectionModal(false);
                setPendingMethodology(null);
              }}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmManualSelection}
              className="bg-yellow-400 text-black hover:bg-yellow-300 font-semibold"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Confirmar Selección
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// Enhanced Routines Screen
const RoutinesScreen = () => {
  const [showDifficultyModal, setShowDifficultyModal] = useState(false)
  const [difficultyFeedback, setDifficultyFeedback] = useState(null)
  const [selectedDayForFeedback, setSelectedDayForFeedback] = useState(null)
  const [showDayDetailModal, setShowDayDetailModal] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null)
  const [exerciseProgress, setExerciseProgress] = useState({})
  const [notification, setNotification] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const { metodologiaActiva, userData, updateUserData } = useUserContext()

  // Update routine when methodology changes
  useEffect(() => {
    if (metodologiaActiva && metodologiaActiva.metodologia) {
      // Regenerate routine when methodology changes
      const newRoutine = generateWeeklyRoutine()
      // Save to user data if needed
      updateUserData({
        currentWeeklyRoutine: newRoutine,
        lastRoutineUpdate: new Date().toISOString()
      })
    }
  }, [metodologiaActiva?.metodologia?.name])

  // If no methodology is selected, show message
  if (!metodologiaActiva || !metodologiaActiva.metodologia) {
    return (
      <div className="min-h-screen bg-black text-white p-6 pb-24">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400">Rutinas de Entrenamiento</h1>
        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-8 text-center">
            <Dumbbell className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No hay metodología seleccionada</h2>
            <p className="text-gray-400 mb-4">
              Primero debes seleccionar una metodología de entrenamiento en la sección de Metodologías.
            </p>
            <Button
              onClick={() => window.location.href = '/methodologies'}
              className="bg-yellow-400 text-black hover:bg-yellow-300"
            >
              Ir a Metodologías
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get methodology info
  const methodology = metodologiaActiva.metodologia
  const methodologyName = methodology.name || 'Metodología Personalizada'

  // Initialize weekly progress
  const weeklyProgress = userData.weeklyProgress || {
    completed: 2,
    pending: 2,
    adherence: 85,
    weightProgress: '+5kg'
  }

  // Generate weekly routine based on methodology
  const generateWeeklyRoutine = () => {
    const today = new Date()
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()))
    const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']

    // Get saved progress or initialize
    const savedProgress = userData.weeklyProgress || {}

    // Define methodology-specific routines
    const methodologyRoutines = {
      'Heavy Duty': {
        pattern: [
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Tren Superior - Push', exercises: ['Press de Banca', 'Press Militar', 'Fondos'] },
          { type: 'Tren Inferior', exercises: ['Sentadillas', 'Peso Muerto'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Tren Superior - Pull', exercises: ['Remo con Barra', 'Dominadas'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] }
        ]
      },
      'Push Pull Legs': {
        pattern: [
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Push', exercises: ['Press de Banca', 'Press Militar', 'Fondos', 'Extensiones'] },
          { type: 'Pull', exercises: ['Remo', 'Dominadas', 'Curl Bíceps', 'Face Pulls'] },
          { type: 'Legs', exercises: ['Sentadillas', 'Peso Muerto', 'Prensa', 'Gemelos'] },
          { type: 'Push', exercises: ['Press Inclinado', 'Press Arnold', 'Dips', 'Laterales'] },
          { type: 'Pull', exercises: ['Remo T-Bar', 'Pulldowns', 'Hammer Curls', 'Encogimientos'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] }
        ]
      },
      'Full Body': {
        pattern: [
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Full Body A', exercises: ['Sentadillas', 'Press de Banca', 'Remo', 'Press Militar'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Full Body B', exercises: ['Peso Muerto', 'Press Inclinado', 'Dominadas', 'Fondos'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] },
          { type: 'Full Body C', exercises: ['Prensa', 'Remo T-Bar', 'Press Arnold', 'Curl Bíceps'] },
          { type: 'Descanso', exercises: ['Recuperación activa'] }
        ]
      }
    }

    // Get the routine pattern for the selected methodology
    const routinePattern = methodologyRoutines[methodology.name] || methodologyRoutines['Heavy Duty']

    return Array.from({ length: 7 }, (_, i) => {
      const date = new Date(startOfWeek.getTime() + i * 86400000)
      const dayPattern = routinePattern.pattern[i]
      const isRestDay = dayPattern.type === 'Descanso'
      const isToday = date.toDateString() === new Date().toDateString()

      // Determine status based on date and saved progress
      let status = 'pending'
      const dayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`

      if (savedProgress[dayKey]) {
        status = savedProgress[dayKey].status
      } else if (isRestDay && date < new Date()) {
        status = 'rest'
      } else if (date < new Date() && !isRestDay) {
        status = 'missed'
      } else if (isToday && !isRestDay) {
        status = 'pending'
      } else if (isRestDay) {
        status = 'rest'
      }

      // Mock completion data - in real app this would come from user data
      const mockCompleted = status === 'completed' ? dayPattern.exercises.length :
                           status === 'in-progress' ? Math.floor(dayPattern.exercises.length / 2) : 0

      return {
        id: dayNames[i].toLowerCase(),
        dayName: dayNames[i],
        dayNumber: date.getDate(),
        date: date.toISOString().split('T')[0],
        isToday,
        type: dayPattern.type,
        exercises: dayPattern.exercises,
        exerciseCount: isRestDay ? 0 : dayPattern.exercises.length,
        completed: mockCompleted,
        total: isRestDay ? 0 : dayPattern.exercises.length,
        status
      }
    })
  }

  const weeklyRoutine = generateWeeklyRoutine()

  // Function to handle exercise completion feedback
  const handleExerciseCompletion = (dayId, difficulty) => {
    if (difficulty === 'too_easy' || difficulty === 'too_hard') {
      setSelectedDayForFeedback(dayId)
      setDifficultyFeedback(difficulty)
      setShowDifficultyModal(true)
    }
  }

  // Function to show notifications
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type })
    setTimeout(() => setNotification(null), 3000)
  }

  // Function to handle day card click
  const handleDayClick = (day) => {
    setSelectedDay(day)
    setShowDayDetailModal(true)
  }

  // Function to handle individual exercise completion
  const handleExerciseComplete = (dayId, exerciseIndex, difficulty = 'normal') => {
    const dayKey = `${dayId}-${new Date().toISOString().split('T')[0]}`
    const exerciseKey = `${dayKey}-${exerciseIndex}`

    // Update exercise progress
    setExerciseProgress(prev => ({
      ...prev,
      [exerciseKey]: {
        completed: true,
        difficulty,
        completedAt: new Date().toISOString()
      }
    }))

    // Update day progress
    const day = weeklyRoutine.find(d => d.id === dayId)
    if (day) {
      const completedExercises = Object.keys(exerciseProgress).filter(key =>
        key.startsWith(dayKey) && exerciseProgress[key].completed
      ).length + 1 // +1 for the current exercise

      // Update the day's completion status
      if (completedExercises >= day.total) {
        // Day completed
        showNotification('¡Día de entrenamiento completado! 🎉', 'success')

        // Check if we need AI assessment
        const difficulties = Object.values(exerciseProgress)
          .filter(ex => ex.completedAt && new Date(ex.completedAt).toDateString() === new Date().toDateString())
          .map(ex => ex.difficulty)

        const tooHardCount = difficulties.filter(d => d === 'too_hard').length
        const tooEasyCount = difficulties.filter(d => d === 'too_easy').length

        if (tooHardCount >= 2 || tooEasyCount >= 2) {
          // Trigger AI difficulty assessment
          setTimeout(() => {
            handleExerciseCompletion(dayId, tooHardCount >= 2 ? 'too_hard' : 'too_easy')
          }, 1500) // Delay to show completion notification first
        }
      } else {
        // Exercise completed
        const exerciseName = day.exercises[exerciseIndex] || 'Ejercicio'
        showNotification(`✓ ${exerciseName} completado`, 'success')
      }
    }

    // Save to user data
    updateUserData({
      exerciseProgress: {
        ...exerciseProgress,
        [exerciseKey]: {
          completed: true,
          difficulty,
          completedAt: new Date().toISOString()
        }
      }
    })
  }

  // Function to start a workout day
  const startWorkoutDay = (dayId) => {
    const updatedRoutine = weeklyRoutine.map(day => {
      if (day.id === dayId) {
        return { ...day, status: 'in-progress' }
      }
      return day
    })

    updateUserData({
      currentWeeklyRoutine: updatedRoutine,
      workoutStarted: {
        dayId,
        startTime: new Date().toISOString()
      }
    })
  }

  // Function to complete a workout day
  const completeWorkoutDay = (dayId) => {
    const updatedRoutine = weeklyRoutine.map(day => {
      if (day.id === dayId) {
        return { ...day, status: 'completed', completed: day.total }
      }
      return day
    })

    updateUserData({
      currentWeeklyRoutine: updatedRoutine,
      workoutCompleted: {
        dayId,
        completedTime: new Date().toISOString()
      }
    })
  }

  // Auto-generate exercise progression based on user performance
  const generateExerciseProgression = (baseExercises, weekNumber, userPerformance) => {
    return baseExercises.map(exercise => {
      let adjustedWeight = exercise.baseWeight || 50
      let adjustedReps = exercise.baseReps || 8
      let adjustedSets = exercise.baseSets || 3

      // Adjust based on user performance and week progression
      if (userPerformance === 'too_easy') {
        adjustedWeight += 5 * weekNumber
        adjustedReps = Math.min(adjustedReps + 1, 12)
      } else if (userPerformance === 'too_hard') {
        adjustedWeight = Math.max(adjustedWeight - 2.5, exercise.baseWeight * 0.8)
        adjustedReps = Math.max(adjustedReps - 1, 6)
      } else {
        // Normal progression
        adjustedWeight += 2.5 * weekNumber
      }

      return {
        ...exercise,
        weight: `${adjustedWeight}kg`,
        reps: `${adjustedReps}`,
        sets: adjustedSets
      }
    })
  }

  // AI Analysis function for difficulty assessment
  const analyzeUserPerformance = async (exerciseData, userFeedback) => {
    try {
      // Import the API function dynamically (temporarily disabled)
      // const { mockAnalyzePerformanceAPI } = await import('./api/analyze-performance.js')

      // Temporarily use fallback logic directly
      return {
        shouldAdjust: userFeedback === 'too_easy' || userFeedback === 'too_hard',
        recommendation: userFeedback === 'too_easy' ? 'increase' : 'decrease',
        confidence: 0.8,
        suggestions: {
          weight: userFeedback === 'too_easy' ? '+2.5kg' : '-2.5kg',
          reps: userFeedback === 'too_easy' ? '+1' : '-1',
          sets: '0',
          rest: '0s'
        },
        reasoning: 'Análisis automático basado en feedback del usuario'
      }
    } catch (error) {
      console.error('Error analyzing performance:', error)
      // Fallback to simple logic if API fails
      return {
        shouldAdjust: userFeedback === 'too_easy' || userFeedback === 'too_hard',
        recommendation: userFeedback === 'too_easy' ? 'increase' : 'decrease',
        confidence: 0.7,
        suggestions: {
          weight: userFeedback === 'too_easy' ? '+2.5kg' : '-2.5kg',
          reps: userFeedback === 'too_easy' ? '+1' : '-1',
          sets: '0',
          rest: '0s'
        },
        reasoning: 'Análisis básico basado en feedback del usuario'
      }
    }
  }

  // Function to apply difficulty adjustments
  const applyDifficultyAdjustment = async (shouldApply) => {
    if (!shouldApply) {
      setShowDifficultyModal(false)
      return
    }

    setIsAnalyzing(true)
    showNotification('Analizando tu rendimiento con IA...', 'info')

    try {
      // Get AI analysis first
      const selectedDay = weeklyRoutine.find(day => day.id === selectedDayForFeedback)
      const analysis = await analyzeUserPerformance(selectedDay, difficultyFeedback)

      if (analysis.shouldAdjust) {
        const updatedRoutine = weeklyRoutine.map(day => {
          // Apply adjustments to remaining days of the week
          if (new Date(day.date) >= new Date()) {
            const adjustedExercises = generateExerciseProgression(
              day.exercises,
              1,
              difficultyFeedback
            )
            return {
              ...day,
              exercises: adjustedExercises,
              adjusted: true,
              aiAnalysis: analysis
            }
          }
          return day
        })

        // Save updated routine
        updateUserData({
          weeklyRoutine: updatedRoutine,
          lastAdjustment: new Date().toISOString(),
          aiRecommendations: analysis
        })

        // Show success message
        showNotification(
          `✓ Rutina ajustada: ${analysis.suggestions.weight} en peso, ${analysis.suggestions.reps} en repeticiones`,
          'success'
        )
      } else {
        showNotification('La IA recomienda mantener la dificultad actual', 'info')
      }
    } catch (error) {
      console.error('Error applying difficulty adjustment:', error)
      showNotification('Error al analizar el rendimiento. Inténtalo de nuevo.', 'error')
    }

    setIsAnalyzing(false)
    setShowDifficultyModal(false)
  }

  // Difficulty Adjustment Modal Component
  const DifficultyModal = () => {
    if (!showDifficultyModal) return null

    return (
      <Dialog open={showDifficultyModal} onOpenChange={setShowDifficultyModal}>
        <DialogContent className="max-w-md mx-4 bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl text-yellow-400">
              Ajuste de Dificultad
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <p className="text-gray-300">
              {difficultyFeedback === 'too_hard'
                ? 'Hemos detectado que los ejercicios te están resultando muy difíciles.'
                : 'Hemos detectado que los ejercicios te están resultando muy fáciles.'
              }
            </p>
            <p className="text-white font-medium">
              ¿Quieres {difficultyFeedback === 'too_hard' ? 'bajar' : 'subir'} el nivel de dificultad para el resto de la semana?
            </p>

            <div className="flex space-x-2">
              <Button
                className="flex-1 bg-yellow-400 text-black hover:bg-yellow-300"
                onClick={() => applyDifficultyAdjustment(true)}
                disabled={isAnalyzing}
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin mr-2"></div>
                    Analizando...
                  </>
                ) : (
                  'Sí, ajustar'
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  setShowDifficultyModal(false)
                }}
                disabled={isAnalyzing}
              >
                No, estoy bien
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Day Detail Modal Component
  const DayDetailModal = () => {
    if (!showDayDetailModal || !selectedDay) return null

    const getDetailedExercises = (day) => {
      // Generate detailed exercise information based on methodology and day type
      const baseExercises = {
        'Tren Superior - Push': [
          { name: 'Press de Banca', sets: 4, reps: '6-8', weight: '70kg', restTime: '3-4 min', muscleGroup: 'Pecho' },
          { name: 'Press Militar', sets: 3, reps: '8-10', weight: '45kg', restTime: '2-3 min', muscleGroup: 'Hombros' },
          { name: 'Fondos en Paralelas', sets: 3, reps: '12-15', weight: 'Corporal', restTime: '2 min', muscleGroup: 'Tríceps' }
        ],
        'Tren Inferior': [
          { name: 'Sentadillas', sets: 4, reps: '8-10', weight: '80kg', restTime: '3-4 min', muscleGroup: 'Cuádriceps' },
          { name: 'Peso Muerto', sets: 3, reps: '5', weight: '100kg', restTime: '4-5 min', muscleGroup: 'Isquiotibiales' }
        ],
        'Tren Superior - Pull': [
          { name: 'Remo con Barra', sets: 4, reps: '8-10', weight: '60kg', restTime: '3 min', muscleGroup: 'Espalda' },
          { name: 'Dominadas', sets: 3, reps: '6-8', weight: 'Corporal', restTime: '3 min', muscleGroup: 'Dorsales' }
        ],
        'Push': [
          { name: 'Press de Banca', sets: 4, reps: '8-10', weight: '70kg', restTime: '3 min', muscleGroup: 'Pecho' },
          { name: 'Press Militar', sets: 3, reps: '10-12', weight: '45kg', restTime: '2 min', muscleGroup: 'Hombros' },
          { name: 'Fondos', sets: 3, reps: '12-15', weight: 'Corporal', restTime: '2 min', muscleGroup: 'Tríceps' },
          { name: 'Extensiones de Tríceps', sets: 3, reps: '12-15', weight: '20kg', restTime: '90s', muscleGroup: 'Tríceps' }
        ],
        'Pull': [
          { name: 'Remo', sets: 4, reps: '8-10', weight: '60kg', restTime: '3 min', muscleGroup: 'Espalda' },
          { name: 'Dominadas', sets: 3, reps: '6-8', weight: 'Corporal', restTime: '3 min', muscleGroup: 'Dorsales' },
          { name: 'Curl Bíceps', sets: 3, reps: '10-12', weight: '15kg', restTime: '90s', muscleGroup: 'Bíceps' },
          { name: 'Face Pulls', sets: 3, reps: '15-20', weight: '25kg', restTime: '90s', muscleGroup: 'Hombros Posteriores' }
        ],
        'Legs': [
          { name: 'Sentadillas', sets: 4, reps: '8-10', weight: '80kg', restTime: '3-4 min', muscleGroup: 'Cuádriceps' },
          { name: 'Peso Muerto', sets: 3, reps: '5', weight: '100kg', restTime: '4-5 min', muscleGroup: 'Isquiotibiales' },
          { name: 'Prensa', sets: 3, reps: '12-15', weight: '120kg', restTime: '2-3 min', muscleGroup: 'Cuádriceps' },
          { name: 'Gemelos', sets: 4, reps: '15-20', weight: '60kg', restTime: '90s', muscleGroup: 'Gemelos' }
        ]
      }

      return baseExercises[day.type] || []
    }

    const detailedExercises = getDetailedExercises(selectedDay)

    return (
      <Dialog open={showDayDetailModal} onOpenChange={setShowDayDetailModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-gray-900 border-yellow-400/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-2xl text-yellow-400 flex items-center justify-between">
              <span>
                {selectedDay.dayName} {selectedDay.dayNumber}
                {selectedDay.isToday && (
                  <Badge className="ml-2 bg-yellow-400 text-black">Hoy</Badge>
                )}
              </span>
              <div className="flex items-center space-x-2">
                {selectedDay.status === 'completed' && (
                  <CheckCircle className="w-6 h-6 text-green-400" />
                )}
                {selectedDay.status === 'in-progress' && (
                  <Clock className="w-6 h-6 text-blue-400" />
                )}
                {selectedDay.status === 'pending' && (
                  <Circle className="w-6 h-6 text-gray-400" />
                )}
                {selectedDay.status === 'missed' && (
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                )}
                {selectedDay.status === 'rest' && (
                  <Heart className="w-6 h-6 text-purple-400" />
                )}
              </div>
            </DialogTitle>
            <div className="text-gray-400">
              {selectedDay.type}
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {selectedDay.status === 'rest' ? (
              <div className="text-center py-8">
                <Heart className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-purple-300 mb-2">Día de Descanso</h3>
                <p className="text-gray-400 mb-4">
                  Hoy es importante descansar para permitir la recuperación muscular
                </p>
                <div className="bg-purple-900/20 border border-purple-400/20 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-300 mb-2">Actividades Recomendadas:</h4>
                  <ul className="text-sm text-gray-300 space-y-1">
                    <li>• Caminata ligera (20-30 min)</li>
                    <li>• Estiramientos suaves</li>
                    <li>• Yoga o meditación</li>
                    <li>• Hidratación adecuada</li>
                    <li>• Sueño de calidad (7-9 horas)</li>
                  </ul>
                </div>
              </div>
            ) : (
              <>
                {/* Progress Summary */}
                <div className="bg-gray-800 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-semibold text-white">Progreso del Día</h3>
                    <span className="text-yellow-400 font-medium">
                      {selectedDay.completed}/{selectedDay.total} completados
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-3">
                    <div
                      className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${selectedDay.total > 0 ? (selectedDay.completed / selectedDay.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">Ejercicios del Día</h3>
                  {detailedExercises.map((exercise, index) => {
                    const dayKey = `${selectedDay.id}-${new Date().toISOString().split('T')[0]}`
                    const exerciseKey = `${dayKey}-${index}`
                    const isCompleted = exerciseProgress[exerciseKey]?.completed || index < selectedDay.completed

                    return (
                      <div key={index} className={`bg-gray-800 rounded-lg p-4 border transition-all ${
                        isCompleted ? 'border-green-400/50 bg-green-900/10' : 'border-gray-700'
                      }`}>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex-1">
                            <h4 className={`font-semibold text-lg ${isCompleted ? 'text-green-300' : 'text-white'}`}>
                              {exercise.name}
                            </h4>
                            <p className="text-gray-400 text-sm">{exercise.muscleGroup}</p>
                          </div>
                          <div className="text-right flex items-center space-x-2">
                            <div className="text-yellow-400 font-bold text-lg">{exercise.weight}</div>
                            {isCompleted && (
                              <CheckCircle className="w-5 h-5 text-green-400" />
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                          <div>
                            <span className="text-gray-400">Series:</span>
                            <div className="text-white font-medium">{exercise.sets}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Reps:</span>
                            <div className="text-white font-medium">{exercise.reps}</div>
                          </div>
                          <div>
                            <span className="text-gray-400">Descanso:</span>
                            <div className="text-white font-medium">{exercise.restTime}</div>
                          </div>
                        </div>

                        {/* Exercise Action Buttons */}
                        {selectedDay.status === 'in-progress' && !isCompleted && (
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => handleExerciseComplete(selectedDay.id, index, 'normal')}
                            >
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-blue-400 text-blue-400 hover:bg-blue-400/10"
                              onClick={() => handleExerciseComplete(selectedDay.id, index, 'too_easy')}
                            >
                              Muy Fácil
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-orange-400 text-orange-400 hover:bg-orange-400/10"
                              onClick={() => handleExerciseComplete(selectedDay.id, index, 'too_hard')}
                            >
                              Muy Difícil
                            </Button>
                          </div>
                        )}

                        {isCompleted && exerciseProgress[exerciseKey] && (
                          <div className="text-xs text-green-400 mt-2">
                            ✓ Completado {exerciseProgress[exerciseKey].difficulty !== 'normal' &&
                              `(${exerciseProgress[exerciseKey].difficulty === 'too_easy' ? 'Muy fácil' : 'Muy difícil'})`}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </>
            )}

            {/* Action Buttons */}
            {selectedDay.status !== 'rest' && (
              <div className="flex space-x-3">
                {selectedDay.status === 'pending' && (
                  <Button
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    onClick={() => {
                      startWorkoutDay(selectedDay.id)
                      setShowDayDetailModal(false)
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Iniciar Entrenamiento
                  </Button>
                )}
                {selectedDay.status === 'in-progress' && (
                  <>
                    <Button
                      className="flex-1 bg-yellow-600 hover:bg-yellow-700"
                      onClick={() => {
                        completeWorkoutDay(selectedDay.id)
                        setShowDayDetailModal(false)
                      }}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Completar Todo
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-orange-400 text-orange-400 hover:bg-orange-400/10"
                      onClick={() => {
                        setSelectedDayForFeedback(selectedDay.id)
                        setDifficultyFeedback('too_hard')
                        setShowDayDetailModal(false)
                        setShowDifficultyModal(true)
                      }}
                    >
                      <AlertTriangle className="w-4 h-4 mr-2" />
                      Muy Difícil
                    </Button>
                  </>
                )}
                {selectedDay.status === 'completed' && (
                  <Button
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    onClick={() => {
                      setShowDayDetailModal(false)
                    }}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    Ver Historial
                  </Button>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-yellow-400">Rutinas de Entrenamiento</h1>
        <p className="text-gray-400 mt-1">
          Tu plan de entrenamiento personalizado basado en {methodologyName}
        </p>
      </div>

      {/* Weekly Summary */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardHeader>
          <CardTitle className="text-white text-lg">Resumen de la Semana</CardTitle>
          <CardDescription className="text-gray-400">Progreso actual de tu rutina semanal</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{weeklyProgress.completed}</div>
              <div className="text-sm text-green-300">Días Completados</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-400">{weeklyProgress.pending}</div>
              <div className="text-sm text-blue-300">Días Pendientes</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{weeklyProgress.adherence}%</div>
              <div className="text-sm text-purple-300">Adherencia</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{weeklyProgress.weightProgress}</div>
              <div className="text-sm text-yellow-300">Progreso Medio</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Day Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {weeklyRoutine.map((day) => {
          const getStatusIcon = (status) => {
            switch (status) {
              case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-400" />
              case 'in-progress':
                return <Clock className="w-5 h-5 text-blue-400" />
              case 'pending':
                return <Circle className="w-5 h-5 text-gray-400" />
              case 'missed':
                return <AlertTriangle className="w-5 h-5 text-red-400" />
              case 'rest':
                return <Heart className="w-5 h-5 text-purple-400" />
              default:
                return <Circle className="w-5 h-5 text-gray-400" />
            }
          }

          const getStatusColor = (status) => {
            switch (status) {
              case 'completed':
                return 'border-green-400/50 bg-green-900/20'
              case 'in-progress':
                return 'border-blue-400/50 bg-blue-900/20'
              case 'pending':
                return 'border-gray-600 bg-gray-800'
              case 'missed':
                return 'border-red-400/50 bg-red-900/20'
              case 'rest':
                return 'border-purple-400/50 bg-purple-900/20'
              default:
                return 'border-gray-600 bg-gray-800'
            }
          }

          return (
            <Card
              key={day.id}
              className={`${getStatusColor(day.status)} border transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer transform ${
                day.isToday ? 'ring-2 ring-yellow-400 shadow-yellow-400/20' : ''
              } ${day.status === 'completed' ? 'animate-pulse-once' : ''}`}
              onClick={() => handleDayClick(day)}
              style={{
                animationDelay: `${day.id === 'monday' ? 0 : day.id === 'tuesday' ? 100 : day.id === 'wednesday' ? 200 : day.id === 'thursday' ? 300 : day.id === 'friday' ? 400 : day.id === 'saturday' ? 500 : 600}ms`
              }}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-white font-semibold">
                      {day.dayName} {day.dayNumber}
                      {day.isToday && (
                        <Badge className="ml-2 bg-yellow-400 text-black text-xs">Hoy</Badge>
                      )}
                    </h3>
                    <p className="text-gray-400 text-sm">{day.type}</p>
                  </div>
                  <div className="flex flex-col items-end">
                    {getStatusIcon(day.status)}
                  </div>
                </div>

                {/* Exercise List */}
                <div className="space-y-1 mb-3">
                  {day.exercises.slice(0, 3).map((exercise, idx) => (
                    <p key={idx} className="text-gray-300 text-sm">
                      {exercise}
                    </p>
                  ))}
                  {day.exercises.length > 3 && (
                    <p className="text-gray-500 text-xs">
                      +{day.exercises.length - 3} más...
                    </p>
                  )}
                </div>

                {/* Exercise Count and Progress */}
                {day.status !== 'rest' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">{day.exerciseCount} ejercicios</span>
                      <span className="text-yellow-400 font-medium">
                        {day.completed}/{day.total} completados
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${day.total > 0 ? (day.completed / day.total) * 100 : 0}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {day.status === 'rest' && (
                  <div className="text-center py-2">
                    <p className="text-purple-300 text-sm">Día de descanso</p>
                    <p className="text-gray-500 text-xs">Recuperación activa</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Notification System */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg animate-in slide-in-from-right duration-300 ${
          notification.type === 'success' ? 'bg-green-600 text-white' :
          notification.type === 'error' ? 'bg-red-600 text-white' :
          notification.type === 'info' ? 'bg-blue-600 text-white' :
          'bg-gray-600 text-white'
        }`}>
          <div className="flex items-center space-x-2">
            {notification.type === 'success' && <CheckCircle className="w-4 h-4" />}
            {notification.type === 'error' && <AlertTriangle className="w-4 h-4" />}
            {notification.type === 'info' && <Clock className="w-4 h-4" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Modals */}
      <DifficultyModal />
      <DayDetailModal />
    </div>
  )
}

// Nutrition Screen component is now in separate file


// Injuries Screen component is now in separate file


// Progress Screen component is now in separate file





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

// Componente principal de la aplicación con autenticación
const AppContent = () => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  // Mostrar loading mientras se verifica la autenticación
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando MindFit...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario logueado, mostrar página de login o registro
  if (!currentUser) {
    if (location.pathname === '/register') {
      return <InitialProfileForm />;
    }
    return <LoginPage />;
  }

  // Si hay usuario logueado, mostrar la aplicación principal
  return (
    <UserProvider>
      <div className="App">
        <UserProfile />
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
          <Route path="/openai-test" element={<OpenAITest />} />
        </Routes>
        <Navigation />
        <MusicBubble />
      </div>
    </UserProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App


