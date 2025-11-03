"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { Textarea } from '@/components/ui/textarea';

interface CustomPromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (customPrompt: string) => void;
  isApplying: boolean;
  currentPromptText: string;
}

export function CustomPromptDialog({
  open,
  onOpenChange,
  onApply,
  isApplying,
  currentPromptText,
}: CustomPromptDialogProps) {
  const [promptText, setPromptText] = useState('');

  // Pre-fill with current prompt when dialog opens
  useEffect(() => {
    if (open && currentPromptText) {
      setPromptText(currentPromptText);
    }
  }, [open, currentPromptText]);

  const handleApply = () => {
    if (promptText.trim()) {
      onApply(promptText.trim());
      // Don't close dialog immediately - let parent handle it after success
    }
  };

  const handleClose = () => {
    if (!isApplying) {
      setPromptText('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl bg-gradient-to-br from-yellow-50/95 via-orange-50/95 to-red-50/95 backdrop-blur-md border-yellow-200">
        {/* Header */}
        <div className="relative pb-4 border-b border-yellow-200/50">
          <div className="text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 mb-2"
            >
              <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Custom AI Style</h2>
            </motion.div>
            <p className="text-sm text-gray-600">
              Edit the system prompt to customize AI responses
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4 py-4">
          {/* Prompt Input */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              System Prompt
            </label>
            <Textarea
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
              placeholder="Enter your custom system prompt..."
              className="min-h-[120px] max-h-[300px] bg-white/80 border-yellow-200 focus:border-yellow-400 focus:ring-yellow-400 font-mono text-sm resize-y"
              disabled={isApplying}
            />
            <p className="text-xs text-gray-500 mt-1">
              {promptText.length} characters
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-yellow-200/50">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isApplying}
            className="border-yellow-300 hover:bg-yellow-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!promptText.trim() || isApplying}
            className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-lg shadow-yellow-200/50"
          >
            {isApplying ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Apply Custom Style
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
