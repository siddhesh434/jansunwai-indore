// app/api/ai-assistant/route.js
import { NextRequest, NextResponse } from 'next/server';
import { detectLanguage, getLanguageInstruction } from "../../lib/ai/languageDetection";

// You can switch between different LLM providers
const LLM_PROVIDER = 'groq'; // 'openai', 'anthropic', 'groq', 'gemini', or 'deepinfra'

async function callOpenAI(message, context) {
  // Detect language from the user's message
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
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
          content: `You are an AI assistant for JanSunwai, a municipal complaint management system for Indore city. Your role is to help citizens with municipal services and complaints.

Available departments and their responsibilities:
- Sewage: Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints
- Compost with dried leaves: Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing
- Water Supply: Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers
- Electricity: Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs
- Engineering: Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals
- Revenue: Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents
- Fire Brigade: Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC
- Finance: Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency
- Garden: Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation
- Miscellaneous Complaints: General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling
- Parking: Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations
- Building Allowance: Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight
- Lake Protection: Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration
- Social Security: Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services
- Govardhan Project: Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination
- BRTS and BCL: Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination

Your role is to help citizens understand which department their complaint should go to and provide helpful guidance. Always be polite, professional, and helpful.

${languageInstruction}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
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
          content: `You are an AI assistant for JanSunwai, a municipal complaint management system for Indore city. Your role is to help citizens with municipal services and complaints.

Available departments and their responsibilities:
- Sewage: Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints
- Compost with dried leaves: Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing
- Water Supply: Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers
- Electricity: Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs
- Engineering: Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals
- Revenue: Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents
- Fire Brigade: Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC
- Finance: Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency
- Garden: Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation
- Miscellaneous Complaints: General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling
- Parking: Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations
- Building Allowance: Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight
- Lake Protection: Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration
- Social Security: Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services
- Govardhan Project: Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination
- BRTS and BCL: Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination

Your role is to help citizens understand which department their complaint should go to and provide helpful guidance. Always be polite, professional, and helpful.`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 800,
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
      max_tokens: 1000,
      messages: [
        {
          role: 'user',
          content: `You are an AI assistant for JanSunwai, a municipal complaint management system for Indore city. Your role is to help citizens with municipal services and complaints.

Available departments and their responsibilities:
- Sewage: Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints
- Compost with dried leaves: Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing
- Water Supply: Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers
- Electricity: Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs
- Engineering: Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals
- Revenue: Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents
- Fire Brigade: Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC
- Finance: Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency
- Garden: Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation
- Miscellaneous Complaints: General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling
- Parking: Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations
- Building Allowance: Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight
- Lake Protection: Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration
- Social Security: Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services
- Govardhan Project: Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination
- BRTS and BCL: Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination

Your role is to help citizens understand which department their complaint should go to and provide helpful guidance. Always be polite, professional, and helpful.
          
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
  // Detect language from the user's message
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
          content: `You are an AI assistant for JanSunwai, a municipal complaint management system for Indore city. Your role is to help citizens with municipal services and complaints.

Available departments and their responsibilities:
- Sewage: Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints
- Compost with dried leaves: Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing
- Water Supply: Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers
- Electricity: Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs
- Engineering: Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals
- Revenue: Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents
- Fire Brigade: Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC
- Finance: Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency
- Garden: Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation
- Miscellaneous Complaints: General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling
- Parking: Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations
- Building Allowance: Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight
- Lake Protection: Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration
- Social Security: Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services
- Govardhan Project: Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination
- BRTS and BCL: Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination

Your role is to help citizens understand which department their complaint should go to and provide helpful guidance. Always be polite, professional, and helpful.

${languageInstruction}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      max_tokens: 1000,
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
  // Detect language from the user's message
  const detectedLanguage = detectLanguage(message);
  const languageInstruction = getLanguageInstruction(detectedLanguage);
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: `You are an AI assistant for JanSunwai, a municipal complaint management system for Indore city. Your role is to help citizens with municipal services and complaints.

Available departments and their responsibilities:
- Sewage: Sewage system maintenance, drainage issues, sewer line repairs, sewage treatment, clogged drains, sewage overflow, manhole maintenance, sewage infrastructure, waste water management, sewage complaints
- Compost with dried leaves: Organic waste composting, leaf collection, composting facilities, organic waste management, leaf mulching, composting programs, organic fertilizer production, waste reduction, environmental sustainability, green waste processing
- Water Supply: Water distribution, quality control, pipeline maintenance, water pressure issues, water contamination, billing disputes, meter problems, water connection, supply interruptions, water tankers
- Electricity: Power supply, electrical maintenance, street lighting, power outages, electrical safety, meter reading, billing issues, electrical connections, power infrastructure, electrical repairs
- Engineering: Infrastructure projects, construction supervision, technical planning, structural assessments, engineering consultations, project management, quality control, technical specifications, construction permits, engineering approvals
- Revenue: Tax collection, property registration, certificates, birth certificates, death certificates, property tax, business licenses, revenue collection, document verification, legal documents
- Fire Brigade: Fire safety, emergency response, rescue operations, fire inspections, safety certificates, fire prevention, emergency services, fire equipment, safety training, fire NOC
- Finance: Budget management, financial planning, expenditure control, financial reporting, budget allocation, financial audits, cost management, financial policies, fiscal planning, financial transparency
- Garden: Park maintenance, tree plantation, landscaping, playground equipment, garden maintenance, public spaces, recreational facilities, green spaces, park safety, environmental conservation
- Miscellaneous Complaints: General complaints, unclassified issues, special cases, unique problems, general grievances, miscellaneous issues, special requests, general feedback, unassigned complaints, special handling
- Parking: Parking management, parking violations, parking infrastructure, parking permits, parking fees, parking enforcement, parking complaints, parking facilities, traffic management, parking regulations
- Building Allowance: Construction permits, building approvals, building codes, construction regulations, building inspections, construction safety, building standards, construction compliance, building permits, construction oversight
- Lake Protection: Water body conservation, lake maintenance, water quality, environmental protection, lake infrastructure, water pollution control, lake safety, environmental monitoring, water conservation, lake restoration
- Social Security: Welfare programs, social assistance, community support, social services, welfare benefits, social programs, community welfare, social assistance programs, welfare schemes, social support services
- Govardhan Project: Special development project, infrastructure development, project management, development initiatives, project coordination, development planning, project implementation, development oversight, project monitoring, development coordination
- BRTS and BCL: Bus rapid transit system, public transportation, bus services, transit infrastructure, transportation planning, bus operations, transit management, transportation services, bus maintenance, transit coordination

Your role is to help citizens understand which department their complaint should go to and provide helpful guidance. Always be polite, professional, and helpful.

${languageInstruction}
          
User message: ${message}`
        }]
      }],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
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

    return NextResponse.json({
      success: true,
      response: responseText
    });

  } catch (error) {
    console.error('AI Assistant API Error:', error);
    
    // Fallback response
    const fallbackResponse = getFallbackResponse();
    
    return NextResponse.json({
      success: true,
      response: fallbackResponse
    });
  }
}

// General fallback response when AI is unavailable
function getFallbackResponse() {
  return `Hello! I'm your JanSunwai AI Assistant for municipal services in Indore. While I'm currently experiencing some technical difficulties connecting to my main systems, I'm still here to assist you.

I can help with:
• Drafting municipal complaints
• Understanding complaint procedures
• Analyzing your query history
• Status tracking and escalation
• Department-specific guidance
• General municipal service information

Please feel free to ask me anything about municipal services, and I'll do my best to help you.`;
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ 
    status: 'healthy', 
    provider: LLM_PROVIDER,
    timestamp: new Date().toISOString(),
    type: 'general-ai-assistant'
  });
}