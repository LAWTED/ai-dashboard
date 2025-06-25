/**
 * Audio processing utilities for voice input functionality
 */

export interface AudioConfig {
  sampleRate: number;
  channelCount: number;
  echoCancellation: boolean;
  noiseSuppression: boolean;
}

export const DEFAULT_AUDIO_CONFIG: AudioConfig = {
  sampleRate: 16000, // Optimal for speech recognition
  channelCount: 1,   // Mono audio
  echoCancellation: true,
  noiseSuppression: true,
};

/**
 * Check if browser supports required audio APIs
 */
export function isAudioSupported(): boolean {
  return (
    typeof navigator !== 'undefined' && 
    navigator.mediaDevices && 
    navigator.mediaDevices.getUserMedia &&
    typeof MediaRecorder !== 'undefined'
  );
}

/**
 * Get optimal MIME type for MediaRecorder based on browser support
 */
export function getOptimalMimeType(): string {
  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/mpeg',
  ];

  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return 'audio/webm'; // fallback
}

/**
 * Request microphone permission and create media stream
 */
export async function createAudioStream(config: AudioConfig = DEFAULT_AUDIO_CONFIG): Promise<MediaStream> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: config,
    });
    return stream;
  } catch (error) {
    throw new Error(`Failed to access microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert audio blob to different format if needed
 */
export function convertAudioBlob(blob: Blob, targetType: string): Blob {
  if (blob.type === targetType) {
    return blob;
  }
  
  // Create new blob with target MIME type
  return new Blob([blob], { type: targetType });
}

/**
 * Validate audio file size and duration
 */
export function validateAudioFile(blob: Blob, maxSizeMB: number = 25): boolean {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return blob.size <= maxSizeBytes;
}

/**
 * Get audio duration from blob (requires HTML5 Audio API)
 */
export function getAudioDuration(blob: Blob): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const url = URL.createObjectURL(blob);
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url);
      resolve(audio.duration);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load audio metadata'));
    });
    
    audio.src = url;
  });
}

/**
 * Stop all tracks in a media stream
 */
export function stopMediaStream(stream: MediaStream): void {
  stream.getTracks().forEach(track => {
    track.stop();
  });
}

/**
 * Check microphone permission status
 */
export async function checkMicrophonePermission(): Promise<PermissionState> {
  try {
    if ('permissions' in navigator) {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return permission.state;
    }
    return 'prompt'; // fallback for browsers without permissions API
  } catch (error) {
    console.warn('Could not check microphone permission:', error);
    return 'prompt';
  }
}