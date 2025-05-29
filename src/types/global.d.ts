// TypeScript declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Voice transcription custom event
interface VoiceTranscriptionEventDetail {
  text: string;
  language: string;
  method: 'whisper' | 'webspeech' | 'manual';
}

interface VoiceRecognitionFallbackEventDetail {
  message: string;
  callback: (text: string) => void;
}

declare global {
  interface DocumentEventMap {
    'voiceTranscription': CustomEvent<VoiceTranscriptionEventDetail>;
    'voiceRecognitionFallback': CustomEvent<VoiceRecognitionFallbackEventDetail>;
  }
}

export {};