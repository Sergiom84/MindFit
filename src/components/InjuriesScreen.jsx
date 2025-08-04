import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserContext } from '../contexts/UserContext';
import { 
  Heart, 
  Activity, 
  CheckCircle, 
  AlertTriangle,
  Shield,
  TrendingUp
} from 'lucide-react';

const InjuriesScreen = () => {
  const [activeInjuryTab, setActiveInjuryTab] = useState('status');
  const { userData } = useUserContext();
  
  // Usar datos dinámicos del usuario actual
  const lesionesUsuario = userData.lesiones || {};

  // Crear datos dinámicos basados en el usuario
  const injuryData = {
    currentStatus: {
      active: lesionesUsuario.historial?.filter(l => l.estado === 'Activa').length || 0,
      recovering: lesionesUsuario.historial?.filter(l => l.estado === 'En recuperación').length || 0,
      riskFactors: lesionesUsuario.zonasVulnerables?.length || 0
    },
    history: lesionesUsuario.historial || [],
    riskFactors: lesionesUsuario.zonasVulnerables?.map(zona => ({
      factor: zona,
      risk: lesionesUsuario.riesgoActual || 'Bajo',
      impact: `Zona vulnerable identificada`,
      prevention: `Ejercicios preventivos específicos`,
      status: 'En seguimiento'
    })) || [],
    preventiveActions: lesionesUsuario.recomendaciones || []
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Prevención de Lesiones IA - {userData.nombre}
      </h1>

      {/* Información general del usuario */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{injuryData.currentStatus.active}</p>
              <p className="text-gray-400 text-sm">Lesiones Activas</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{injuryData.currentStatus.recovering}</p>
              <p className="text-gray-400 text-sm">En Recuperación</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{injuryData.currentStatus.riskFactors}</p>
              <p className="text-gray-400 text-sm">Zonas Vulnerables</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400 capitalize">{lesionesUsuario.riesgoActual || 'Bajo'}</p>
              <p className="text-gray-400 text-sm">Riesgo Actual</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeInjuryTab} onValueChange={setActiveInjuryTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="status" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Estado Actual
          </TabsTrigger>
          <TabsTrigger value="history" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Historial
          </TabsTrigger>
          <TabsTrigger value="prevention" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Prevención
          </TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Heart className="w-5 h-5 mr-2 text-yellow-400" />
                Estado de Salud Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${
                  injuryData.currentStatus.active === 0 ? 'bg-green-400' : 'bg-red-400'
                }`}></div>
                <span className="text-white">
                  {injuryData.currentStatus.active === 0 
                    ? 'Sin lesiones activas' 
                    : `${injuryData.currentStatus.active} lesión(es) activa(s)`
                  }
                </span>
              </div>

              <Alert className={`${
                injuryData.currentStatus.active === 0 
                  ? 'border-green-400 bg-green-400/10' 
                  : 'border-yellow-400 bg-yellow-400/10'
              }`}>
                <AlertDescription className={`${
                  injuryData.currentStatus.active === 0 ? 'text-green-300' : 'text-yellow-300'
                }`}>
                  🤖 IA monitorea automáticamente tu feedback y ajusta la rutina preventivamente.
                  {lesionesUsuario.riesgoActual && ` Riesgo actual: ${lesionesUsuario.riesgoActual}.`}
                </AlertDescription>
              </Alert>
              
              {/* Información específica del usuario */}
              {lesionesUsuario.prevencion && (
                <div className="mt-4 p-3 bg-blue-400/10 rounded-lg border border-blue-400/20">
                  <h4 className="text-blue-400 font-semibold mb-2">Tu Plan Preventivo:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-400">Calentamiento:</span>
                      <span className="text-white ml-2">{lesionesUsuario.prevencion.calentamiento}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Estiramientos:</span>
                      <span className="text-white ml-2">{lesionesUsuario.prevencion.estiramientos}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Descanso:</span>
                      <span className="text-white ml-2">{lesionesUsuario.prevencion.descanso}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Hidratación:</span>
                      <span className="text-white ml-2">{lesionesUsuario.prevencion.hidratacion}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Zonas vulnerables */}
              {lesionesUsuario.zonasVulnerables && lesionesUsuario.zonasVulnerables.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-white font-semibold mb-2">Zonas Vulnerables:</h4>
                  <div className="space-y-2">
                    {lesionesUsuario.zonasVulnerables.map((zona, idx) => (
                      <div key={idx} className="p-2 bg-yellow-400/10 rounded border border-yellow-400/20">
                        <p className="text-yellow-300 text-sm">{zona}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          {injuryData.history.length === 0 ? (
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardContent className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">¡Excelente!</h3>
                <p className="text-gray-400">No tienes historial de lesiones registradas.</p>
                <p className="text-gray-400 text-sm mt-2">Mantén las buenas prácticas preventivas.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {injuryData.history.map((injury, idx) => (
                <Card key={idx} className="bg-gray-900 border-yellow-400/20">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-white">{injury.tipo}</CardTitle>
                        <CardDescription className="text-gray-400">
                          {injury.fecha} • {injury.duracion} • {injury.gravedad}
                        </CardDescription>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${
                          injury.estado === 'Recuperado completamente' || injury.estado === 'Recuperada' ? 'border-green-400 text-green-400' :
                          injury.estado === 'En recuperación' ? 'border-yellow-400 text-yellow-400' :
                          'border-red-400 text-red-400'
                        }`}
                      >
                        {injury.estado}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <h4 className="text-white font-semibold mb-2">Detalles de la Lesión:</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div>
                            <span className="text-gray-400">Causa:</span>
                            <span className="text-white ml-2">{injury.causa}</span>
                          </div>
                          <div>
                            <span className="text-gray-400">Tratamiento:</span>
                            <span className="text-white ml-2">{injury.tratamiento}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-3 bg-blue-900/20 rounded">
                        <h4 className="text-blue-400 font-semibold mb-1">Experiencia de Recuperación:</h4>
                        <p className="text-blue-300 text-sm">
                          Esta lesión {injury.gravedad?.toLowerCase()} fue tratada con {injury.tratamiento?.toLowerCase()} 
                          y tuvo una duración de {injury.duracion}.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
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
              {injuryData.preventiveActions.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay recomendaciones preventivas específicas registradas.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {injuryData.preventiveActions.map((action, idx) => (
                    <div key={idx} className="flex items-center space-x-3 p-2 bg-gray-800 rounded">
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-white">{action}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Ejercicios recomendados */}
              {lesionesUsuario.ejerciciosRecomendados && lesionesUsuario.ejerciciosRecomendados.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3">Ejercicios Recomendados:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lesionesUsuario.ejerciciosRecomendados.map((ejercicio, idx) => (
                      <div key={idx} className="p-3 bg-green-400/10 rounded border border-green-400/20">
                        <p className="text-green-300 text-sm">{ejercicio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Ejercicios a evitar */}
              {lesionesUsuario.ejerciciosEvitar && lesionesUsuario.ejerciciosEvitar.length > 0 && (
                <div className="mt-6">
                  <h4 className="text-white font-semibold mb-3">Ejercicios a Evitar:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {lesionesUsuario.ejerciciosEvitar.map((ejercicio, idx) => (
                      <div key={idx} className="p-3 bg-red-400/10 rounded border border-red-400/20">
                        <p className="text-red-300 text-sm">{ejercicio}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InjuriesScreen;
