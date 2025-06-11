'use client';

import { useState, useRef, useEffect } from 'react';
import MessageDisplay from './MessageDisplay';
import Navigation from './Navigation';

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

  // Helper function to format product information (same as MessageDisplay)
  const formatProductInfo = (content: string) => {
    let formattedContent = content;
    formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<span class="font-semibold text-primary bg-primary/10 px-1.5 py-0.5 rounded-md">$1</span>');
    formattedContent = formattedContent.replace(/(\$\d+\.\d+)/g, '<span class="font-bold text-success bg-success/10 px-2 py-1 rounded-full text-sm">$1</span>');
    formattedContent = formattedContent.replace(/\n/g, '<br />');
    return formattedContent;
  };

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
    <div className="flex flex-col h-screen bg-premium relative overflow-hidden">
      {/* Premium Dark Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
        
        {/* Subtle glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dim/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '8s' }} />
      </div>

      {/* Premium Header with Dark Glass Effect */}
      <div className="relative z-10">
        <div className="glass-premium border-b border-glass-border">
          <div className="px-6 py-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 glass rounded-2xl flex items-center justify-center">
                <svg className="w-6 h-6 text-gradient" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white font-display">Chat Assistant</h1>
                <p className="text-sm text-secondary font-medium">Powered by AI • 100+ Languages</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10" style={{paddingBottom: '240px'}}>
        {messages.length === 0 && (
          <div className="text-center mt-16 animate-fade-in">
            <div className="inline-flex items-center justify-center w-28 h-28 mb-8 glass-premium rounded-3xl shadow-premium hover-glow">
              <svg className="w-14 h-14 text-gradient" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3 font-display">Start a Conversation</h2>
            <p className="text-lg text-secondary mb-8 max-w-md mx-auto leading-relaxed">
              Ask about products in any language. I'll understand and respond naturally.
            </p>
            
            {/* Example Queries */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg mx-auto">
              {[
                "Where is milk?",
                "¿Dónde está la leche?",
                "Où est le lait?",
                "牛奶在哪里？"
              ].map((example, index) => (
                <div
                  key={index}
                  className={`glass px-4 py-3 rounded-xl text-sm font-medium text-white hover:text-primary hover:border-primary/30 border border-glass-border cursor-pointer animate-scale-in transition-all duration-300`}
                  onClick={() => setInputValue(example)}
                  style={{ animationDelay: `${(index + 1) * 200}ms` }}
                >
                  "{example}"
                </div>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-slide-up`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${message.isUser ? 'ml-auto' : 'mr-auto'}`}>
              <MessageDisplay
                content={message.content}
                isUser={message.isUser}
                language={message.language}
              />
            </div>
          </div>
        ))}

        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <div className="flex justify-start animate-fade-in">
            <div className="max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl mr-auto">
              <div className="glass-premium rounded-3xl shadow-premium p-6 transform transition-all duration-500 hover-glow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Assistant</p>
                      <span className="text-xs px-3 py-1 rounded-full font-medium text-primary bg-primary/10 border border-primary/30">
                        {getLanguageDisplay(detectLanguage(streamingMessage))}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-xs text-secondary font-medium">Live</span>
                  </div>
                </div>
                <div className="font-body leading-relaxed text-white">
                  <div 
                    className="text-base leading-loose space-y-2"
                    dangerouslySetInnerHTML={{ __html: formatProductInfo(streamingMessage) }}
                  />
                  <span className="inline-block w-1 h-5 bg-gradient-primary ml-1 animate-pulse rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Indicator */}
        {isLoading && !isStreaming && (
          <div className="flex justify-start animate-fade-in">
            <div className="glass-premium rounded-2xl px-6 py-4 shadow-lg">
              <div className="flex items-center space-x-4">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-3 h-3 bg-gradient-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                  <div className="w-3 h-3 bg-gradient-secondary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                </div>
                <span className="text-sm font-medium text-secondary">AI is thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center animate-fade-in">
            <div className="glass border border-error/30 text-error px-6 py-4 rounded-2xl shadow-lg max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-error/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium flex-1">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-error hover:text-error/80 transition-colors p-1 rounded-full hover:bg-error/20"
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
      <div className="fixed bottom-20 left-0 right-0 z-20">
        <div className="glass-premium border-t border-glass-border">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask about products in any language..."
                  className="w-full glass border-2 border-glass-border rounded-2xl px-6 pr-20 py-4 text-white placeholder-secondary bg-surface/50 focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary/50 transition-all duration-300 shadow-lg hover:shadow-xl text-base"
                  disabled={isLoading || isStreaming}
                />
                {inputValue && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary bg-surface/80 backdrop-blur-sm px-2 py-1 rounded-md font-semibold animate-fade-in border border-primary/30">
                    {getLanguageDisplay(detectLanguage(inputValue))}
                  </div>
                )}
                
                {/* Remove the 100+ Languages indicator entirely to prevent overlap */}
              </div>
              
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading || isStreaming}
                className="btn-primary w-full sm:w-auto sm:min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-3"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <div className="relative flex items-center gap-2">
                  {isLoading || isStreaming ? (
                    <>
                      <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Sending</span>
                    </>
                  ) : (
                    <>
                      <span>Send</span>
                      <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </div>
              </button>
            </form>
            
            {/* Quick Actions */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              {[
                "🥛 Where is milk?",
                "🍞 Show me bread",
                "💰 Product prices",
                "📍 Store map"
              ].map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputValue(action.split(' ').slice(1).join(' '))}
                  className="text-xs px-3 py-2 glass rounded-full text-secondary hover:text-primary hover:border-primary/30 transition-all duration-200 border border-glass-border"
                  disabled={isLoading || isStreaming}
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <Navigation />
    </div>
  );
}