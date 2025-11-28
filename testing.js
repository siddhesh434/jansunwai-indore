// testing.js

const { GoogleGenerativeAI } = require("@google/generative-ai");

// ✅ Replace with your valid Gemini API key
const API_KEY = "AIzaSyD9oiwXglGne0aA6sUb1xK-ZhHeBKFT1w"; // (your key here)

const genAI = new GoogleGenerativeAI(API_KEY);

async function testGemini() {
  try {
    // ✅ Use v1 model (available after updating SDK)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = "Explain LangChain in one sentence.";

    const result = await model.generateContent(prompt);
    console.log("✅ Gemini API Test Successful!\n");
    console.log("Response:\n", result.response.text());
  } catch (err) {
    console.error("❌ Error testing Gemini API:\n", err);
  }
}

testGemini();
