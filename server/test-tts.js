require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function testTTS() {
  try {
    console.log('Testing OpenAI TTS...');
    
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "nova",
      input: "Bonjour, je suis votre assistant DynProt. Test de synthèse vocale.",
      speed: 0.95
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());
    console.log('TTS Success! Buffer size:', buffer.length);
    
    // Save to file for testing
    const fs = require('fs');
    fs.writeFileSync('test-audio.mp3', buffer);
    console.log('Audio saved to test-audio.mp3');
    
  } catch (error) {
    console.error('TTS Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testTTS();
