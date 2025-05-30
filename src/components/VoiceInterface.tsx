'use client';

import { useState, useRef, useEffect } from 'react';
import { detectLanguage } from '../lib/language-detection';
import { checkVoiceSupport } from '../lib/audio-utils';
import { VoiceRecognitionManager, type VoiceTranscriptionResult } from '../lib/VoiceRecognitionManager';

interface VoiceMessage {
  id: string;
  content: string;
  language: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

export default function VoiceInterface() {
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [recordingTime, setRecordingTime] = useState(0);
  const [browserSupport, setBrowserSupport] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceManagerRef = useRef<VoiceRecognitionManager | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Check browser support on mount
    const support = checkVoiceSupport();
    setBrowserSupport(support);
    
    // Initialize VoiceRecognitionManager
    voiceManagerRef.current = new VoiceRecognitionManager({
      onTranscriptionSuccess: handleTranscriptionSuccess,
      onError: handleVoiceError,
      onStatusUpdate: (status) => setStatusMessage(status),
      onRecordingStart: () => {
        setIsRecording(true);
        setRecordingTime(0);
        startRecordingTimer();
      },
      onRecordingStop: () => {
        console.log('onRecordingStop callback triggered'); // DEBUG
        setIsRecording(false);
        setIsProcessing(false);
        stopRecordingTimer();
      }
    });
    
    // Check microphone permission on mount
    navigator.permissions?.query({ name: 'microphone' as PermissionName })
      .then((permission) => {
        setPermissionStatus(permission.state);
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      })
      .catch(() => {
        setPermissionStatus('prompt');
      });

    // Listen for manual input fallback events
    const handleFallbackEvent = (event: CustomEvent<any>) => {
      setStatusMessage(event.detail.message);
      setShowManualInput(true);
      setManualInputValue('');
    };

    document.addEventListener('voiceRecognitionFallback', handleFallbackEvent);

    return () => {
      document.removeEventListener('voiceRecognitionFallback', handleFallbackEvent);
      stopRecordingTimer();
    };
  }, []);

  const getLanguageDisplay = (code: string): string => {
    const languages = {
      // Latin Script Languages
      'en': 'EN', 'es': 'ES', 'fr': 'FR', 'de': 'DE', 'it': 'IT', 'pt': 'PT',
      'nl': 'NL', 'sv': 'SV', 'no': 'NO', 'da': 'DA', 'pl': 'PL', 'cs': 'CS',
      'sk': 'SK', 'hr': 'HR', 'sl': 'SI', 'ro': 'RO', 'fi': 'FI', 'hu': 'HU',
      'et': 'ET', 'lv': 'LV', 'lt': 'LT',
      
      // Non-Latin Script Languages
      'zh': '中文', 'ja': '日本語', 'ko': '한국어',
      'ar': 'عربي', 'fa': 'فارسی', 'ur': 'اردو', 'he': 'עברית',
      'hi': 'हिन्दी', 'bn': 'বাংলা', 'gu': 'ગુજરાતી', 'pa': 'ਪੰਜਾਬੀ',
      'ta': 'தமிழ்', 'te': 'తెలుగు', 'kn': 'ಕನ್ನಡ', 'ml': 'മലയാളം',
      'th': 'ไทย', 'lo': 'ລາວ', 'my': 'မြန်မာ', 'km': 'ខ្មែរ',
      'ru': 'RU', 'uk': 'UK', 'bg': 'BG', 'sr': 'SR', 'mk': 'MK',
      'el': 'Ελ', 'am': 'አማ', 'ka': 'ქარ', 'hy': 'Հայ'
    };
    return languages[code as keyof typeof languages] || 'EN';
  };

  // Handle successful transcription from any source
  const handleTranscriptionSuccess = async (result: VoiceTranscriptionResult) => {
    try {
      setIsProcessing(true);
      setError(null);
      setStatusMessage(`Transcribed via ${result.method}: "${result.text}"`);

      console.log('=== TRANSCRIPTION SUCCESS ==='); // DEBUG
      console.log('Method:', result.method); // DEBUG
      console.log('Text:', result.text); // DEBUG
      console.log('Detected Language:', result.language); // DEBUG
      console.log('============================'); // DEBUG

      // Add user message
      const userMessage: VoiceMessage = {
        id: Date.now().toString(),
        content: result.text,
        language: result.language,
        isUser: true,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, userMessage]);
      
      // Get AI response with explicit language
      await getAIResponse(result.text, result.language);
      
    } catch (error) {
      console.error('Failed to process transcription:', error);
      setError('Failed to process transcription. Please try again.');
    } finally {
      setIsProcessing(false);
      setStatusMessage('');
    }
  };

  // Handle voice recognition errors
  const handleVoiceError = (error: Error) => {
    console.error('Voice recognition error:', error);
    setError(error.message);
    setIsRecording(false);
    setIsProcessing(false);
    setStatusMessage('');
    stopRecordingTimer();
  };

  // Start and stop recording timer
  const startRecordingTimer = () => {
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecordingTimer = () => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  // Start voice recognition using VoiceRecognitionManager
  const startRecording = async () => {
    // Check browser support
    if (!browserSupport?.mediaRecorder && !browserSupport?.webSpeech) {
      setError('Voice recognition not supported in this browser. Please use text input.');
      return;
    }

    if (!voiceManagerRef.current) {
      setError('Voice recognition not initialized. Please refresh the page.');
      return;
    }

    try {
      setError(null);
      setIsProcessing(true);
      setShowManualInput(false);
      
      // Start the comprehensive voice recognition process
      await voiceManagerRef.current.startVoiceRecognition();
      
    } catch (error) {
      console.error('Failed to start voice recognition:', error);
      setError('Failed to start voice recognition. Please try again.');
      setIsProcessing(false);
    }
  };

  // Stop recording using VoiceRecognitionManager
  const stopRecording = () => {
    console.log('Stop button clicked'); // DEBUG
    
    if (!voiceManagerRef.current) {
      console.error('Voice manager not initialized'); // DEBUG
      setError('Voice recognition not initialized');
      return;
    }

    try {
      console.log('Stopping recording - Current state:', {
        isRecording,
        isProcessing,
        managerState: voiceManagerRef.current.getRecordingState()
      }); // DEBUG
      
      // Immediately update UI state
      setIsRecording(false);
      setIsProcessing(true);
      setError(null);
      
      // Stop the recording
      voiceManagerRef.current.stopRecording();
      console.log('stopRecording() called successfully'); // DEBUG
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError('Failed to stop recording. Please try again.');
      setIsRecording(false);
      setIsProcessing(false);
      stopRecordingTimer();
    }
  };

  // Handle manual input submission
  const handleManualInputSubmit = async () => {
    if (!manualInputValue.trim()) return;

    try {
      await handleTranscriptionSuccess({
        text: manualInputValue.trim(),
        language: detectLanguage(manualInputValue.trim()),
        method: 'manual'
      });
      
      setShowManualInput(false);
      setManualInputValue('');
      
    } catch (error) {
      console.error('Failed to process manual input:', error);
      setError('Failed to process input. Please try again.');
    }
  };


  const getAIResponse = async (userInput: string, detectedLanguage?: string) => {
    try {
      console.log('=== AI RESPONSE REQUEST ==='); // DEBUG
      console.log('User Input:', userInput); // DEBUG
      console.log('Language for AI:', detectedLanguage); // DEBUG
      console.log('=========================='); // DEBUG
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json',
          'Accept-Charset': 'utf-8'
        },
        body: JSON.stringify({ 
          message: userInput,
          language: detectedLanguage 
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      let aiLanguage = 'en';
      let fullResponse = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              aiLanguage = data.language;
              
              if (data.done) {
                console.log('=== AI RESPONSE COMPLETE ==='); // DEBUG
                console.log('AI Response:', fullResponse); // DEBUG
                console.log('AI Language:', aiLanguage); // DEBUG
                console.log('============================'); // DEBUG
                
                const aiMessage: VoiceMessage = {
                  id: (Date.now() + 1).toString(),
                  content: fullResponse,
                  language: aiLanguage,
                  isUser: false,
                  timestamp: new Date()
                };

                setMessages(prev => [...prev, aiMessage]);
                
                // Generate speech for AI response
                await generateSpeech(fullResponse, aiLanguage, aiMessage.id);
                
              } else if (data.content) {
                fullResponse += data.content;
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('AI response error:', error);
      setError('Failed to get AI response');
    }
  };

  const generateSpeech = async (text: string, language: string, messageId: string) => {
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, language }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Update message with audio URL
        setMessages(prev => prev.map(msg => 
          msg.id === messageId 
            ? { ...msg, audioUrl }
            : msg
        ));

        // Auto-play the response
        const audio = new Audio(audioUrl);
        audio.play().catch(console.error);
        
      } else {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch(console.error);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header */}
      <div className="bg-primary text-white p-4 shadow-md">
        <h1 className="text-xl font-semibold">Voice Assistant</h1>
        <p className="text-sm opacity-90">Speak in any language</p>
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <div className="mb-4">
              <span className="text-4xl">🎤</span>
            </div>
            <p className="text-lg">Tap the microphone to start</p>
            <p className="text-sm mt-2">Speak in any language</p>
            
            {browserSupport && (
              <div className="mt-4 text-xs">
                <p className="mb-1">Browser Support:</p>
                <div className="flex justify-center space-x-4">
                  <span className={browserSupport.mediaRecorder ? 'text-green-600' : 'text-red-600'}>
                    🎙️ Recording: {browserSupport.mediaRecorder ? '✓' : '✗'}
                  </span>
                  <span className={browserSupport.webSpeech ? 'text-green-600' : 'text-red-600'}>
                    🗣️ Speech: {browserSupport.webSpeech ? '✓' : '✗'}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-sm rounded-lg px-4 py-2 ${
                message.isUser
                  ? 'bg-primary text-white ml-auto'
                  : 'bg-secondary text-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs opacity-75">
                  {getLanguageDisplay(message.language)}
                </div>
                {!message.isUser && message.audioUrl && (
                  <button
                    onClick={() => playAudio(message.audioUrl!)}
                    className="text-xs opacity-75 hover:opacity-100 ml-2"
                  >
                    🔊
                  </button>
                )}
              </div>
              <div className="text-sm whitespace-pre-wrap">{message.content}</div>
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-center">
            <div className="bg-secondary text-gray-800 rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span className="text-sm">Processing speech...</span>
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex justify-center">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded-lg text-sm">
              {error}
              <button
                onClick={() => setError(null)}
                className="ml-2 text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Voice Controls */}
      <div className="border-t bg-white p-4">
        <div className="flex flex-col items-center space-y-4">
          {/* Recording Status */}
          {isRecording && (
            <div className="text-center">
              <div className="text-lg font-medium text-red-600">Recording...</div>
              <div className="text-sm text-gray-600">{formatTime(recordingTime)}</div>
            </div>
          )}

          {/* Microphone Button */}
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={permissionStatus === 'denied' || !browserSupport?.mediaRecorder}
            className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-500 hover:bg-red-600 animate-pulse cursor-pointer'
                : isProcessing
                ? 'bg-yellow-500 animate-pulse cursor-wait'
                : 'bg-primary hover:bg-primary/90 cursor-pointer'
            } ${
              permissionStatus === 'denied' || !browserSupport?.mediaRecorder
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <span className="text-white text-3xl">
              {isRecording ? '⏹️' : isProcessing ? '⏳' : '🎤'}
            </span>
          </button>

          {/* Permission Status */}
          {permissionStatus === 'denied' && (
            <div className="text-center text-red-600 text-sm">
              <p>Microphone access denied</p>
              <p>Please enable in browser settings</p>
            </div>
          )}

          {permissionStatus === 'prompt' && (
            <div className="text-center text-gray-600 text-sm">
              <p>Tap microphone to request permission</p>
            </div>
          )}

          {browserSupport && !browserSupport.mediaRecorder && (
            <div className="text-center text-red-600 text-sm">
              <p>Voice recording not supported</p>
              <p>Try using a modern browser</p>
            </div>
          )}

          {/* Status Message */}
          {statusMessage && (
            <div className="text-center text-gray-600 text-sm">
              {statusMessage}
            </div>
          )}

          {/* Manual Input Fallback */}
          {showManualInput && (
            <div className="w-full max-w-md">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <div className="text-center text-yellow-800 text-sm mb-2">
                  Voice recognition isn't working. Please type your message:
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={manualInputValue}
                    onChange={(e) => setManualInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleManualInputSubmit()}
                    placeholder="Type your message here..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    autoFocus
                  />
                  <button
                    onClick={handleManualInputSubmit}
                    disabled={!manualInputValue.trim() || isProcessing}
                    className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}