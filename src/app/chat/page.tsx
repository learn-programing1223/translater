import ChatInterface from '@/components/ChatInterface';

export default function ChatPage() {
  return (
    <div className="min-h-screen bg-gradient-dark flex flex-col">
      <div className="flex-1 flex flex-col">
        <ChatInterface />
      </div>
    </div>
  );
}