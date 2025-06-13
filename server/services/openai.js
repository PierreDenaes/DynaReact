const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const classifyMessage = async (message, userId) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un agent classificateur qui analyse les messages d'un utilisateur d'une application de suivi des protéines.

ÉTAPE 1 : Analyse le message
ÉTAPE 2 : Retourne un JSON avec l'action détectée

Actions possibles :
- GOAL_UPDATE : Message contient "objectif" + nombre OU "remet/remets/mettre objectif à zéro"
- MEAL : Description d'aliment ou repas consommé  
- STATUS : Demande de progression sans aliment
- RESET_MEALS : Message demande de réinitialiser/effacer/supprimer les repas du jour (reset, remise à zéro des repas, etc.)
- GENERAL : Conversation générale

IMPORTANT pour GOAL_UPDATE :
- "remet mon objectif à zéro" = GOAL_UPDATE avec new_goal: 0
- "objectif 150g" = GOAL_UPDATE avec new_goal: 150
- "nouvel objectif 100" = GOAL_UPDATE avec new_goal: 100

IMPORTANT pour RESET_MEALS :
- "reset", "remise à zéro", "effacer tout", "supprimer les repas" = RESET_MEALS
- "remettre à zéro les repas d'aujourd'hui" = RESET_MEALS

Format de réponse STRICT (JSON uniquement) :
{
  "action": "GOAL_UPDATE|MEAL|STATUS|RESET_MEALS|GENERAL",
  "confidence": "high|medium|low",
  "data": {},
  "reasoning": "explication"
}`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.3,
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      
      // Extract goal value if GOAL_UPDATE
      if (parsed.action === 'GOAL_UPDATE') {
        // Check for "zero" or "zéro" first
        if (message.toLowerCase().includes('zero') || message.toLowerCase().includes('zéro')) {
          parsed.data.new_goal = 0;
        } else {
          // Then check for numeric values
          const goalMatch = message.match(/(\d+)\s*g?/);
          if (goalMatch) {
            parsed.data.new_goal = parseInt(goalMatch[1]);
          }
        }
        
        // If no goal value was found, set a default or return an error
        if (parsed.data.new_goal === undefined) {
          parsed.action = 'GENERAL';
          parsed.reasoning = 'Could not extract goal value from message';
        }
      }
      
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse classification response:', parseError);
      return {
        action: 'GENERAL',
        confidence: 'low',
        data: {},
        reasoning: 'Failed to parse response'
      };
    }

  } catch (error) {
    console.error('OpenAI classification error:', error);
    return {
      action: 'GENERAL',
      confidence: 'low',
      data: {},
      reasoning: 'API error'
    };
  }
};

const generateResponse = async (message, userId) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es DynProt, un assistant spécialisé dans le suivi des protéines. Tu aides les utilisateurs à atteindre leurs objectifs protéiques quotidiens.

Ton rôle :
- Encourager et motiver
- Donner des conseils nutritionnels sur les protéines
- Suggérer des aliments riches en protéines
- Répondre aux questions sur la nutrition

Ton ton : Amical, encourageant, expert mais accessible.`
        },
        {
          role: "user",
          content: message
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error('OpenAI response generation error:', error);
    return "Désolé, je rencontre un problème technique. Pouvez-vous réessayer ?";
  }
};

const generateSpeech = async (text) => {
  try {
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova", // Options: alloy, echo, fable, onyx, nova, shimmer
      input: text,
      speed: 0.95 // Slightly slower for better comprehension
    });

    // Convert the response to a buffer
    const buffer = Buffer.from(await mp3.arrayBuffer());
    return buffer;

  } catch (error) {
    console.error('OpenAI TTS error:', error);
    throw error;
  }
};

module.exports = {
  classifyMessage,
  generateResponse,
  generateSpeech
};
