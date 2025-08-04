import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserContext } from '../contexts/UserContext';
import { 
  TrendingUp, 
  BarChart3, 
  Target,
  Activity,
  Zap,
  Trophy
} from 'lucide-react';

const ProgressScreen = () => {
  const [activeProgressTab, setActiveProgressTab] = useState('overview');
  const { userData } = useUserContext();
  
  // Usar datos dinámicos del usuario actual
  const progresoUsuario = userData.progreso || {};

  const progressData = {
    overview: progresoUsuario.overview || {
      weightChange: { value: 0, unit: 'kg', trend: 'stable', target: 0 },
      bodyFatChange: { value: 0, unit: '%', trend: 'stable', target: 0 },
      muscleGain: { value: 0, unit: 'kg', trend: 'stable', target: 0 },
      strengthGain: { value: 0, unit: '%', trend: 'stable', target: 0 }
    },
    weeklyMetrics: progresoUsuario.weeklyMetrics || {
      workouts: { completed: 0, planned: 0, consistency: 0 },
      calories: { average: 0, target: 0, adherence: 0 },
      sleep: { average: 0, target: 0, quality: 'No registrado' },
      recovery: { score: 0, status: 'No evaluado' }
    },
    strengthProgress: progresoUsuario.strengthProgress || [],
    bodyMetrics: progresoUsuario.bodyMetrics || { measurements: [] }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '↗️';
      case 'down': return '↘️';
      case 'excellent': return '🚀';
      case 'good': return '✅';
      default: return '➡️';
    }
  };

  const getTrendColor = (trend) => {
    switch(trend) {
      case 'up':
      case 'excellent': return 'text-green-400';
      case 'good': return 'text-blue-400';
      case 'down': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Progreso y Análisis - {userData.nombre}
      </h1>
      
      {/* Información general del usuario */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{progresoUsuario.diasActivo || 0}</p>
              <p className="text-gray-400 text-sm">Días Activo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{progresoUsuario.rachaActual || 0}</p>
              <p className="text-gray-400 text-sm">Racha Actual</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{progresoUsuario.pesoInicial || 0}→{progresoUsuario.pesoActual || 0}kg</p>
              <p className="text-gray-400 text-sm">Peso</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400 capitalize">{userData.nivel}</p>
              <p className="text-gray-400 text-sm">Nivel</p>
            </div>
          </div>
          
          {/* Estado general */}
          <div className="mt-4 text-center">
            <p className="text-gray-400 text-sm">Estado General:</p>
            <p className="text-white font-medium">{progresoUsuario.fuerzaGeneral} • {progresoUsuario.motivacion} motivación</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeProgressTab} onValueChange={setActiveProgressTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="strength" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Fuerza
          </TabsTrigger>
          <TabsTrigger value="body" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Medidas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(progressData.overview).map(([key, data]) => (
              <Card key={key} className="bg-gray-900 border-yellow-400/20">
                <CardHeader>
                  <CardTitle className="text-white text-lg">
                    {key === 'weightChange' ? 'Cambio de Peso' :
                     key === 'bodyFatChange' ? 'Grasa Corporal' :
                     key === 'muscleGain' ? 'Ganancia Muscular' :
                     'Ganancia de Fuerza'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-3xl font-bold ${getTrendColor(data.trend)}`}>
                        {data.value > 0 ? '+' : ''}{data.value}{data.unit}
                      </p>
                      <p className="text-gray-400 text-sm">
                        Objetivo: {data.target > 0 ? '+' : ''}{data.target}{data.unit}
                      </p>
                    </div>
                    <div className="text-4xl">
                      {getTrendIcon(data.trend)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Métricas semanales */}
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <BarChart3 className="w-5 h-5 mr-2 text-yellow-400" />
                Métricas Semanales
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Entrenamientos</span>
                      <span className="text-white">{progressData.weeklyMetrics.workouts.completed}/{progressData.weeklyMetrics.workouts.planned}</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-green-400"
                        style={{ width: `${progressData.weeklyMetrics.workouts.consistency}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-400">Adherencia Calórica</span>
                      <span className="text-white">{progressData.weeklyMetrics.calories.adherence}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className="h-2 rounded-full bg-blue-400"
                        style={{ width: `${progressData.weeklyMetrics.calories.adherence}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <span className="text-gray-400">Sueño Promedio:</span>
                    <span className="text-white ml-2">{progressData.weeklyMetrics.sleep.average}h</span>
                    <Badge className="ml-2 bg-blue-400/20 text-blue-400">
                      {progressData.weeklyMetrics.sleep.quality}
                    </Badge>
                  </div>
                  
                  <div>
                    <span className="text-gray-400">Recuperación:</span>
                    <span className="text-white ml-2">{progressData.weeklyMetrics.recovery.score}/100</span>
                    <Badge className="ml-2 bg-green-400/20 text-green-400">
                      {progressData.weeklyMetrics.recovery.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strength" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-yellow-400" />
                Progreso de Fuerza
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressData.strengthProgress.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay datos de progreso de fuerza registrados.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {progressData.strengthProgress.map((exercise, idx) => (
                    <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="text-white font-semibold">{exercise.exercise}</h3>
                        <Badge className={`${getTrendColor(exercise.trend)} bg-opacity-20`}>
                          {getTrendIcon(exercise.trend)} {exercise.change}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Anterior: {exercise.previous}</span>
                        <span className="text-white">Actual: {exercise.current}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="body" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Activity className="w-5 h-5 mr-2 text-yellow-400" />
                Medidas Corporales
              </CardTitle>
            </CardHeader>
            <CardContent>
              {progressData.bodyMetrics.measurements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay medidas corporales registradas.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {progressData.bodyMetrics.measurements.map((measurement, idx) => (
                    <div key={idx} className="p-4 bg-gray-800 rounded-lg">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-white font-semibold">{measurement.part}</h3>
                          <p className="text-gray-400 text-sm">Actual: {measurement.current}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={`${getTrendColor(measurement.trend)} bg-opacity-20`}>
                            {getTrendIcon(measurement.trend)} {measurement.change}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressScreen;
