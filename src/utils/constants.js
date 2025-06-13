export const ACTIVITY_LEVELS = [
  { value: 'Sédentaire', label: 'Sédentaire (peu ou pas d\'exercice)' },
  { value: 'Légèrement actif', label: 'Légèrement actif (exercice léger 1-3 jours/semaine)' },
  { value: 'Modérément actif', label: 'Modérément actif (exercice modéré 3-5 jours/semaine)' },
  { value: 'Très actif', label: 'Très actif (exercice intense 6-7 jours/semaine)' },
  { value: 'Extrêmement actif', label: 'Extrêmement actif (exercice très intense, travail physique)' }
];

export const MAIN_OBJECTIVES = [
  { value: 'Maintenir mon poids actuel', label: 'Maintenir mon poids actuel' },
  { value: 'Perdre du poids / Définition musculaire', label: 'Perdre du poids / Définition musculaire' },
  { value: 'Prendre de la masse musculaire', label: 'Prendre de la masse musculaire' },
  { value: 'Améliorer mes performances sportives', label: 'Améliorer mes performances sportives' }
];

export const PROTEIN_SOURCES = [
  { name: 'Poulet', proteins_per_100g: 23 },
  { name: 'Bœuf', proteins_per_100g: 26 },
  { name: 'Porc', proteins_per_100g: 27 },
  { name: 'Poisson blanc', proteins_per_100g: 20 },
  { name: 'Saumon', proteins_per_100g: 25 },
  { name: 'Thon', proteins_per_100g: 30 },
  { name: 'Œufs', proteins_per_100g: 13 },
  { name: 'Fromage blanc', proteins_per_100g: 8 },
  { name: 'Yaourt grec', proteins_per_100g: 10 },
  { name: 'Lentilles', proteins_per_100g: 9 },
  { name: 'Haricots rouges', proteins_per_100g: 8 },
  { name: 'Quinoa', proteins_per_100g: 4 },
  { name: 'Tofu', proteins_per_100g: 8 },
  { name: 'Tempeh', proteins_per_100g: 19 },
  { name: 'Amandes', proteins_per_100g: 21 },
  { name: 'Cacahuètes', proteins_per_100g: 26 }
];

export const MESSAGE_TYPES = {
  USER: 'user',
  AI: 'ai',
  SYSTEM: 'system'
};

export const CHAT_ACTIONS = {
  MEAL: 'MEAL',
  GOAL_UPDATE: 'GOAL_UPDATE',
  STATUS: 'STATUS',
  GENERAL: 'GENERAL',
  IMAGE: 'IMAGE'
};

export const CONFIDENCE_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const QUICK_SUGGESTIONS = [
  "Où j'en suis ?",
  "J'ai mangé du poulet grillé",
  "200g de saumon",
  "3 œufs au petit déjeuner",
  "Un yaourt grec",
  "Nouvel objectif 150g",
  "Conseils protéines",
  "Quels aliments riches en protéines ?"
];

export const PROTEIN_TIPS = [
  "Répartissez vos protéines tout au long de la journée",
  "Combinez protéines animales et végétales",
  "N'oubliez pas les protéines au petit-déjeuner",
  "Les œufs sont une excellente source de protéines complètes",
  "Le fromage blanc est parfait en collation",
  "Les légumineuses apportent protéines et fibres",
  "Hydratez-vous suffisamment pour optimiser l'absorption",
  "Variez vos sources de protéines pour tous les acides aminés"
];

export const GOAL_RECOMMENDATIONS = {
  SEDENTARY: { min: 0.8, max: 1.0 }, // g par kg de poids corporel
  LIGHT_ACTIVE: { min: 1.0, max: 1.2 },
  MODERATE_ACTIVE: { min: 1.2, max: 1.4 },
  VERY_ACTIVE: { min: 1.4, max: 1.6 },
  EXTREMELY_ACTIVE: { min: 1.6, max: 2.0 }
};

export const COLORS = {
  PRIMARY: '#2563eb',
  SECONDARY: '#4f46e5',
  SUCCESS: '#10b981',
  WARNING: '#f59e0b',
  ERROR: '#ef4444',
  INFO: '#06b6d4'
};