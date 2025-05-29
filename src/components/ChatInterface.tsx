'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  content: string;
  language: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const detectLanguage = (text: string): string => {
    // Clean the text and convert to lowercase for Latin script detection
    const cleanText = text.toLowerCase().trim();
    
    // Enhanced Unicode script detection (check these first - most reliable)
    const scriptPatterns = {
      // East Asian Scripts
      'zh': /[\u4e00-\u9fff]/,          // Chinese (CJK Unified Ideographs)
      'ja': /[\u3040-\u309f\u30a0-\u30ff\u4e00-\u9faf]/, // Japanese (Hiragana + Katakana + Kanji)
      'ko': /[\uac00-\ud7af\u1100-\u11ff\u3130-\u318f]/, // Korean (Hangul)
      
      // Middle Eastern Scripts  
      'ar': /[\u0600-\u06ff\u0750-\u077f]/,  // Arabic + Arabic Supplement
      'fa': /[\u0600-\u06ff\u0750-\u077f]/,  // Persian (uses Arabic script)
      'ur': /[\u0600-\u06ff\u0750-\u077f]/,  // Urdu (uses Arabic script)
      'he': /[\u0590-\u05ff]/,              // Hebrew
      
      // Indian Subcontinent Scripts
      'hi': /[\u0900-\u097f]/,              // Hindi (Devanagari)
      'bn': /[\u0980-\u09ff]/,              // Bengali
      'gu': /[\u0a80-\u0aff]/,              // Gujarati
      'pa': /[\u0a00-\u0a7f]/,              // Punjabi (Gurmukhi)
      'ta': /[\u0b80-\u0bff]/,              // Tamil
      'te': /[\u0c00-\u0c7f]/,              // Telugu
      'kn': /[\u0c80-\u0cff]/,              // Kannada
      'ml': /[\u0d00-\u0d7f]/,              // Malayalam
      
      // Southeast Asian Scripts
      'th': /[\u0e00-\u0e7f]/,              // Thai
      'lo': /[\u0e80-\u0eff]/,              // Lao
      'my': /[\u1000-\u109f]/,              // Myanmar (Burmese)
      'km': /[\u1780-\u17ff]/,              // Khmer (Cambodian)
      
      // Other Scripts
      'ru': /[\u0400-\u04ff]/,              // Cyrillic (Russian, etc.)
      'uk': /[\u0400-\u04ff]/,              // Ukrainian (Cyrillic)
      'bg': /[\u0400-\u04ff]/,              // Bulgarian (Cyrillic)
      'sr': /[\u0400-\u04ff]/,              // Serbian (Cyrillic)
      'mk': /[\u0400-\u04ff]/,              // Macedonian (Cyrillic)
      'el': /[\u0370-\u03ff]/,              // Greek
      'am': /[\u1200-\u137f]/,              // Amharic (Ethiopic)
      'ka': /[\u10a0-\u10ff]/,              // Georgian
      'hy': /[\u0530-\u058f]/,              // Armenian
    };
    
    // Check script patterns first (most reliable for non-Latin)
    for (const [lang, pattern] of Object.entries(scriptPatterns)) {
      if (pattern.test(text)) {
        return lang;
      }
    }
    
    // Enhanced Latin script detection with better patterns
    const latinPatterns = {
      // Romance Languages
      'es': /\b(dónde|está|cuánto|cuesta|precio|ubicación|pasillo|¿|¡|el|la|los|las|qué|cómo|cuándo|por|para|con|sin|muy|más|menos|bien|mal|sí|no|gracias|hola|adiós)\b/i,
      'fr': /\b(où|est|combien|coûte|prix|emplacement|allée|le|la|les|que|comment|quand|pour|avec|sans|très|plus|moins|bien|mal|oui|non|merci|bonjour|au revoir|ç|à|è|é|ê)\b/i,
      'pt': /\b(onde|está|quanto|custa|preço|localização|corredor|o|a|os|as|que|como|quando|para|com|sem|muito|mais|menos|bem|mal|sim|não|obrigado|olá|tchau|ã|õ|ç)\b/i,
      'it': /\b(dove|è|quanto|costa|prezzo|posizione|corridoio|il|la|i|le|che|come|quando|per|con|senza|molto|più|meno|bene|male|sì|no|grazie|ciao|perché)\b/i,
      'de': /\b(wo|ist|wieviel|kostet|preis|standort|gang|der|die|das|wie|wann|was|für|mit|ohne|sehr|mehr|weniger|gut|schlecht|ja|nein|danke|hallo|auf wiedersehen|ä|ö|ü|ß)\b/i,
    };
    
    // Check Latin script patterns
    for (const [lang, pattern] of Object.entries(latinPatterns)) {
      if (pattern.test(cleanText)) {
        return lang;
      }
    }
    
    return 'en'; // Default to English
  };

  const getLanguageDisplay = (code: string): string => {
    const languages = {
      // Latin Script Languages
      'en': 'EN', 'es': 'ES', 'fr': 'FR', 'de': 'DE', 'it': 'IT', 'pt': 'PT',
      'nl': 'NL', 'sv': 'SV', 'no': 'NO', 'da': 'DA', 'pl': 'PL', 'cs': 'CS',
      'sk': 'SK', 'hr': 'HR', 'sl': 'SI', 'ro': 'RO', 'fi': 'FI', 'hu': 'HU',
      'et': 'ET', 'lv': 'LV', 'lt': 'LT',
      
      // Non-Latin Script Languages
      'zh': '中文', 'ja': '日本語', 'ko': '한국어',
      'ar': 'عربي', 'fa': 'فارسی', 'ur': 'اردو', 'he': 'עברית',
      'hi': 'हिन्दी', 'bn': 'বাংলা', 'gu': 'ગુજરાતી', 'pa': 'ਪੰਜਾਬੀ',
      'ta': 'தமிழ்', 'te': 'తెలుగు', 'kn': 'ಕನ್ನಡ', 'ml': 'മലയാളം',
      'th': 'ไทย', 'lo': 'ລາວ', 'my': 'မြန်မာ', 'km': 'ខ្មែរ',
      'ru': 'RU', 'uk': 'UK', 'bg': 'BG', 'sr': 'SR', 'mk': 'MK',
      'el': 'Ελ', 'am': 'አማ', 'ka': 'ქარ', 'hy': 'Հայ'
    };
    return languages[code as keyof typeof languages] || 'EN';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim() || isLoading || isStreaming) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue.trim(),
      language: detectLanguage(inputValue.trim()),
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setError(null);
    setStreamingMessage('');
    setIsStreaming(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        },
        body: JSON.stringify({ message: userMessage.content }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let assistantLanguage = 'en';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              assistantLanguage = data.language;
              
              if (data.done) {
                const assistantMessage: Message = {
                  id: (Date.now() + 1).toString(),
                  content: fullResponse,
                  language: assistantLanguage,
                  isUser: false,
                  timestamp: new Date()
                };
                setMessages(prev => [...prev, assistantMessage]);
                setStreamingMessage('');
                setIsStreaming(false);
              } else if (data.content) {
                fullResponse += data.content;
                setStreamingMessage(fullResponse);
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (err) {
      setError('Failed to send message. Please try again.');
      setIsStreaming(false);
      setStreamingMessage('');
      console.error('Chat error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Scan & Speak Assistant</h1>
        <p className="text-sm opacity-90">Ask about products in any language</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-lg">Welcome! Ask me about products in our store.</p>
            <p className="text-sm mt-2">Try: "Where is milk?" or "¿Dónde está la leche?"</p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm rounded-lg px-4 py-2 ${
                message.isUser
                  ? 'bg-primary text-white ml-auto'
                  : 'bg-secondary text-gray-800'
              }`}
            >
              <div className="text-xs opacity-75 mb-1">
                {getLanguageDisplay(message.language)}
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <div className="flex justify-start">
            <div className="bg-secondary text-gray-800 rounded-lg px-4 py-2 max-w-sm">
              <div className="text-xs text-gray-500 mb-1">
                {getLanguageDisplay(detectLanguage(streamingMessage))}
              </div>
              <div className="text-sm whitespace-pre-wrap">
                {streamingMessage}
                <span className="animate-pulse">|</span>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start">
            <div className="bg-secondary text-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask about products in any language..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            disabled={isLoading || isStreaming}
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || isLoading || isStreaming}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}