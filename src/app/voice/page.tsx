import VoiceInterface from '@/components/VoiceInterface';
import Navigation from '@/components/Navigation';

export default function VoicePage() {
  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1">
        <VoiceInterface />
      </div>
      <Navigation />
    </div>
  );
}