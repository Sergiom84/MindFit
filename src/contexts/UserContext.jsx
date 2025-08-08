import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Crear el contexto
const UserContext = createContext();

// Hook personalizado para usar el contexto
export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext debe ser usado dentro de un UserProvider');
  }
  return context;
};

// Provider del contexto
export const UserProvider = ({ children }) => {
  const { currentUser, getUserData, updateUserData: updateAuthUserData } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Obtener datos dinámicos del usuario actual
  const userData = currentUser || {};
  const panelIA = getUserData('panelIA') || {};
  const videoCorreccion = getUserData('videoCorreccion') || {};
  const entrenamientoCasa = getUserData('entrenamientoCasa') || {};
  const progreso = getUserData('progreso') || {};
  const rutinas = getUserData('rutinas') || {};
  const metodologiaActiva = getUserData('metodologiaActiva') || null;

  // Función para actualizar datos del usuario
  const updateUserData = async (newData) => {
    if (!currentUser) return false;

    // Persistir en backend (PATCH)
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/users/${currentUser.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newData)
      });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.error || 'Error al actualizar');

      // Actualizar en AuthContext también
      updateAuthUserData('', result.user);
      return true;
    } catch (e) {
      console.error('Error actualizando usuario en backend:', e);
      return false;
    }
  };

  // Función para actualizar el panel IA
  const updatePanelIA = (newPanelData) => {
    if (!currentUser) return false;

    const updatedPanelData = {
      ...panelIA,
      ...newPanelData,
      ultimaActualizacion: new Date().toISOString()
    };

    return updateAuthUserData('panelIA', updatedPanelData);
  };

  // Función para activar IA adaptativa
  const activarIAAdaptativa = async (modo) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/activar-ia-adaptativa`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modo: modo,
          variablesPrompt: userData
        })
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar el panel con la respuesta de la IA
        updatePanelIA({
          ...data.respuestaIA,
          modoActivo: modo,
          ultimaActualizacion: data.timestamp
        });
        
        return {
          success: true,
          data: data.respuestaIA
        };
      } else {
        throw new Error(data.error || 'Error desconocido');
      }
    } catch (error) {
      console.error('Error activando IA adaptativa:', error);
      return {
        success: false,
        error: error.message
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para resetear el panel IA a valores por defecto
  const resetPanelIA = () => {
    if (!currentUser) return false;

    const defaultPanelIA = {
      estadoMetabolico: "Bueno",
      recuperacionNeural: "75%",
      eficienciaAdaptativa: "+5%",
      proximaRevision: "7 días",
      alertas: [],
      ultimaActualizacion: null,
      modoActivo: null
    };

    return updateAuthUserData('panelIA', defaultPanelIA);
  };

  // Función para obtener el color del estado metabólico
  const getEstadoMetabolicoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'óptimo':
        return 'text-green-400';
      case 'bueno':
        return 'text-blue-400';
      case 'regular':
        return 'text-yellow-400';
      case 'necesita ajuste':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  // Función para establecer metodología activa
  const setMetodologiaActiva = (metodologia, fechaInicio, fechaFin) => {
    if (!currentUser) return false;

    const metodologiaData = {
      metodologia,
      fechaInicio,
      fechaFin,
      progreso: 0,
      entrenamientosCompletados: 0,
      fechaSeleccion: new Date().toISOString()
    };

    return updateAuthUserData('metodologiaActiva', metodologiaData);
  };

  // Función para actualizar progreso de metodología
  const updateMetodologiaProgress = (nuevoProgreso, entrenamientosCompletados = null) => {
    if (!currentUser || !metodologiaActiva) return false;

    const updatedData = {
      ...metodologiaActiva,
      progreso: nuevoProgreso,
      entrenamientosCompletados: entrenamientosCompletados || metodologiaActiva.entrenamientosCompletados || 0,
      ultimaActualizacion: new Date().toISOString()
    };

    return updateAuthUserData('metodologiaActiva', updatedData);
  };

  // Función para completar un entrenamiento
  const completarEntrenamiento = () => {
    if (!currentUser || !metodologiaActiva) return false;

    const entrenamientosCompletados = (metodologiaActiva.entrenamientosCompletados || 0) + 1;
    const metodologia = metodologiaActiva.metodologia;

    // Calcular progreso basado en entrenamientos completados
    const frecuenciaSemanal = parseInt(metodologia.frequency?.split('-')[0]) || 3;
    const duracionSemanas = parseInt(metodologia.programDuration?.split('-')[1]) || 8;
    const totalEntrenamientos = frecuenciaSemanal * duracionSemanas;
    const nuevoProgreso = Math.min((entrenamientosCompletados / totalEntrenamientos) * 100, 100);

    return updateMetodologiaProgress(nuevoProgreso, entrenamientosCompletados);
  };

  // Función para obtener el color de las alertas
  const getAlertColor = (tipo) => {
    switch (tipo) {
      case 'success':
        return 'border-green-400 bg-green-400/10 text-green-300';
      case 'warning':
        return 'border-yellow-400 bg-yellow-400/10 text-yellow-300';
      case 'info':
        return 'border-blue-400 bg-blue-400/10 text-blue-300';
      default:
        return 'border-gray-400 bg-gray-400/10 text-gray-300';
    }
  };

  const value = {
    // Datos del usuario actual (dinámicos)
    userData,
    updateUserData,

    // Panel IA (dinámico)
    panelIA,
    updatePanelIA,
    resetPanelIA,

    // Datos específicos por sección (dinámicos)
    videoCorreccion,
    entrenamientoCasa,
    progreso,
    rutinas,

    // Metodología activa
    metodologiaActiva,
    setMetodologiaActiva,
    updateMetodologiaProgress,
    completarEntrenamiento,

    // Estados
    isLoading,

    // Funciones
    activarIAAdaptativa,
    getEstadoMetabolicoColor,
    getAlertColor,

    // Información del usuario actual
    currentUser,
    isUserLoggedIn: !!currentUser
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
