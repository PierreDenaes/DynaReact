import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { api } from '../services/api';
import ProgressChart from './ProgressChart';
import MealEntry from './MealEntry';

const Dashboard = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState(null);
  const [meals, setMeals] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
      
      // Rafraîchir les données toutes les 30 secondes
      const interval = setInterval(() => {
        fetchDashboardData();
      }, 30000);

      // Écouter les événements de repas sauvegardés
      const handleMealSaved = () => {
        fetchDashboardData();
      };

      window.addEventListener('mealSaved', handleMealSaved);
      
      return () => {
        clearInterval(interval);
        window.removeEventListener('mealSaved', handleMealSaved);
      };
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [progressRes, mealsRes, weeklyRes] = await Promise.all([
        api.get(`/meals/progress/${user.user_id}`),
        api.get(`/meals/${user.user_id}`),
        api.get(`/meals/progress/weekly/${user.user_id}`)
      ]);

      setProgress(progressRes.progress);
      setMeals(mealsRes.meals);
      setWeeklyProgress(weeklyRes.weeklyProgress);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMealDeleted = (mealId) => {
    setMeals(prev => prev.filter(meal => meal.id !== mealId));
    fetchDashboardData(); // Refresh progress
  };

  const handleResetMeals = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer tous les repas d\'aujourd\'hui ?')) {
      return;
    }

    try {
      await api.delete(`/meals/reset/${user.user_id}`);
      
      // Refresh the dashboard data
      fetchDashboardData();
      
      // Show success message (you could use a toast library here)
      alert('Tous les repas ont été supprimés !');
    } catch (error) {
      console.error('Failed to reset meals:', error);
      alert('Erreur lors de la suppression des repas');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const progressPercentage = progress ? (progress.total_proteins / progress.daily_protein_goal) * 100 : 0;
  const remaining = progress ? Math.max(0, progress.daily_protein_goal - progress.total_proteins) : 0;

  return (
    <div className="h-full overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Salut {user?.prenom} ! 👋
          </h1>
          <p className="text-gray-600">Voici ton tableau de bord DynProt</p>
        </div>

        {/* Progress Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Progression du jour</h2>
            <div className="flex items-center gap-3">
              <div className="text-sm text-gray-500">
                {new Date().toLocaleDateString('fr-FR')}
              </div>
              {meals.length > 0 && (
                <button
                  onClick={handleResetMeals}
                  className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                  title="Effacer tous les repas du jour"
                >
                  🔄 Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-600">
                {progress?.total_proteins || 0}g
              </div>
              <div className="text-sm text-gray-600">Protéines consommées</div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-600">
                {progress?.daily_protein_goal || 0}g
              </div>
              <div className="text-sm text-gray-600">Objectif quotidien</div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg p-4">
              <div className="text-2xl font-bold text-purple-600">
                {remaining}g
              </div>
              <div className="text-sm text-gray-600">Restant à consommer</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progression</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ${
                  progressPercentage >= 100 ? 'bg-green-500' :
                  progressPercentage >= 75 ? 'bg-blue-500' :
                  progressPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
          </div>

          {/* Status Message */}
          <div className="text-center">
            {progressPercentage >= 100 ? (
              <div className="text-green-600 font-semibold">
                🎉 Félicitations ! Objectif atteint !
              </div>
            ) : progressPercentage >= 75 ? (
              <div className="text-blue-600 font-semibold">
                💪 Excellent ! Vous êtes sur la bonne voie !
              </div>
            ) : progressPercentage >= 50 ? (
              <div className="text-yellow-600 font-semibold">
                👍 Bon travail ! Continuez comme ça !
              </div>
            ) : (
              <div className="text-red-600 font-semibold">
                📈 Allez-y ! Vous pouvez y arriver !
              </div>
            )}
          </div>
        </div>

        {/* Weekly Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Progression de la semaine
          </h2>
          <ProgressChart data={weeklyProgress} />
        </div>

        {/* Today's Meals */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Repas d'aujourd'hui
          </h2>
          
          {meals.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-4">🍽️</div>
              <p className="text-gray-500">
                Aucun repas enregistré aujourd'hui
              </p>
              <p className="text-sm text-gray-400 mt-2">
                Utilisez le chat pour ajouter vos repas
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {meals.map((meal) => (
                <MealEntry 
                  key={meal.id} 
                  meal={meal} 
                  onDelete={handleMealDeleted}
                />
              ))}
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Informations personnelles
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Âge:</span>
                <span className="font-medium">{user?.age} ans</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Poids:</span>
                <span className="font-medium">{user?.poids} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Activité:</span>
                <span className="font-medium">{user?.niveau_activite}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Objectif:</span>
                <span className="font-medium">{user?.objectif_principal}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Conseils du jour
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">💡</span>
                <span>Variez vos sources de protéines</span>
              </div>
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">🥤</span>
                <span>N'oubliez pas de vous hydrater</span>
              </div>
              <div className="flex items-start">
                <span className="text-yellow-500 mr-2">⏰</span>
                <span>Répartissez vos protéines sur la journée</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
