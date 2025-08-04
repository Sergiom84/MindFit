import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserContext } from '../contexts/UserContext';
import PoseCamera from './PoseCamera';
import { 
  Video, 
  Brain, 
  Target,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings,
  Zap
} from 'lucide-react';

const VideoCorrectionScreen = () => {
  const [activeTab, setActiveTab] = useState('camera');
  const [selectedExercise, setSelectedExercise] = useState('Sentadilla');
  const [sessionHistory, setSessionHistory] = useState([]);
  const [aiSettings, setAiSettings] = useState({
    sensitivity: 'medium',
    feedback_type: 'visual_audio',
    analysis_frequency: 10
  });
  const { userData } = useUserContext();

  // Ejercicios disponibles basados en el perfil del usuario
  const availableExercises = [
    'Sentadilla',
    'Press de Banca',
    'Peso Muerto',
    'Press Militar',
    'Remo con Barra',
    'Dominadas'
  ];

  // Manejar datos de pose del componente PoseCamera
  const handlePoseData = (poseData) => {
    // Aquí puedes procesar los datos de pose en tiempo real
    console.log('Pose data received:', poseData);
  };

  // Manejar feedback de IA
  const handleAIFeedback = (feedback) => {
    const newSession = {
      id: Date.now(),
      exercise: selectedExercise,
      timestamp: new Date().toISOString(),
      feedback: feedback,
      user: userData.nombre
    };
    
    setSessionHistory(prev => [newSession, ...prev.slice(0, 9)]); // Mantener últimas 10 sesiones
  };

  // Enviar feedback a API (simulado)
  const sendFeedbackToAPI = async (metrics) => {
    try {
      // En producción, esto sería una llamada real a tu API
      const response = await fetch('/api/pose-feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          metrics,
          variablesPrompt: {
            usuario: userData.nombre,
            nivel: userData.nivel,
            objetivo: userData.objetivo,
            ejercicio_actual: selectedExercise
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.feedback;
      }
    } catch (error) {
      console.error('Error sending feedback to API:', error);
    }
    
    // Fallback con feedback simulado
    return `Análisis completado para ${selectedExercise}. Mantén la técnica y continúa progresando.`;
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Corrección por Video IA - {userData.nombre}
      </h1>

      {/* Información del usuario */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{sessionHistory.length}</p>
              <p className="text-gray-400 text-sm">Sesiones Analizadas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400 capitalize">{userData.nivel}</p>
              <p className="text-gray-400 text-sm">Nivel Actual</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{selectedExercise}</p>
              <p className="text-gray-400 text-sm">Ejercicio Activo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{aiSettings.sensitivity}</p>
              <p className="text-gray-400 text-sm">Sensibilidad IA</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="camera" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Video className="w-4 h-4 mr-2" />
            Cámara IA
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Activity className="w-4 h-4 mr-2" />
            Historial
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <TrendingUp className="w-4 h-4 mr-2" />
            Análisis
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            <Settings className="w-4 h-4 mr-2" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="camera" className="space-y-6">
          {/* Selector de ejercicio */}
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Target className="w-5 h-5 mr-2 text-yellow-400" />
                Seleccionar Ejercicio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {availableExercises.map((exercise) => (
                  <Button
                    key={exercise}
                    variant={selectedExercise === exercise ? "default" : "outline"}
                    className={`${
                      selectedExercise === exercise 
                        ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                        : 'border-gray-600 text-gray-300 hover:border-yellow-400 hover:text-yellow-400'
                    }`}
                    onClick={() => setSelectedExercise(exercise)}
                  >
                    {exercise}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Componente de cámara */}
          <PoseCamera 
            selectedExercise={selectedExercise}
            onPoseData={handlePoseData}
            onFeedback={handleAIFeedback}
          />
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                Historial de Sesiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sessionHistory.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay sesiones registradas aún.</p>
                  <p className="text-gray-500 text-sm mt-2">Inicia una sesión de análisis para ver tu historial.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {sessionHistory.map((session) => (
                    <div key={session.id} className="p-4 bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{session.exercise}</h3>
                          <p className="text-gray-400 text-sm">
                            {new Date(session.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <Badge className="bg-blue-500 text-white">
                          Completado
                        </Badge>
                      </div>
                      <div className="text-gray-300 text-sm whitespace-pre-line">
                        {session.feedback}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-yellow-400" />
                Análisis de Progreso
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Errores Más Comunes</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span className="text-gray-300">Rodillas hacia adentro</span>
                      <Badge className="bg-red-500 text-white">35%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span className="text-gray-300">Falta de profundidad</span>
                      <Badge className="bg-orange-500 text-white">28%</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 bg-gray-800 rounded">
                      <span className="text-gray-300">Espalda curvada</span>
                      <Badge className="bg-yellow-500 text-black">15%</Badge>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-white font-semibold">Mejoras Detectadas</h3>
                  <div className="space-y-2">
                    <div className="flex items-center p-2 bg-green-900/20 rounded border border-green-400/20">
                      <CheckCircle className="w-4 h-4 text-green-400 mr-2" />
                      <span className="text-green-300 text-sm">Técnica de sentadilla mejorada 23%</span>
                    </div>
                    <div className="flex items-center p-2 bg-blue-900/20 rounded border border-blue-400/20">
                      <TrendingUp className="w-4 h-4 text-blue-400 mr-2" />
                      <span className="text-blue-300 text-sm">Consistencia aumentada 18%</span>
                    </div>
                    <div className="flex items-center p-2 bg-purple-900/20 rounded border border-purple-400/20">
                      <Target className="w-4 h-4 text-purple-400 mr-2" />
                      <span className="text-purple-300 text-sm">Precisión general +12%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Settings className="w-5 h-5 mr-2 text-yellow-400" />
                Configuración de IA
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <label className="text-white font-semibold mb-3 block">Sensibilidad de Detección</label>
                  <div className="grid grid-cols-3 gap-3">
                    {['low', 'medium', 'high'].map((level) => (
                      <Button
                        key={level}
                        variant={aiSettings.sensitivity === level ? "default" : "outline"}
                        className={`${
                          aiSettings.sensitivity === level 
                            ? 'bg-yellow-400 text-black' 
                            : 'border-gray-600 text-gray-300'
                        }`}
                        onClick={() => setAiSettings(prev => ({ ...prev, sensitivity: level }))}
                      >
                        {level === 'low' ? 'Baja' : level === 'medium' ? 'Media' : 'Alta'}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-white font-semibold mb-3 block">Tipo de Feedback</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { key: 'visual', label: 'Solo Visual' },
                      { key: 'audio', label: 'Solo Audio' },
                      { key: 'haptic', label: 'Solo Vibración' },
                      { key: 'visual_audio', label: 'Visual + Audio' }
                    ].map((type) => (
                      <Button
                        key={type.key}
                        variant={aiSettings.feedback_type === type.key ? "default" : "outline"}
                        className={`${
                          aiSettings.feedback_type === type.key 
                            ? 'bg-yellow-400 text-black' 
                            : 'border-gray-600 text-gray-300'
                        }`}
                        onClick={() => setAiSettings(prev => ({ ...prev, feedback_type: type.key }))}
                      >
                        {type.label}
                      </Button>
                    ))}
                  </div>
                </div>

                <Alert className="border-blue-400 bg-blue-400/10">
                  <Zap className="w-4 h-4" />
                  <AlertDescription className="text-blue-300">
                    <strong>IA Adaptativa:</strong> El sistema aprende de tus patrones de movimiento y 
                    ajusta automáticamente la sensibilidad según tu progreso y nivel de experiencia.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default VideoCorrectionScreen;
