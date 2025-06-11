import VoiceInterface from '@/components/VoiceInterface';
import Navigation from '@/components/Navigation';

export default function VoicePage() {
  return (
    <div className="relative h-screen bg-gradient-dark flex flex-col">
      <div className="flex-1 relative">
        <VoiceInterface />
      </div>
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <Navigation />
      </div>
    </div>
  );
}