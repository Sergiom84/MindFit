// src/components/RoutinesScreen.jsx (Versión Completa y Unificada)
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserContext } from "@/contexts/UserContext";
import { Button } from '@/components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Dumbbell } from 'lucide-react';

const RoutinesScreen = () => {
    const navigate = useNavigate();
    // Asegúrate de que el contexto provea un objeto con 'methodology_name' y 'methodology_data'
    const { metodologiaActiva } = useUserContext();

    // Si no hay metodología seleccionada, mostramos un mensaje para que elija una.
    if (!metodologiaActiva || !metodologiaActiva.methodology_name) {
        return (
            <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
                <h1 className="text-3xl font-bold mb-6 text-yellow-400">Rutinas de Entrenamiento</h1>
                <Card className="bg-gray-900 border-yellow-400/20">
                    <CardContent className="p-8 text-center">
                        <Dumbbell className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-white mb-2">No hay metodología activa</h2>
                        <p className="text-gray-400 mb-4">
                            Para ver tu rutina, primero elige una metodología o deja que la IA la genere por ti.
                        </p>
                        <Button
                            onClick={() => navigate('/methodologies')}
                            className="bg-yellow-400 text-black hover:bg-yellow-300"
                        >
                            Ir a Metodologías
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Esta función determina qué rutina mostrar: la de la IA o una de respaldo.
    const getRoutineSource = () => {
        // 1. Buscamos la rutina generada por la IA en los datos guardados.
        const aiRoutine = metodologiaActiva.methodology_data;

        // 2. Si existe y tiene el formato correcto (un array de 'dias'), la usamos.
        if (aiRoutine && Array.isArray(aiRoutine.dias) && aiRoutine.dias.length > 0) {
            console.log("✅ Mostrando rutina generada por la IA.");
            return aiRoutine.dias; // Devolvemos el array de días de la IA.
        }

        // 3. Si no, usamos las plantillas locales como respaldo.
        console.warn("⚠️ No se encontró rutina de la IA o tiene un formato incorrecto. Usando plantilla de respaldo.");

        // --- INICIO DE LAS PLANTILLAS DE RESPALDO (LAS QUE TÚ CREASTE) ---
        const methodologyRoutines = {
            'Heavy Duty': {
                pattern: [
                    { dia: 1, nombre_sesion: 'Pecho y Espalda', ejercicios: [ { nombre: 'Press Inclinado con Mancuernas', series: 1, repeticiones: '6-8 (al fallo)' }, { nombre: 'Jalones en Polea (Pullover)', series: 1, repeticiones: '6-8 (al fallo)' }, { nombre: 'Remo con Barra', series: 1, repeticiones: '6-8 (al fallo)' }, ]},
                    { dia: 2, nombre_sesion: 'Descanso / Recuperación Activa', ejercicios: []},
                    { dia: 3, nombre_sesion: 'Piernas y Hombros', ejercicios: [ { nombre: 'Sentadillas', series: 1, repeticiones: '8-10 (al fallo)' }, { nombre: 'Elevaciones Laterales', series: 1, repeticiones: '8-10 (al fallo)' }, { nombre: 'Press Militar', series: 1, repeticiones: '6-8 (al fallo)' }, ]},
                    { dia: 4, nombre_sesion: 'Descanso / Recuperación Activa', ejercicios: []},
                    { dia: 5, nombre_sesion: 'Brazos y Gemelos', ejercicios: [ { nombre: 'Curl de Bíceps con Barra', series: 1, repeticiones: '6-8 (al fallo)' }, { nombre: 'Extensiones de Tríceps en Polea', series: 1, repeticiones: '8-10 (al fallo)' }, { nombre: 'Elevación de talones', series: 1, repeticiones: '12-15 (al fallo)' }, ]},
                ]
            },
            'Powerlifting': {
                pattern: [
                    { dia: 1, nombre_sesion: 'Día de Sentadilla (Pesado)', ejercicios: [ { nombre: 'Sentadilla con Barra', series: 5, repeticiones: '5' }, { nombre: 'Prensa', series: 3, repeticiones: '8-10' }, { nombre: 'Extensiones de Cuádriceps', series: 3, repeticiones: '10-12' }, ]},
                    { dia: 2, nombre_sesion: 'Día de Press Banca (Pesado)', ejercicios: [ { nombre: 'Press de Banca', series: 5, repeticiones: '5' }, { nombre: 'Press Militar', series: 3, repeticiones: '8' }, { nombre: 'Fondos en paralelas', series: 3, repeticiones: 'Máx' }, ]},
                    { dia: 3, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 4, nombre_sesion: 'Día de Peso Muerto (Pesado)', ejercicios: [ { nombre: 'Peso Muerto', series: 5, repeticiones: '5' }, { nombre: 'Remo con Barra', series: 3, repeticiones: '8' }, { nombre: 'Dominadas', series: 3, repeticiones: 'Máx' }, ]},
                    { dia: 5, nombre_sesion: 'Día de Accesorios (Volumen)', ejercicios: [ { nombre: 'Press Inclinado con mancuernas', series: 4, repeticiones: '10-12' }, { nombre: 'Sentadilla Búlgara', series: 3, repeticiones: '10 por pierna' }, { nombre: 'Face Pulls', series: 4, repeticiones: '15' }, ]},
                ]
            },
            'Hipertrofia': {
                pattern: [
                    { dia: 1, nombre_sesion: 'Empuje (Push)', ejercicios: [ { nombre: 'Press de Banca', series: 4, repeticiones: '8-12' }, { nombre: 'Press Inclinado con Mancuernas', series: 3, repeticiones: '10-15' }, { nombre: 'Press Militar', series: 3, repeticiones: '8-12' }, { nombre: 'Elevaciones Laterales', series: 4, repeticiones: '12-15' }, { nombre: 'Extensiones de Tríceps', series: 3, repeticiones: '10-15' }, ]},
                    { dia: 2, nombre_sesion: 'Tirón (Pull)', ejercicios: [ { nombre: 'Dominadas o Jalón al Pecho', series: 4, repeticiones: '8-12' }, { nombre: 'Remo con Barra', series: 3, repeticiones: '8-12' }, { nombre: 'Face Pulls', series: 3, repeticiones: '15-20' }, { nombre: 'Curl de Bíceps con Barra', series: 3, repeticiones: '10-15' }, ]},
                    { dia: 3, nombre_sesion: 'Pierna (Leg)', ejercicios: [ { nombre: 'Sentadillas', series: 4, repeticiones: '8-12' }, { nombre: 'Peso Muerto Rumano', series: 3, repeticiones: '10-15' }, { nombre: 'Prensa', series: 3, repeticiones: '10-15' }, { nombre: 'Curl Femoral', series: 3, repeticiones: '12-15' }, { nombre: 'Elevación de Gemelos', series: 4, repeticiones: '15-20' }, ]},
                    { dia: 4, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 5, nombre_sesion: 'Full Body (Opcional)', ejercicios: [ { nombre: 'Peso Muerto', series: 3, repeticiones: '5-8' }, { nombre: 'Press de Banca', series: 3, repeticiones: '8-10' }, { nombre: 'Remo con mancuerna', series: 3, repeticiones: '10-12' }, ]},
                ]
            },
            'Funcional': {
                pattern: [
                    { dia: 1, nombre_sesion: 'Circuito Funcional A', ejercicios: [ { nombre: 'Kettlebell Swing', series: 4, repeticiones: '15' }, { nombre: 'Saltos al Cajón (Box Jumps)', series: 4, repeticiones: '12' }, { nombre: 'Flexiones con rotación', series: 4, repeticiones: '10' }, { nombre: 'Plancha isométrica', series: 4, repeticiones: '45 seg' }, ]},
                    { dia: 2, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 3, nombre_sesion: 'Circuito Funcional B', ejercicios: [ { nombre: 'Sentadilla Goblet', series: 4, repeticiones: '15' }, { nombre: 'Battle Ropes', series: 4, repeticiones: '30 seg' }, { nombre: 'Paseo del granjero', series: 4, repeticiones: '30 metros' }, { nombre: 'Burpees', series: 4, repeticiones: '10' }, ]},
                    { dia: 4, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 5, nombre_sesion: 'Core y Estabilidad', ejercicios: [ { nombre: 'Press Pallof', series: 3, repeticiones: '12 por lado' }, { nombre: 'Levantamiento Turco (Turkish Get-up)', series: 3, repeticiones: '5 por lado' }, { nombre: 'Bird-Dog', series: 3, repeticiones: '15 por lado' }, ]},
                ]
            },
            'Oposiciones': {
               pattern: [
                    { dia: 1, nombre_sesion: 'Fuerza Específica', ejercicios: [ { nombre: 'Dominadas (con lastre si es necesario)', series: 5, repeticiones: 'Máx (-2 del fallo)' }, { nombre: 'Press de Banca', series: 4, repeticiones: '5-8' }, { nombre: 'Salto Vertical', series: 5, repeticiones: '3 saltos' }, ]},
                    { dia: 2, nombre_sesion: 'Resistencia (Circuito)', ejercicios: [ { nombre: 'Simulacro Course Navette', series: 1, repeticiones: 'Máx nivel' }, { nombre: 'Burpees', series: 3, repeticiones: '15' }, { nombre: 'Carrera continua (40 min)', series: 1, repeticiones: 'Ritmo suave' }, ]},
                    { dia: 3, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 4, nombre_sesion: 'Simulacro de Pruebas', ejercicios: [ { nombre: 'Circuito de Agilidad (simulado)', series: 3, repeticiones: 'Mejor tiempo' }, { nombre: 'Dominadas (test)', series: 1, repeticiones: 'Máx' }, { nombre: 'Salto Horizontal (test)', series: 3, repeticiones: 'Máx distancia' }, ]},
               ]
            },
            'CrossFit': {
                pattern: [
                    { dia: 1, nombre_sesion: 'WOD: "Cindy"', ejercicios: [ { nombre: 'AMRAP 20 min (As Many Rounds As Possible)', series: 1, repeticiones: 'Continuo' }, { nombre: '-> 5 Dominadas', series: 1, repeticiones: '5' }, { nombre: '-> 10 Flexiones', series: 1, repeticiones: '10' }, { nombre: '-> 15 Sentadillas al aire', series: 1, repeticiones: '15' }, ]},
                    { dia: 2, nombre_sesion: 'Fuerza y Técnica', ejercicios: [ { nombre: 'Clean and Jerk', series: 1, repeticiones: 'Encontrar 1RM del día' }, { nombre: 'Accesorio: Press de Banca', series: 5, repeticiones: '5' }, ]},
                    { dia: 3, nombre_sesion: 'WOD: "Helen"', ejercicios: [ { nombre: '3 Rondas por tiempo (For Time)', series: 1, repeticiones: 'Máx velocidad' }, { nombre: '-> 400m Carrera', series: 1, repeticiones: '1' }, { nombre: '-> 21 Kettlebell Swings (24/16 kg)', series: 1, repeticiones: '21' }, { nombre: '-> 12 Dominadas', series: 1, repeticiones: '12' }, ]},
                ]
            },
            'Calistenia': {
                pattern: [
                    { dia: 1, nombre_sesion: 'Full Body - Básico', ejercicios: [ { nombre: 'Dominadas (o remo invertido)', series: 4, repeticiones: 'Máx' }, { nombre: 'Fondos en paralelas (o en banco)', series: 4, repeticiones: 'Máx' }, { nombre: 'Flexiones', series: 4, repeticiones: 'Máx' }, { nombre: 'Sentadillas Pistol (o con asistencia)', series: 4, repeticiones: 'Máx' }, ]},
                    { dia: 2, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 3, nombre_sesion: 'Core y Habilidades', ejercicios: [ { nombre: 'Progresión de L-Sit', series: 5, repeticiones: '10-20 seg' }, { nombre: 'Progresión de Pino (Handstand)', series: 5, repeticiones: '30-60 seg' }, { nombre: 'Dragon Flags', series: 3, repeticiones: 'Máx' }, ]},
                    { dia: 4, nombre_sesion: 'Full Body - Volumen', ejercicios: [ { nombre: 'Flexiones diamante', series: 3, repeticiones: 'Máx' }, { nombre: 'Dominadas agarre ancho', series: 3, repeticiones: 'Máx' }, { nombre: 'Zancadas', series: 3, repeticiones: '15 por pierna' }, { nombre: 'Elevaciones de piernas colgado', series: 3, repeticiones: 'Máx' }, ]},
                ]
            },
            'Entrenamiento en Casa': {
                pattern: [
                    { dia: 1, nombre_sesion: 'Circuito Full Body A', ejercicios: [ { nombre: 'Sentadillas', series: 4, repeticiones: '20' }, { nombre: 'Flexiones', series: 4, repeticiones: 'Máx' }, { nombre: 'Zancadas alternas', series: 4, repeticiones: '15 por pierna' }, { nombre: 'Plancha', series: 4, repeticiones: '60 seg' }, ]},
                    { dia: 2, nombre_sesion: 'Cardio y Core', ejercicios: [ { nombre: 'Jumping Jacks', series: 3, repeticiones: '60 seg' }, { nombre: 'Burpees', series: 3, repeticiones: '15' }, { nombre: 'Mountain Climbers', series: 3, repeticiones: '45 seg' }, { nombre: 'Crunches', series: 3, repeticiones: '25' }, ]},
                    { dia: 3, nombre_sesion: 'Descanso', ejercicios: []},
                    { dia: 4, nombre_sesion: 'Circuito Full Body B', ejercicios: [ { nombre: 'Puente de glúteos', series: 4, repeticiones: '20' }, { nombre: 'Flexiones declinadas (pies elevados)', series: 4, repeticiones: 'Máx' }, { nombre: 'Remo con toalla/bandas elásticas', series: 4, repeticiones: '15' }, { nombre: 'Sentadilla isométrica (pared)', series: 4, repeticiones: 'Máx tiempo' }, ]},
                ]
            },
        };
        // --- FIN DE LAS PLANTILLAS DE RESPALDO ---

        const fallbackPattern = methodologyRoutines[metodologiaActiva.methodology_name]?.pattern;

        // Si no se encuentra una plantilla específica, se devuelve la de 'Hipertrofia' como valor por defecto.
        return fallbackPattern || methodologyRoutines['Hipertrofia'].pattern;
    };

    const weeklyRoutine = getRoutineSource();
    const methodologyName = metodologiaActiva.methodology_name;

    return (
        <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-yellow-400">Mi Rutina</h1>
                <p className="text-gray-400 mt-1">
                    Plan de entrenamiento activo basado en: <span className="font-semibold text-white">{methodologyName}</span>
                </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {weeklyRoutine.map((day, index) => (
                    <Card key={index} className="bg-gray-900 p-4 border border-gray-700 flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-lg">Día {day.dia}: {day.nombre_sesion}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            {day.ejercicios && day.ejercicios.length > 0 ? (
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-300">
                                    {day.ejercicios.map((ex, idx) => (
                                        <li key={idx}>
                                            <span className="font-semibold text-white">{ex.nombre}:</span> {ex.series} x {ex.repeticiones}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-400 italic">Día de descanso y recuperación.</p>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default RoutinesScreen;