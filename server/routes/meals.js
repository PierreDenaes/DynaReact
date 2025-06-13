const express = require('express');
const router = express.Router();
const database = require('../services/db');

// Get meals for a specific date
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const result = await database.query(
      `SELECT * FROM meal_entries 
       WHERE user_id = $1 AND DATE(timestamp) = $2 
       ORDER BY timestamp DESC`,
      [userId, date]
    );

    res.json({
      success: true,
      meals: result.rows
    });

  } catch (error) {
    console.error('Meals fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch meals' });
  }
});

// Get daily progress
router.get('/progress/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const date = req.query.date || new Date().toISOString().split('T')[0];
    
    const result = await database.query(
      `SELECT 
         $2 as date,
         up.user_id, 
         up.prenom,
         COALESCE(SUM(me.proteines_apportees), 0) as total_proteins,
         up.daily_protein_goal,
         CASE WHEN up.daily_protein_goal > 0 THEN 
              ROUND((COALESCE(SUM(me.proteines_apportees), 0) * 100.0 / up.daily_protein_goal), 1)
         ELSE 0 END as progress_percent
       FROM user_profiles up
       LEFT JOIN meal_entries me ON up.user_id = me.user_id AND DATE(me.timestamp) = $2
       WHERE up.user_id = $1
       GROUP BY up.user_id, up.daily_protein_goal, up.prenom`,
      [userId, date]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      progress: result.rows[0]
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch progress' });
  }
});

// Get weekly progress
router.get('/progress/weekly/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // First get user goal
    const goalResult = await database.query(
      `SELECT daily_protein_goal FROM user_profiles WHERE user_id = $1`,
      [userId]
    );

    if (goalResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const dailyGoal = goalResult.rows[0].daily_protein_goal;
    
    // Generate last 7 days with data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayResult = await database.query(
        `SELECT COALESCE(SUM(proteines_apportees), 0) as total_proteins
         FROM meal_entries 
         WHERE user_id = $1 AND DATE(timestamp) = $2`,
        [userId, dateStr]
      );
      
      const totalProteins = parseFloat(dayResult.rows[0]?.total_proteins || 0);
      const progressPercent = dailyGoal > 0 ? Math.round((totalProteins * 100) / dailyGoal) : 0;
      
      weeklyData.push({
        date: dateStr,
        total_proteins: totalProteins,
        daily_protein_goal: dailyGoal,
        progress_percent: progressPercent
      });
    }

    res.json({
      success: true,
      weeklyProgress: weeklyData
    });

  } catch (error) {
    console.error('Weekly progress fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch weekly progress' });
  }
});

// Delete meal entry
router.delete('/:mealId', async (req, res) => {
  try {
    const { mealId } = req.params;
    
    const result = await database.query(
      `DELETE FROM meal_entries WHERE id = $1 RETURNING *`,
      [mealId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Meal not found' });
    }

    res.json({
      success: true,
      message: 'Meal deleted successfully'
    });

  } catch (error) {
    console.error('Meal deletion error:', error);
    res.status(500).json({ error: 'Failed to delete meal' });
  }
});

// Reset all meals for today
router.delete('/reset/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    const result = await database.query(
      `DELETE FROM meal_entries 
       WHERE user_id = $1 AND DATE(timestamp) = CURRENT_DATE
       RETURNING *`,
      [userId]
    );

    res.json({
      success: true,
      message: `${result.rowCount} repas supprimés`,
      deletedCount: result.rowCount
    });

  } catch (error) {
    console.error('Meals reset error:', error);
    res.status(500).json({ error: 'Failed to reset meals' });
  }
});

module.exports = router;
