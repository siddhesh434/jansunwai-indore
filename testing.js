const fetch = require('node-fetch');

const GROQ_API_KEY = GROQ_API_KEY; // 🔁 Replace this with your actual Groq API key

const url = 'https://api.groq.com/openai/v1/chat/completions';

const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${GROQ_API_KEY}`
};

const body = {
  model: 'llama3-70b-8192', // or "mixtral-8x7b-32768"
  messages: [
    {
      role: 'user',
      content: 'What is Groq and how is it different from OpenAI?'
    }
  ],
  temperature: 0.7
};

async function testGroq() {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Groq Response:\n', data.choices[0].message.content);
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testGroq();
