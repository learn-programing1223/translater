import ChatInterface from '@/components/ChatInterface';
import Navigation from '@/components/Navigation';

export default function ChatPage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
        <ChatInterface />
      </div>
      <Navigation />
    </div>
  );
}