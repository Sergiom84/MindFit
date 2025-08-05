import React, { createContext, useContext, useState, useEffect } from 'react';

// Crear el contexto de autenticación
const AuthContext = createContext();

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar usuario desde localStorage al inicializar
  useEffect(() => {
    const loadUserFromStorage = () => {
      try {
        const storedUser = localStorage.getItem('mindfit_current_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
        }
      } catch (error) {
        console.error('Error cargando usuario desde localStorage:', error);
        localStorage.removeItem('mindfit_current_user');
      } finally {
        setIsLoading(false);
      }
    };

    loadUserFromStorage();
  }, []);

  // Función para hacer login
  const login = async (email, password) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error en el login');
      }

      // Guardar usuario en localStorage
      localStorage.setItem('mindfit_current_user', JSON.stringify(result.user));

      // Actualizar estado
      setCurrentUser(result.user);

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para hacer logout
  const logout = () => {
    try {
      // Limpiar localStorage
      localStorage.removeItem('mindfit_current_user');
      
      // Limpiar estado
      setCurrentUser(null);
      
      return { success: true };
    } catch (error) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  };

  // Función para verificar si el usuario está autenticado
  const isAuthenticated = () => {
    return currentUser !== null;
  };

  // Función para obtener datos específicos del usuario actual
  const getUserData = (dataPath) => {
    if (!currentUser) return null;
    
    // Permitir acceso a datos anidados usando dot notation
    // Ejemplo: getUserData('panelIA.estadoMetabolico')
    const keys = dataPath.split('.');
    let data = currentUser;
    
    for (const key of keys) {
      if (data && typeof data === 'object' && key in data) {
        data = data[key];
      } else {
        return null;
      }
    }
    
    return data;
  };

  // Función para actualizar datos del usuario (simulado)
  const updateUserData = (dataPath, newValue) => {
    if (!currentUser) return false;
    
    try {
      // Crear una copia profunda del usuario actual
      const updatedUser = JSON.parse(JSON.stringify(currentUser));
      
      // Navegar hasta el objeto padre del campo a actualizar
      const keys = dataPath.split('.');
      const lastKey = keys.pop();
      let targetObject = updatedUser;
      
      for (const key of keys) {
        if (targetObject && typeof targetObject === 'object' && key in targetObject) {
          targetObject = targetObject[key];
        } else {
          return false;
        }
      }
      
      // Actualizar el valor
      if (targetObject && typeof targetObject === 'object') {
        targetObject[lastKey] = newValue;
        setCurrentUser(updatedUser);
        
        // Opcional: persistir cambios en localStorage
        // (En una app real, esto se enviaría al backend)
        const userDataForStorage = {
          ...updatedUser,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem(`mindfit_user_data_${currentUser.id}`, JSON.stringify(userDataForStorage));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error actualizando datos del usuario:', error);
      return false;
    }
  };

  // Función para registrar usuario
  const register = async (userData) => {
    try {
      setIsLoading(true);

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Error en el registro');
      }

      return { success: true, user: result.user };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  // Función para obtener información básica del usuario actual
  const getCurrentUserInfo = () => {
    if (!currentUser) return null;
    
    return {
      id: currentUser.id,
      nombre: currentUser.nombre,
      apellido: currentUser.apellido,
      email: currentUser.email,
      avatar: currentUser.avatar,
      nivel: currentUser.nivel
    };
  };

  // Valor del contexto que se proporcionará a los componentes hijos
  const contextValue = {
    // Estado
    currentUser,
    isLoading,
    
    // Funciones de autenticación
    login,
    logout,
    register,
    isAuthenticated,
    
    // Funciones de datos
    getUserData,
    updateUserData,
    getCurrentUserInfo,
    
    // Datos de acceso rápido (para compatibilidad con componentes existentes)
    userData: currentUser,
    panelIA: currentUser?.panelIA || {},
    videoCorreccion: currentUser?.videoCorreccion || {},
    entrenamientoCasa: currentUser?.entrenamientoCasa || {},
    progreso: currentUser?.progreso || {},
    rutinas: currentUser?.rutinas || {}
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
