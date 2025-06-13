import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Onboarding from './components/Onboarding';
import Chat from './components/Chat';
import Dashboard from './components/Dashboard';
import { useAuth } from './hooks/useAuth';

function AppContent() {
  const { user, isOnboarded, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  if (!isOnboarded) {
    return <Onboarding />;
  }

  return (
    <Layout>
      <div className="flex flex-col lg:flex-row h-full">
        <div className="lg:w-1/2 border-r border-gray-200">
          <Dashboard />
        </div>
        <div className="lg:w-1/2">
          <Chat />
        </div>
      </div>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <div className="min-h-screen bg-gray-50">
          <AppContent />
        </div>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;
