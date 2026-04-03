require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGemini() {
  console.log("Testing Gemini with API Key:", process.env.GEMINI_API_KEY ? "PRESENT" : "MISSING");
  
  if (!process.env.GEMINI_API_KEY) {
    console.error("Error: GEMINI_API_KEY is not defined in .env");
    process.exit(1);
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    console.log("Sending test prompt: 'Hello, are you working?'");
    const result = await model.generateContent("Hello, are you working?");
    const response = await result.response;
    const text = response.text();
    
    console.log("Success! Gemini response:");
    console.log(text);
  } catch (error) {
    console.error("Gemini API Error:");
    console.error(error.message);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
  }
}

testGemini();
