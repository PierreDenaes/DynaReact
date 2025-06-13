import React from 'react';
import { useAuth } from '../hooks/useAuth';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                🏋️ DynProt
              </div>
            </div>

            {/* User Info */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Bonjour, <span className="font-semibold">{user?.prenom}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-xs text-gray-500">
                  Objectif: {user?.daily_protein_goal}g
                </div>
                <button
                  onClick={logout}
                  className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  title="Déconnexion"
                >
                  🚪
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 h-[calc(100vh-4rem)]">
        {children}
      </main>
    </div>
  );
};

export default Layout;