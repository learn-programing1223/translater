import { create } from 'zustand';
import { ChatState, Message } from '@/types';
import { generateId } from '@/lib/utils';

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isLoading: false,
  error: null,

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, {
      ...message,
      id: generateId(),
      timestamp: new Date(),
    }],
  })),

  updateMessage: (id, content) => set((state) => ({
    messages: state.messages.map((msg) =>
      msg.id === id ? { ...msg, content } : msg
    ),
  })),

  clearMessages: () => set({ messages: [], error: null }),

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),
}));