'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Mic, MicOff, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useVoiceStore } from '@/stores/voiceStore';
import { useLocaleStore } from '@/stores/localeStore';
import { useChatStore } from '@/stores/chatStore';
import { SpeechRecognitionService } from '@/lib/speech/recognition';
import { SpeechSynthesisService } from '@/lib/speech/synthesis';
import { catalogService } from '@/lib/db/catalog';
import { streamChat } from '@/lib/ai/openai';
import { generateId } from '@/lib/utils';
import { cn } from '@/lib/utils';

export function VoiceInterface() {
  const router = useRouter();
  const [recognition] = useState(() => new SpeechRecognitionService());
  const [synthesis] = useState(() => new SpeechSynthesisService());
  const [isSupported, setIsSupported] = useState(true);
  
  const { isRecording, transcript, language, startRecording, stopRecording, setTranscript, setError } = useVoiceStore();
  const { currentLocale } = useLocaleStore();
  const { addMessage } = useChatStore();

  useEffect(() => {
    if (!recognition.isAvailable() || !synthesis.isAvailable()) {
      setIsSupported(false);
    }
    recognition.setLanguage(currentLocale);
  }, [recognition, synthesis, currentLocale]);

  const handleTranscriptComplete = useCallback(async (finalTranscript: string) => {
    if (!finalTranscript.trim()) return;

    // Add user message
    addMessage({
      content: finalTranscript,
      role: 'user',
      language: currentLocale,
    });

    try {
      // Search for relevant products
      const products = await catalogService.searchProducts(finalTranscript, currentLocale);

      let responseContent = '';
      const assistantMessageId = generateId();

      // Add assistant message
      addMessage({
        content: '',
        role: 'assistant',
        language: currentLocale,
      });

      await streamChat(
        finalTranscript,
        currentLocale,
        products,
        {
          onChunk: (chunk) => {
            responseContent += chunk;
          },
          onComplete: () => {
            // Speak the response
            synthesis.speak(responseContent, currentLocale);
            
            // Navigate to chat to see the conversation
            router.push('/chat');
          },
          onError: (error) => {
            console.error('Voice chat error:', error);
            setError('Failed to process your request. Please try again.');
          },
        }
      );
    } catch (error) {
      console.error('Error processing voice input:', error);
      setError('Failed to process voice input. Please try again.');
    }
  }, [currentLocale, addMessage, synthesis, router, setError]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      recognition.stop();
      stopRecording();
      
      // Process the final transcript
      if (transcript) {
        handleTranscriptComplete(transcript);
      }
    } else {
      setTranscript('');
      recognition.start(
        (text, isFinal) => {
          setTranscript(text);
          if (isFinal && text.trim()) {
            // Auto-stop after final transcript
            recognition.stop();
            stopRecording();
            handleTranscriptComplete(text);
          }
        },
        (error) => {
          console.error('Recognition error:', error);
          setError(error.message);
          stopRecording();
        },
        () => {
          stopRecording();
        }
      );
      startRecording();
    }
  }, [isRecording, transcript, recognition, startRecording, stopRecording, setTranscript, setError, handleTranscriptComplete]);

  const handleClose = () => {
    if (isRecording) {
      recognition.stop();
      stopRecording();
    }
    synthesis.stop();
    router.push('/chat');
  };

  if (!isSupported) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-[#28C6B1] to-white p-8">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
          <AlertCircle className="mx-auto mb-4 h-16 w-16 text-yellow-500" />
          <h2 className="mb-2 text-2xl font-bold text-gray-800">
            Speech Not Supported
          </h2>
          <p className="mb-6 text-gray-600">
            Your browser doesn't support speech recognition or synthesis. 
            Please use Chrome, Safari, or Edge for the best experience.
          </p>
          <Button onClick={() => router.push('/chat')}>
            Use Text Chat Instead
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex h-screen items-center justify-center bg-gradient-to-br from-[#28C6B1] to-white">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleClose}
        className="absolute right-4 top-4 text-gray-600 hover:text-gray-800"
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Main content */}
      <div className="flex flex-col items-center">
        {/* Microphone button */}
        <button
          onClick={toggleRecording}
          className={cn(
            'group relative mb-8 rounded-full p-6 shadow-2xl transition-all duration-300',
            isRecording
              ? 'animate-pulse bg-red-500 hover:bg-red-600'
              : 'bg-[#28C6B1] hover:bg-[#28C6B1]/90'
          )}
        >
          {isRecording ? (
            <MicOff className="h-16 w-16 text-white" />
          ) : (
            <Mic className="h-16 w-16 text-white" />
          )}
          
          {/* Pulse animation when recording */}
          {isRecording && (
            <>
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-25" />
              <span className="absolute inset-0 animate-ping rounded-full bg-red-500 opacity-25 animation-delay-200" />
            </>
          )}
        </button>

        {/* Status text */}
        <p className="mb-8 text-xl font-medium text-gray-700">
          {isRecording ? 'Listening...' : 'Tap to speak'}
        </p>

        {/* Transcript display */}
        {transcript && (
          <div className="max-w-2xl animate-fadeIn rounded-2xl bg-white/90 p-6 shadow-xl backdrop-blur">
            <p className="text-lg text-gray-800">{transcript}</p>
          </div>
        )}

        {/* Language indicator */}
        <div className="mt-8 text-sm text-gray-600">
          Speaking in: <span className="font-semibold">{currentLocale.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
}