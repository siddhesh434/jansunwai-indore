// app/api/ai-assistant/route.js
import { NextRequest, NextResponse } from 'next/server';

// You can switch between different LLM providers
const LLM_PROVIDER = 'groq'; // 'openai', 'anthropic', 'groq', 'gemini', or 'deepinfra'

// Municipal knowledge base for RAG
const MUNICIPAL_KNOWLEDGE = `
JANSUNWAI MUNICIPAL SERVICES GUIDE

DEPARTMENTS:
1. Water & Sanitation: Water supply issues, drainage problems, sewage blockages
2. Road & Transportation: Potholes, traffic signals, street lighting, road repairs
3. Waste Management: Garbage collection, recycling, waste disposal complaints
4. Building & Planning: Construction permits, zoning issues, illegal constructions
5. Health & Hygiene: Food safety, public health issues, hospital complaints
6. Public Works: Parks maintenance, public facilities, infrastructure
7. Revenue: Property tax, municipal bills, tax assessments
8. Electricity: Power outages, meter issues, electrical safety

COMPLAINT PROCESS:
1. Identify the right department for your issue
2. Provide clear title and detailed description
3. Include location, date, and relevant details
4. Attach photos if helpful
5. Track your complaint status
6. Follow up through the thread system

COMMON ISSUES & SOLUTIONS:
- Water Supply: Report timings, pressure issues, contamination
- Road Problems: Specify exact location with landmarks
- Garbage: Mention collection schedule issues or overflow
- Electricity: Provide meter number and outage duration
- Building Issues: Include plot numbers and violation details

ESCALATION PROCESS:
If no response within 7 days, complaints auto-escalate to senior officials.
Emergency issues (water contamination, electrical hazards) get priority.
`;

async function callOpenAI(message, context) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini', // Cost-effective choice
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for JanSunwai, a municipal complaint system. 
          
          Your role:
          - Help users understand municipal services
          - Guide them to the right department
          - Draft complaint titles and descriptions
          - Provide information about processes
          - Be concise, helpful, and actionable
          
          Available departments: ${context.departments?.map(d => d.departmentName || d).join(', ') || 'Water & Sanitation, Road & Transportation, Waste Management, Building & Planning, Health & Hygiene, Public Works, Revenue, Electricity'}
          
          Knowledge Base:
          ${MUNICIPAL_KNOWLEDGE}
          
          If you suggest creating a complaint, format your response to include:
          SUGGESTED_QUERY: {title: "complaint title", description: "detailed description", department: "department name"}
          
          Always be helpful, professional, and focused on municipal services.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callDeepInfra(message, context) {
  // Popular models on DeepInfra (you can change this):
  // - meta-llama/Meta-Llama-3.1-70B-Instruct (best quality)
  // - meta-llama/Meta-Llama-3.1-8B-Instruct (faster, cheaper)
  // - microsoft/WizardLM-2-8x22B (great for complex tasks)
  // - mistralai/Mixtral-8x7B-Instruct-v0.1 (balanced performance)
  
  const model = 'meta-llama/Meta-Llama-3.1-70B-Instruct'; // Change model here if needed
  
  const response = await fetch(`https://api.deepinfra.com/v1/openai/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.DEEPINFRA_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for JanSunwai, a municipal complaint system in India. 
          
          Your role:
          - Help users understand municipal services
          - Guide them to the right department
          - Draft complaint titles and descriptions in clear, professional language
          - Provide information about processes
          - Be concise, helpful, and actionable
          - Use simple, clear Hindi-English mix when appropriate
          
          Available departments: ${context.departments?.map(d => d.departmentName || d).join(', ') || 'Water & Sanitation, Road & Transportation, Waste Management, Building & Planning, Health & Hygiene, Public Works, Revenue, Electricity'}
          
          Knowledge Base:
          ${MUNICIPAL_KNOWLEDGE}
          
          If you suggest creating a complaint, format your response to include:
          SUGGESTED_QUERY: {title: "complaint title", description: "detailed description", department: "department name"}
          
          Always be helpful, professional, and focused on municipal services. Keep responses under 150 words.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 400,
      temperature: 0.7,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepInfra API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callAnthropic(message, context) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `You are a helpful AI assistant for JanSunwai, a municipal complaint system. 
          
          Your role:
          - Help users understand municipal services
          - Guide them to the right department
          - Draft complaint titles and descriptions
          - Provide information about processes
          - Be concise, helpful, and actionable
          
          Available departments: ${context.departments?.map(d => d.departmentName || d).join(', ') || 'Water & Sanitation, Road & Transportation, Waste Management, Building & Planning, Health & Hygiene, Public Works, Revenue, Electricity'}
          
          Knowledge Base:
          ${MUNICIPAL_KNOWLEDGE}
          
          If you suggest creating a complaint, format your response to include:
          SUGGESTED_QUERY: {title: "complaint title", description: "detailed description", department: "department name"}
          
          User message: ${message}`
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callGroq(message, context) {
  // Updated with working configuration from your test script
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama3-70b-8192', // Updated to use the working model from your test
      messages: [
        {
          role: 'system',
          content: `You are a helpful AI assistant for JanSunwai, a municipal complaint system in India. 
          
          Your role:
          - Help users understand municipal services
          - Guide them to the right department
          - Draft complaint titles and descriptions
          - Provide information about processes
          - Be concise, helpful, and actionable
          - Use simple, clear language that's easy to understand
          
          Available departments: ${context.departments?.map(d => d.departmentName || d).join(', ') || 'Water & Sanitation, Road & Transportation, Waste Management, Building & Planning, Health & Hygiene, Public Works, Revenue, Electricity'}
          
          Knowledge Base:
          ${MUNICIPAL_KNOWLEDGE}
          
          If you suggest creating a complaint, format your response to include:
          SUGGESTED_QUERY: {"title": "complaint title", "description": "detailed description", "department": "department name"}
          
          Always be helpful, professional, and focused on municipal services. Keep responses under 200 words.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 500,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API Error Response:', errorText);
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

async function callGemini(message, context) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are a helpful AI assistant for JanSunwai, a municipal complaint system. 
          
          Your role:
          - Help users understand municipal services
          - Guide them to the right department
          - Draft complaint titles and descriptions
          - Provide information about processes
          - Be concise, helpful, and actionable
          
          Available departments: ${context.departments?.map(d => d.departmentName || d).join(', ') || 'Water & Sanitation, Road & Transportation, Waste Management, Building & Planning, Health & Hygiene, Public Works, Revenue, Electricity'}
          
          Knowledge Base:
          ${MUNICIPAL_KNOWLEDGE}
          
          If you suggest creating a complaint, format your response to include:
          SUGGESTED_QUERY: {title: "complaint title", description: "detailed description", department: "department name"}
          
          User message: ${message}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.7,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

function extractSuggestedQuery(response, departments) {
  const text = response.toLowerCase();
  
  // Look for SUGGESTED_QUERY pattern
  const queryMatch = response.match(/SUGGESTED_QUERY:\s*{([^}]+)}/i);
  if (queryMatch) {
    try {
      // Parse the suggested query
      const queryText = `{${queryMatch[1]}}`;
      const suggested = JSON.parse(queryText.replace(/(\w+):/g, '"$1":'));
      
      // Find matching department ID
      const dept = departments?.find(d => 
        (d.departmentName || d).toLowerCase().includes(suggested.department.toLowerCase()) ||
        suggested.department.toLowerCase().includes((d.departmentName || d).toLowerCase())
      );
      
      if (dept) {
        return {
          title: suggested.title,
          description: suggested.description,
          departmentId: dept._id || dept.id || dept
        };
      }
    } catch (error) {
      console.error('Error parsing suggested query:', error);
    }
  }
  
  return null;
}

export async function POST(request) {
  try {
    const { message, context } = await request.json();

    if (!message?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Message is required' },
        { status: 400 }
      );
    }

    let aiResponse;
    let responseText = '';

    // Call the selected LLM provider
    switch (LLM_PROVIDER) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        aiResponse = await callOpenAI(message, context);
        responseText = aiResponse.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        break;

      case 'deepinfra':
        if (!process.env.DEEPINFRA_API_KEY) {
          throw new Error('DeepInfra API key not configured');
        }
        aiResponse = await callDeepInfra(message, context);
        responseText = aiResponse.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        break;

      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        aiResponse = await callAnthropic(message, context);
        responseText = aiResponse.content?.[0]?.text || 'Sorry, I could not generate a response.';
        break;

      case 'groq':
        if (!process.env.GROQ_API_KEY) {
          throw new Error('Groq API key not configured. Please add GROQ_API_KEY to your environment variables.');
        }
        aiResponse = await callGroq(message, context);
        responseText = aiResponse.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';
        break;

      case 'gemini':
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }
        aiResponse = await callGemini(message, context);
        responseText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';
        break;

      default:
        throw new Error('Invalid LLM provider configured');
    }

    // Extract suggested query if present
    const suggestedQuery = extractSuggestedQuery(responseText, context.departments || []);

    // Clean up the response text (remove SUGGESTED_QUERY part)
    const cleanResponse = responseText.replace(/SUGGESTED_QUERY:\s*{[^}]+}/i, '').trim();

    return NextResponse.json({
      success: true,
      response: cleanResponse,
      suggestedQuery: suggestedQuery
    });

  } catch (error) {
    console.error('AI Assistant API Error:', error);
    
    // Fallback response
    const fallbackResponse = getFallbackResponse(message);
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse,
      suggestedQuery: null
    });
  }
}

// Fallback response system when AI is unavailable
function getFallbackResponse(message) {
  const msg = message?.toLowerCase() || '';
  
  if (msg.includes('water') || msg.includes('supply') || msg.includes('drainage')) {
    return "I can help you with water-related issues! For water supply problems, drainage issues, or sewage blockages, you should contact the Water & Sanitation department. Please provide details about your location and the specific problem you're experiencing.";
  }
  
  if (msg.includes('road') || msg.includes('pothole') || msg.includes('street') || msg.includes('traffic')) {
    return "For road and transportation issues like potholes, street lighting, or traffic problems, the Road & Transportation department handles these complaints. Please include the exact location with nearby landmarks.";
  }
  
  if (msg.includes('garbage') || msg.includes('waste') || msg.includes('trash')) {
    return "Waste management issues including garbage collection problems should be reported to the Waste Management department. Please mention your area and the specific issue with collection schedules.";
  }
  
  if (msg.includes('building') || msg.includes('construction') || msg.includes('permit')) {
    return "Building and construction related issues are handled by the Building & Planning department. This includes permits, zoning issues, and illegal construction complaints.";
  }
  
  if (msg.includes('electricity') || msg.includes('power') || msg.includes('outage')) {
    return "Electrical issues like power outages or meter problems should be reported to the Electricity department. Please provide your meter number and details about the outage duration.";
  }
  
  return `Hello! I'm here to help you with municipal services and complaints. I can assist you with:

• Finding the right department for your issue
• Drafting complaint descriptions  
• Understanding the complaint process
• Information about municipal services

What specific issue would you like help with today?`;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    provider: LLM_PROVIDER,
    timestamp: new Date().toISOString()
  });
}