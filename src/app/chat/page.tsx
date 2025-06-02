import ChatInterface from '@/components/ChatInterface';
import Navigation from '@/components/Navigation';

export default function ChatPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
      <Navigation />
    </div>
  );
}