"use client";

import { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  createAudioStream,
  getOptimalMimeType,
  isAudioSupported,
  stopMediaStream,
  validateAudioFile,
  DEFAULT_AUDIO_CONFIG,
} from "@/lib/audio-utils";

interface VoiceInputProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export function VoiceInput({
  onTranscriptionComplete,
  disabled = false,
}: VoiceInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const processAudio = useCallback(
    async (audioBlob: Blob) => {
      try {
        // Create FormData for API request
        const formData = new FormData();
        formData.append("audio", audioBlob, "recording.webm");

        // Send to transcription API
        const response = await fetch("/api/transcribe", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Transcription failed");
        }

        const data = await response.json();

        if (data.success && data.transcription) {
          onTranscriptionComplete(data.transcription);
          toast.success("语音识别完成");
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        console.error("Error processing audio:", error);
        toast.error("语音识别失败，请重试");
      } finally {
        setIsProcessing(false);
      }
    },
    [onTranscriptionComplete]
  );

  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission and create stream
      const stream = await createAudioStream(DEFAULT_AUDIO_CONFIG);

      // Get optimal MIME type for this browser
      const mimeType = getOptimalMimeType();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      // Handle data available
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType,
        });

        // Stop all tracks to release microphone
        stopMediaStream(stream);

        // Validate audio file
        if (!validateAudioFile(audioBlob)) {
          toast.error("录音文件过大，请重新录制较短的音频");
          setIsProcessing(false);
          return;
        }

        // Process the audio
        await processAudio(audioBlob);
      };

      // Start recording
      mediaRecorder.start();
      setIsRecording(true);
      toast.info("录音开始，点击停止按钮结束录音");
    } catch (error) {
      console.error("Error starting recording:", error);
      toast.error("无法访问麦克风，请检查权限设置");
    }
  }, [processAudio]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [isRecording]);

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // Check if browser supports required APIs
  const isSupported = isAudioSupported();

  if (!isSupported) {
    return (
      <button disabled className="text-black opacity-50">
        <MicOff className="w-4 h-4" />
      </button>
    );
  }

  return (
    <button
      onClick={handleToggleRecording}
      disabled={disabled || isProcessing}
      className={`disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center ${
        isRecording
          ? "animate-pulse text-red-500"
          : "text-black hover:opacity-70"
      }`}
    >
      {isProcessing ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="w-4 h-4" />
      ) : (
        <Mic className="w-4 h-4" />
      )}
    </button>
  );
}
