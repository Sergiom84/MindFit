import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import {
  Brain,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  UserPlus
} from 'lucide-react';

// DebugPanel con persistencia en localStorage
function DebugPanel() {
  const LS_KEY = 'mindfit-debug-log';
  const getLogs = () => {
    try {
      return JSON.parse(localStorage.getItem(LS_KEY)) || [];
    } catch {
      return [];
    }
  };
  const [logs, setLogs] = useState(getLogs());

  // Guardar en localStorage
  const saveLogs = (arr) => {
    setLogs(arr);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(arr));
    } catch {}
  };

  // Añadir log
  const addLog = (text) => {
    const msg = `[${new Date().toLocaleTimeString()}] ${text}`;
    saveLogs([...logs, msg]);
    // También a consola
    console.log(`[DEBUG] ${msg}`);
  };

  // Limpiar logs
  const clearLogs = () => {
    saveLogs([]);
  };

  // Exportar logs
  const exportLogs = () => {
    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mindfit-debug-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Exponer función global para debug rápido
  window.debugLog = addLog;

  return (
    <div className="fixed right-0 top-0 z-50 w-80 h-screen bg-black/90 text-white border-l border-yellow-400 flex flex-col">
      <div className="p-3 border-b border-yellow-400 flex gap-2 items-center">
        <span className="text-yellow-400 font-bold">DEBUG PANEL</span>
        <button onClick={() => addLog('Debug button pressed')} className="px-2 py-1 bg-yellow-500 text-black rounded">Debug</button>
        <button onClick={clearLogs} className="px-2 py-1 bg-gray-600 rounded">Clear</button>
        <button onClick={exportLogs} className="px-2 py-1 bg-green-600 rounded">Export</button>
      </div>
      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
        {logs.length === 0 && <div className="text-gray-500">No hay logs aún.</div>}
        {logs.map((l, i) => <div key={i}>{l}</div>)}
      </div>
    </div>
  );
}

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Guardar trazas de eventos importantes en el debug panel y en localStorage
  const logEvent = (msg) => {
    if (window.debugLog) window.debugLog(msg);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    logEvent('SUBMIT Login pulsado');

    if (!email || !password) {
      setLoginError('Por favor completa todos los campos');
      logEvent('Login fallido: campos vacíos');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      logEvent(`Intento de login con email: ${email}`);
      const result = await login(email, password);

      if (!result.success) {
        setLoginError(result.error || 'Error al iniciar sesión');
        logEvent('Login fallido: ' + (result.error || 'desconocido'));
      } else {
        logEvent('Login exitoso');
      }
    } catch (error) {
      setLoginError('Error de conexión. Inténtalo de nuevo.');
      logEvent('Login fallido: Error de conexión');
      console.error('Error en login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Brain className="w-16 h-16 text-yellow-400 mr-4" />
              <h1 className="text-6xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-200 bg-clip-text text-transparent">
                MindFit
              </h1>
            </div>
            <p className="text-2xl text-gray-300 mb-4">
              Inteligencia Artificial para tu Entrenamiento
            </p>
            <p className="text-lg text-gray-400">
              Selecciona tu perfil para acceder a tu experiencia personalizada
            </p>
          </div>

          {/* Formulario de Login */}
          <div className="max-w-md mx-auto">
            <Card className="bg-gray-900 border-yellow-400/20">
              <CardHeader className="text-center">
                <CardTitle className="text-white text-2xl">Iniciar Sesión</CardTitle>
                <p className="text-gray-400">Accede a tu cuenta MindFit</p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          logEvent('Input email cambiado: ' + e.target.value);
                        }}
                        placeholder="tu@email.com"
                        className="bg-gray-800 border-gray-600 text-white pl-10"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-300">Contraseña</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          logEvent('Input password cambiado');
                        }}
                        placeholder="Tu contraseña"
                        className="bg-gray-800 border-gray-600 text-white pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoggingIn || isLoading}
                    className="w-full bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50"
                    onClick={() => logEvent('Botón INICIAR SESIÓN pulsado')}
                  >
                    {isLoggingIn || isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Iniciando sesión...
                      </>
                    ) : (
                      <>
                        <Brain className="w-4 h-4 mr-2" />
                        Iniciar Sesión
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Enlace a registro */}
            <div className="text-center mt-6">
              <p className="text-gray-400">
                ¿No tienes cuenta?{' '}
                <Button
                  variant="link"
                  onClick={() => {
                    logEvent('Botón REGISTRO pulsado');
                    window.location.href = '/register';
                  }}
                  className="text-yellow-400 hover:text-yellow-300 p-0"
                >
                  <UserPlus className="w-4 h-4 mr-1" />
                  Crear cuenta
                </Button>
              </p>
            </div>
          </div>

          {/* Error de login */}
          {loginError && (
            <Alert className="border-red-400 bg-red-400/10 mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                <strong>Error:</strong> {loginError}
              </AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <div className="text-center mt-12 text-gray-500 text-sm">
            <p>MindFit App - Tu entrenador personal inteligente</p>
            <p className="mt-2">Datos seguros y privados</p>
          </div>
        </div>
      </div>
      <DebugPanel />
    </>
  );
};

export default LoginPage;
