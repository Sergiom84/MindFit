import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '../contexts/AuthContext';
import { getAvailableUsers } from '../data/UserProfiles';
import Avatar from './Avatar';
import { 
  Brain, 
  User, 
  Zap, 
  Target, 
  Trophy,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

const LoginPage = () => {
  const { login, isLoading } = useAuth();
  const [selectedUser, setSelectedUser] = useState(null);
  const [loginError, setLoginError] = useState(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const availableUsers = getAvailableUsers();

  // Configuración visual para cada nivel de usuario
  const userLevelConfig = {
    principiante: {
      color: 'border-green-400',
      bgColor: 'bg-green-400/10',
      textColor: 'text-green-400',
      icon: <Target className="w-8 h-8" />,
      description: 'Comenzando el viaje fitness',
      features: ['Rutinas básicas', 'Técnica fundamental', 'Progreso gradual']
    },
    intermedio: {
      color: 'border-yellow-400',
      bgColor: 'bg-yellow-400/10',
      textColor: 'text-yellow-400',
      icon: <Zap className="w-8 h-8" />,
      description: 'Desarrollando fuerza y técnica',
      features: ['Rutinas variadas', 'Técnica refinada', 'Objetivos específicos']
    },
    avanzado: {
      color: 'border-red-400',
      bgColor: 'bg-red-400/10',
      textColor: 'text-red-400',
      icon: <Trophy className="w-8 h-8" />,
      description: 'Maximizando rendimiento',
      features: ['Entrenamiento complejo', 'Periodización avanzada', 'Rendimiento óptimo']
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    setLoginError(null);
  };

  const handleLogin = async () => {
    if (!selectedUser) {
      setLoginError('Por favor selecciona un usuario');
      return;
    }

    setIsLoggingIn(true);
    setLoginError(null);

    try {
      const result = await login(selectedUser);
      
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

        {/* Selección de Usuario */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {availableUsers.map((user) => {
            const config = userLevelConfig[user.nivel];
            const isSelected = selectedUser === user.id;
            
            return (
              <Card
                key={user.id}
                className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? `${config.color} ${config.bgColor} shadow-lg shadow-${config.color.split('-')[1]}-400/20`
                    : 'bg-gray-900 border-gray-700 hover:border-gray-600'
                }`}
                onClick={() => handleUserSelect(user.id)}
              >
                <CardHeader className="text-center">
                  <div className="flex flex-col items-center space-y-4">
                    {/* Avatar con iniciales */}
                    <Avatar
                      avatar={user.avatar}
                      iniciales={user.iniciales}
                      nombre={user.nombre}
                      size="2xl"
                      showBorder={isSelected}
                    />

                    {/* Icono de nivel */}
                    <div className={isSelected ? config.textColor : 'text-gray-400'}>
                      {config.icon}
                    </div>
                    
                    {/* Nombre y nivel */}
                    <div>
                      <CardTitle className="text-white text-2xl mb-2">
                        {user.nombre}
                      </CardTitle>
                      <Badge 
                        className={`${config.bgColor} ${config.textColor} border-0 text-sm font-semibold uppercase tracking-wide`}
                      >
                        {user.nivel}
                      </Badge>
                    </div>
                    
                    {/* Descripción */}
                    <p className="text-gray-400 text-sm text-center">
                      {config.description}
                    </p>
                  </div>
                </CardHeader>
                
                <CardContent>
                  {/* Características del nivel */}
                  <ul className="space-y-2">
                    {config.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center space-x-2 text-sm">
                        <CheckCircle className={`w-4 h-4 ${isSelected ? config.textColor : 'text-gray-500'}`} />
                        <span className={isSelected ? 'text-white' : 'text-gray-400'}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* Indicador de selección */}
                  {isSelected && (
                    <div className="mt-4 text-center">
                      <Badge className={`${config.bgColor} ${config.textColor} border-0`}>
                        ✓ Seleccionado
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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

        {/* Información adicional */}
        {selectedUser && (
          <Alert className="border-blue-400 bg-blue-400/10 mb-6">
            <User className="h-4 w-4" />
            <AlertDescription className="text-blue-300">
              <strong>Usuario seleccionado:</strong> {availableUsers.find(u => u.id === selectedUser)?.nombre} - 
              Accederás a datos y métricas personalizadas para nivel {availableUsers.find(u => u.id === selectedUser)?.nivel}.
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de login */}
        <div className="text-center">
          <Button
            onClick={handleLogin}
            disabled={!selectedUser || isLoggingIn || isLoading}
            className="bg-yellow-400 text-black hover:bg-yellow-300 px-12 py-4 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn || isLoading ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <Brain className="w-5 h-5 mr-2" />
                Acceder a MindFit
              </>
            )}
          </Button>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500 text-sm">
          <p>Demo de MindFit App - Datos simulados para demostración</p>
          <p className="mt-2">Cada usuario tiene métricas y progreso únicos</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
