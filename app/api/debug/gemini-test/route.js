// app/api/debug/gemini-test/route.js
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function GET() {
  try {
    console.log("Testing Gemini API...");
    console.log("GEMINI_API_KEY present:", !!process.env.GEMINI_API_KEY);
    
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "GEMINI_API_KEY environment variable is not set",
        timestamp: new Date().toISOString()
      });
    }

    // Initialize Gemini client
    const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Try different models
    let model;
    try {
      model = gemini.getGenerativeModel({ model: "gemini-1.5-flash-latest" });
      console.log("Using gemini-1.5-flash-latest model");
    } catch (modelError) {
      console.log("Falling back to gemini-1.5-pro-latest model");
      model = gemini.getGenerativeModel({ model: "gemini-1.5-pro-latest" });
    }

    // Test with a simple prompt
    const result = await model.generateContent("Hello! Please respond with 'Gemini API is working correctly' if you can see this message.");
    
    const response = result.response?.candidates?.[0]?.content?.parts?.[0]?.text || "No response received";
    
    console.log("Gemini test successful:", response);
    
    return NextResponse.json({
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error("Gemini test failed:", error);
    return NextResponse.json({
      success: false,
      error: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}
