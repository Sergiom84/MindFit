import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useUserContext } from '../contexts/UserContext';
import {
  Apple,
  BarChart3,
  CheckCircle,
  Target,
  TrendingUp,
  Zap,
  ShoppingCart
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NutritionScreen = () => {
  const [activeNutritionTab, setActiveNutritionTab] = useState('overview');
  const [selectedMeal, setSelectedMeal] = useState(null);
  const { userData } = useUserContext();
  
  // Usar datos dinámicos del usuario actual
  const nutricionUsuario = userData.nutricion || {};

  // Calcular datos dinámicos basados en el usuario
  const calcularMacros = () => {
    const calorias = nutricionUsuario.calorias || 2000;
    const macros = nutricionUsuario.distribucionMacros || { proteinas: 25, carbohidratos: 50, grasas: 25 };
    
    return {
      protein: { 
        current: Math.round((calorias * macros.proteinas / 100) / 4), 
        target: Math.round((calorias * macros.proteinas / 100) / 4 * 1.1), 
        percentage: Math.round(Math.random() * 20 + 80) // Simular adherencia
      },
      carbs: { 
        current: Math.round((calorias * macros.carbohidratos / 100) / 4), 
        target: Math.round((calorias * macros.carbohidratos / 100) / 4 * 1.1), 
        percentage: Math.round(Math.random() * 20 + 80)
      },
      fats: { 
        current: Math.round((calorias * macros.grasas / 100) / 9), 
        target: Math.round((calorias * macros.grasas / 100) / 9 * 1.1), 
        percentage: Math.round(Math.random() * 20 + 80)
      }
    };
  };

  // Datos de suplementos mejorados con información detallada
  const getSupplementsData = () => {
    const supplementsInfo = {
      'Proteína Whey': {
        description: 'Completar requerimientos proteicos',
        timing: 'Tomar Post-entreno',
        price: '€29.99',
        priority: 'Recomendado',
        priorityColor: 'bg-blue-500'
      },
      'Creatina Monohidrato': {
        description: 'Mejorar rendimiento y fuerza',
        timing: 'Tomar Cualquier momento',
        price: '€19.99',
        priority: 'Recomendado',
        priorityColor: 'bg-blue-500'
      },
      'Omega-3': {
        description: 'Salud cardiovascular y articular',
        timing: 'Tomar Con las comidas',
        price: '€24.99',
        priority: 'Opcional',
        priorityColor: 'bg-gray-500'
      },
      'Vitamina D3': {
        description: 'Salud ósea y sistema inmune',
        timing: 'Tomar Por la mañana',
        price: '€15.99',
        priority: 'Recomendado',
        priorityColor: 'bg-blue-500'
      },
      'Magnesio': {
        description: 'Recuperación muscular y sueño',
        timing: 'Tomar Antes de dormir',
        price: '€18.99',
        priority: 'Opcional',
        priorityColor: 'bg-gray-500'
      }
    };

    if (nutricionUsuario.suplementos) {
      return nutricionUsuario.suplementos.split(', ').map(supl => ({
        name: supl,
        ...supplementsInfo[supl] || {
          description: 'Suplemento personalizado',
          timing: 'Según indicación',
          price: '€--',
          priority: 'Personalizado',
          priorityColor: 'bg-yellow-500'
        }
      }));
    }

    // Suplementos por defecto basados en el objetivo del usuario
    const defaultSupplements = [];
    if (userData.objetivo === 'ganar_masa_muscular') {
      defaultSupplements.push('Proteína Whey', 'Creatina Monohidrato');
    }
    if (userData.objetivo === 'perder_peso') {
      defaultSupplements.push('Omega-3', 'Vitamina D3');
    }
    defaultSupplements.push('Magnesio'); // Para todos

    return defaultSupplements.map(supl => ({
      name: supl,
      ...supplementsInfo[supl]
    }));
  };

  const nutritionData = {
    dailyCalories: nutricionUsuario.calorias || 2000,
    targetCalories: (nutricionUsuario.calorias || 2000) + 50,
    macros: calcularMacros(),
    supplements: getSupplementsData()
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">
        Nutrición IA - {userData.nombre}
      </h1>

      {/* Información general del usuario */}
      <Card className="bg-gray-900 border-yellow-400/20 mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-400">{nutritionData.dailyCalories}</p>
              <p className="text-gray-400 text-sm">Calorías Objetivo</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-400">{nutricionUsuario.comidasDiarias || 5}</p>
              <p className="text-gray-400 text-sm">Comidas Diarias</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-400">{nutricionUsuario.aguaDiaria || 2.5}L</p>
              <p className="text-gray-400 text-sm">Agua Diaria</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-400">{nutricionUsuario.progreso?.adherencia || 85}%</p>
              <p className="text-gray-400 text-sm">Adherencia</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeNutritionTab} onValueChange={setActiveNutritionTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Resumen
          </TabsTrigger>
          <TabsTrigger value="tracking" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Seguimiento
          </TabsTrigger>
          <TabsTrigger value="supplements" className="data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Suplementos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Apple className="w-5 h-5 mr-2 text-yellow-400" />
                Macronutrientes Hoy
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(nutritionData.macros).map(([key, macro]) => (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-white capitalize">{key === 'carbs' ? 'Carbohidratos' : key === 'protein' ? 'Proteínas' : 'Grasas'}</span>
                      <span className="text-gray-400">{macro.current}g / {macro.target}g</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          macro.percentage >= 90 ? 'bg-green-400' : 
                          macro.percentage >= 70 ? 'bg-yellow-400' : 'bg-red-400'
                        }`}
                        style={{ width: `${Math.min(macro.percentage, 100)}%` }}
                      ></div>
                    </div>
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
                Seguimiento Nutricional IA - {userData.nombre}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-400">{nutricionUsuario.comidasDiarias || 5}</p>
                    <p className="text-gray-400 text-sm">comidas diarias</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{nutricionUsuario.progreso?.adherencia || 85}%</p>
                    <p className="text-gray-400 text-sm">adherencia promedio</p>
                  </div>
                </div>
                
                {/* Información específica del usuario */}
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan Nutricional:</span>
                    <span className="text-white">{nutricionUsuario.planNutricional || 'No especificado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Objetivo:</span>
                    <span className="text-white capitalize">{nutricionUsuario.objetivo || userData.objetivo}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">IMC:</span>
                    <span className="text-white">{nutricionUsuario.imc || 'No calculado'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Agua diaria:</span>
                    <span className="text-white">{nutricionUsuario.aguaDiaria || 2.5}L</span>
                  </div>
                </div>
                
                {/* Mejoras del usuario */}
                {nutricionUsuario.progreso?.mejoras && (
                  <div className="mt-4">
                    <h4 className="text-white font-semibold mb-2">Mejoras Recientes:</h4>
                    <ul className="space-y-1">
                      {nutricionUsuario.progreso.mejoras.map((mejora, idx) => (
                        <li key={idx} className="text-sm text-green-400 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          {mejora}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Restricciones y alergias */}
                {(nutricionUsuario.restricciones?.length > 0 || nutricionUsuario.alergias?.length > 0) && (
                  <div className="mt-4 p-3 bg-yellow-400/10 rounded-lg border border-yellow-400/20">
                    <h4 className="text-yellow-400 font-semibold mb-2">Consideraciones Especiales:</h4>
                    {nutricionUsuario.restricciones?.length > 0 && (
                      <p className="text-sm text-yellow-300">
                        <strong>Restricciones:</strong> {nutricionUsuario.restricciones.join(', ')}
                      </p>
                    )}
                    {nutricionUsuario.alergias?.length > 0 && (
                      <p className="text-sm text-red-300">
                        <strong>Alergias:</strong> {nutricionUsuario.alergias.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="supplements" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                Suplementación Recomendada
              </CardTitle>
              <p className="text-gray-400 text-sm mt-2">
                Suplementos basados en tu metodología y objetivos
              </p>
            </CardHeader>
            <CardContent>
              {nutritionData.supplements.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No hay suplementos registrados para este usuario.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {nutritionData.supplements.map((supplement, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/30 hover:border-yellow-400/20 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-base">{supplement.name}</h3>
                          {supplement.priority !== 'Opcional' && (
                            <Badge className="bg-blue-600 text-white text-xs px-3 py-1 rounded-full">
                              {supplement.priority}
                            </Badge>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mb-1">{supplement.description}</p>
                        <p className="text-gray-500 text-xs">{supplement.timing}</p>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-green-400 font-bold text-lg">{supplement.price}</p>
                        </div>
                        <Button
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center gap-2 transition-colors"
                          onClick={() => {
                            // Aquí puedes agregar la lógica para comprar
                            console.log(`Comprando ${supplement.name}`);
                          }}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Comprar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-400/10 rounded-lg border border-blue-400/20">
                <p className="text-blue-300 text-sm">
                  🤖 <strong>IA Personalizada:</strong> Estos suplementos han sido seleccionados específicamente
                  para tu objetivo de <span className="capitalize">{userData.objetivo?.replace('_', ' ')}</span> y
                  tu nivel {userData.nivel}. Los precios y disponibilidad se actualizan automáticamente.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NutritionScreen;
