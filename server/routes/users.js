const express = require('express');
const router = express.Router();
const database = require('../database');

// Update user goal
router.put('/goal/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { daily_protein_goal } = req.body;
    
    if (!daily_protein_goal || daily_protein_goal <= 0) {
      return res.status(400).json({ error: 'Valid protein goal required' });
    }

    await database.query(
      `UPDATE user_goals SET daily_protein_goal = $1, updated_at = $2 WHERE user_id = $3`,
      [daily_protein_goal, new Date().toISOString(), userId]
    );

    res.json({
      success: true,
      message: 'Goal updated successfully',
      daily_protein_goal
    });

  } catch (error) {
    console.error('Goal update error:', error);
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// Update user profile
router.put('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { prenom, age, poids, niveau_activite, objectif_principal } = req.body;
    
    const result = await database.query(
      `UPDATE user_profiles 
       SET prenom = $1, age = $2, poids = $3, niveau_activite = $4, objectif_principal = $5
       WHERE user_id = $6
       RETURNING *`,
      [prenom, age, poids, niveau_activite, objectif_principal, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user: result.rows[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

module.exports = router;