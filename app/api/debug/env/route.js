// app/api/debug/env/route.js
import { NextResponse } from "next/server";

export async function GET() {
  const envCheck = {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY ? "Present" : "Missing",
    GROQ_API_KEY: process.env.GROQ_API_KEY ? "Present" : "Missing",
    MONGOURL: process.env.MONGOURL ? "Present" : "Missing",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? "Present" : "Missing",
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET ? "Present" : "Missing",
    JWT_SECRET: process.env.JWT_SECRET ? "Present" : "Missing",
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL ? "Present" : "Missing",
    NODE_ENV: process.env.NODE_ENV || "Not set",
    timestamp: new Date().toISOString(),
  };

  return NextResponse.json(envCheck);
}
