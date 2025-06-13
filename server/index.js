const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Charger les variables d'environnement
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Importer le service de base de données
const db = require('./services/db');

// Importer les routes
const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const mealRoutes = require('./routes/meals');
const userRoutes = require('./routes/users');

const app = express();
const PORT = process.env.PORT || 5001;

// --- Middlewares ---
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Rate limiting plus permissif pour le développement
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: process.env.NODE_ENV === 'production' ? 100 : 1000, // 1000 en dev, 100 en prod
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de requêtes, veuillez réessayer dans une minute.'
  }
});
app.use(limiter);

// --- Routes de l'API ---
app.get('/', (req, res) => {
  res.send('API DynProt is running!');
});
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/meals', mealRoutes);
app.use('/api/users', userRoutes);

// --- Gestionnaire d'erreurs global ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

// --- Démarrage du serveur ---
const startServer = async () => {
  try {
    await db.initializeDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
