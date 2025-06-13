import React, { useState } from 'react';
import { api } from '../services/api';

const MealEntry = ({ meal, onDelete }) => {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce repas ?')) {
      return;
    }

    try {
      setDeleting(true);
      await api.delete(`/meals/${meal.id}`);
      onDelete(meal.id);
    } catch (error) {
      console.error('Failed to delete meal:', error);
      alert('Erreur lors de la suppression du repas');
    } finally {
      setDeleting(false);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMethodIcon = (method) => {
    switch (method?.toLowerCase()) {
      case 'analyse d\'image':
        return '📷';
      case 'analyse textuelle':
        return '📝';
      default:
        return '🍽️';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence?.toLowerCase()) {
      case 'high':
        return 'text-green-600 bg-green-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-lg">{getMethodIcon(meal.methode)}</span>
            <h4 className="font-semibold text-gray-900">{meal.produit}</h4>
            <span className="text-sm text-gray-500">
              {formatTime(meal.timestamp)}
            </span>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">
                <span className="font-medium text-blue-600">
                  {meal.proteines_apportees || 0}g
                </span> de protéines
              </span>
              
              {meal.poids_estime && (
                <span className="text-gray-600">
                  Poids: {meal.poids_estime}g
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <span className="text-gray-500">Méthode:</span>
              <span className="text-gray-700">{meal.methode}</span>
              
              {meal.source && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-500">{meal.source}</span>
                </>
              )}
            </div>
            
            {meal.description_visuelle && (
              <div className="mt-2">
                <p className="text-gray-600 text-xs bg-gray-50 rounded p-2">
                  {meal.description_visuelle.length > 150 
                    ? `${meal.description_visuelle.substring(0, 150)}...`
                    : meal.description_visuelle
                  }
                </p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
            title="Supprimer ce repas"
          >
            {deleting ? (
              <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
            ) : (
              '🗑️'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MealEntry;