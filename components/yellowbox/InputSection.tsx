"use client";

import { motion } from "framer-motion";
import { VoiceInput } from "@/components/voice-input";
import React, { useMemo } from "react";
import { uploadImageToSupabase } from "@/lib/storage/image-upload";
import { toast } from "sonner";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";

interface InputSectionProps {
  userAnswer: string;
  conversationHistory: Array<{ type: string; content: string }>;
  selectedQuestion: string;
  isLoading: boolean;
  selectedImages: string[];
  onAnswerChange: (value: string) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCompositionStart: () => void;
  onCompositionEnd: () => void;
  onVoiceTranscription: (text: string) => void;
  onImageSelect: (images: string[]) => void;
  trackKeystroke: (event: KeyboardEvent, textLength: number) => void;
  trackTextChange: (newValue: string, previousValue: string) => void;
}

export function InputSection({
  userAnswer,
  conversationHistory,
  selectedQuestion,
  isLoading,
  selectedImages,
  onAnswerChange,
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onVoiceTranscription,
  onImageSelect,
  trackKeystroke,
  trackTextChange,
}: InputSectionProps) {
  const previousAnswer = React.useRef<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    trackTextChange(newValue, previousAnswer.current);
    previousAnswer.current = newValue;
    onAnswerChange(newValue);
  };

  // Helper function to count words (supports Chinese and English)
  const countWords = (text: string): number => {
    if (!text || typeof text !== 'string') return 0;
    const trimmed = text.trim();
    if (!trimmed) return 0;
    
    // Count Chinese characters (each Chinese character counts as one word)
    const chineseMatches = trimmed.match(/[\u4e00-\u9fff]/g);
    const chineseCount = chineseMatches ? chineseMatches.length : 0;
    
    // Count English words (split by whitespace, filter out Chinese characters)
    const englishText = trimmed.replace(/[\u4e00-\u9fff]/g, ' ');
    const englishWords = englishText.split(/\s+/).filter(word => 
      word.length > 0 && /[a-zA-Z0-9]/.test(word)
    );
    const englishCount = englishWords.length;
    
    return chineseCount + englishCount;
  };

  // Calculate stats
  const characterCount = userAnswer.length;
  const wordCount = countWords(userAnswer);
  const estimatedReadTime = Math.max(1, Math.ceil(wordCount / 200)); // 200 words per minute

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    trackKeystroke(e.nativeEvent, userAnswer.length);
    onKeyDown(e);
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    trackKeystroke(e.nativeEvent, userAnswer.length);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Convert files to data URLs for immediate preview
    const dataUrlPromises = Array.from(files).map(async (file) => {
      // Validate file first
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not a valid image file`);
        return null;
      }

      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large (max 10MB)`);
        return null;
      }

      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    });

    const dataUrls = await Promise.all(dataUrlPromises);
    const validDataUrls = dataUrls.filter((url): url is string => url !== null);
    
    if (validDataUrls.length > 0) {
      const newImages = [...selectedImages, ...validDataUrls];
      onImageSelect(newImages);
      toast.success(`Added ${validDataUrls.length} image(s) for preview`);
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const newImages = selectedImages.filter((_, index) => index !== indexToRemove);
    onImageSelect(newImages);
  };

  // Generate stable layoutIds for images based on their content hash
  const imageLayoutIds = useMemo(() => {
    return selectedImages.map((imageUrl, index) => {
      // Create a consistent hash from the image data
      const imageHash = btoa(imageUrl.slice(0, 50)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 10);
      return `image-${imageHash}-${index}`;
    });
  }, [selectedImages]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      className="space-y-4"
    >
      <motion.textarea
        initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        value={userAnswer}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onCompositionStart={onCompositionStart}
        onCompositionEnd={onCompositionEnd}
        placeholder={
          conversationHistory.length === 0
            ? selectedQuestion
            : "Continue your thoughts..."
        }
        className="w-full py-1 h-32 rounded-lg bg-yellow-400 text-[#3B3109] text-base resize-none focus:outline-none"
      />

      {/* Selected Images Display */}
      {selectedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap gap-2 p-3 bg-yellow-300/50 rounded-lg"
        >
          {selectedImages.map((imageUrl, index) => {
            const layoutId = imageLayoutIds[index];
            
            return (
              <div key={index} className="relative group">
                <motion.div layoutId={layoutId}>
                  <Image
                    src={imageUrl}
                    alt={`Selected image ${index + 1}`}
                    width={64}
                    height={64}
                    className="w-16 h-16 object-cover rounded-lg border-2 border-yellow-600"
                  />
                </motion.div>
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, x: -20, filter: "blur(4px)" }}
        animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
        className="flex gap-2 items-center justify-between h-10"
      >
        <div className="flex items-center gap-2">
          <VoiceInput
            onTranscriptionComplete={onVoiceTranscription}
            disabled={isLoading}
          />
          
          {/* Image Upload Button */}
          <label className="cursor-pointer p-2 rounded-lg flex items-center justify-center">
            <ImageIcon size={20} className="text-[#3B3109]" />
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
              disabled={isLoading}
            />
          </label>
        </div>
        
        {/* Character/Word Count Display */}
        {userAnswer.trim() && (
          <div className="text-xs text-[#3B3109] opacity-60 flex items-center gap-3">
            <span>{characterCount} chars</span>
            <span>{wordCount} words</span>
            <span>~{estimatedReadTime} min read</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}