const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Standard text generation (GPT-4o mini)
 */
const generateResponse = async (prompt, systemInstruction = "You are a professional academic and career assistant.") => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI generation error:', error.message);
    throw error;
  }
};

/**
 * Enhanced JSON parsing helper
 */
const safeParseJSON = (text) => {
  try {
    // Strip markdown fences just in case
    const cleanText = text.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    return JSON.parse(cleanText);
  } catch {
    return null;
  }
};

module.exports = { openai, generateResponse, safeParseJSON };
