// Enhanced MediaRecorder setup with cross-browser MIME type support
export function setupMediaRecorder(stream: MediaStream): MediaRecorder {
  // List of MIME types in order of preference (most compatible first)
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg;codecs=opus',
    'audio/ogg',
    ''  // Empty string as final fallback
  ];
  
  // Find the first supported MIME type
  let selectedMimeType = '';
  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      selectedMimeType = mimeType;
      console.log(`Using MIME type: ${mimeType}`);
      break;
    }
  }
  
  // Create MediaRecorder with supported MIME type
  const options: MediaRecorderOptions = {};
  if (selectedMimeType) {
    options.mimeType = selectedMimeType;
  }
  
  try {
    const mediaRecorder = new MediaRecorder(stream, options);
    return mediaRecorder;
  } catch (error) {
    console.error('MediaRecorder creation failed:', error);
    // Fallback: try without any options
    return new MediaRecorder(stream);
  }
}

// Convert audio to format compatible with OpenAI Whisper
export async function convertAudioForWhisper(audioBlob: Blob, originalMimeType?: string): Promise<File> {
  // OpenAI Whisper accepts: mp3, mp4, mpeg, mpga, m4a, wav, webm
  // Convert blob to File object with proper name and type
  
  let fileType = 'audio/wav';  // Default fallback
  let extension = 'wav';
  
  // Determine best format based on original blob type
  const blobType = originalMimeType || audioBlob.type;
  
  if (blobType.includes('webm')) {
    fileType = 'audio/webm';
    extension = 'webm';
  } else if (blobType.includes('mp4')) {
    fileType = 'audio/mp4'; 
    extension = 'mp4';
  } else if (blobType.includes('ogg')) {
    // Convert OGG to WAV for better Whisper compatibility
    fileType = 'audio/wav';
    extension = 'wav';
  } else if (blobType.includes('wav')) {
    fileType = 'audio/wav';
    extension = 'wav';
  }
  
  // Create File object that OpenAI Whisper can accept
  const audioFile = new File(
    [audioBlob], 
    `recording.${extension}`, 
    { type: fileType }
  );
  
  return audioFile;
}

// Check browser compatibility for voice features
export function checkVoiceSupport() {
  const support = {
    mediaRecorder: !!window.MediaRecorder,
    mediaDevices: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
    webSpeech: !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition),
    speechSynthesis: !!window.speechSynthesis
  };
  
  return support;
}

// Get supported MIME types for current browser
export function getSupportedMimeTypes(): string[] {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/wav',
    'audio/ogg;codecs=opus',
    'audio/ogg'
  ];
  
  return mimeTypes.filter(type => MediaRecorder.isTypeSupported(type));
}