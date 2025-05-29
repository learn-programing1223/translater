import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function HomePage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 flex flex-col justify-center items-center bg-gradient-to-br from-primary/10 to-primary/20 p-8">
        <div className="text-center max-w-md">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Scan & Speak
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            Multilingual Shopping Assistant
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Ask about products in 100+ languages automatically. No language selection needed.
          </p>
          
          <div className="space-y-4">
            <Link
              href="/chat"
              className="block w-full bg-primary text-white py-4 px-6 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
            >
              💬 Start Chatting
            </Link>
            
            <Link
              href="/voice"
              className="block w-full bg-white text-primary border-2 border-primary py-4 px-6 rounded-lg font-semibold hover:bg-primary/10 transition-colors"
            >
              🎤 Voice Assistant
            </Link>
          </div>
          
          <div className="mt-8 text-xs text-gray-400">
            <p>Try: "Where is milk?" or "¿Dónde está la leche?"</p>
          </div>
        </div>
      </div>
      <Navigation />
    </div>
  );
}