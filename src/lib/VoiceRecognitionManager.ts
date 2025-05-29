import { detectLanguage } from './language-detection';

export interface VoiceTranscriptionResult {
  text: string;
  language: string;
  method: 'whisper' | 'webspeech' | 'manual';
}

export interface VoiceRecognitionCallbacks {
  onTranscriptionSuccess: (result: VoiceTranscriptionResult) => Promise<void>;
  onError: (error: Error) => void;
  onStatusUpdate: (status: string) => void;
  onRecordingStart: () => void;
  onRecordingStop: () => void;
}

export class VoiceRecognitionManager {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private isRecording = false;
  private isProcessingVoice = false;
  private callbacks: VoiceRecognitionCallbacks;
  private recordingTimeoutId: NodeJS.Timeout | null = null;

  constructor(callbacks: VoiceRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  // Main voice recognition function with comprehensive error handling
  async startVoiceRecognition(): Promise<void> {
    try {
      this.isProcessingVoice = true;
      this.callbacks.onStatusUpdate('Starting voice recognition...');
      
      // Step 1: Record audio
      const audioBlob = await this.recordAudio();
      
      // Step 2: Try OpenAI Whisper first (primary method)
      try {
        this.callbacks.onStatusUpdate('Transcribing with OpenAI Whisper...');
        const transcription = await this.transcribeWithWhisper(audioBlob);
        
        await this.callbacks.onTranscriptionSuccess({
          text: transcription.text,
          language: transcription.language,
          method: 'whisper'
        });
        return;
        
      } catch (whisperError) {
        console.warn('OpenAI Whisper failed:', whisperError);
        
        // Step 3: Try Web Speech API fallback (if available)
        if (this.isWebSpeechAvailable()) {
          try {
            this.callbacks.onStatusUpdate('Trying Web Speech API fallback...');
            const result = await this.tryWebSpeechFallback();
            
            await this.callbacks.onTranscriptionSuccess({
              text: result.text,
              language: result.language,
              method: 'webspeech'
            });
            return;
            
          } catch (speechError) {
            console.warn('Web Speech API failed:', speechError);
          }
        }
        
        // Step 4: Manual input fallback
        this.showManualInputFallback();
      }
      
    } catch (error) {
      console.error('Voice recognition completely failed:', error);
      this.callbacks.onError(error as Error);
    } finally {
      this.isProcessingVoice = false;
      this.cleanup();
    }
  }

  // Enhanced audio recording with proper cleanup
  private async recordAudio(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      // Check browser support first
      if (!navigator.mediaDevices?.getUserMedia) {
        reject(new Error('MediaDevices not supported in this browser'));
        return;
      }

      this.callbacks.onStatusUpdate('Requesting microphone access...');

      navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100
        } 
      })
      .then(stream => {
        this.stream = stream;
        this.setupRecording(stream, resolve, reject);
      })
      .catch(error => {
        let errorMessage = 'Microphone access failed';
        
        if (error.name === 'NotAllowedError') {
          errorMessage = 'Microphone permission denied. Please enable microphone access in your browser settings.';
        } else if (error.name === 'NotFoundError') {
          errorMessage = 'No microphone found. Please connect a microphone and try again.';
        } else if (error.name === 'NotReadableError') {
          errorMessage = 'Microphone is already in use by another application.';
        } else {
          errorMessage = `Microphone access failed: ${error.message}`;
        }
        
        reject(new Error(errorMessage));
      });
    });
  }

  // Setup MediaRecorder with cross-browser compatibility
  private setupRecording(stream: MediaStream, resolve: (blob: Blob) => void, reject: (error: Error) => void): void {
    try {
      this.mediaRecorder = this.createCompatibleMediaRecorder(stream);
      this.audioChunks = [];

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/wav' 
        });
        
        this.callbacks.onRecordingStop();
        this.cleanup();
        
        if (audioBlob.size === 0) {
          reject(new Error('No audio data recorded'));
        } else {
          resolve(audioBlob);
        }
      };

      this.mediaRecorder.onerror = (event: any) => {
        this.cleanup();
        reject(new Error(`Recording failed: ${event.error?.message || 'Unknown recording error'}`));
      };

      // Start recording
      this.isRecording = true;
      this.mediaRecorder.start(1000);
      this.callbacks.onRecordingStart();
      this.callbacks.onStatusUpdate('Recording... Tap to stop');
      
      // Auto-stop after 30 seconds (prevent infinite recording)
      this.recordingTimeoutId = setTimeout(() => {
        if (this.isRecording && this.mediaRecorder?.state === 'recording') {
          this.stopRecording();
        }
      }, 30000);

    } catch (error) {
      this.cleanup();
      reject(new Error(`Failed to setup recording: ${(error as Error).message}`));
    }
  }

  // Create MediaRecorder with MIME type fallbacks
  private createCompatibleMediaRecorder(stream: MediaStream): MediaRecorder {
    const mimeTypes = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/mp4',
      'audio/wav',
      'audio/ogg;codecs=opus',
      'audio/ogg',
      ''
    ];

    for (const mimeType of mimeTypes) {
      if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
        const options = mimeType ? { mimeType } : {};
        try {
          const recorder = new MediaRecorder(stream, options);
          console.log(`Using MediaRecorder with MIME type: ${mimeType || 'default'}`);
          return recorder;
        } catch (error) {
          continue;
        }
      }
    }

    throw new Error('No supported audio format found for MediaRecorder');
  }

  // Enhanced OpenAI Whisper transcription with proper error handling
  private async transcribeWithWhisper(audioBlob: Blob): Promise<{text: string, language: string}> {
    // Convert to proper format for Whisper
    const audioFile = new File([audioBlob], 'recording.webm', { type: audioBlob.type });
    
    const formData = new FormData();
    formData.append('file', audioFile);

    const response = await fetch('/api/speech', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(`Whisper API failed (${response.status}): ${errorData.error || response.statusText}`);
    }

    const result = await response.json();
    
    if (!result.success || !result.text) {
      throw new Error(result.error || 'No transcription received from Whisper');
    }

    return {
      text: result.text.trim(),
      language: result.language || detectLanguage(result.text.trim())
    };
  }

  // Check if Web Speech API is available and meets requirements
  private isWebSpeechAvailable(): boolean {
    // Check if API exists
    if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) {
      return false;
    }

    // Check if we're on HTTPS (required for Web Speech API)
    if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
      console.warn('Web Speech API requires HTTPS');
      return false;
    }

    return true;
  }

  // Web Speech API fallback with comprehensive error handling
  private async tryWebSpeechFallback(): Promise<{text: string, language: string}> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Try to auto-detect language, fallback to English
      recognition.lang = 'en-US';

      let timeoutId: NodeJS.Timeout | null = null;
      let hasStarted = false;

      recognition.onstart = () => {
        hasStarted = true;
        this.callbacks.onStatusUpdate('Listening with Web Speech API...');
        
        // Set timeout to prevent hanging
        timeoutId = setTimeout(() => {
          recognition.abort();
          reject(new Error('Speech recognition timeout'));
        }, 10000);
      };

      recognition.onresult = (event: any) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          if (transcript) {
            resolve({
              text: transcript,
              language: detectLanguage(transcript)
            });
          } else {
            reject(new Error('Empty transcription received'));
          }
        } else {
          reject(new Error('No speech detected'));
        }
      };

      recognition.onerror = (event: any) => {
        if (timeoutId) clearTimeout(timeoutId);
        
        let errorMessage = 'Speech recognition failed';
        
        switch (event.error) {
          case 'not-allowed':
            errorMessage = 'Microphone access denied for speech recognition';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not available. This may be due to browser restrictions or network issues.';
            break;
          case 'no-speech':
            errorMessage = 'No speech detected. Please try speaking more clearly.';
            break;
          case 'audio-capture':
            errorMessage = 'Audio capture failed. Please check your microphone.';
            break;
          case 'network':
            errorMessage = 'Network error during speech recognition. Please check your internet connection.';
            break;
          case 'aborted':
            errorMessage = 'Speech recognition was aborted';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        if (timeoutId) clearTimeout(timeoutId);
        if (!hasStarted) {
          reject(new Error('Speech recognition failed to start'));
        }
      };

      try {
        recognition.start();
      } catch (error) {
        if (timeoutId) clearTimeout(timeoutId);
        reject(new Error(`Failed to start speech recognition: ${(error as Error).message}`));
      }
    });
  }

  // Manual input fallback when all voice recognition fails
  private showManualInputFallback(): void {
    this.callbacks.onStatusUpdate('Voice recognition failed. Please type your message.');
    
    // Use a more user-friendly approach than prompt()
    const event = new CustomEvent('voiceRecognitionFallback', {
      detail: { 
        message: 'Voice recognition failed. Please type your message in the chat input.',
        callback: (text: string) => {
          if (text && text.trim()) {
            this.callbacks.onTranscriptionSuccess({
              text: text.trim(),
              language: detectLanguage(text.trim()),
              method: 'manual'
            });
          }
        }
      }
    });
    
    document.dispatchEvent(event);
  }

  // Stop recording manually
  public stopRecording(): void {
    this.callbacks.onStatusUpdate('Stopping recording...');
    
    // Stop the entire voice processing flow
    this.isProcessingVoice = false;
    this.isRecording = false;
    
    // Stop MediaRecorder if it's recording
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }
    
    // Clear any pending timeouts
    if (this.recordingTimeoutId) {
      clearTimeout(this.recordingTimeoutId);
      this.recordingTimeoutId = null;
    }
    
    // Force cleanup if recorder is in other states
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (error) {
        console.warn('Error stopping MediaRecorder:', error);
      }
    }
    
    // Ensure cleanup happens
    this.cleanup();
    
    // Notify that recording has stopped
    this.callbacks.onRecordingStop();
    this.callbacks.onStatusUpdate('Recording stopped');
  }

  // Clean up resources
  private cleanup(): void {
    this.isRecording = false;
    this.isProcessingVoice = false;
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.mediaRecorder = null;
    this.audioChunks = [];
    
    if (this.recordingTimeoutId) {
      clearTimeout(this.recordingTimeoutId);
      this.recordingTimeoutId = null;
    }
  }

  // Check if currently recording
  public get isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  // Check if currently processing voice (recording or transcribing)
  public get isCurrentlyProcessing(): boolean {
    return this.isProcessingVoice || this.isRecording;
  }

  // Get current recording state
  public getRecordingState(): string {
    if (!this.mediaRecorder) return 'inactive';
    return this.mediaRecorder.state;
  }
}