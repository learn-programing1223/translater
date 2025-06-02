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
  private manuallyStopped = false;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private audioLevelCheckInterval: NodeJS.Timeout | null = null;

  constructor(callbacks: VoiceRecognitionCallbacks) {
    this.callbacks = callbacks;
  }

  // Main voice recognition function with comprehensive error handling
  async startVoiceRecognition(): Promise<void> {
    try {
      this.isProcessingVoice = true;
      this.manuallyStopped = false; // Reset manual stop flag
      this.callbacks.onStatusUpdate('Starting voice recognition...');
      
      // Step 1: Try MediaRecorder + OpenAI Whisper (primary method)
      try {
        const audioBlob = await this.recordAudio();
        
        // Check if recording was manually stopped - but still process the audio if we have it
        if (this.manuallyStopped) {
          console.log('Recording was manually stopped - processing captured audio'); // DEBUG
          // Don't return early - we should still process the audio that was captured
        }
        
        this.callbacks.onStatusUpdate('Transcribing with OpenAI Whisper...');
        const transcription = await this.transcribeWithWhisper(audioBlob);
        
        await this.callbacks.onTranscriptionSuccess({
          text: transcription.text,
          language: transcription.language,
          method: 'whisper'
        });
        return;
        
      } catch (primaryError) {
        console.warn('Primary method (MediaRecorder + Whisper) failed:', primaryError);
        console.log('=== STARTING FALLBACK CHAIN ==='); // DEBUG
        
        // Step 2: Try Web Speech API as alternative recording method (live transcription)
        const webSpeechAvailable = this.isWebSpeechAvailable();
        console.log('Web Speech API available:', webSpeechAvailable); // DEBUG
        
        if (webSpeechAvailable) {
          try {
            this.callbacks.onStatusUpdate('Trying Web Speech API for live transcription...');
            console.log('🎤 Starting Web Speech API live recording (no MediaRecorder)');
            const result = await this.tryWebSpeechLiveRecording();
            
            await this.callbacks.onTranscriptionSuccess({
              text: result.text,
              language: result.language,
              method: 'webspeech'
            });
            return;
            
          } catch (speechError) {
            console.warn('Web Speech API live recording failed:', speechError);
          }
        } else {
          console.warn('Web Speech API not available'); // DEBUG
        }
        
        // Step 3: Manual input fallback
        console.log('All voice methods failed - showing manual input fallback');
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

      // Optimized audio constraints for reliable capture across browsers
      const audioConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Can cause issues in Safari
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1,
          volume: 1.0,
          latency: 0.1
        }
      };

      console.log('=== AUDIO CAPTURE DEBUG ===');
      console.log('Audio constraints:', audioConstraints);

      navigator.mediaDevices.getUserMedia(audioConstraints)
      .then(stream => {
        console.log('Audio stream obtained successfully');
        console.log('Stream active:', stream.active);
        console.log('Audio tracks:', stream.getAudioTracks().length);
        
        // Verify audio tracks
        const audioTracks = stream.getAudioTracks();
        audioTracks.forEach((track, index) => {
          console.log(`Audio Track ${index}:`);
          console.log('  - Enabled:', track.enabled);
          console.log('  - Muted:', track.muted);
          console.log('  - Ready State:', track.readyState);
          console.log('  - Label:', track.label);
          console.log('  - Settings:', track.getSettings());
        });
        
        if (audioTracks.length === 0) {
          reject(new Error('No audio tracks available in stream'));
          return;
        }
        
        if (audioTracks[0].readyState !== 'live') {
          reject(new Error('Audio track is not in live state'));
          return;
        }
        
        this.stream = stream;
        this.setupAudioLevelMonitoring(stream);
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

  // Setup audio level monitoring to verify microphone input
  private setupAudioLevelMonitoring(stream: MediaStream): void {
    try {
      // Create audio context for level monitoring
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser for level detection
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;
      
      // Connect stream to analyser
      const source = this.audioContext.createMediaStreamSource(stream);
      source.connect(this.analyser);
      
      console.log('Audio level monitoring setup complete');
      
      // Start monitoring audio levels
      this.startAudioLevelCheck();
      
    } catch (error) {
      console.warn('Could not setup audio level monitoring:', error);
      // Not critical - continue without level monitoring
    }
  }

  // Monitor audio input levels to verify microphone is working
  private startAudioLevelCheck(): void {
    if (!this.analyser) return;
    
    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    let silentCount = 0;
    let hasDetectedSound = false;
    
    this.audioLevelCheckInterval = setInterval(() => {
      if (!this.analyser || !this.isRecording) return;
      
      this.analyser.getByteFrequencyData(dataArray);
      
      // Calculate average audio level
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      
      console.log(`Audio Level: ${average.toFixed(1)}/255 ${average > 10 ? '🔊' : '🔇'}`);
      
      if (average > 10) { // Sound detected
        hasDetectedSound = true;
        silentCount = 0;
      } else { // Silence
        silentCount++;
      }
      
      // Warn if no sound detected for too long
      if (silentCount > 10 && !hasDetectedSound) { // 2.5 seconds of silence
        console.warn('⚠️ No audio input detected - microphone may be muted or not working');
      }
      
    }, 250); // Check every 250ms
  }

  // Setup MediaRecorder with cross-browser compatibility
  private setupRecording(stream: MediaStream, resolve: (blob: Blob) => void, reject: (error: Error) => void): void {
    try {
      this.mediaRecorder = this.createCompatibleMediaRecorder(stream);
      this.audioChunks = [];

      console.log('MediaRecorder created successfully');
      console.log('MediaRecorder MIME type:', this.mediaRecorder.mimeType);
      console.log('MediaRecorder state:', this.mediaRecorder.state);

      this.mediaRecorder.ondataavailable = (event) => {
        console.log(`=== AUDIO CHUNK RECEIVED ===`);
        console.log('Chunk size:', event.data.size, 'bytes');
        console.log('Chunk type:', event.data.type);
        console.log('Total chunks so far:', this.audioChunks.length);
        
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
          console.log('✅ Chunk added to collection (size > 0)');
        } else {
          console.warn('❌ Empty audio chunk received (size = 0)!');
        }
        
        const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.size, 0);
        console.log('Total audio data collected:', totalSize, 'bytes');
        console.log('============================');
      };

      this.mediaRecorder.onstop = () => {
        console.log('=== MEDIARECORDER STOP EVENT ===');
        console.log('Total chunks collected:', this.audioChunks.length);
        
        // Log each chunk size
        this.audioChunks.forEach((chunk, index) => {
          console.log(`Chunk ${index}: ${chunk.size} bytes`);
        });
        
        const audioBlob = new Blob(this.audioChunks, { 
          type: this.mediaRecorder?.mimeType || 'audio/wav' 
        });
        
        console.log('Final audio blob created:');
        console.log('- Blob size:', audioBlob.size, 'bytes');
        console.log('- Blob type:', audioBlob.type);
        console.log('- Expected minimum size for valid audio: ~1000 bytes');
        
        this.callbacks.onRecordingStop();
        this.cleanup();
        
        if (audioBlob.size === 0) {
          console.error('❌ AUDIO CAPTURE FAILED: Blob size is 0 bytes');
          console.error('Possible causes:');
          console.error('1. MediaRecorder.ondataavailable never fired');
          console.error('2. All audio chunks were empty');
          console.error('3. Microphone input was silent/muted');
          console.error('4. MediaRecorder configuration issue');
          reject(new Error('No audio data recorded - microphone may be muted or MediaRecorder failed to capture audio'));
        } else if (audioBlob.size < 100) {
          console.warn('⚠️ Very small audio blob detected (< 100 bytes)');
          console.warn('Audio may be too short or mostly silent');
          resolve(audioBlob); // Still try to process it
        } else {
          console.log('✅ Valid audio blob created successfully');
          resolve(audioBlob);
        }
        console.log('================================');
      };

      this.mediaRecorder.onerror = (event: any) => {
        this.cleanup();
        reject(new Error(`Recording failed: ${event.error?.message || 'Unknown recording error'}`));
      };

      // Start recording with frequent data collection
      this.isRecording = true;
      
      console.log('=== STARTING MEDIARECORDER ===');
      console.log('Starting MediaRecorder with 250ms chunks for better data collection');
      
      // Use smaller timeslice for more frequent data collection (250ms instead of 1000ms)
      this.mediaRecorder.start(250);
      
      console.log('MediaRecorder state after start():', this.mediaRecorder.state);
      
      this.callbacks.onRecordingStart();
      this.callbacks.onStatusUpdate('Recording... Tap to stop');
      
      // Verify recording started properly
      setTimeout(() => {
        if (this.mediaRecorder) {
          console.log('MediaRecorder state after 100ms:', this.mediaRecorder.state);
          if (this.mediaRecorder.state !== 'recording') {
            console.error('❌ MediaRecorder failed to start recording!');
          }
        }
      }, 100);
      
      // Auto-stop after 30 seconds (prevent infinite recording)
      this.recordingTimeoutId = setTimeout(() => {
        if (this.isRecording && this.mediaRecorder?.state === 'recording') {
          console.log('Auto-stopping recording after 30 seconds');
          this.stopRecording();
        }
      }, 30000);
      
      console.log('===============================');

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

    console.log('=== MEDIARECORDER MIME TYPE TESTING ===');
    
    // Log browser MIME type support
    mimeTypes.forEach(mimeType => {
      const supported = !mimeType || MediaRecorder.isTypeSupported(mimeType);
      console.log(`MIME type "${mimeType || 'default'}" supported: ${supported}`);
    });

    for (const mimeType of mimeTypes) {
      if (!mimeType || MediaRecorder.isTypeSupported(mimeType)) {
        const options = mimeType ? { mimeType } : {};
        try {
          const recorder = new MediaRecorder(stream, options);
          console.log(`✅ Successfully created MediaRecorder with MIME type: ${mimeType || 'default'}`);
          console.log('MediaRecorder created with options:', options);
          console.log('Final MIME type used:', recorder.mimeType);
          console.log('======================================');
          return recorder;
        } catch (error) {
          console.warn(`❌ Failed to create MediaRecorder with MIME type "${mimeType}":`, error);
          continue;
        }
      }
    }

    console.error('❌ No supported audio format found for MediaRecorder');
    throw new Error('No supported audio format found for MediaRecorder');
  }

  // Enhanced OpenAI Whisper transcription with proper error handling
  private async transcribeWithWhisper(audioBlob: Blob): Promise<{text: string, language: string}> {
    // Convert to proper format for Whisper with correct file extension and MIME type
    let fileName = 'recording.wav';
    let mimeType = audioBlob.type || 'audio/wav';
    
    // Determine correct file extension based on MIME type
    if (mimeType.includes('webm')) {
      fileName = 'recording.webm';
    } else if (mimeType.includes('mp4') || mimeType.includes('m4a')) {
      fileName = 'recording.mp4';
    } else if (mimeType.includes('ogg')) {
      fileName = 'recording.ogg';
    } else if (mimeType.includes('wav')) {
      fileName = 'recording.wav';
    } else {
      // Default to wav for unknown types
      fileName = 'recording.wav';
      mimeType = 'audio/wav';
    }
    
    console.log(`Creating audio file: ${fileName}, original MIME: ${audioBlob.type}, final MIME: ${mimeType}`);
    
    const audioFile = new File([audioBlob], fileName, { type: mimeType });
    
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

    const transcribedText = result.text.trim();
    const whisperLanguage = result.language;
    const detectedLanguage = detectLanguage(transcribedText);
    
    // Language consistency check
    let finalLanguage = whisperLanguage || detectedLanguage;
    
    // If Whisper detected a language but our text analysis suggests different, validate
    if (whisperLanguage && detectedLanguage && whisperLanguage !== detectedLanguage) {
      console.log('Language mismatch detected:');
      console.log('- Whisper detected:', whisperLanguage);
      console.log('- Text analysis detected:', detectedLanguage);
      console.log('- Transcribed text:', transcribedText);
      
      // Use text analysis result if it found strong patterns, otherwise trust Whisper
      finalLanguage = detectedLanguage;
      console.log('- Using text analysis result:', finalLanguage);
    }
    
    console.log('Final language decision:', finalLanguage); // DEBUG
    
    return {
      text: transcribedText,
      language: finalLanguage
    };
  }

  // Check if Web Speech API is available and meets requirements
  private isWebSpeechAvailable(): boolean {
    // Check if API exists
    const hasAPI = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    console.log('Speech Recognition API exists:', hasAPI); // DEBUG
    console.log('window.SpeechRecognition:', !!window.SpeechRecognition); // DEBUG
    console.log('window.webkitSpeechRecognition:', !!window.webkitSpeechRecognition); // DEBUG
    
    if (!hasAPI) {
      console.warn('Web Speech API not supported in this browser'); // DEBUG
      return false;
    }

    // Check if we're on HTTPS (required for Web Speech API)
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    console.log('Protocol check - isSecure:', isSecure, 'protocol:', location.protocol, 'hostname:', location.hostname); // DEBUG
    
    if (!isSecure) {
      console.warn('Web Speech API requires HTTPS or localhost'); // DEBUG
      return false;
    }

    console.log('Web Speech API is available and secure'); // DEBUG
    return true;
  }

  // Web Speech API live recording (alternative to MediaRecorder + Whisper)
  private async tryWebSpeechLiveRecording(): Promise<{text: string, language: string}> {
    return new Promise((resolve, reject) => {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        reject(new Error('Web Speech API not supported'));
        return;
      }

      const recognition = new SpeechRecognition();
      
      // Store reference for stopping
      (window as any).speechRecognitionInstance = recognition;
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      // Try to auto-detect language, fallback to English
      recognition.lang = 'en-US';

      let timeoutId: NodeJS.Timeout | null = null;
      let hasStarted = false;

      recognition.onstart = () => {
        hasStarted = true;
        console.log('🎤 Web Speech API live recording started - speak now!');
        this.callbacks.onStatusUpdate('Listening with Web Speech API... Speak now!');
        this.callbacks.onRecordingStart(); // Trigger recording UI state
        
        // Set timeout to prevent hanging (increased to 15 seconds)
        timeoutId = setTimeout(() => {
          console.log('Web Speech API timeout - stopping recognition');
          recognition.abort();
          reject(new Error('Speech recognition timeout after 15 seconds - please try again'));
        }, 15000);
      };

      recognition.onresult = (event: any) => {
        if (timeoutId) clearTimeout(timeoutId);
        this.callbacks.onRecordingStop(); // Stop recording UI state
        
        // Clear the stored reference
        (window as any).speechRecognitionInstance = null;
        
        console.log('🎯 Web Speech API transcription received');
        
        if (event.results.length > 0) {
          const transcript = event.results[0][0].transcript.trim();
          const confidence = event.results[0][0].confidence;
          
          console.log('Transcript:', transcript);
          console.log('Confidence:', confidence);
          
          if (transcript) {
            resolve({
              text: transcript,
              language: detectLanguage(transcript)
            });
          } else {
            reject(new Error('Empty transcription received from Web Speech API'));
          }
        } else {
          reject(new Error('No speech detected by Web Speech API'));
        }
      };

      recognition.onerror = (event: any) => {
        if (timeoutId) clearTimeout(timeoutId);
        this.callbacks.onRecordingStop(); // Stop recording UI state
        
        // Clear the stored reference
        (window as any).speechRecognitionInstance = null;
        
        console.error('❌ Web Speech API error:', event.error);
        let errorMessage = 'Web Speech API failed';
        
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
            // Don't treat manual abort as an error if it was done intentionally
            if (this.manuallyStopped) {
              console.log('Web Speech API was manually stopped - not an error');
              return; // Don't reject, just return silently
            }
            errorMessage = 'Speech recognition was aborted unexpectedly';
            break;
          default:
            errorMessage = `Speech recognition error: ${event.error}`;
        }
        
        reject(new Error(errorMessage));
      };

      recognition.onend = () => {
        if (timeoutId) clearTimeout(timeoutId);
        this.callbacks.onRecordingStop(); // Ensure recording UI state stops
        
        // Clear the stored reference
        (window as any).speechRecognitionInstance = null;
        
        console.log('🔚 Web Speech API session ended');
        
        if (!hasStarted) {
          reject(new Error('Web Speech API failed to start'));
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
    console.log('VoiceRecognitionManager.stopRecording() called'); // DEBUG
    console.log('Current state:', {
      isRecording: this.isRecording,
      isProcessingVoice: this.isProcessingVoice,
      mediaRecorderState: this.mediaRecorder?.state,
      hasMediaRecorder: !!this.mediaRecorder
    }); // DEBUG
    
    this.callbacks.onStatusUpdate('Stopping recording...');
    
    // Mark as manually stopped to prevent further processing
    this.manuallyStopped = true;
    
    // Stop the entire voice processing flow
    this.isProcessingVoice = false;
    this.isRecording = false;
    
    // Stop any active Web Speech recognition
    if ((window as any).speechRecognitionInstance) {
      console.log('Stopping active Web Speech recognition'); // DEBUG
      try {
        (window as any).speechRecognitionInstance.abort();
        (window as any).speechRecognitionInstance = null;
      } catch (error) {
        console.warn('Error stopping Web Speech recognition:', error);
      }
    }
    
    // Stop MediaRecorder if it's recording
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      console.log('Stopping MediaRecorder (state: recording)'); // DEBUG
      this.mediaRecorder.stop();
    }
    
    // Clear any pending timeouts
    if (this.recordingTimeoutId) {
      console.log('Clearing recording timeout'); // DEBUG
      clearTimeout(this.recordingTimeoutId);
      this.recordingTimeoutId = null;
    }
    
    // Force cleanup if recorder is in other states
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        console.log('Force stopping MediaRecorder (state:', this.mediaRecorder.state, ')'); // DEBUG
        this.mediaRecorder.stop();
      } catch (error) {
        console.warn('Error stopping MediaRecorder:', error);
      }
    }
    
    // Partial cleanup - stop resources but don't reset processing flags yet
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    if (this.recordingTimeoutId) {
      clearTimeout(this.recordingTimeoutId);
      this.recordingTimeoutId = null;
    }
    
    // Notify that recording has stopped
    this.callbacks.onRecordingStop();
    this.callbacks.onStatusUpdate('Recording stopped');
    console.log('VoiceRecognitionManager.stopRecording() completed'); // DEBUG
  }

  // Clean up resources
  private cleanup(resetManualStop: boolean = true): void {
    this.isRecording = false;
    this.isProcessingVoice = false;
    
    if (resetManualStop) {
      this.manuallyStopped = false; // Reset manual stop flag only when explicitly requested
    }
    
    // Clean up audio level monitoring
    if (this.audioLevelCheckInterval) {
      clearInterval(this.audioLevelCheckInterval);
      this.audioLevelCheckInterval = null;
    }
    
    if (this.audioContext) {
      try {
        this.audioContext.close();
      } catch (error) {
        console.warn('Error closing audio context:', error);
      }
      this.audioContext = null;
    }
    
    this.analyser = null;
    
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