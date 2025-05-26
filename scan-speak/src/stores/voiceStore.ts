import { create } from 'zustand';
import { VoiceState } from '@/types';

export const useVoiceStore = create<VoiceState>((set) => ({
  isRecording: false,
  isProcessing: false,
  transcript: '',
  language: 'en',
  error: null,

  startRecording: () => set({ isRecording: true, error: null }),
  
  stopRecording: () => set({ isRecording: false }),

  setTranscript: (transcript) => set({ transcript }),

  setLanguage: (language) => set({ language }),

  setError: (error) => set({ error }),
  
  setProcessing: (isProcessing) => set({ isProcessing }),
}));