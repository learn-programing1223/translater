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
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-100 to-cyan-100">
      {/* Premium Header with Glass Effect */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500" />
        <div className="relative glass p-5 shadow-2xl">
          <h1 className="text-2xl font-bold text-white drop-shadow-lg">Scan & Speak Assistant</h1>
          <p className="text-sm text-white/90 mt-1">Ask about products in any language</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-white/50">
        {messages.length === 0 && (
          <div className="text-center mt-12 animate-fade-in">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full shadow-2xl">
              <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <p className="text-xl font-semibold text-gray-800">Welcome! Ask me about products in our store.</p>
            <p className="text-base mt-3 text-gray-600">Try: "Where is milk?" or "¿Dónde está la leche?"</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div
              className={`max-w-[80%] md:max-w-md rounded-2xl px-5 py-3 shadow-xl transform hover:scale-[1.02] transition-all duration-300 ${
                message.isUser
                  ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
                  : 'glass text-gray-800 border border-gray-200'
              }`}
            >
              <div className={`text-xs font-semibold mb-2 flex items-center gap-2 ${
                message.isUser ? 'text-white/90' : 'text-gray-600'
              }`}>
                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold ${
                  message.isUser ? 'bg-white/30 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {getLanguageDisplay(message.language)}
                </span>
                <span>
                  {message.isUser ? 'You' : 'Assistant'}
                </span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass text-gray-800 rounded-2xl px-5 py-3 max-w-[80%] md:max-w-md shadow-xl border border-gray-200 animate-pulse-soft">
              <div className="text-xs text-gray-600 font-semibold mb-2 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-[10px] font-bold">
                  {getLanguageDisplay(detectLanguage(streamingMessage))}
                </span>
                <span>Assistant</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                {streamingMessage}
                <span className="inline-block w-1 h-4 bg-gray-400 ml-1 animate-pulse" />
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass text-gray-800 rounded-2xl px-5 py-3 shadow-xl border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="flex space-x-1.5">
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                <span className="text-sm font-medium text-gray-700">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center animate-fade-in">
            <div className="bg-red-50 border border-red-300 text-red-800 px-5 py-3 rounded-2xl shadow-lg max-w-md">
              <div className="flex items-center gap-3">
                <svg className="w-5 h-5 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800 transition-colors p-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Premium Input Form */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-t from-white to-gray-50" />
        <div className="relative glass border-t border-gray-200 p-5 shadow-2xl">
          <form onSubmit={handleSubmit} className="flex gap-3">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask about products in any language..."
                className="w-full glass border-2 border-gray-300 rounded-2xl px-5 py-3.5 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-md hover:shadow-lg"
                disabled={isLoading || isStreaming}
              />
              {inputValue && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full font-semibold animate-fade-in">
                  {getLanguageDisplay(detectLanguage(inputValue))}
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading || isStreaming}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3.5 rounded-2xl font-semibold shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              <span>Send</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}