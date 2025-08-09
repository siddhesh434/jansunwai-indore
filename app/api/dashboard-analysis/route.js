// app/api/dashboard-analysis/route.js
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "../../../lib/dbConnect";

// You can switch between different LLM providers (matches your existing setup)
const LLM_PROVIDER = 'groq'; // 'openai', 'anthropic', 'groq', 'gemini', or 'deepinfra'

async function callOpenAI(analyticsData) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert data analyst for municipal governance systems. Analyze the provided dashboard data and generate comprehensive insights.

Your analysis should include:
1. System health assessment (Excellent/Good/Fair/Poor)
2. Key findings (4-6 critical insights about the data)
3. Strategic recommendations (3-5 actionable items)
4. Predictive insights (growth trends, efficiency improvements)
5. Alerts (any urgent issues that need attention)

Be specific, data-driven, and provide actionable insights for municipal administrators.

Respond in JSON format only:
{
  "systemHealth": "Good/Fair/Poor/Excellent",
  "keyFindings": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "predictions": {
    "expectedGrowth": "percentage or description",
    "resolutionTimeImprovement": "percentage improvement possible",
    "staffEfficiency": "efficiency improvement potential"
  },
  "alerts": ["alert1", "alert2", ...],
  "analysisTimestamp": "current_timestamp"
}`
        },
        {
          role: 'user',
          content: `Analyze this municipal dashboard data: ${JSON.stringify(analyticsData)}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callGroq(analyticsData) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert data analyst for municipal governance systems. Analyze the provided dashboard data and generate comprehensive insights.

Your analysis should include:
1. System health assessment (Excellent/Good/Fair/Poor)
2. Key findings (4-6 critical insights about the data)
3. Strategic recommendations (3-5 actionable items)
4. Predictive insights (growth trends, efficiency improvements)
5. Alerts (any urgent issues that need attention)

Be specific, data-driven, and provide actionable insights for municipal administrators.

Respond in JSON format only:
{
  "systemHealth": "Good/Fair/Poor/Excellent",
  "keyFindings": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "predictions": {
    "expectedGrowth": "percentage or description",
    "resolutionTimeImprovement": "percentage improvement possible",
    "staffEfficiency": "efficiency improvement potential"
  },
  "alerts": ["alert1", "alert2", ...],
  "analysisTimestamp": "current_timestamp"
}`
        },
        {
          role: 'user',
          content: `Analyze this municipal dashboard data: ${JSON.stringify(analyticsData)}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('Groq API Error Response:', errorText);
    throw new Error(`Groq API error: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

async function callAnthropic(analyticsData) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are an expert data analyst for municipal governance systems. Analyze the provided dashboard data and generate comprehensive insights.

Your analysis should include:
1. System health assessment (Excellent/Good/Fair/Poor)
2. Key findings (4-6 critical insights about the data)
3. Strategic recommendations (3-5 actionable items)
4. Predictive insights (growth trends, efficiency improvements)
5. Alerts (any urgent issues that need attention)

Be specific, data-driven, and provide actionable insights for municipal administrators.

Respond in JSON format only:
{
  "systemHealth": "Good/Fair/Poor/Excellent",
  "keyFindings": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "predictions": {
    "expectedGrowth": "percentage or description",
    "resolutionTimeImprovement": "percentage improvement possible",
    "staffEfficiency": "efficiency improvement potential"
  },
  "alerts": ["alert1", "alert2", ...],
  "analysisTimestamp": "current_timestamp"
}

Analyze this municipal dashboard data: ${JSON.stringify(analyticsData)}`
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callDeepInfra(analyticsData) {
  const model = 'meta-llama/Meta-Llama-3.1-70B-Instruct';
  
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
          content: `You are an expert data analyst for municipal governance systems. Analyze the provided dashboard data and generate comprehensive insights.

Your analysis should include:
1. System health assessment (Excellent/Good/Fair/Poor)
2. Key findings (4-6 critical insights about the data)
3. Strategic recommendations (3-5 actionable items)
4. Predictive insights (growth trends, efficiency improvements)
5. Alerts (any urgent issues that need attention)

Be specific, data-driven, and provide actionable insights for municipal administrators.

Respond in JSON format only:
{
  "systemHealth": "Good/Fair/Poor/Excellent",
  "keyFindings": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "predictions": {
    "expectedGrowth": "percentage or description",
    "resolutionTimeImprovement": "percentage improvement possible",
    "staffEfficiency": "efficiency improvement potential"
  },
  "alerts": ["alert1", "alert2", ...],
  "analysisTimestamp": "current_timestamp"
}`
        },
        {
          role: 'user',
          content: `Analyze this municipal dashboard data: ${JSON.stringify(analyticsData)}`
        }
      ],
      max_tokens: 1000,
      temperature: 0.3,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepInfra API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callGemini(analyticsData) {
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert data analyst for municipal governance systems. Analyze the provided dashboard data and generate comprehensive insights.

Your analysis should include:
1. System health assessment (Excellent/Good/Fair/Poor)
2. Key findings (4-6 critical insights about the data)
3. Strategic recommendations (3-5 actionable items)
4. Predictive insights (growth trends, efficiency improvements)
5. Alerts (any urgent issues that need attention)

Be specific, data-driven, and provide actionable insights for municipal administrators.

Respond in JSON format only:
{
  "systemHealth": "Good/Fair/Poor/Excellent",
  "keyFindings": ["insight1", "insight2", ...],
  "recommendations": ["recommendation1", "recommendation2", ...],
  "predictions": {
    "expectedGrowth": "percentage or description",
    "resolutionTimeImprovement": "percentage improvement possible",
    "staffEfficiency": "efficiency improvement potential"
  },
  "alerts": ["alert1", "alert2", ...],
  "analysisTimestamp": "current_timestamp"
}

Analyze this municipal dashboard data: ${JSON.stringify(analyticsData)}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function POST(request) {
  try {
    await dbConnect();
    
    const { data: analyticsData, analysisType } = await request.json();

    if (!analyticsData) {
      return NextResponse.json(
        { success: false, error: 'Analytics data is required' },
        { status: 400 }
      );
    }

    let aiResponse;
    let responseText = '';

    // Call the selected LLM provider (same pattern as your query-analysis)
    switch (LLM_PROVIDER) {
      case 'openai':
        if (!process.env.OPENAI_API_KEY) {
          throw new Error('OpenAI API key not configured');
        }
        aiResponse = await callOpenAI(analyticsData);
        responseText = aiResponse.choices?.[0]?.message?.content || '';
        break;

      case 'groq':
        if (!process.env.GROQ_API_KEY) {
          throw new Error('Groq API key not configured');
        }
        aiResponse = await callGroq(analyticsData);
        responseText = aiResponse.choices?.[0]?.message?.content || '';
        console.log('Groq Analysis Response:', responseText);
        break;

      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        aiResponse = await callAnthropic(analyticsData);
        responseText = aiResponse.content?.[0]?.text || '';
        break;

      case 'deepinfra':
        if (!process.env.DEEPINFRA_API_KEY) {
          throw new Error('DeepInfra API key not configured');
        }
        aiResponse = await callDeepInfra(analyticsData);
        responseText = aiResponse.choices?.[0]?.message?.content || '';
        break;

      case 'gemini':
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }
        aiResponse = await callGemini(analyticsData);
        responseText = aiResponse.candidates?.[0]?.content?.parts?.[0]?.text || '';
        break;

      default:
        throw new Error('Invalid LLM provider configured');
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0]);
      } else {
        parsedResponse = JSON.parse(responseText);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', responseText);
      throw new Error('Failed to parse AI response');
    }

    // Add timestamp if not provided
    if (!parsedResponse.analysisTimestamp) {
      parsedResponse.analysisTimestamp = new Date().toISOString();
    }

    // Validate the response structure
    if (!parsedResponse.systemHealth || !parsedResponse.keyFindings || !parsedResponse.recommendations) {
      throw new Error('Invalid AI response format');
    }

    return NextResponse.json({
      success: true,
      analysis: parsedResponse,
      provider: LLM_PROVIDER,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Dashboard Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate AI insights',
      fallback: generateFallbackAnalysis(request.data || {})
    }, { status: 500 });
  }
}

// Fallback analysis in case AI fails
function generateFallbackAnalysis(data) {
  return {
    systemHealth: 'Good',
    keyFindings: [
      'System is processing queries effectively with stable performance',
      'Department workload distribution shows opportunities for optimization',
      'Resolution rates are within acceptable ranges but can be improved',
      'User engagement levels indicate healthy system adoption'
    ],
    recommendations: [
      'Implement automated query routing to reduce manual processing time',
      'Consider staff reallocation to balance departmental workloads',
      'Set up proactive monitoring for queries approaching SLA deadlines',
      'Develop user feedback mechanisms to track satisfaction metrics'
    ],
    predictions: {
      expectedGrowth: '+15-20% quarterly growth expected',
      resolutionTimeImprovement: '20-25% improvement possible with optimization',
      staffEfficiency: '30% efficiency gain with process automation'
    },
    alerts: [
      'Monitor pending query backlog for potential overflow'
    ],
    analysisTimestamp: new Date().toISOString()
  };
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    provider: LLM_PROVIDER,
    timestamp: new Date().toISOString(),
    type: 'dashboard-analysis',
    capabilities: [
      'System health assessment',
      'Performance analytics',
      'Predictive insights',
      'Strategic recommendations'
    ]
  });
}