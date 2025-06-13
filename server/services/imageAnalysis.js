const OpenAI = require('openai');
const fs = require('fs');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const analyzeImage = async (imagePath, userMessage = null) => {
  try {
    // Read image file and convert to base64
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    
    // Check if user provided a quantity or portion information
    let quantityOverride = null;
    let portionInfo = null;
    
    if (userMessage) {
      // Check for specific gram amounts
      const quantityMatch = userMessage.match(/(\d+)\s*g/i);
      if (quantityMatch) {
        quantityOverride = parseInt(quantityMatch[1]);
      }
      
      // Check for portion indicators
      const portionKeywords = {
        'une tranche': 'une seule tranche (environ 20-30g pour du pain de mie)',
        'deux tranches': 'deux tranches (environ 40-60g pour du pain de mie)',
        'un morceau': 'un morceau',
        'une portion': 'une portion individuelle',
        'la moitié': 'la moitié de ce qui est visible',
        'un quart': 'un quart de ce qui est visible',
        'une part': 'une part individuelle'
      };
      
      const lowerMessage = userMessage.toLowerCase();
      for (const [key, value] of Object.entries(portionKeywords)) {
        if (lowerMessage.includes(key)) {
          portionInfo = value;
          break;
        }
      }
    }
    
    let promptText = `Analyse cette image de repas. Identifie TOUS les aliments visibles.
Pour chaque aliment : nom exact, quantité estimée en grammes, protéines pour 100g, protéines dans la portion.
Si c'est un plat préparé, identifie TOUS les ingrédients principaux.`;

    if (quantityOverride) {
      promptText += `\n\nIMPORTANT: L'utilisateur indique que la quantité totale est de ${quantityOverride}g. Utilise cette quantité pour calculer les protéines.`;
    } else if (portionInfo) {
      promptText += `\n\nIMPORTANT: L'utilisateur a consommé seulement ${portionInfo}. Ajuste la quantité en conséquence, même si l'image montre plus.`;
    }
    
    if (userMessage && !quantityOverride && !portionInfo) {
      promptText += `\n\nContexte de l'utilisateur: "${userMessage}"`;
    }

    promptText += `\n\nRetourne UNIQUEMENT un JSON au format suivant :
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
  "methode": "Analyse d'image",
  "raisonnement": "description détaillée de ce que tu vois"
}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ]
        }
      ],
      max_tokens: 500,
      temperature: 0.3
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
      console.error('Failed to parse image analysis response:', parseError);
      return {
        aliments: [],
        proteines_totales: 0,
        confiance: 'low',
        methode: 'Analyse d\'image',
        raisonnement: 'Erreur lors de l\'analyse de l\'image'
      };
    }

  } catch (error) {
    console.error('Image analysis error:', error);
    return {
      aliments: [],
      proteines_totales: 0,
      confiance: 'low',
      methode: 'Analyse d\'image',
      raisonnement: 'Erreur technique lors de l\'analyse'
    };
  }
};

module.exports = {
  analyzeImage
};
