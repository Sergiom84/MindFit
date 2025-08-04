import React, { useEffect, useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Camera, 
  Square, 
  Play, 
  Pause,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target
} from 'lucide-react';

const PoseCamera = ({ selectedExercise = "Sentadilla", onPoseData, onFeedback }) => {
  const camRef = useRef(null);
  const canvasRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [currentErrors, setCurrentErrors] = useState([]);
  const [sessionMetrics, setSessionMetrics] = useState({
    repeticiones: 0,
    erroresDetectados: [],
    precision: 0,
    tiempoSesion: 0
  });
  const [feedback, setFeedback] = useState('');
  const [poseWorker, setPoseWorker] = useState(null);

  // Simulación de MediaPipe Pose (en producción usarías la librería real)
  const initializePoseDetection = useCallback(() => {
    // Simulación de pose detection
    const mockPoseWorker = {
      evaluate: (landmarks, ejercicio) => {
        // Simulación de análisis de postura
        const errores = [];
        const random = Math.random();
        
        if (random > 0.7) {
          errores.push("Rodillas hacia adentro");
        }
        if (random > 0.8) {
          errores.push("Falta de profundidad");
        }
        if (random > 0.9) {
          errores.push("Espalda curvada");
        }

        return {
          errores,
          precision: Math.round(85 + Math.random() * 15),
          anguloMinRodilla: Math.round(70 + Math.random() * 30),
          tempoConc: (1 + Math.random()).toFixed(1),
          tempoEcc: (2 + Math.random() * 2).toFixed(1)
        };
      }
    };
    
    setPoseWorker(mockPoseWorker);
  }, []);

  // Análisis en tiempo real
  const analyzePose = useCallback(() => {
    if (!poseWorker || !isRecording) return;

    // Simulación de landmarks (en producción vendrían de MediaPipe)
    const mockLandmarks = Array(33).fill(0).map(() => [
      Math.random(),
      Math.random(),
      Math.random()
    ]);

    const analysis = poseWorker.evaluate(mockLandmarks, selectedExercise);
    
    setCurrentErrors(analysis.errores);
    setSessionMetrics(prev => ({
      ...prev,
      precision: analysis.precision,
      erroresDetectados: [...new Set([...prev.erroresDetectados, ...analysis.errores])]
    }));

    // Feedback háptico si hay errores
    if (analysis.errores.length > 0 && navigator.vibrate) {
      navigator.vibrate(100);
    }

    // Enviar datos al componente padre
    if (onPoseData) {
      onPoseData({
        landmarks: mockLandmarks,
        analysis: analysis
      });
    }
  }, [poseWorker, isRecording, selectedExercise, onPoseData]);

  // Loop de análisis
  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(analyzePose, 100); // ~10 FPS
    return () => clearInterval(interval);
  }, [isRecording, analyzePose]);

  // Inicializar pose detection
  useEffect(() => {
    initializePoseDetection();
  }, [initializePoseDetection]);

  // Contador de tiempo de sesión
  useEffect(() => {
    if (!isRecording) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      setSessionMetrics(prev => ({
        ...prev,
        tiempoSesion: Math.floor((Date.now() - startTime) / 1000)
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRecording]);

  const startRecording = () => {
    setIsRecording(true);
    setCurrentErrors([]);
    setSessionMetrics({
      repeticiones: 0,
      erroresDetectados: [],
      precision: 0,
      tiempoSesion: 0
    });
    setFeedback('');
  };

  const stopRecording = async () => {
    setIsRecording(false);
    
    // Simular envío a GPT-4o para feedback
    const metrics = {
      ejercicio: selectedExercise,
      repeticiones: Math.floor(Math.random() * 10) + 5,
      erroresDetectados: sessionMetrics.erroresDetectados,
      anguloMinRodilla: 78 + Math.floor(Math.random() * 20),
      tempoConc: (1 + Math.random()).toFixed(1),
      tempoEcc: (2 + Math.random() * 2).toFixed(1),
      precision: sessionMetrics.precision
    };

    // Simulación de respuesta de IA
    setTimeout(() => {
      const mockFeedback = generateMockFeedback(metrics);
      setFeedback(mockFeedback);
      if (onFeedback) {
        onFeedback(mockFeedback);
      }
    }, 1500);
  };

  const generateMockFeedback = (metrics) => {
    const feedbacks = [
      `Excelente trabajo en ${metrics.ejercicio}! Completaste ${metrics.repeticiones} repeticiones con ${metrics.precision}% de precisión.`,
      `Buen progreso! Nota: ${metrics.erroresDetectados.length > 0 ? 'Trabaja en: ' + metrics.erroresDetectados.join(', ') : 'Técnica correcta mantenida'}.`,
      `Recomendación: Mantén un tempo más controlado en la fase excéntrica (${metrics.tempoEcc}s está bien).`,
      `Tu ángulo mínimo de rodilla fue ${metrics.anguloMinRodilla}°. Intenta llegar a 90° para mayor activación muscular.`
    ];
    
    return feedbacks.join('\n\n');
  };

  return (
    <div className="space-y-6">
      {/* Cámara y Canvas */}
      <Card className="bg-gray-900 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Camera className="w-5 h-5 mr-2 text-yellow-400" />
              Corrección por Video IA - {selectedExercise}
            </div>
            <Badge className={`${isRecording ? 'bg-red-500' : 'bg-gray-500'} text-white`}>
              {isRecording ? 'GRABANDO' : 'DETENIDO'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative bg-black rounded-lg overflow-hidden">
            <Webcam
              ref={camRef}
              className="w-full h-64 object-cover"
              mirrored
              videoConstraints={{ facingMode: "user" }}
            />
            <canvas
              ref={canvasRef}
              className="absolute inset-0 pointer-events-none"
              width="640"
              height="480"
            />
            
            {/* Overlay de errores en tiempo real */}
            {isRecording && currentErrors.length > 0 && (
              <div className="absolute top-4 left-4 space-y-2">
                {currentErrors.map((error, idx) => (
                  <Alert key={idx} className="border-red-500 bg-red-500/20 text-red-300">
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription className="text-sm">
                      {error}
                    </AlertDescription>
                  </Alert>
                ))}
              </div>
            )}

            {/* Métricas en tiempo real */}
            {isRecording && (
              <div className="absolute top-4 right-4 bg-black/70 rounded-lg p-3 text-white text-sm">
                <div className="flex items-center space-x-2 mb-1">
                  <Activity className="w-4 h-4 text-green-400" />
                  <span>Precisión: {sessionMetrics.precision}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Target className="w-4 h-4 text-blue-400" />
                  <span>Tiempo: {sessionMetrics.tiempoSesion}s</span>
                </div>
              </div>
            )}
          </div>

          {/* Controles */}
          <div className="flex justify-center space-x-4 mt-4">
            {!isRecording ? (
              <Button 
                onClick={startRecording}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2"
              >
                <Play className="w-4 h-4 mr-2" />
                Iniciar Análisis
              </Button>
            ) : (
              <Button 
                onClick={stopRecording}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
              >
                <Square className="w-4 h-4 mr-2" />
                Detener y Analizar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feedback de IA */}
      {feedback && (
        <Card className="bg-gray-900 border-blue-400/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-blue-400" />
              Feedback IA Personalizado
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-300 whitespace-pre-line">
              {feedback}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PoseCamera;
