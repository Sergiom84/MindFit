import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUserContext } from '../contexts/UserContext';
import { generateNutritionPlan } from '../api/nutrition-ai';
import {
  BarChart3,
  CheckCircle,
  Zap,
  ShoppingCart,
  Utensils,
  Plus,
  Minus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const NutritionScreen = () => {
  const [activeNutritionTab, setActiveNutritionTab] = useState('overview');
  const [selectedMealPlan, setSelectedMealPlan] = useState('maintenance');
  const [mealsPerDay, setMealsPerDay] = useState(4);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const { userData } = useUserContext();

  const mealPlans = [
    {
      id: 'deficit',
      name: 'Déficit Calórico',
      description: 'Para perder grasa manteniendo músculo',
    },
    {
      id: 'maintenance',
      name: 'Mantenimiento',
      description: 'Equilibrio energético para mantener peso',
    },
    {
      id: 'surplus',
      name: 'Superávit',
      description: 'Aumento de masa muscular con más calorías',
    },
  ];

  const sampleMeals = [
    {
      name: 'Desayuno',
      time: '08:00',
      totalCalories: 600,
      foods: [
        { name: 'Avena (80g)', calories: 300 },
        { name: 'Plátano (1 unidad)', calories: 100 },
        { name: 'Proteína Whey (30g)', calories: 120 },
        { name: 'Almendras (20g)', calories: 80 }
      ]
    },
    {
      name: 'Almuerzo',
      time: '13:00',
      totalCalories: 800,
      foods: [
        { name: 'Pechuga de Pollo (200g)', calories: 330 },
        { name: 'Arroz Integral (100g)', calories: 350 },
        { name: 'Brócoli (150g)', calories: 40 },
        { name: 'Aceite de Oliva (10ml)', calories: 80 }
      ]
    },
    {
      name: 'Merienda',
      time: '17:00',
      totalCalories: 400,
      foods: [
        { name: 'Yogur Griego (200g)', calories: 200 },
        { name: 'Nueces (30g)', calories: 200 }
      ]
    },
    {
      name: 'Cena',
      time: '21:00',
      totalCalories: 600,
      foods: [
        { name: 'Salmón (150g)', calories: 300 },
        { name: 'Patata Dulce (200g)', calories: 180 },
        { name: 'Espinacas (100g)', calories: 20 },
        { name: 'Aguacate (50g)', calories: 100 }
      ]
    }
  ];
   
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

  const getSupplementsData = () => {
    const suplementos = nutricionUsuario.suplementos || [];
    return suplementos.map(sup => ({
      name: sup.nombre,
      dosage: sup.dosis,
      timing: sup.momento,
      benefits: sup.beneficios
    }));
  };

  const generatePersonalizedPlan = async () => {
    setIsGeneratingPlan(true);
    
    try {
      // Preparar datos del usuario para la IA
      const userProfile = {
        nombre: userData.nombre || 'Usuario',
        edad: userData.edad || 25,
        peso: userData.peso || 70,
        altura: userData.altura || 170,
        genero: userData.genero || 'masculino',
        objetivos: userData.objetivos || 'Mantenimiento de peso',
        nivelActividad: userData.nivelActividad || 'moderado',
        restriccionesAlimenticias: userData.restriccionesAlimenticias || [],
        preferenciasAlimenticias: userData.preferenciasAlimenticias || [],
        rutinaActual: userData.rutinaActual || 'No seleccionada actualmente',
        tipoDieta: selectedMealPlan,
        comidasPorDia: mealsPerDay
      };

      console.log('Generando plan nutricional para:', userProfile);

      const planGenerado = await generateNutritionPlan(userProfile);
      
      setGeneratedPlan(planGenerado);
      
      // Actualizar las comidas mostradas con el plan generado
      if (planGenerado.comidas) {
        // Aquí podrías actualizar el estado de sampleMeals con las nuevas comidas
        console.log('Plan nutricional generado:', planGenerado);
      }
      
    } catch (error) {
      console.error('Error al generar plan:', error);
      alert('Error al generar el plan nutricional. Por favor, intenta de nuevo.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };
 
   const nutritionData = {
     dailyCalories: nutricionUsuario.calorias || 2000,
     targetCalories: (nutricionUsuario.calorias || 2000) + 50,
     macros: calcularMacros(),
     supplements: getSupplementsData()
   };
 
   return (
     <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
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
              <p className="text-2xl font-bold text-blue-400">{mealsPerDay}</p>
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
        <TabsList className="w-full bg-gray-800 overflow-x-auto whitespace-nowrap rounded-lg no-scrollbar">
           <TabsTrigger value="overview" className="px-4 shrink-0 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
             Resumen
           </TabsTrigger>
          <TabsTrigger value="diet" className="px-4 shrink-0 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
            Dietas
          </TabsTrigger>
           <TabsTrigger value="tracking" className="px-4 shrink-0 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
             Seguimiento
           </TabsTrigger>
           <TabsTrigger value="supplements" className="px-4 shrink-0 data-[state=active]:bg-yellow-400 data-[state=active]:text-black">
             Suplementos
           </TabsTrigger>
         </TabsList>
 
         <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white">Metabolismo Basal</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-400">
                  {nutricionUsuario.metabolismoBasal || 1600} kcal
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white">Gasto Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-400">
                  {nutricionUsuario.gastoTotal || 2200} kcal
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white">Objetivo Calórico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-yellow-400">
                  {nutritionData.dailyCalories} kcal
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader>
                <CardTitle className="text-white">Comidas/Día</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gray-800 border-gray-700 text-white"
                  onClick={() => setMealsPerDay(Math.max(1, mealsPerDay - 1))}
                >
                  <Minus className="w-4 h-4" />
                </Button>
                <span className="text-2xl font-bold text-yellow-400">
                  {mealsPerDay}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="bg-gray-800 border-gray-700 text-white"
                  onClick={() => setMealsPerDay(mealsPerDay + 1)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Distribución de Macronutrientes</CardTitle>
              <CardDescription className="text-gray-400">
                Basada en tu objetivo actual
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Proteínas</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {nutritionData.macros.protein.target}g
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Carbohidratos</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {nutritionData.macros.carbs.target}g
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg text-center">
                  <p className="text-sm text-gray-400">Grasas</p>
                  <p className="text-xl font-bold text-yellow-400">
                    {nutritionData.macros.fats.target}g
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diet" className="space-y-6">
          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white">Tipo de Dieta</CardTitle>
              <CardDescription className="text-gray-400">
                Selecciona un plan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                {mealPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedMealPlan(plan.id)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all ${
                      selectedMealPlan === plan.id
                        ? 'border-yellow-400 bg-yellow-400/10'
                        : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                    }`}
                  >
                    <p className="font-semibold text-white">{plan.name}</p>
                    <p className="text-sm text-gray-400">{plan.description}</p>
                  </div>
                ))}
              </div>
              
              {/* Botón Generar Plan Personalizado */}
              <div className="text-center">
                <Button 
                  onClick={generatePersonalizedPlan}
                  disabled={isGeneratingPlan}
                  className="bg-yellow-400 text-black hover:bg-yellow-300 px-8 py-2 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGeneratingPlan ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
                      Generando Plan...
                    </>
                  ) : (
                    'Generar Plan Personalizado'
                  )}
                </Button>
                <p className="text-gray-400 text-sm mt-2">
                  Plan basado en tu perfil y tipo de dieta seleccionada: <span className="text-yellow-400 font-medium">{mealPlans.find(p => p.id === selectedMealPlan)?.name}</span>
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-yellow-400/20">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <Utensils className="w-5 h-5 mr-2 text-yellow-400" />
                Plan de Comidas Diario
              </CardTitle>
              <CardDescription className="text-gray-400">
                {generatedPlan ? 'Plan personalizado generado por IA' : `Distribución de ${mealsPerDay} comidas adaptada a tus preferencias`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {generatedPlan ? (
                // Mostrar plan generado por IA
                <div className="space-y-4">
                  <div className="mb-4 p-4 bg-green-900/20 border border-green-400/20 rounded-lg">
                    <h4 className="text-green-400 font-semibold mb-2">Plan Personalizado Generado</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Calorías objetivo:</span>
                        <span className="text-white ml-2 font-medium">{generatedPlan.caloriasObjetivo} kcal</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Proteínas:</span>
                        <span className="text-white ml-2 font-medium">{generatedPlan.macronutrientes?.proteinas}g</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Carbohidratos:</span>
                        <span className="text-white ml-2 font-medium">{generatedPlan.macronutrientes?.carbohidratos}g</span>
                      </div>
                    </div>
                  </div>
                  
                  {generatedPlan.comidas?.map((meal, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div>
                          <h3 className="text-white text-lg font-semibold">{meal.nombre}</h3>
                          <p className="text-gray-400 text-sm">{meal.hora} • {meal.totalCalorias} kcal</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        >
                          Personalizar
                        </Button>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {meal.alimentos?.map((food, foodIdx) => (
                            <div key={foodIdx} className="flex items-center justify-between">
                              <span className="text-white text-sm">{food.nombre} ({food.cantidad})</span>
                              <span className="text-yellow-400 text-sm font-medium">{food.calorias} kcal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {generatedPlan.notas && (
                    <div className="mt-4 p-4 bg-blue-900/20 border border-blue-400/20 rounded-lg">
                      <h4 className="text-blue-400 font-semibold mb-2">Notas del Nutricionista IA</h4>
                      <p className="text-gray-300 text-sm">{generatedPlan.notas}</p>
                    </div>
                  )}
                </div>
              ) : (
                // Mostrar plan por defecto
                <div className="space-y-4">
                  {sampleMeals.slice(0, mealsPerDay).map((meal, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg border border-gray-700">
                      <div className="flex items-center justify-between p-4 border-b border-gray-700">
                        <div>
                          <h3 className="text-white text-lg font-semibold">{meal.name}</h3>
                          <p className="text-gray-400 text-sm">{meal.time} • {meal.totalCalories} kcal</p>
                        </div>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-transparent border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                        >
                          Personalizar
                        </Button>
                      </div>
                      
                      <div className="p-4">
                        <div className="grid grid-cols-1 gap-2">
                          {meal.foods.map((food, foodIdx) => (
                            <div key={foodIdx} className="flex items-center justify-between">
                              <span className="text-white text-sm">{food.name}</span>
                              <span className="text-yellow-400 text-sm font-medium">{food.calories} kcal</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                 
                 {/* Gráfico de macros */}
                 <div className="space-y-3">
                   <h3 className="text-lg font-semibold text-white">Progreso de Macros Hoy</h3>
                   {Object.entries(nutritionData.macros).map(([key, macro]) => (
                     <div key={key} className="space-y-2">
                       <div className="flex justify-between">
                         <span className="text-white capitalize">{key === 'protein' ? 'Proteínas' : key === 'carbs' ? 'Carbohidratos' : 'Grasas'}</span>
                         <span className="text-yellow-400">{macro.current}g / {macro.target}g</span>
                       </div>
                       <div className="w-full bg-gray-700 rounded-full h-2">
                         <div 
                           className={`h-2 rounded-full ${key === 'protein' ? 'bg-blue-400' : key === 'carbs' ? 'bg-green-400' : 'bg-purple-400'}`}
                           style={{ width: `${macro.percentage}%` }}
                         ></div>
                       </div>
                     </div>
                   ))}
                 </div>
               </div>
             </CardContent>
           </Card>
         </TabsContent>

         <TabsContent value="supplements" className="space-y-6">
           <Card className="bg-gray-900 border-yellow-400/20">
             <CardHeader>
               <CardTitle className="text-white flex items-center">
                 <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                 Suplementos Recomendados
               </CardTitle>
               <CardDescription className="text-gray-400">
                 Basado en tu objetivo y datos nutricionales
               </CardDescription>
             </CardHeader>
             <CardContent>
               <div className="grid gap-4 sm:grid-cols-2">
                 <div className="p-4 bg-gray-800 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold text-white">Proteína Whey</h4>
                     <Badge className="bg-green-500 text-white">Recomendado</Badge>
                   </div>
                   <p className="text-sm text-gray-400 mb-2">
                     25-30g post-entreno para optimizar síntesis proteica
                   </p>
                   <p className="text-yellow-400 text-sm">Post-Entreno</p>
                 </div>
                 
                 <div className="p-4 bg-gray-800 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold text-white">Creatina</h4>
                     <Badge className="bg-blue-500 text-white">Básico</Badge>
                   </div>
                   <p className="text-sm text-gray-400 mb-2">
                     3-5g diarios para mejorar fuerza y volumen muscular
                   </p>
                   <p className="text-yellow-400 text-sm">Cualquier momento</p>
                 </div>
                 
                 <div className="p-4 bg-gray-800 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold text-white">Omega-3</h4>
                     <Badge className="bg-purple-500 text-white">Salud</Badge>
                   </div>
                   <p className="text-sm text-gray-400 mb-2">
                     1-2g diarios para reducir inflamación y mejorar recuperación
                   </p>
                   <p className="text-yellow-400 text-sm">Con comidas</p>
                 </div>
                 
                 <div className="p-4 bg-gray-800 rounded-lg">
                   <div className="flex items-center justify-between mb-2">
                     <h4 className="font-semibold text-white">Multivitamínico</h4>
                     <Badge className="bg-gray-500 text-white">Opcional</Badge>
                   </div>
                   <p className="text-sm text-gray-400 mb-2">
                     Para cubrir posibles deficiencias nutricionales
                   </p>
                   <p className="text-yellow-400 text-sm">Desayuno</p>
                 </div>
               </div>
               
               <Button className="mt-4 bg-yellow-400 text-black hover:bg-yellow-300 w-full">
                 <ShoppingCart className="w-4 h-4 mr-2" />
                 Ver Tienda de Suplementos
               </Button>
             </CardContent>
           </Card>
         </TabsContent>
       </Tabs>
     </div>
   );
 };

 export default NutritionScreen;