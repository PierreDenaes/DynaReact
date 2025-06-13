const { analyzeImage } = require('./imageAnalysis');
const { analyzeImageWithClaude } = require('./claudeImageAnalysis');

const analyzeImageUnified = async (imagePath, userMessage = null) => {
  // Try Claude first if API key is available
  if (process.env.CLAUDE_API_KEY) {
    try {
      console.log('Attempting image analysis with Claude...');
      const result = await analyzeImageWithClaude(imagePath, userMessage);
      if (result && result.aliments && result.aliments.length > 0) {
        console.log('Claude analysis successful');
        return result;
      }
    } catch (error) {
      console.error('Claude analysis failed, falling back to OpenAI:', error.message);
    }
  }

  // Fallback to OpenAI
  if (process.env.OPENAI_API_KEY) {
    try {
      console.log('Attempting image analysis with OpenAI...');
      const result = await analyzeImage(imagePath, userMessage);
      if (result && result.aliments && result.aliments.length > 0) {
        console.log('OpenAI analysis successful');
        return result;
      }
    } catch (error) {
      console.error('OpenAI analysis failed:', error.message);
    }
  }

  // If both fail, return error result
  console.error('Both Claude and OpenAI analysis failed');
  return {
    aliments: [],
    proteines_totales: 0,
    confiance: 'low',
    methode: 'Analyse d\'image',
    raisonnement: 'Aucun service d\'analyse disponible'
  };
};

module.exports = {
  analyzeImageUnified
};
