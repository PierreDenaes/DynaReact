import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { ACTIVITY_LEVELS, MAIN_OBJECTIVES } from '../utils/constants';

const Onboarding = () => {
  const { registerProfile } = useAuth();
  const [formData, setFormData] = useState({
    prenom: '',
    age: '',
    poids: '',
    niveau_activite: '',
    objectif_principal: '',
    daily_protein_goal: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.prenom.trim()) newErrors.prenom = 'Prénom requis';
    if (!formData.age || formData.age < 1 || formData.age > 120) newErrors.age = 'Âge valide requis';
    if (!formData.poids || formData.poids < 1 || formData.poids > 500) newErrors.poids = 'Poids valide requis';
    if (!formData.niveau_activite) newErrors.niveau_activite = 'Niveau d\'activité requis';
    if (!formData.objectif_principal) newErrors.objectif_principal = 'Objectif principal requis';
    if (!formData.daily_protein_goal || formData.daily_protein_goal < 1 || formData.daily_protein_goal > 500) {
      newErrors.daily_protein_goal = 'Objectif protéines valide requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      const user = await registerProfile({
        ...formData,
        age: parseInt(formData.age),
        poids: parseFloat(formData.poids),
        daily_protein_goal: parseInt(formData.daily_protein_goal)
      });
      
      // Success - user will be automatically redirected by App.jsx
      console.log('Profile registration successful:', user);
      
    } catch (error) {
      console.error('Profile registration failed:', error);
      setErrors({ general: 'Erreur lors de la configuration du profil. Veuillez réessayer.' });
      setLoading(false);
    }
    // Note: Don't set loading to false on success, let the navigation happen
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🏋️</div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Bienvenue sur DynProt
          </h1>
          <p className="text-gray-600">
            Configurons votre profil nutritionnel pour optimiser votre apport en protéines
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              {errors.general}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prénom *
              </label>
              <input
                type="text"
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.prenom ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Votre prénom"
              />
              {errors.prenom && <p className="text-red-500 text-sm mt-1">{errors.prenom}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Âge *
              </label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                min="1"
                max="120"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.age ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Votre âge"
              />
              {errors.age && <p className="text-red-500 text-sm mt-1">{errors.age}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Poids actuel (kg) *
              </label>
              <input
                type="number"
                name="poids"
                value={formData.poids}
                onChange={handleChange}
                min="1"
                max="500"
                step="0.1"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.poids ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Votre poids"
              />
              {errors.poids && <p className="text-red-500 text-sm mt-1">{errors.poids}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Objectif quotidien de protéines (g) *
              </label>
              <input
                type="number"
                name="daily_protein_goal"
                value={formData.daily_protein_goal}
                onChange={handleChange}
                min="1"
                max="500"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.daily_protein_goal ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ex: 120"
              />
              {errors.daily_protein_goal && <p className="text-red-500 text-sm mt-1">{errors.daily_protein_goal}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Niveau d'activité *
            </label>
            <select
              name="niveau_activite"
              value={formData.niveau_activite}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.niveau_activite ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez votre niveau</option>
              {ACTIVITY_LEVELS.map(level => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.niveau_activite && <p className="text-red-500 text-sm mt-1">{errors.niveau_activite}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Objectif principal *
            </label>
            <select
              name="objectif_principal"
              value={formData.objectif_principal}
              onChange={handleChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.objectif_principal ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Sélectionnez votre objectif</option>
              {MAIN_OBJECTIVES.map(obj => (
                <option key={obj.value} value={obj.value}>
                  {obj.label}
                </option>
              ))}
            </select>
            {errors.objectif_principal && <p className="text-red-500 text-sm mt-1">{errors.objectif_principal}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-2"></div>
                Configuration en cours...
              </div>
            ) : (
              '🚀 Commencer mon suivi DynProt'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>En continuant, vous acceptez nos conditions d'utilisation</p>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;
