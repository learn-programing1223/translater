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
    <div className="relative h-screen overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Floating circles */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-float" />
        <div className="absolute top-40 right-20 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-float-delayed" />
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-white/10 rounded-full blur-xl animate-float-slow" />
        <div className="absolute bottom-20 right-1/4 w-24 h-24 bg-white/10 rounded-full blur-lg animate-float" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Status Area */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* Status Text */}
          <div className="text-center mb-12 animate-fade-in">
            {isListening || isRecording ? (
              <>
                <h2 className="text-3xl font-light text-white mb-3 animate-pulse">
                  {isRecording ? 'Listening...' : 'Initializing...'}
                </h2>
                {detectedLanguage && detectedLanguage !== 'en' && (
                  <p className="text-lg text-white/80">
                    Detected: {getLanguageDisplay(detectedLanguage)}
                  </p>
                )}
              </>
            ) : isProcessing ? (
              <h2 className="text-3xl font-light text-white animate-pulse">
                Processing...
              </h2>
            ) : (
              <>
                <h2 className="text-3xl font-light text-white mb-3">
                  Tap the microphone to start
                </h2>
                <p className="text-lg text-white/80">
                  Speak in any language
                </p>
              </>
            )}
          </div>

          {/* Current Response Display */}
          {currentMessage && (
            <div className="w-full max-w-2xl px-6 animate-fade-in">
              <div className="bg-white/95 backdrop-blur-lg rounded-3xl shadow-2xl p-6 transform transition-all duration-500 hover:scale-[1.02]">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {currentMessage.isUser ? (
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                    ) : (
                      <div className="w-8 h-8 bg-cyan-500 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                    <div>
                      <p className="text-sm font-medium text-gray-700">
                        {currentMessage.isUser ? 'You' : 'Assistant'}
                        <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          {getLanguageDisplay(currentMessage.language)}
                        </span>
                      </p>
                    </div>
                  </div>
                  {!currentMessage.isUser && currentMessage.audioUrl && (
                    <button
                      onClick={() => playAudio(currentMessage.audioUrl!)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                  )}
                </div>
                <p className="text-base leading-relaxed text-gray-800 whitespace-pre-wrap">
                  {currentMessage.content}
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 animate-slide-down">
              <div className="bg-red-500/90 backdrop-blur-sm text-white px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-medium">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-2 hover:opacity-70 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Microphone Button Area */}
        <div className="pb-24">
          <div className="flex flex-col items-center">
            {/* Recording Timer */}
            {isRecording && (
              <div className="mb-6 text-center animate-fade-in">
                <div className="text-2xl font-light text-white">{formatTime(recordingTime)}</div>
              </div>
            )}

            {/* Microphone Button with Pulse Rings */}
            <div className="relative">
              {/* Pulse Rings */}
              {(isListening || isRecording) && (
                <>
                  <div className="absolute inset-0 -m-8 rounded-full bg-white/20 animate-ping" />
                  <div className="absolute inset-0 -m-4 rounded-full bg-white/30 animate-ping animation-delay-200" />
                </>
              )}
              
              {/* Main Button */}
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={permissionStatus === 'denied' || (!browserSupport?.mediaRecorder && !browserSupport?.webSpeech)}
                className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all transform hover:scale-110 active:scale-95 ${
                  isRecording
                    ? 'bg-red-500 shadow-2xl shadow-red-500/50'
                    : isProcessing
                    ? 'bg-yellow-500 shadow-2xl shadow-yellow-500/50'
                    : 'bg-white shadow-2xl hover:shadow-3xl'
                } ${
                  permissionStatus === 'denied' || (!browserSupport?.mediaRecorder && !browserSupport?.webSpeech)
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
              >
                {isRecording ? (
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                  </svg>
                ) : isProcessing ? (
                  <svg className="w-10 h-10 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                ) : (
                  <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Permission/Status Messages */}
            <div className="mt-6 text-center">
              {permissionStatus === 'denied' && (
                <div className="text-white/90 text-sm animate-fade-in">
                  <p className="font-medium">Microphone access denied</p>
                  <p className="opacity-80">Please enable in browser settings</p>
                </div>
              )}

              {browserSupport && !browserSupport.mediaRecorder && !browserSupport.webSpeech && (
                <div className="text-white/90 text-sm animate-fade-in">
                  <p className="font-medium">Voice recognition not supported</p>
                  <p className="opacity-80">Try using Chrome, Safari, or Edge</p>
                </div>
              )}

              {/* Browser Support Indicators */}
              {browserSupport && (isListening || isRecording) && (
                <div className="mt-4 flex justify-center gap-6 text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${browserSupport.mediaRecorder ? 'bg-green-400' : 'bg-red-400'}`} />
                    Recording
                  </span>
                  <span className="flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${browserSupport.webSpeech ? 'bg-green-400' : 'bg-red-400'}`} />
                    Speech
                  </span>
                </div>
              )}
            </div>

            {/* Manual Input Fallback */}
            {showManualInput && (
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-full max-w-md px-6 animate-slide-up">
                <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-5">
                  <p className="text-center text-gray-700 text-sm mb-3 font-medium">
                    Voice recognition isn't working. Type your message:
                  </p>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={manualInputValue}
                      onChange={(e) => setManualInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleManualInputSubmit()}
                      placeholder="Type your message here..."
                      className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      autoFocus
                    />
                    <button
                      onClick={handleManualInputSubmit}
                      disabled={!manualInputValue.trim() || isProcessing}
                      className="px-6 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    </div>
  );
}