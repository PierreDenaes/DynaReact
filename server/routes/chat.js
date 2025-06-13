const express = require('express');
const multer = require('multer');
const router = express.Router();
const database = require('../services/db');
const openaiService = require('../services/openai');
const mealAnalysis = require('../services/mealAnalysis');
const { analyzeImageUnified } = require('../services/unifiedImageAnalysis');

const upload = multer({ dest: 'uploads/' });

// Generate speech for text
router.post('/speech', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    // Generate speech using OpenAI TTS
    const audioBuffer = await openaiService.generateSpeech(text);
    
    // Set proper headers for audio streaming
    res.set({
      'Content-Type': 'audio/mpeg',
      'Content-Length': audioBuffer.length,
    });

    // Send the audio buffer
    res.send(audioBuffer);

  } catch (error) {
    console.error('Speech generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate speech',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Process chat message with image
router.post('/message/image', upload.single('image'), async (req, res) => {
  try {
    const { userId, message } = req.body;
    const imageFile = req.file;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Validate image file
    if (!imageFile) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    // Check file size (10MB limit)
    if (imageFile.size > 10 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image file too large (max 10MB)' });
    }

    // Check file type
    const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedMimeTypes.includes(imageFile.mimetype)) {
      return res.status(400).json({ error: 'Invalid image format (JPEG, PNG, WebP only)' });
    }

    // Save user message if provided
    if (message) {
      await database.query(
        `INSERT INTO chat_messages (user_id, message_content, message_type, sender_type, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, message, 'text', 'user', new Date().toISOString()]
      );
    }

    let response = '';
    let analysisResult = null;

    // Handle image analysis
    try {
      analysisResult = await analyzeImageUnified(imageFile.path, message);
      
      if (analysisResult && analysisResult.aliments && analysisResult.aliments.length > 0) {
        // Save meal entries from image analysis
        const savedMeals = [];
        for (const aliment of analysisResult.aliments) {
          try {
            const mealResult = await database.query(
              `INSERT INTO meal_entries (user_id, produit, description_visuelle, proteines_apportees, poids_estime, methode, source, timestamp)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
              [
                userId,
                aliment.nom || 'Aliment non identifié',
                analysisResult.raisonnement || 'Analyse d\'image',
                Math.max(0, aliment.proteines_portion || 0),
                Math.max(0, aliment.quantite_g || 0),
                'Analyse d\'image',
                'IA Analysis',
                new Date().toISOString()
              ]
            );
            savedMeals.push(mealResult.rows[0].id);
          } catch (mealError) {
            console.error('Error saving meal entry:', mealError);
          }
        }
        
        if (savedMeals.length > 0) {
          // Get updated progress
          const progressResult = await getUpdatedProgress(userId);
          response = formatProgressResponse(progressResult, 'meal_saved');
        } else {
          response = "L'analyse a été effectuée mais aucun repas n'a pu être enregistré. Veuillez réessayer.";
        }
      } else {
        response = "Je n'ai pas pu identifier d'aliments dans cette image. Pouvez-vous me décrire ce que vous avez mangé ?";
      }
    } catch (error) {
      console.error('Image analysis error:', error);
      
      if (error.message && error.message.includes('OpenAI')) {
        response = "Service d'analyse temporairement indisponible. Veuillez réessayer dans quelques instants.";
      } else {
        response = "Désolé, je n'ai pas pu analyser cette image. Pouvez-vous me décrire votre repas ?";
      }
    }

    // Save AI response
    await database.query(
      `INSERT INTO chat_messages (user_id, message_content, message_type, sender_type, timestamp, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, response, 'text', 'ai', new Date().toISOString(), JSON.stringify(analysisResult)]
    );

    res.json({
      success: true,
      response,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Chat image message error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process image message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Process text chat message
router.post('/message', async (req, res) => {
  try {
    const { userId, message } = req.body;
    const imageFile = req.file;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    // Save user message
    if (message) {
      await database.query(
        `INSERT INTO chat_messages (user_id, message_content, message_type, sender_type, timestamp)
         VALUES ($1, $2, $3, $4, $5)`,
        [userId, message, 'text', 'user', new Date().toISOString()]
      );
    }

    let response = '';
    let analysisResult = null;

    // Handle image analysis
    if (imageFile) {
      try {
        analysisResult = await analyzeImageUnified(imageFile.path, message);
        
        if (analysisResult.aliments && analysisResult.aliments.length > 0) {
          // Save meal entries from image analysis
          for (const aliment of analysisResult.aliments) {
            await database.query(
              `INSERT INTO meal_entries (user_id, produit, description_visuelle, proteines_apportees, poids_estime, methode, source, timestamp)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
              [
                userId,
                aliment.nom,
                analysisResult.raisonnement,
                aliment.proteines_portion,
                aliment.quantite_g,
                'Analyse d\'image',
                'IA Analysis',
                new Date().toISOString()
              ]
            );
          }
          
          // Get updated progress
          const progressResult = await getUpdatedProgress(userId);
          response = formatProgressResponse(progressResult, 'meal_saved');
        } else {
          response = "Je n'ai pas pu identifier d'aliments dans cette image. Pouvez-vous me décrire ce que vous avez mangé ?";
        }
      } catch (error) {
        console.error('Image analysis error:', error);
        response = "Désolé, je n'ai pas pu analyser cette image. Pouvez-vous me décrire votre repas ?";
      }
    }
    // Handle text message
    else if (message) {
      const classification = await openaiService.classifyMessage(message, userId);
      
      switch (classification.action) {
        case 'MEAL':
          analysisResult = await mealAnalysis.analyzeMeal(message);
          if (analysisResult.aliments && analysisResult.aliments.length > 0) {
            // Save meal entries
            for (const aliment of analysisResult.aliments) {
              await database.query(
                `INSERT INTO meal_entries (user_id, produit, description_visuelle, proteines_apportees, poids_estime, methode, source, timestamp)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                  userId,
                  aliment.nom,
                  message,
                  aliment.proteines_portion,
                  aliment.quantite_g,
                  analysisResult.methode,
                  'IA Analysis',
                  new Date().toISOString()
                ]
              );
            }
            
            const progressResult = await getUpdatedProgress(userId);
            response = formatProgressResponse(progressResult, 'meal_saved');
          } else {
            response = "Je n'ai pas pu identifier les protéines dans ce repas. Pouvez-vous être plus précis ?";
          }
          break;
          
        case 'GOAL_UPDATE':
          const newGoal = classification.data.new_goal;
          await database.query(
            `UPDATE user_profiles SET daily_protein_goal = $1, updated_at = $2 WHERE user_id = $3`,
            [newGoal, new Date().toISOString(), userId]
          );
          response = `🎯 Objectif mis à jour !\n\nVotre nouvel objectif quotidien est fixé à ${newGoal}g de protéines.`;
          break;
          
        case 'STATUS':
          const progressResult = await getUpdatedProgress(userId);
          response = formatProgressResponse(progressResult, 'status_check');
          break;
          
        case 'RESET_MEALS':
          // Delete all meal entries for today
          await database.query(
            `DELETE FROM meal_entries 
             WHERE user_id = $1 AND DATE(timestamp) = CURRENT_DATE`,
            [userId]
          );
          response = `🔄 Remise à zéro effectuée !\n\nTous vos repas d'aujourd'hui ont été supprimés. Vous pouvez repartir de zéro.`;
          break;
          
        default:
          response = await openaiService.generateResponse(message, userId);
      }
    }

    // Save AI response
    await database.query(
      `INSERT INTO chat_messages (user_id, message_content, message_type, sender_type, timestamp, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [userId, response, 'text', 'ai', new Date().toISOString(), JSON.stringify(analysisResult)]
    );

    res.json({
      success: true,
      response,
      analysis: analysisResult
    });

  } catch (error) {
    console.error('Chat message error:', error);
    console.error('Full error details:', error.stack);
    res.status(500).json({ 
      error: 'Failed to process message',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Get chat history
router.get('/history/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit) || 50;
    
    const result = await database.query(
      `SELECT * FROM chat_messages 
       WHERE user_id = $1 
       ORDER BY timestamp DESC 
       LIMIT $2`,
      [userId, limit]
    );

    res.json({
      success: true,
      messages: result.rows.reverse()
    });

  } catch (error) {
    console.error('Chat history error:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
});

async function getUpdatedProgress(userId) {
  const result = await database.query(
    `SELECT 
       CURRENT_DATE as date, 
       up.user_id, 
       up.prenom,
       COALESCE(SUM(me.proteines_apportees), 0) as total_proteins,
       up.daily_protein_goal,
       CASE WHEN up.daily_protein_goal > 0 THEN 
            ROUND((COALESCE(SUM(me.proteines_apportees), 0) * 100.0 / up.daily_protein_goal), 1)
       ELSE 0 END as progress_percent
     FROM user_profiles up
     LEFT JOIN meal_entries me ON up.user_id = me.user_id AND DATE(me.timestamp) = CURRENT_DATE
     WHERE up.user_id = $1
     GROUP BY up.user_id, up.daily_protein_goal, up.prenom`,
    [userId]
  );
  
  return result.rows[0];
}

function formatProgressResponse(data, action) {
  if (!data) return "Utilisateur non trouvé.";
  
  const progressEmoji = data.progress_percent >= 100 ? '🎉' : 
                       data.progress_percent >= 75 ? '💪' : 
                       data.progress_percent >= 50 ? '👍' : '📈';
  const remaining = Math.max(0, data.daily_protein_goal - data.total_proteins);
  
  let prefix = '';
  if (action === 'meal_saved') {
    prefix = `✅ Repas enregistré, ${data.prenom} !\n\n`;
  }
  
  return prefix +
         `📊 Votre progression aujourd'hui :\n` +
         `• Protéines consommées : ${data.total_proteins}g\n` +
         `• Objectif quotidien : ${data.daily_protein_goal}g\n` +
         `• Progression : ${data.progress_percent}% ${progressEmoji}\n\n` +
         `${data.progress_percent >= 100 ? '🎯 Félicitations ! Objectif atteint !' : 
          `Il vous reste ${remaining}g à consommer.`}`;
}

module.exports = router;
