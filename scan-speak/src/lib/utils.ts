import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function detectLanguage(text: string): string {
  // Simple language detection based on character sets
  // In production, you'd use a proper language detection library
  
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) return 'ar';
  
  // Chinese
  if (/[\u4E00-\u9FFF]/.test(text)) return 'zh';
  
  // Japanese (Hiragana, Katakana, or Kanji)
  if (/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text)) return 'ja';
  
  // Korean
  if (/[\uAC00-\uD7AF]/.test(text)) return 'ko';
  
  // Hindi/Devanagari
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  
  // Russian/Cyrillic
  if (/[\u0400-\u04FF]/.test(text)) return 'ru';
  
  // Greek
  if (/[\u0370-\u03FF]/.test(text)) return 'el';
  
  // Hebrew
  if (/[\u0590-\u05FF]/.test(text)) return 'he';
  
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) return 'th';
  
  // Default to English
  return 'en';
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function getLanguageName(code: string): string {
  const displayNames = new Intl.DisplayNames(['en'], { type: 'language' });
  try {
    return displayNames.of(code) || code;
  } catch {
    return code;
  }
}

export function isRTL(languageCode: string): boolean {
  const rtlLanguages = ['ar', 'he', 'fa', 'ur', 'yi', 'ji', 'iw', 'ku', 'ps', 'sd', 'ks'];
  return rtlLanguages.includes(languageCode);
}

export function getBrowserLanguage(): string {
  const browserLang = navigator.language || navigator.languages[0];
  return browserLang.split('-')[0].toLowerCase();
}

export function supportsWebSpeech(): boolean {
  return 'speechSynthesis' in window && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
}