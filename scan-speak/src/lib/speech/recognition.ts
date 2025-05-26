import { detectLanguage } from '@/lib/utils';

export class SpeechRecognitionService {
  private recognition: any;
  private isListening = false;

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.setupRecognition();
      }
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  setLanguage(languageCode: string) {
    if (!this.recognition) return;
    
    // Convert our language codes to BCP 47 format
    const languageMap: Record<string, string> = {
      'en': 'en-US',
      'es': 'es-ES',
      'fr': 'fr-FR',
      'de': 'de-DE',
      'it': 'it-IT',
      'pt': 'pt-PT',
      'ru': 'ru-RU',
      'zh': 'zh-CN',
      'ja': 'ja-JP',
      'ko': 'ko-KR',
      'ar': 'ar-SA',
      'hi': 'hi-IN',
      'bn': 'bn-BD',
      'pa': 'pa-IN',
      'ta': 'ta-IN',
      'te': 'te-IN',
      'mr': 'mr-IN',
      'gu': 'gu-IN',
      'ur': 'ur-PK',
      'fa': 'fa-IR',
      'tr': 'tr-TR',
      'vi': 'vi-VN',
      'th': 'th-TH',
      'ms': 'ms-MY',
      'id': 'id-ID',
      'fil': 'fil-PH',
      'nl': 'nl-NL',
      'pl': 'pl-PL',
      'uk': 'uk-UA',
      'ro': 'ro-RO',
      'el': 'el-GR',
      'cs': 'cs-CZ',
      'hu': 'hu-HU',
      'sv': 'sv-SE',
      'no': 'no-NO',
      'da': 'da-DK',
      'fi': 'fi-FI',
      'he': 'he-IL',
      'sw': 'sw-KE',
      'am': 'am-ET',
      'ha': 'ha-NG',
      'yo': 'yo-NG',
      'ig': 'ig-NG',
      'zu': 'zu-ZA',
      'xh': 'xh-ZA',
      'af': 'af-ZA',
    };

    this.recognition.lang = languageMap[languageCode] || 'en-US';
  }

  start(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: Error) => void,
    onEnd: () => void
  ) {
    if (!this.recognition || this.isListening) return;

    this.recognition.onresult = (event: any) => {
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript;
      const isFinal = event.results[last].isFinal;

      // Auto-detect language from transcript
      const detectedLang = detectLanguage(transcript);
      if (detectedLang !== this.recognition.lang.split('-')[0]) {
        this.setLanguage(detectedLang);
      }

      onResult(transcript, isFinal);
    };

    this.recognition.onerror = (event: any) => {
      onError(new Error(event.error));
      this.isListening = false;
    };

    this.recognition.onend = () => {
      onEnd();
      this.isListening = false;
    };

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      onError(error as Error);
    }
  }

  stop() {
    if (!this.recognition || !this.isListening) return;
    
    try {
      this.recognition.stop();
      this.isListening = false;
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  isAvailable(): boolean {
    return !!this.recognition;
  }
}