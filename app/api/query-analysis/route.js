// app/api/query-analysis/route.js
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from "../lib/dbConnect";
import { Department } from "../../../models";
import { detectLanguage, getLanguageInstruction } from "../lib/ai/languageDetection";

// You can switch between different LLM providers
const LLM_PROVIDER = 'groq'; // 'openai', 'anthropic', 'groq', 'gemini', or 'deepinfra'

async function callOpenAI(message, address, departments) {
  // Detect language from the user's complaint
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
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
          content: `You are an expert municipal services assistant for Indore city. Your task is to analyze user complaints and automatically determine:

1. A concise, descriptive title (max 60 characters)
2. The most appropriate department to handle the complaint
3. Whether the user has provided ENOUGH DETAILS for effective complaint resolution
4. If details are insufficient, suggest specific additional information needed

Available departments:
${departments.map(dept => `- ${dept.departmentName}: ${dept.description || 'Municipal services'}`).join('\n')}

DETAIL VALIDATION CRITERIA:
- Location/Address: Is the specific location mentioned? (street, area, landmark)
- Severity: How serious is the problem? (minor inconvenience, health hazard, safety risk)
- Specific Description: Is the complaint detailed enough? (size, quantity, specific symptoms, specific nature of the issue)

IMPORTANT: Only set detailsSufficient to false if:
1. VERY BASIC details are missing (no location/address at all, completely vague description that doesn't describe any specific issue)
2. The prompt is inappropriate or not a legitimate municipal complaint
3. The complaint is so unclear that no department could reasonably act on it

For most complaints, even if some details could be improved, set detailsSufficient to true and provide helpful suggestions for enhancement. Only block submission for genuinely insufficient or inappropriate content.

Do NOT ask for time/duration or contact information.

Rules:
- Title should be clear, specific, and actionable
- Choose the most relevant department based on the complaint type
- If multiple departments could handle it, choose the primary one
- Be precise and professional
- ALWAYS check if details are sufficient for effective resolution
- If details are insufficient, provide actionable suggestions for improvement

${languageInstruction}

Respond in JSON format only:
{
  "title": "Brief descriptive title",
  "departmentId": "department_id_here",
  "reasoning": "Brief explanation of why this department was chosen",
  "detailsSufficient": true/false,
  "missingDetails": ["List of specific details that would help resolve this complaint"],
  "suggestions": "Specific suggestions for what additional information to provide"
}`
        },
        {
          role: 'user',
          content: `Analyze this complaint: ${message}${address ? `\nAddress: ${address}` : ''}`
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callGroq(message, address, departments) {
  // Detect language from the user's complaint
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
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
          content: `You are an expert municipal services assistant for Indore city. Your task is to analyze user complaints and automatically determine:

1. A concise, descriptive title (max 60 characters)
2. The most appropriate department to handle the complaint
3. Whether the user has provided ENOUGH DETAILS for effective complaint resolution
4. If details are insufficient, suggest specific additional information needed

Available departments:
${departments.map(dept => `- ${dept.departmentName}: ${dept.description || 'Municipal services'}`).join('\n')}

DETAIL VALIDATION CRITERIA:
- Location/Address: Is the specific location mentioned? (street, area, landmark)
- Severity: How serious is the problem? (minor inconvenience, health hazard, safety risk)
- Specific Description: Is the complaint detailed enough? (size, quantity, specific symptoms, specific nature of the issue)

IMPORTANT: Only set detailsSufficient to false if:
1. VERY BASIC details are missing (no location/address at all, completely vague description that doesn't describe any specific issue)
2. The prompt is inappropriate or not a legitimate municipal complaint
3. The complaint is so unclear that no department could reasonably act on it

For most complaints, even if some details could be improved, set detailsSufficient to true and provide helpful suggestions for enhancement. Only block submission for genuinely insufficient or inappropriate content.

Do NOT ask for time/duration or contact information.

Rules:
- Title should be clear, specific, and actionable
- Choose the most relevant department based on the complaint type
- If multiple departments could handle it, choose the primary one
- Be precise and professional
- ALWAYS check if details are sufficient for effective resolution
- If details are insufficient, provide actionable suggestions for improvement

${languageInstruction}

Respond in JSON format only:
{
  "title": "Brief descriptive title",
  "departmentId": "department_id_here",
  "reasoning": "Brief explanation of why this department was chosen",
  "detailsSufficient": true/false,
  "missingDetails": ["List of specific details that would help resolve this complaint"],
  "suggestions": "Specific suggestions for what additional information to provide"
}`
        },
        {
          role: 'user',
          content: `Analyze this complaint: ${message}${address ? `\nAddress: ${address}` : ''}`
        }
      ],
      max_tokens: 800,
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

async function callAnthropic(message, address, departments) {
  // Detect language from the user's complaint
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'Content-Type': 'application/json',
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 800,
      messages: [
        {
          role: 'user',
          content: `You are an expert municipal services assistant for Indore city. Your task is to analyze user complaints and automatically determine:

1. A concise, descriptive title (max 60 characters)
2. The most appropriate department to handle the complaint
3. Whether the user has provided ENOUGH DETAILS for effective complaint resolution
4. If details are insufficient, suggest specific additional information needed

Available departments:
${departments.map(dept => `- ${dept.departmentName}: ${dept.description || 'Municipal services'}`).join('\n')}

DETAIL VALIDATION CRITERIA:
- Location/Address: Is the specific location mentioned? (street, area, landmark)
- Severity: How serious is the problem? (minor inconvenience, health hazard, safety risk)
- Specific Description: Is the complaint detailed enough? (size, quantity, specific symptoms, specific nature of the issue)

IMPORTANT: Only set detailsSufficient to false if:
1. VERY BASIC details are missing (no location/address at all, completely vague description that doesn't describe any specific issue)
2. The prompt is inappropriate or not a legitimate municipal complaint
3. The complaint is so unclear that no department could reasonably act on it

For most complaints, even if some details could be improved, set detailsSufficient to true and provide helpful suggestions for enhancement. Only block submission for genuinely insufficient or inappropriate content.

Do NOT ask for time/duration or contact information.

Rules:
- Title should be clear, specific, and actionable
- Choose the most relevant department based on the complaint type
- If multiple departments could handle it, choose the primary one
- Be precise and professional
- ALWAYS check if details are sufficient for effective resolution
- If details are insufficient, provide actionable suggestions for improvement

${languageInstruction}

Respond in JSON format only:
{
  "title": "Brief descriptive title",
  "departmentId": "department_id_here",
  "reasoning": "Brief explanation of why this department was chosen",
  "detailsSufficient": true/false,
  "missingDetails": ["List of specific details that would help resolve this complaint"],
  "suggestions": "Specific suggestions for what additional information to provide"
}

Analyze this complaint: ${message}${address ? `\nAddress: ${address}` : ''}`
        }
      ]
    }),
  });

  if (!response.ok) {
    throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callDeepInfra(message, address, departments) {
  // Detect language from the user's complaint
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
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
          content: `You are an expert municipal services assistant for Indore city. Your task is to analyze user complaints and automatically determine:

1. A concise, descriptive title (max 60 characters)
2. The most appropriate department to handle the complaint
3. Whether the user has provided ENOUGH DETAILS for effective complaint resolution
4. If details are insufficient, suggest specific additional information needed

Available departments:
${departments.map(dept => `- ${dept.departmentName}: ${dept.description || 'Municipal services'}`).join('\n')}

DETAIL VALIDATION CRITERIA:
- Location/Address: Is the specific location mentioned? (street, area, landmark)
- Severity: How serious is the problem? (minor inconvenience, health hazard, safety risk)
- Specific Description: Is the complaint detailed enough? (size, quantity, specific symptoms, specific nature of the issue)

IMPORTANT: Only set detailsSufficient to false if:
1. VERY BASIC details are missing (no location/address at all, completely vague description that doesn't describe any specific issue)
2. The prompt is inappropriate or not a legitimate municipal complaint
3. The complaint is so unclear that no department could reasonably act on it

For most complaints, even if some details could be improved, set detailsSufficient to true and provide helpful suggestions for enhancement. Only block submission for genuinely insufficient or inappropriate content.

Do NOT ask for time/duration or contact information.

Rules:
- Title should be clear, specific, and actionable
- Choose the most relevant department based on the complaint type
- If multiple departments could handle it, choose the primary one
- Be precise and professional
- ALWAYS check if details are sufficient for effective resolution
- If details are insufficient, provide actionable suggestions for improvement

${languageInstruction}

Respond in JSON format only:
{
  "title": "Brief descriptive title",
  "departmentId": "department_id_here",
  "reasoning": "Brief explanation of why this department was chosen",
  "detailsSufficient": true/false,
  "missingDetails": ["List of specific details that would help resolve this complaint"],
  "suggestions": "Specific suggestions for what additional information to provide"
}`
        },
        {
          role: 'user',
          content: `Analyze this complaint: ${message}${address ? `\nAddress: ${address}` : ''}`
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
      stream: false
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepInfra API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

async function callGemini(message, address, departments) {
  // Detect language from the user's complaint
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an expert municipal services assistant for Indore city. Your task is to analyze user complaints and automatically determine:

1. A concise, descriptive title (max 60 characters)
2. The most appropriate department to handle the complaint
3. Whether the user has provided ENOUGH DETAILS for effective complaint resolution
4. If details are insufficient, suggest specific additional information needed

Available departments:
${departments.map(dept => `- ${dept.departmentName}: ${dept.description || 'Municipal services'}`).join('\n')}

DETAIL VALIDATION CRITERIA:
- Location/Address: Is the specific location mentioned? (street, area, landmark)
- Severity: How serious is the problem? (minor inconvenience, health hazard, safety risk)
- Specific Description: Is the complaint detailed enough? (size, quantity, specific symptoms, specific nature of the issue)

IMPORTANT: Only set detailsSufficient to false if:
1. VERY BASIC details are missing (no location/address at all, completely vague description that doesn't describe any specific issue)
2. The prompt is inappropriate or not a legitimate municipal complaint
3. The complaint is so unclear that no department could reasonably act on it

For most complaints, even if some details could be improved, set detailsSufficient to true and provide helpful suggestions for enhancement. Only block submission for genuinely insufficient or inappropriate content.

Do NOT ask for time/duration or contact information.

Rules:
- Title should be clear, specific, and actionable
- Choose the most relevant department based on the complaint type
- If multiple departments could handle it, choose the primary one
- Be precise and professional
- ALWAYS check if details are sufficient for effective resolution
- If details are insufficient, provide actionable suggestions for improvement

${languageInstruction}

Respond in JSON format only:
{
  "title": "Brief descriptive title",
  "departmentId": "department_id_here",
  "reasoning": "Brief explanation of why this department was chosen",
  "detailsSufficient": true/false,
  "missingDetails": ["List of specific details that would help resolve this complaint"],
  "suggestions": "Specific suggestions for what additional information to provide"
}

Analyze this complaint: ${message}${address ? `\nAddress: ${address}` : ''}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.3,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

const getDepartmentIdByName = async (deptName) => {
  try {
    const department = await Department.findOne({ departmentName: deptName }).select('_id');
    if (!department) {
      console.log('Department not found');
      return null;
    }
    return department._id;
  } catch (error) {
    console.error('Error fetching department ID:', error);
    return null;
  }
};


export async function POST(request) {
  try {
    await dbConnect();
    
    const { query, address } = await request.json();

    if (!query?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Query is required' },
        { status: 400 }
      );
    }

    // Fetch all departments
    const departments = await Department.find({}).select('_id departmentName');
    console.log(departments);
    
    if (!departments.length) {
      return NextResponse.json(
        { success: false, error: 'No departments found' },
        { status: 500 }
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
        aiResponse = await callOpenAI(query, address, departments);
        responseText = aiResponse.choices?.[0]?.message?.content || '';
        break;

      case 'groq':
        if (!process.env.GROQ_API_KEY) {
          throw new Error('Groq API key not configured');
        }
        aiResponse = await callGroq(query, address, departments);
        responseText = aiResponse.choices?.[0]?.message?.content || '';
        console.log(responseText);
        break;

      case 'anthropic':
        if (!process.env.ANTHROPIC_API_KEY) {
          throw new Error('Anthropic API key not configured');
        }
        aiResponse = await callAnthropic(query, address, departments);
        responseText = aiResponse.content?.[0]?.text || '';
        break;

      case 'deepinfra':
        if (!process.env.DEEPINFRA_API_KEY) {
          throw new Error('DeepInfra API key not configured');
        }
        aiResponse = await callDeepInfra(query, address, departments);
        responseText = aiResponse.choices?.[0]?.message?.content || '';
        break;

      case 'gemini':
        if (!process.env.GEMINI_API_KEY) {
          throw new Error('Gemini API key not configured');
        }
        aiResponse = await callGemini(query, address, departments);
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

    // Validate the response
    if (!parsedResponse.title || !parsedResponse.departmentId) {
      throw new Error('Invalid AI response format');
    }
    
    // Verify the department exists
    const departmentId = await getDepartmentIdByName(parsedResponse.departmentId);
    console.log(departmentId,"departmentId");
   
    return NextResponse.json({
      success: true,
      analysis: {
        title: parsedResponse.title,
        departmentId: departmentId,
        departmentName: parsedResponse.departmentId,
        reasoning: parsedResponse.reasoning || 'AI analysis completed',
        originalQuery: query,
        address: address || '',
        detailsSufficient: parsedResponse.detailsSufficient !== undefined ? parsedResponse.detailsSufficient : true,
        missingDetails: parsedResponse.missingDetails || [],
        suggestions: parsedResponse.suggestions || ''
      }
    });

  } catch (error) {
    console.error('Query Analysis API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to analyze query'
    }, { status: 500 });
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    provider: LLM_PROVIDER,
    timestamp: new Date().toISOString(),
    type: 'query-analysis'
  });
}
