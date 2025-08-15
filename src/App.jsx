// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';

import { UserProvider } from '@/contexts/UserContext';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { MusicProvider } from '@/contexts/MusicContext.jsx';

import LoginPage from '@/components/LoginPage';
import InitialProfileForm from '@/components/InitialProfileForm';
import UserProfile from '@/components/UserProfile';
import ProfileScreen from '@/components/ProfileScreen';

import HomeScreen from '@/components/HomeScreen';
import MethodologiesScreen from '@/components/MethodologiesScreen';
import RoutinesScreen from '@/components/RoutinesScreen';

import AIAdaptiveSection from '@/components/AIAdaptiveSection';
import HomeTrainingSection from '@/components/HomeTrainingSection';
import VideoCorrectionSection from '@/components/VideoCorrectionSection';
import NutritionScreen from '@/components/NutritionScreen';
import InjuriesScreen from '@/components/InjuriesScreen';
import ProgressScreen from '@/components/ProgressScreen';
import OpenAITest from '@/components/OpenAITest';

import MusicSettingsScreen from '@/components/MusicSettingsScreen';

import { Card, CardContent } from '@/components/ui/card.jsx';

import {
  Home,
  User,
  Dumbbell,
  Calendar,
  Apple,
  Heart,
  TrendingUp,
  Settings as SettingsIcon,
  ChevronRight,
  Camera,
  Music
} from 'lucide-react';

import './App.css';

const Navigation = () => {
  const location = useLocation();

  // Todos los elementos de navegación (ahora en una sola lista)
  const allNavItems = [
    { path: '/', icon: Home, label: 'Inicio' },
    { path: '/profile', icon: User, label: 'Perfil' },
    { path: '/methodologies', icon: Dumbbell, label: 'Metodologías' },
    { path: '/routines', icon: Calendar, label: 'Rutinas' },
    { path: '/settings', icon: SettingsIcon, label: 'Ajustes' },
    { path: '/nutrition', icon: Apple, label: 'Nutrición' },
    { path: '/injuries', icon: Heart, label: 'Lesiones' },
    { path: '/progress', icon: TrendingUp, label: 'Progreso' }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-sm border-t border-yellow-400/20 z-40">
      {/* Versión móvil con scroll horizontal */}
      <div className="md:hidden overflow-x-auto scrollbar-hide">
        <div className="flex items-center py-2 px-2 min-w-max">
          {allNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors min-w-[70px] mx-1 ${
                  isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
                }`}
              >
                <Icon size={18} />
                <span className="text-xs mt-1 text-center whitespace-nowrap">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Versión desktop (todos los elementos) */}
      <div className="hidden md:flex justify-around items-center py-2 px-4">
        {allNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive ? 'text-yellow-400' : 'text-gray-400 hover:text-yellow-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

const SettingsScreen = () => {
  return (
    <div className="min-h-screen bg-black text-white p-6 pt-20 pb-24">
      <h1 className="text-3xl font-bold mb-6 text-yellow-400">Ajustes y Configuración</h1>

      <div className="space-y-4">
        <Link to="/settings/music" className="block">
          <Card className="bg-gray-900 border-yellow-400/20 hover:border-yellow-400/40 transition-colors">
            <CardContent className="p-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <Music className="w-5 h-5 text-yellow-400" />
                  <span className="text-white">Configuración Musical</span>
                </div>
                <ChevronRight className="text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-yellow-400" />
                <span className="text-white">Corrección por Video IA</span>
              </div>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Privacidad</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-400/20">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <span className="text-white">Acerca de</span>
              <ChevronRight className="text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const AppContent = () => {
  const { currentUser, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Cargando MindFit.</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    if (location.pathname === '/register') return <InitialProfileForm />;
    return <LoginPage />;
  }

  return (
    <UserProvider>
      <MusicProvider>
        <div className="App">
          <UserProfile />

          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/profile" element={<ProfileScreen />} />
            <Route path="/methodologies" element={<MethodologiesScreen />} />
            <Route path="/routines" element={<RoutinesScreen />} />
            <Route path="/nutrition" element={<NutritionScreen />} />
            <Route path="/injuries" element={<InjuriesScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />

            {/* Música */}
            <Route path="/settings/music" element={<MusicSettingsScreen />} />

            {/* Extras */}
            <Route path="/ai-adaptive" element={<AIAdaptiveSection />} />
            <Route path="/home-training" element={<HomeTrainingSection />} />
            <Route path="/video-correction" element={<VideoCorrectionSection />} />
            <Route path="/openai-test" element={<OpenAITest />} />
          </Routes>

          <div className="safe-bottom">
            <Navigation />
          </div>
        </div>
      </MusicProvider>
    </UserProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
