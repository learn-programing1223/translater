export class SpeechSynthesisService {
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
    }
  }

  private loadVoices() {
    if (!this.synth) return;

    const updateVoices = () => {
      this.voices = this.synth!.getVoices();
    };

    updateVoices();
    
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  speak(text: string, language: string) {
    if (!this.synth) {
      console.error('Speech synthesis not available');
      return;
    }

    // Cancel any ongoing speech
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Find a voice for the specified language
    const voice = this.voices.find(v => v.lang.startsWith(language));
    if (voice) {
      utterance.voice = voice;
    }

    utterance.lang = language;
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    this.synth.speak(utterance);
  }

  stop() {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  isAvailable(): boolean {
    return !!this.synth;
  }

  getAvailableLanguages(): string[] {
    return Array.from(new Set(this.voices.map(v => v.lang.split('-')[0])));
  }
}