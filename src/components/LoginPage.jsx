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
  UserPlus,
  Eye,
  EyeOff,
  LogIn
} from 'lucide-react';



const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

       if (!email || !password) {
      setLoginError('Por favor completa todos los campos');
       return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const result = await login(email, password);

      if (!result.success) {
        console.log('Login fallido: ' + (result.error || 'desconocido'));
        // Usar debugLog si está disponible
        if (window.debugLog) {
          window.debugLog('Login fallido: ' + (result.error || 'desconocido'));
        }
      } else {
        console.log('Login exitoso');
        // Usar debugLog si está disponible
        if (window.debugLog) {
          window.debugLog('Login exitoso');
        }
      }
    } catch (error) {
      setLoginError('Error de conexión. Inténtalo de nuevo.');
      console.log('Login fallido: Error de conexión');
      // Usar debugLog si está disponible
      if (window.debugLog) {
        window.debugLog('Login fallido: Error de conexión');
      }
      console.error('Error en login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <>
      <div className="login-container min-h-screen bg-black text-white flex items-center justify-center p-4">
        <div className="max-w-5xl w-full">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <Brain className="w-16 h-16 text-yellow-400 mr-4" />
              <h1 className="text-5xl font-extrabold text-yellow-400">MindFit IA</h1>
            </div>
            <p className="text-lg text-gray-300 font-medium">Tu entrenador personal con inteligencia artificial</p>
          </div>

          {/* Contenedor principal con pestañas */}
          <div className="max-w-3xl mx-auto login-modal login-glass-effect rounded-3xl p-6">
            {/* Tabs superiores */}
            <div className="flex items-center gap-4 mb-6">
              <button
                className="login-tab-active flex-1 flex items-center justify-center gap-3 py-2.5 px-6 rounded-xl border border-yellow-400/20"
                disabled
              >
                <LogIn className="w-4 h-4" /> Iniciar Sesión
              </button>
              <button
                onClick={() => (window.location.href = '/register')}
                className="login-tab-inactive flex-1 flex items-center justify-center gap-3 py-2.5 px-6 rounded-xl border border-yellow-400/20 hover:bg-yellow-400/10"
              >
                <UserPlus className="w-4 h-4" /> Registrarse
              </button>
            </div>

            {/* Formulario de Login */}
            <div className="mx-auto px-8">
            <Card className="login-card bg-gray-900 border-yellow-400/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="login-header-title text-white text-2xl">Iniciar Sesión</CardTitle>
                <p className="login-subtitle text-gray-400">Accede a tu cuenta MindFit</p>
              </CardHeader>
              <CardContent className="px-12 pb-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="email" className="login-form-label text-gray-300">Email</Label>
                    <div className="relative">
                      <Mail className="login-input-icon absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                        }}
                        placeholder="tu@email.com"
                        className="login-input bg-gray-800 border-gray-600 text-white pl-12"
                        autoComplete="email"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="password" className="login-form-label text-gray-300">Contraseña</Label>
                    <div className="relative">
                      <Lock className="login-input-icon absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                        }}
                        placeholder="Tu contraseña"
                        className="login-input bg-gray-800 border-gray-600 text-white pl-12 pr-12"
                        autoComplete="current-password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((v) => !v)}
                        className="login-toggle-password absolute right-3 top-3 text-gray-400 hover:text-yellow-400"
                        aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoggingIn || isLoading}
                    className="login-button w-full bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-50 mt-6"
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
              <p className="text-gray-400 text-base">
                ¿No tienes cuenta?{' '}
                <Button
                  variant="link"
                  onClick={() => {
                    window.location.href = '/register';
                  }}
                  className="login-link text-yellow-400 hover:text-yellow-300 p-0 text-base"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear cuenta
                </Button>
              </p>
            </div>
          </div>

	          </div>


          {/* Error de login */}
          {loginError && (
            <Alert className="login-error border-red-400 bg-red-400/10 mb-4 max-w-3xl mx-auto">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-300">
                <strong>Error:</strong> {loginError}
              </AlertDescription>
            </Alert>
          )}

          {/* Footer */}
          <div className="text-center mt-8 text-gray-500 text-sm">
            <p className="font-medium">MindFit App - Tu entrenador personal inteligente</p>
            <p className="mt-1">Datos seguros y privados</p>
          </div>
        </div>
      </div>
      </>
  );
};

export default LoginPage;
