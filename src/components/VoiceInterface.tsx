'use client';

import { useState, useRef, useEffect } from 'react';
import { detectLanguage } from '../lib/language-detection';
import { checkVoiceSupport } from '../lib/audio-utils';
import { VoiceRecognitionManager, type VoiceTranscriptionResult } from '../lib/VoiceRecognitionManager';
import MessageDisplay from './MessageDisplay';

interface VoiceMessage {
  id: string;
  content: string;
  language: string;
  isUser: boolean;
  timestamp: Date;
  audioUrl?: string;
}

export default function VoiceInterface() {
  const [currentMessage, setCurrentMessage] = useState<VoiceMessage | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const [recordingTime, setRecordingTime] = useState(0);
  const [browserSupport, setBrowserSupport] = useState<any>(null);
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [manualInputValue, setManualInputValue] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>('en');
  
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const voiceManagerRef = useRef<VoiceRecognitionManager | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Function to stop any current speech
  const stopCurrentSpeech = () => {
    // Stop OpenAI TTS audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
    
    // Stop browser TTS
    if (currentUtteranceRef.current) {
      speechSynthesis.cancel();
      currentUtteranceRef.current = null;
    }
  };

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
        setIsListening(true);
        setIsRecording(true);
        setRecordingTime(0);
        startRecordingTimer();
      },
      onRecordingStop: () => {
        console.log('onRecordingStop callback triggered'); // DEBUG
        setIsListening(false);
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
      stopCurrentSpeech(); // Stop any playing speech when component unmounts
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
      // Stop any current speech when new input starts
      stopCurrentSpeech();
      
      setIsProcessing(true);
      setError(null);
      setStatusMessage(`Transcribed via ${result.method}: "${result.text}"`);

      console.log('=== TRANSCRIPTION SUCCESS ==='); // DEBUG
      console.log('Method:', result.method); // DEBUG
      console.log('Text:', result.text); // DEBUG
      console.log('Detected Language:', result.language); // DEBUG
      console.log('============================'); // DEBUG

      // Set current message as user message
      const userMessage: VoiceMessage = {
        id: Date.now().toString(),
        content: result.text,
        language: result.language,
        isUser: true,
        timestamp: new Date()
      };

      setCurrentMessage(userMessage);
      setDetectedLanguage(result.language);
      
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
    setIsListening(false);
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
    // Stop any current speech when starting new recording
    stopCurrentSpeech();
    
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
      setIsListening(false);
      setIsRecording(false);
      setIsProcessing(true);
      setError(null);
      
      // Stop the recording
      voiceManagerRef.current.stopRecording();
      console.log('stopRecording() called successfully'); // DEBUG
      
    } catch (error) {
      console.error('Failed to stop recording:', error);
      setError('Failed to stop recording. Please try again.');
      setIsListening(false);
      setIsRecording(false);
      setIsProcessing(false);
      stopRecordingTimer();
    }
  };

  // Handle manual input submission
  const handleManualInputSubmit = async () => {
    if (!manualInputValue.trim()) return;

    // Stop any current speech when processing manual input
    stopCurrentSpeech();

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

                setCurrentMessage(aiMessage);
                
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
      // Stop any previous speech before starting new one
      stopCurrentSpeech();
      
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
        
        // Update current message with audio URL if it matches
        if (currentMessage?.id === messageId) {
          setCurrentMessage(prev => prev ? { ...prev, audioUrl } : null);
        }

        // Auto-play the response and store reference
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        // Clear reference when audio ends
        audio.addEventListener('ended', () => {
          currentAudioRef.current = null;
        });
        
        audio.play().catch(console.error);
        
      } else {
        // Fallback to browser TTS
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language;
        currentUtteranceRef.current = utterance;
        
        // Clear reference when utterance ends
        utterance.addEventListener('end', () => {
          currentUtteranceRef.current = null;
        });
        
        speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('TTS generation failed:', error);
      // Fallback to browser TTS
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language;
      currentUtteranceRef.current = utterance;
      
      // Clear reference when utterance ends
      utterance.addEventListener('end', () => {
        currentUtteranceRef.current = null;
      });
      
      speechSynthesis.speak(utterance);
    }
  };

  const playAudio = (audioUrl: string) => {
    // Stop any current speech before starting new one
    stopCurrentSpeech();
    
    const audio = new Audio(audioUrl);
    currentAudioRef.current = audio;
    
    // Clear reference when audio ends
    audio.addEventListener('ended', () => {
      currentAudioRef.current = null;
    });
    
    audio.play().catch(console.error);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative min-h-screen bg-premium">
      {/* Premium Dark Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
        
        {/* Subtle glow effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-dim/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s', animationDuration: '8s' }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Premium Header */}
        <div className="text-center pt-8 pb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 glass rounded-2xl ">
            <svg className="w-8 h-8 text-gradient" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white font-secondary mb-1">Voice Assistant</h1>
          <p className="text-sm text-white/70 font-medium">AI Powered • 100+ Languages</p>
        </div>

        {/* Status Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
          {/* Enhanced Status Display */}
          <div className="text-center mb-8 animate-fade-in">
            {isListening || isRecording ? (
              <div className="glass rounded-3xl px-8 py-6 ">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                  <h2 className="text-2xl font-light text-white animate-pulse">
                    {isRecording ? 'Listening...' : 'Initializing...'}
                  </h2>
                </div>
                {detectedLanguage && detectedLanguage !== 'en' && (
                  <p className="text-base text-secondary font-medium">
                    Language: <span className="text-primary font-semibold">{getLanguageDisplay(detectedLanguage)}</span>
                  </p>
                )}
              </div>
            ) : isProcessing ? (
              <div className="glass rounded-3xl px-8 py-6 ">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gradient-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gradient-accent rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
                    <div className="w-2 h-2 bg-gradient-secondary rounded-full animate-bounce" style={{ animationDelay: '400ms' }} />
                  </div>
                  <h2 className="text-2xl font-light text-white">
                    Processing...
                  </h2>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-4xl md:text-5xl font-light text-white mb-4 font-secondary">
                  Ready to Listen
                </h2>
                <p className="text-xl text-white/90 mb-8 max-w-md mx-auto leading-relaxed">
                  Speak naturally in any language
                </p>
                
                {/* Language Examples */}
                <div className="flex flex-wrap justify-center gap-3 max-w-lg mx-auto">
                  {[
                    { text: "English", flag: "🇺🇸" },
                    { text: "Español", flag: "🇪🇸" },
                    { text: "Français", flag: "🇫🇷" },
                    { text: "中文", flag: "🇨🇳" },
                    { text: "العربية", flag: "🇸🇦" },
                    { text: "हिन्दी", flag: "🇮🇳" }
                  ].map((lang, index) => (
                    <div
                      key={index}
                      className="glass px-3 py-2 rounded-full text-sm font-medium text-white/80 animate-scale-in"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {lang.flag} {lang.text}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Current Response Display */}
          {currentMessage && (
            <div className="w-full mt-8 animate-fade-in">
              <MessageDisplay
                content={currentMessage.content}
                isUser={currentMessage.isUser}
                language={currentMessage.language}
                audioUrl={currentMessage.audioUrl}
                onPlayAudio={playAudio}
              />
            </div>
          )}

          {/* Enhanced Error Message */}
          {error && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 animate-slide-down z-50">
              <div className="glass bg-red-900/20 border border-red-500/30 text-red-400 px-6 py-4 rounded-2xl flex items-center gap-3 max-w-sm">
                <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-sm font-medium flex-1">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 text-red-400 hover:text-red-300 transition-colors p-1 rounded-full hover:bg-red-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Microphone Button Area */}
        <div className="pb-32">
          <div className="flex flex-col items-center">
            {/* Recording Timer */}
            {isRecording && (
              <div className="mb-8 text-center animate-fade-in">
                <div className="glass px-6 py-3 rounded-2xl shadow-lg">
                  <div className="text-3xl font-light text-white font-secondary">
                    {formatTime(recordingTime)}
                  </div>
                  <div className="text-xs text-secondary font-medium mt-1">Recording</div>
                </div>
              </div>
            )}

            {/* Premium Microphone Button with Advanced Effects */}
            <div className="relative">
              {/* Enhanced Pulse Rings */}
              {(isListening || isRecording) && (
                <>
                  <div className="absolute inset-0 -m-12 rounded-full bg-gradient-primary opacity-20 animate-ping" />
                  <div className="absolute inset-0 -m-8 rounded-full bg-gradient-accent opacity-30 animate-ping animation-delay-200" />
                  <div className="absolute inset-0 -m-4 rounded-full bg-gradient-secondary opacity-40 animate-ping animation-delay-300" />
                </>
              )}
              
              {/* Glow Effect */}
              <div className={`absolute inset-0 rounded-full transition-all duration-500 ${
                isRecording ? 'shadow-[0_0_60px_rgba(239,68,68,0.6)]' : 
                isProcessing ? 'shadow-[0_0_60px_rgba(245,158,11,0.6)]' :
                'shadow-[0_0_40px_rgba(99,102,241,0.4)] hover:shadow-[0_0_80px_rgba(99,102,241,0.6)]'
              }`} />
              
              {/* Main Premium Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={permissionStatus === 'denied' || (!browserSupport?.mediaRecorder && !browserSupport?.webSpeech)}
                className={`relative w-28 h-28 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110 active:scale-95 ${
                  isRecording
                    ? 'bg-gradient-to-br from-red-500 to-red-600 '
                    : isProcessing
                    ? 'bg-gradient-to-br from-yellow-500 to-orange-500 '
                    : 'bg-gradient-premium  hover-glow'
                } ${
                  permissionStatus === 'denied' || (!browserSupport?.mediaRecorder && !browserSupport?.webSpeech)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {/* Button Content */}
                {isRecording ? (
                  <div className="flex flex-col items-center">
                    <div className="w-6 h-6 bg-white rounded-sm mb-1" />
                    <div className="text-xs text-white font-medium">Stop</div>
                  </div>
                ) : isProcessing ? (
                  <div className="flex flex-col items-center">
                    <svg className="w-8 h-8 text-white animate-spin mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div className="text-xs text-white font-medium">AI</div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 text-white mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <div className="text-xs text-white font-medium">Speak</div>
                  </div>
                )}
              </button>
            </div>

            {/* Enhanced Permission/Status Messages */}
            <div className="mt-8 text-center">
              {permissionStatus === 'denied' && (
                <div className="glass px-6 py-4 rounded-2xl shadow-lg max-w-sm mx-auto animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Microphone Access Denied</p>
                      <p className="text-sm text-secondary">Please enable in browser settings</p>
                    </div>
                  </div>
                </div>
              )}

              {browserSupport && !browserSupport.mediaRecorder && !browserSupport.webSpeech && (
                <div className="glass px-6 py-4 rounded-2xl shadow-lg max-w-sm mx-auto animate-fade-in">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-white">Voice Not Supported</p>
                      <p className="text-sm text-secondary">Try Chrome, Safari, or Edge</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Browser Support Indicators */}
              {browserSupport && (isListening || isRecording) && (
                <div className="mt-6 flex justify-center gap-8">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${browserSupport.mediaRecorder ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-sm text-white/80 font-medium">Recording</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${browserSupport.webSpeech ? 'bg-green-400' : 'bg-red-400'} animate-pulse`} />
                    <span className="text-sm text-white/80 font-medium">Speech AI</span>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Manual Input Fallback */}
            {showManualInput && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-lg px-6 animate-scale-in z-40">
                <div className="glass rounded-3xl  p-6 border border-white/30">
                  <div className="text-center mb-4">
                    <div className="w-12 h-12 bg-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <p className="text-white text-sm font-semibold mb-1">
                      Voice Recognition Unavailable
                    </p>
                    <p className="text-secondary text-xs">
                      Type your message instead
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={manualInputValue}
                      onChange={(e) => setManualInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualInputSubmit()}
                      placeholder="Type your message in any language..."
                      className="flex-1 px-4 py-3 glass border border-glass-border rounded-xl text-sm text-white placeholder-secondary bg-surface/50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                      autoFocus
                    />
                    <button
                      onClick={handleManualInputSubmit}
                      disabled={!manualInputValue.trim() || isProcessing}
                      className="px-6 py-3 bg-gradient-primary text-white rounded-xl text-sm font-medium hover-lift disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
                    >
                      {isProcessing ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      ) : (
                        'Send'
                      )}
                    </button>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowManualInput(false)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-secondary transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}