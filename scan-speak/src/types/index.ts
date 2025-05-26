export interface Product {
  id: string;
  barcode?: string;
  name: string;
  nameTranslations: Record<string, string>;
  description: string;
  descriptionTranslations: Record<string, string>;
  price: number;
  currency: string;
  category: string;
  brand: string;
  location?: string;
  allergens?: string[];
  inStock: boolean;
  imageUrl?: string;
  lastUpdated: string;
}

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  language: string;
  timestamp: Date;
  isStreaming?: boolean;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  updateMessage: (id: string, content: string) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export interface VoiceState {
  isRecording: boolean;
  isProcessing: boolean;
  transcript: string;
  language: string;
  error: string | null;
  startRecording: () => void;
  stopRecording: () => void;
  setTranscript: (transcript: string) => void;
  setLanguage: (language: string) => void;
  setError: (error: string | null) => void;
  setProcessing: (isProcessing: boolean) => void;
}

export interface LocaleState {
  currentLocale: string;
  supportedLocales: LocaleInfo[];
  setLocale: (locale: string) => void;
}

export interface LocaleInfo {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export interface CatalogState {
  products: Product[];
  isLoading: boolean;
  lastSync: Date | null;
  searchProducts: (query: string, language: string) => Product[];
  syncCatalog: () => Promise<void>;
}