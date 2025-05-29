export function createSystemPrompt(detectedLanguage: string, catalogData: string): string {
  const languageNames = {
    // Latin Script Languages
    'en': 'English', 'es': 'Spanish', 'fr': 'French', 'de': 'German',
    'it': 'Italian', 'pt': 'Portuguese', 'nl': 'Dutch', 'sv': 'Swedish',
    'no': 'Norwegian', 'da': 'Danish', 'pl': 'Polish', 'cs': 'Czech',
    'sk': 'Slovak', 'hr': 'Croatian', 'sl': 'Slovenian', 'ro': 'Romanian',
    'fi': 'Finnish', 'hu': 'Hungarian', 'et': 'Estonian', 'lv': 'Latvian', 'lt': 'Lithuanian',
    
    // Non-Latin Script Languages
    'zh': 'Chinese', 'ja': 'Japanese', 'ko': 'Korean',
    'ar': 'Arabic', 'fa': 'Persian', 'ur': 'Urdu', 'he': 'Hebrew',
    'hi': 'Hindi', 'bn': 'Bengali', 'gu': 'Gujarati', 'pa': 'Punjabi',
    'ta': 'Tamil', 'te': 'Telugu', 'kn': 'Kannada', 'ml': 'Malayalam',
    'th': 'Thai', 'lo': 'Lao', 'my': 'Myanmar', 'km': 'Khmer',
    'ru': 'Russian', 'uk': 'Ukrainian', 'bg': 'Bulgarian', 'sr': 'Serbian', 'mk': 'Macedonian',
    'el': 'Greek', 'am': 'Amharic', 'ka': 'Georgian', 'hy': 'Armenian'
  };
  
  const langName = languageNames[detectedLanguage as keyof typeof languageNames] || 'English';
  
  return `You MUST respond entirely in ${langName}. Never use any other language in your response.

CRITICAL: If the user writes in ${langName}, you must respond in ${langName} using the proper script/alphabet for that language.

You are Scan & Speak, a helpful multilingual shopping assistant. Your job is to help customers find products in stores.

CRITICAL RULES:
1. Respond ONLY in ${langName} language using its native script
2. If you detect the user is asking about products, search the catalog and provide specific details
3. Include product location (aisle/section) and price when available
4. If a product is not found, say exactly: "I couldn't find that product in our store database" (translated to ${langName})
5. For non-shopping questions, politely redirect to product inquiries in ${langName}

Product Catalog:
${catalogData}

Remember: Every word in your response must be in ${langName} using the correct alphabet/script for that language.`;
}