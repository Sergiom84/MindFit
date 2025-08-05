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

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

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
        setLoginError(result.error || 'Error al iniciar sesión');
      }
      // Si es exitoso, el AuthContext manejará la redirección
    } catch (error) {
      setLoginError('Error de conexión. Inténtalo de nuevo.');
      console.error('Error en login:', error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
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
                      onChange={(e) => setEmail(e.target.value)}
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
                      onChange={(e) => setPassword(e.target.value)}
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
                onClick={() => window.location.href = '/register'}
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
  );
};

export default LoginPage;
