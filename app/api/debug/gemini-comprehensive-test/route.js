// app/api/debug/gemini-comprehensive-test/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  const results = {
    timestamp: new Date().toISOString(),
    tests: {}
  };

  try {
    // Test 1: Check if API key is present
    results.tests.apiKeyPresent = !!process.env.GEMINI_API_KEY;
    results.tests.apiKeyLength = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.length : 0;
    results.tests.apiKeyPrefix = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.substring(0, 10) + "..." : "N/A";

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY environment variable is not set",
        results
      });
    }

    // Test 2: Try to initialize the client
    try {
      const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      results.tests.clientInitialization = "success";
      
      // Test 3: Try different models
      const models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];
      
      for (const modelName of models) {
        try {
          const model = gemini.getGenerativeModel({ model: modelName });
          results.tests[`model_${modelName}`] = "available";
          
          // Test 4: Try a simple text generation
          try {
            const result = await model.generateContent("Say 'Hello World' in one word.");
            const response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text;
            results.tests[`generation_${modelName}`] = response ? "success" : "no_response";
            results.tests[`response_${modelName}`] = response || "null";
          } catch (genError) {
            results.tests[`generation_${modelName}`] = "failed";
            results.tests[`generation_error_${modelName}`] = genError.message;
          }
          
        } catch (modelError) {
          results.tests[`model_${modelName}`] = "unavailable";
          results.tests[`model_error_${modelName}`] = modelError.message;
        }
      }
      
      results.success = true;
      
    } catch (clientError) {
      results.tests.clientInitialization = "failed";
      results.tests.clientError = clientError.message;
      results.success = false;
    }

  } catch (error) {
    results.success = false;
    results.error = error.message;
    results.stack = error.stack;
  }

  return NextResponse.json(results);
}
