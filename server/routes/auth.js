const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../services/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const SALT_ROUNDS = 12;

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { email, password, prenom } = req.body;
    
    if (!email || !password || !prenom) {
      return res.status(400).json({ error: 'Email, mot de passe et prénom requis' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Check if user already exists
    const existingUser = await db.query(
      'SELECT user_id FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Un compte existe déjà avec cet email' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    
    // Insert user with onboarding_completed = false
    const result = await db.query(
      `INSERT INTO users (email, password_hash, onboarding_completed)
       VALUES ($1, $2, $3) RETURNING user_id`,
      [email.toLowerCase(), passwordHash, false]
    );

    const userId = result.rows[0].user_id;

    // Generate JWT token
    const token = jwt.sign(
      { userId, email: email.toLowerCase() },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      user: {
        user_id: userId,
        email: email.toLowerCase(),
        prenom,
        onboarding_completed: false
      },
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    // Find user
    const result = await db.query(
      `SELECT u.*, up.prenom, up.age, up.poids, up.niveau_activite, up.objectif_principal, up.daily_protein_goal
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.email = $1`,
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.user_id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Return user data without password hash
    const userData = {
      user_id: user.user_id,
      email: user.email,
      prenom: user.prenom,
      onboarding_completed: user.onboarding_completed || false,
      age: user.age,
      poids: user.poids,
      niveau_activite: user.niveau_activite,
      objectif_principal: user.objectif_principal,
      daily_protein_goal: user.daily_protein_goal
    };

    res.json({
      success: true,
      user: userData,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
});

// Complete user profile (onboarding)
router.post('/register-profile', async (req, res) => {
  try {
    const { user_id, prenom, age, poids, niveau_activite, objectif_principal, daily_protein_goal } = req.body;
    
    if (!user_id || !prenom || !age || !poids || !daily_protein_goal) {
      return res.status(400).json({ error: 'Tous les champs requis doivent être remplis' });
    }

    // Insert or update user profile
    await db.query(
      `INSERT INTO user_profiles (user_id, prenom, age, poids, niveau_activite, objectif_principal, daily_protein_goal)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (user_id) DO UPDATE SET
       prenom = $2, age = $3, poids = $4, niveau_activite = $5, objectif_principal = $6, daily_protein_goal = $7`,
      [user_id, prenom, age, poids, niveau_activite, objectif_principal, daily_protein_goal]
    );

    // Update onboarding status
    await db.query(
      `UPDATE users 
       SET onboarding_completed = true
       WHERE user_id = $1`,
      [user_id]
    );

    res.json({
      success: true,
      user: {
        user_id,
        prenom,
        age,
        poids,
        niveau_activite,
        objectif_principal,
        daily_protein_goal,
        onboarding_completed: true
      }
    });

  } catch (error) {
    console.error('Profile registration error:', error);
    res.status(500).json({ error: 'Erreur lors de la configuration du profil' });
  }
});

// Get user profile
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await db.query(
      `SELECT u.user_id, u.email, u.onboarding_completed, up.prenom, up.age, up.poids, up.niveau_activite, up.objectif_principal, up.daily_protein_goal
       FROM users u
       LEFT JOIN user_profiles up ON u.user_id = up.user_id
       WHERE u.user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: result.rows[0] });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Token d\'authentification requis' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token invalide' });
  }
};

module.exports = router;
module.exports.verifyToken = verifyToken;
