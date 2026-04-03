const { GoogleGenerativeAI } = require('@google/generative-ai');

// Explicitly use the stable v1 API version if the SDK supports it, 
// or we will handle it in the model selection.
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Uses the stable 1.5 Flash model which is free and reliable.
 */
const getModel = (modelName = 'gemini-1.5-flash') => {
  return genAI.getGenerativeModel({ model: modelName });
};

module.exports = { genAI, getModel };
