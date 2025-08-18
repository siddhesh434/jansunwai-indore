// app/api/ai-assistant/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { message } = await request.json();
    
    // Simple fallback response
    const fallbackResponse = `Hello! I'm your JanSunwai AI Assistant for municipal services in Indore. While I'm currently experiencing some technical difficulties connecting to my main systems, I'm still here to assist you.

I can help with:
• Drafting municipal complaints
• Understanding complaint procedures
• Analyzing your query history
• Status tracking and escalation
• Department-specific guidance
• General municipal service information

Please feel free to ask me anything about municipal services, and I'll do my best to help you.`;

    return NextResponse.json({
      success: true,
      response: fallbackResponse,
    });
  } catch (error) {
    console.error("AI Assistant API Error:", error);

    return NextResponse.json({
      success: false,
      error: "Internal server error",
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    type: "general-ai-assistant",
  });
}
