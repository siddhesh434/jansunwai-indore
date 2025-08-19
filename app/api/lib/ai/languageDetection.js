// lib/ai/languageDetection.js

/**
 * Detects if the given text is primarily in Hindi or English
 * @param {string} text - The text to analyze
 * @returns {string} - 'hi' for Hindi, 'en' for English
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') {
    return 'en'; // Default to English
  }

  // Hindi Unicode range: \u0900-\u097F (Devanagari)
  const hindiRegex = /[\u0900-\u097F]/;
  
  // Count Hindi characters
  const hindiChars = (text.match(hindiRegex) || []).length;
  
  // Count total characters (excluding spaces and punctuation)
  const totalChars = text.replace(/[\s\p{P}]/gu, '').length;
  
  // If more than 30% of characters are Hindi, consider it Hindi
  if (totalChars > 0 && (hindiChars / totalChars) > 0.3) {
    return 'hi';
  }
  
  return 'en';
}

/**
 * Gets the appropriate language instruction for AI analysis
 * @param {string} language - 'hi' or 'en'
 * @returns {string} - Language instruction for AI
 */
export function getLanguageInstruction(language) {
  if (language === 'hi') {
    return `
IMPORTANT: The user's complaint is in Hindi. Please respond in Hindi (हिंदी) for all analysis results including:
- Title (शीर्षक)
- Reasoning (तर्क)
- Missing details (गुम विवरण)
- Suggestions (सुझाव)

Use natural Hindi language that would be easily understood by Hindi-speaking users.
`;
  }
  
  return `
IMPORTANT: The user's complaint is in English. Please respond in English for all analysis results.
`;
}
