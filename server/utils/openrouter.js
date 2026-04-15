const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1',
  defaultHeaders: {
    'HTTP-Referer': 'https://github.com/antigravity-ai', // Required by OpenRouter
    'X-Title': 'ASCC - AI Study Copilot',
  },
});

/**
 * Standard text generation helper for OpenRouter
 */
const generateResponse = async (prompt, systemPrompt = '', model = 'openrouter/free') => {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt || 'You are a helpful AI assistant.' },
        { role: 'user', content: prompt }
      ],
    });
    return response.choices[0].message.content;
  } catch (err) {
    console.error('OpenRouter error:', err.message);
    throw err;
  }
};

module.exports = { openai, generateResponse };
