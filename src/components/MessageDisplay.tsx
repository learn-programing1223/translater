'use client';

import React from 'react';

interface MessageDisplayProps {
  content: string;
  isUser: boolean;
  language: string;
  audioUrl?: string;
  onPlayAudio?: (audioUrl: string) => void;
}

// Helper function to parse and format product information
const formatProductInfo = (content: string) => {
  let formattedContent = content;

  // Replace markdown-style bold text with styled spans for better visual hierarchy
  formattedContent = formattedContent.replace(/\*\*([^*]+)\*\*/g, '<span class="font-semibold text-accent-700 bg-accent-50 px-1.5 py-0.5 rounded-md">$1</span>');

  // Format prices specifically
  formattedContent = formattedContent.replace(/(\$\d+\.\d+)/g, '<span class="font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full text-sm">$1</span>');

  // Add better line spacing for readability
  formattedContent = formattedContent.replace(/\n/g, '<br />');

  return formattedContent;
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

export default function MessageDisplay({ content, isUser, language, audioUrl, onPlayAudio }: MessageDisplayProps) {
  const formattedContent = formatProductInfo(content);

  return (
    <div className="w-full max-w-2xl px-6 animate-fade-in">
      <div className={`backdrop-blur-lg rounded-3xl shadow-2xl p-6 transform transition-all duration-500 hover:scale-[1.02] ${
        isUser 
          ? 'bg-gradient-to-br from-accent-500 to-accent-600 text-white ml-auto max-w-md'
          : 'bg-white/95 text-gray-800'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {isUser ? (
              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-accent-500 to-accent-600 rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <p className={`text-sm font-semibold ${isUser ? 'text-white' : 'text-gray-700'}`}>
                {isUser ? 'You' : 'Assistant'}
              </p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                isUser 
                  ? 'text-white/80 bg-white/20' 
                  : 'text-accent-700 bg-accent-50 border border-accent-100'
              }`}>
                {getLanguageDisplay(language)}
              </span>
            </div>
          </div>
          {!isUser && audioUrl && onPlayAudio && (
            <button
              onClick={() => onPlayAudio(audioUrl)}
              className="p-2 hover:bg-accent-50 rounded-full transition-colors group"
            >
              <svg className="w-5 h-5 text-accent-600 group-hover:text-accent-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          )}
        </div>

        {/* Content */}
        <div className={`font-body leading-relaxed ${
          isUser ? 'text-white' : 'text-gray-800'
        }`}>
          {isUser ? (
            <p className="text-base whitespace-pre-wrap font-medium">{content}</p>
          ) : (
            <div 
              className="text-base leading-loose space-y-2"
              dangerouslySetInnerHTML={{ __html: formattedContent }}
            />
          )}
        </div>

        {/* Decorative elements for assistant messages */}
        {!isUser && (
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full opacity-20 -mr-10 -mt-10" />
        )}
      </div>
    </div>
  );
}