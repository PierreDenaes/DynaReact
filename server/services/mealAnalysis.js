const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeMeal = async (mealDescription) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Tu es un expert nutritionniste qui analyse les descriptions de repas pour calculer les protéines.

Analyse cette description de repas et retourne UNIQUEMENT un JSON au format suivant :
{
  "aliments": [
    {
      "nom": "nom de l'aliment",
      "quantite_g": nombre,
      "proteines_100g": nombre,
      "proteines_portion": nombre
    }
  ],
  "proteines_totales": nombre,
  "confiance": "high|medium|low",
  "methode": "Analyse textuelle",
  "raisonnement": "explication de ton calcul"
}

Règles importantes :
- Estime les quantités réalistes si non précisées
- Utilise les valeurs nutritionnelles standards
- Sois précis sur les calculs de protéines
- Si tu n'es pas sûr, indique une confiance "medium" ou "low"`
        },
        {
          role: "user",
          content: mealDescription
        }
      ],
      temperature: 0.3,
      max_tokens: 400
    });

    const content = response.choices[0].message.content;
    
    try {
      const parsed = JSON.parse(content);
      
      // Validate the response structure
      if (!parsed.aliments || !Array.isArray(parsed.aliments)) {
        throw new Error('Invalid response format');
      }
      
      // Calculate total proteins if not provided
      if (!parsed.proteines_totales) {
        parsed.proteines_totales = parsed.aliments.reduce((total, aliment) => {
          return total + (aliment.proteines_portion || 0);
        }, 0);
      }
      
      return parsed;
    } catch (parseError) {
      console.error('Failed to parse meal analysis response:', parseError);
      return {
        aliments: [],
        proteines_totales: 0,
        confiance: 'low',
        methode: 'Analyse textuelle',
        raisonnement: 'Erreur lors de l\'analyse du repas'
      };
    }

  } catch (error) {
    console.error('Meal analysis error:', error);
    return {
      aliments: [],
      proteines_totales: 0,
      confiance: 'low',
      methode: 'Analyse textuelle',
      raisonnement: 'Erreur technique lors de l\'analyse'
    };
  }
};

module.exports = {
  analyzeMeal
};