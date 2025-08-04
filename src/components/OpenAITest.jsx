import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { getPoseFeedback } from '../api/poseFeedback';
import { CheckCircle, AlertTriangle, Loader2, Zap } from 'lucide-react';

const OpenAITest = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState(null);
  const [error, setError] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('not_tested');

  const testOpenAIConnection = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);
    setConnectionStatus('testing');

    // Datos de prueba para el análisis
    const testMetrics = {
      ejercicio: 'Sentadilla',
      repeticiones: 8,
      erroresDetectados: ['Rodillas hacia adentro', 'Falta de profundidad'],
      anguloMinRodilla: 78,
      tempoConc: 1.2,
      tempoEcc: 2.8,
      precision: 85
    };

    const testUserVariables = {
      usuario: 'Usuario de Prueba',
      nivel: 'intermedio',
      objetivo: 'ganar_masa_muscular'
    };

    try {
      console.log('🧪 Iniciando prueba de conexión con OpenAI...');
      const result = await getPoseFeedback(testMetrics, testUserVariables);
      
      if (result.success) {
        setResponse(result.feedback);
        setConnectionStatus('success');
        console.log('✅ Conexión exitosa con OpenAI');
      } else {
        setError(result.error || 'Error desconocido');
        setConnectionStatus('error');
        console.log('❌ Error en la conexión:', result.error);
      }
    } catch (err) {
      setError(err.message);
      setConnectionStatus('error');
      console.error('❌ Error en la prueba:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'success':
        return <Badge className="bg-green-500 text-white">✅ Conectado</Badge>;
      case 'error':
        return <Badge className="bg-red-500 text-white">❌ Error</Badge>;
      case 'testing':
        return <Badge className="bg-yellow-500 text-black">🔄 Probando...</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">⚪ No probado</Badge>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gray-900 border-yellow-400/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center justify-between">
            <div className="flex items-center">
              <Zap className="w-5 h-5 mr-2 text-yellow-400" />
              Prueba de Conexión OpenAI
            </div>
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-white font-semibold mb-2">Configuración:</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">API Key:</span>
                  <span className="text-white">
                    {import.meta.env.VITE_OPENAI_API_KEY ? 
                      `${import.meta.env.VITE_OPENAI_API_KEY.substring(0, 10)}...` : 
                      'No configurada'
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Prompt ID:</span>
                  <span className="text-white text-xs">
                    {import.meta.env.VITE_OPENAI_PROMPT_ID || 'No configurado'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Versión:</span>
                  <span className="text-white">
                    {import.meta.env.VITE_OPENAI_PROMPT_VERSION || 'No configurada'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-white font-semibold mb-2">Datos de Prueba:</h3>
              <div className="space-y-1 text-sm text-gray-300">
                <div>• Ejercicio: Sentadilla</div>
                <div>• Errores: Rodillas hacia adentro, Falta de profundidad</div>
                <div>• Precisión: 85%</div>
                <div>• Usuario: Intermedio</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button 
              onClick={testOpenAIConnection}
              disabled={isLoading}
              className="bg-yellow-400 text-black hover:bg-yellow-300 px-6 py-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Probando Conexión...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Probar Conexión OpenAI
                </>
              )}
            </Button>
          </div>

          {error && (
            <Alert className="border-red-500 bg-red-500/10">
              <AlertTriangle className="w-4 h-4" />
              <AlertDescription className="text-red-300">
                <strong>Error de Conexión:</strong> {error}
                <br />
                <span className="text-sm">
                  Verifica que tu API key sea válida y que tengas créditos disponibles.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {response && (
            <Card className="bg-gray-800 border-green-400/20">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <CheckCircle className="w-5 h-5 mr-2 text-green-400" />
                  Respuesta de OpenAI
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-gray-300 whitespace-pre-line text-sm">
                  {response}
                </div>
              </CardContent>
            </Card>
          )}

          <Alert className="border-blue-400 bg-blue-400/10">
            <AlertDescription className="text-blue-300 text-sm">
              <strong>Información:</strong> Esta prueba verifica la conexión con OpenAI usando tu prompt personalizado.
              Si falla el prompt personalizado, automáticamente usará chat.completions como respaldo.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default OpenAITest;
