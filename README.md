# DynProt 🥗

DynProt est une application web intelligente de suivi nutritionnel qui utilise l'IA pour analyser vos repas et calculer automatiquement leur teneur en protéines. Conçue pour les sportifs, les nutritionnistes et toute personne souhaitant optimiser son apport protéique quotidien.

## 🎯 Fonctionnalités principales

- **📸 Analyse d'images de repas** : Prenez une photo de votre repas et obtenez instantanément une analyse nutritionnelle détaillée
- **💬 Chat intelligent** : Conversez avec un assistant IA nutritionniste pour obtenir des conseils personnalisés
- **📊 Dashboard interactif** : Visualisez votre progression et vos statistiques nutritionnelles
- **🔐 Authentification sécurisée** : Connexion via Supabase Auth pour protéger vos données
- **📱 Interface responsive** : Design moderne et adaptatif pour tous les appareils
- **🎯 Suivi des objectifs** : Définissez et suivez vos objectifs protéiques quotidiens

## 🛠️ Stack Technique

### Frontend
- **React 18** - Framework UI moderne
- **Vite** - Build tool ultra-rapide
- **TailwindCSS** - Framework CSS utility-first
- **Material-UI** - Composants UI professionnels
- **Supabase** - Backend-as-a-Service pour l'authentification

### Backend
- **Node.js & Express** - Serveur API REST
- **OpenAI GPT-4** - Analyse textuelle des repas
- **Claude AI** - Analyse d'images de repas
- **SQLite/PostgreSQL** - Base de données
- **JWT** - Authentification sécurisée

## 📁 Structure du projet

```
dynprot/
├── src/                      # Code source frontend
│   ├── components/          # Composants React
│   │   ├── Auth.jsx        # Gestion de l'authentification
│   │   ├── Chat.jsx        # Interface de chat IA
│   │   ├── Dashboard.jsx   # Tableau de bord
│   │   ├── MealEntry.jsx   # Saisie des repas
│   │   └── ProgressChart.jsx # Graphiques de progression
│   ├── context/            # Contextes React
│   │   ├── AuthContext.jsx # Contexte d'authentification
│   │   └── AppContext.jsx  # Contexte global de l'app
│   ├── hooks/              # Hooks personnalisés
│   ├── services/           # Services API
│   └── utils/              # Utilitaires
├── server/                  # Backend Node.js
│   ├── routes/             # Routes API
│   │   ├── auth.js        # Routes d'authentification
│   │   ├── chat.js        # Routes de chat
│   │   ├── meals.js       # Routes de gestion des repas
│   │   └── users.js       # Routes utilisateurs
│   ├── services/           # Services métier
│   │   ├── mealAnalysis.js # Analyse IA des repas
│   │   ├── imageAnalysis.js # Analyse d'images
│   │   └── openai.js      # Intégration OpenAI
│   └── middleware/         # Middlewares Express
└── public/                 # Assets statiques
```

## 🚀 Installation

### Prérequis
- Node.js 18+ et npm
- Compte Supabase (pour l'authentification)
- Clés API OpenAI et/ou Claude

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone https://github.com/votre-username/dynprot.git
cd dynprot
```

2. **Installer les dépendances**
```bash
# Frontend
npm install

# Backend
cd server
npm install
```

3. **Configuration de l'environnement**

Créer un fichier `.env` à la racine du projet :
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Créer un fichier `.env` dans le dossier `server/` :
```env
# Server
PORT=5001
JWT_SECRET=your_jwt_secret

# Database
DATABASE_URL=your_database_url

# API Keys
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
```

4. **Initialiser la base de données**
```bash
cd server
npm run init-db
```

5. **Lancer l'application**
```bash
# Terminal 1 - Frontend
npm run dev

# Terminal 2 - Backend
npm run start:server
```

L'application sera accessible sur `http://localhost:5173`

## 📝 Utilisation

1. **Créer un compte** : Inscrivez-vous avec votre email
2. **Compléter votre profil** : Renseignez vos objectifs nutritionnels
3. **Ajouter des repas** :
   - Prenez une photo de votre repas
   - Ou décrivez-le textuellement
   - L'IA analysera automatiquement la composition
4. **Consulter le dashboard** : Suivez votre progression quotidienne
5. **Utiliser le chat** : Posez des questions nutritionnelles à l'assistant

## 🔧 Scripts disponibles

### Frontend
- `npm run dev` - Lance le serveur de développement
- `npm run build` - Build de production
- `npm run lint` - Vérification du code
- `npm run preview` - Prévisualisation du build

### Backend
- `npm start` - Lance le serveur en production
- `npm run dev` - Lance le serveur en développement (avec nodemon)
- `npm run init-db` - Initialise la base de données
- `npm run migrate` - Execute les migrations

## 🔐 Sécurité

- Authentification via JWT et Supabase Auth
- Validation des données côté serveur
- Sanitization des entrées utilisateur
- HTTPS en production
- Rate limiting sur les endpoints sensibles
- Stockage sécurisé des images uploadées

## 🧪 Tests

```bash
# Lancer les tests unitaires
npm test

# Tests d'intégration
npm run test:integration

# Tests E2E
npm run test:e2e
```

## 📈 Performances

- Build optimisé avec Vite
- Lazy loading des composants
- Mise en cache des analyses
- Compression des images
- CDN pour les assets statiques

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez votre branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteurs

- **Votre Nom** - *Développeur principal* - [@votre-username](https://github.com/votre-username)

## 🙏 Remerciements

- OpenAI pour l'API GPT-4
- Anthropic pour Claude AI
- La communauté React et Vite
- Tous les contributeurs du projet

---

**DynProt** - Votre assistant nutritionnel intelligent 🚀
