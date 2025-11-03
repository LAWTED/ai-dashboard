"use client";

import { useState } from 'react';
import { Sparkles, Loader2, Wand2, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useYellowBoxPrompt } from '@/contexts/yellowbox-prompt-context';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CustomPromptDialog } from './CustomPromptDialog';

interface PromptStyleSelectorProps {
  onRegenerateWithPrompt: (promptId: string) => Promise<void>;
  onRegenerateWithCustomPrompt: (customPrompt: string) => Promise<void>;
  isGenerating: boolean;
  timeOfDay?: 'morning' | 'daytime' | 'evening';
  className?: string;
}

export function PromptStyleSelector({
  onRegenerateWithPrompt,
  onRegenerateWithCustomPrompt,
  isGenerating,
  timeOfDay = 'daytime',
  className = '',
}: PromptStyleSelectorProps) {
  const { allPrompts, settings, getPromptById } = useYellowBoxPrompt();
  const [isExpanded, setIsExpanded] = useState(false);
  const [lastUsedPromptId, setLastUsedPromptId] = useState<string | null>(null);
  const [lastUsedWasCustom, setLastUsedWasCustom] = useState(false);
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  const [isApplyingCustom, setIsApplyingCustom] = useState(false);

  // Filter prompts that have diary prompts
  const availablePrompts = allPrompts.filter((p) => p.diaryPrompt);

  // Get Original prompt (first one)
  const originalPrompt = availablePrompts[0];

  // Get other prompts for dropdown (exclude Original)
  const dropdownPrompts = availablePrompts.slice(1);

  const handlePromptSelect = async (promptId: string) => {
    try {
      setSelectedPromptId(promptId);
      await onRegenerateWithPrompt(promptId);

      // Update last used prompt tracking
      setLastUsedPromptId(promptId);
      setLastUsedWasCustom(false);

      const prompt = availablePrompts.find((p) => p.id === promptId);
      toast.success(`Generated with ${prompt?.name || 'prompt'}`);
    } catch (error) {
      console.error('Error regenerating:', error);
      toast.error('Failed to regenerate');
    } finally {
      setSelectedPromptId(null);
    }
  };

  const handleCustomPromptApply = async (customPrompt: string) => {
    try {
      setIsApplyingCustom(true);
      await onRegenerateWithCustomPrompt(customPrompt);

      // Update last used to custom
      setLastUsedPromptId(null);
      setLastUsedWasCustom(true);

      toast.success('Generated with custom style!');
      setIsCustomDialogOpen(false);
    } catch (error) {
      console.error('Error with custom prompt:', error);
      toast.error('Failed to generate with custom prompt');
    } finally {
      setIsApplyingCustom(false);
    }
  };

  // Get the display name for current style
  const getCurrentStyleName = () => {
    if (lastUsedWasCustom) {
      return 'Custom';
    }
    if (lastUsedPromptId) {
      const prompt = getPromptById(lastUsedPromptId);
      return prompt?.name.replace(/\s*\(.*?\)\s*/g, '') || 'Original';
    }
    // Default to Original if nothing has been regenerated yet
    return 'Original';
  };

  // Get current prompt text for pre-filling custom dialog
  const getCurrentPromptText = () => {
    const promptId = lastUsedPromptId || settings.defaultDiaryPromptId;
    const prompt = getPromptById(promptId);

    if (!prompt?.diaryPrompt) return '';

    // Get the appropriate prompt based on timeOfDay
    if (timeOfDay === 'morning' || timeOfDay === 'evening') {
      return prompt.diaryPrompt.morning || prompt.diaryPrompt.daytime || '';
    }
    return prompt.diaryPrompt.daytime || '';
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Expand/Collapse button */}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        disabled={isGenerating}
        className="h-7 px-2 text-xs bg-yellow-100/80 hover:bg-yellow-200/80 text-[#3B3109] border border-yellow-300"
        title="Try different writing styles"
      >
        <Sparkles className="w-3 h-3 mr-1" />
        {isExpanded ? 'Hide Styles' : 'Try Styles'}
      </Button>

      {/* Style selection buttons - slide in/out */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 overflow-hidden"
          >
            {/* Original button */}
            {originalPrompt && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handlePromptSelect(originalPrompt.id)}
                disabled={isGenerating && selectedPromptId !== originalPrompt.id}
                className={`
                  h-7 px-2 text-xs whitespace-nowrap transition-all
                  ${lastUsedPromptId === originalPrompt.id || (!lastUsedPromptId && !lastUsedWasCustom)
                    ? 'bg-[#C04635] text-white hover:bg-[#C04635]/90'
                    : 'bg-yellow-50 hover:bg-yellow-100 text-[#3B3109]'
                  }
                  border border-yellow-200
                  ${isGenerating && selectedPromptId !== originalPrompt.id ? 'opacity-50' : ''}
                `}
                title={originalPrompt.description || originalPrompt.name}
              >
                {isGenerating && selectedPromptId === originalPrompt.id ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (lastUsedPromptId === originalPrompt.id || (!lastUsedPromptId && !lastUsedWasCustom)) ? (
                  <span className="mr-1">●</span>
                ) : null}
                {originalPrompt.name.replace(/\s*\(.*?\)\s*/g, '')}
              </Button>
            )}

            {/* Dropdown for other styles */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isGenerating}
                  className="h-7 px-2 text-xs whitespace-nowrap bg-yellow-50 hover:bg-yellow-100 text-[#3B3109] border border-yellow-200 transition-all"
                >
                  More Styles
                  <ChevronDown className="w-3 h-3 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-yellow-50/95 backdrop-blur-sm border-yellow-200">
                {dropdownPrompts.map((prompt) => {
                  const isCurrentlyUsed = lastUsedPromptId === prompt.id;
                  const isRegeneratingWithThis = isGenerating && selectedPromptId === prompt.id;

                  return (
                    <DropdownMenuItem
                      key={prompt.id}
                      onClick={() => handlePromptSelect(prompt.id)}
                      disabled={isGenerating}
                      className={`
                        text-xs cursor-pointer
                        ${isCurrentlyUsed ? 'bg-[#C04635] text-white' : 'text-[#3B3109]'}
                        hover:bg-yellow-100
                      `}
                    >
                      {isRegeneratingWithThis ? (
                        <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                      ) : isCurrentlyUsed ? (
                        <span className="mr-2">●</span>
                      ) : (
                        <span className="mr-2 opacity-0">●</span>
                      )}
                      {prompt.name.replace(/\s*\(.*?\)\s*/g, '')}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Custom button */}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsCustomDialogOpen(true)}
              disabled={isGenerating}
              className={`
                h-7 px-2 text-xs whitespace-nowrap transition-all border
                ${lastUsedWasCustom
                  ? 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700'
                  : 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                }
              `}
              title="Write your own custom prompt"
            >
              {lastUsedWasCustom && <span className="mr-1">●</span>}
              <Wand2 className="w-3 h-3 mr-1" />
              Custom
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Current style indicator (when collapsed) */}
      {!isExpanded && (
        <span className="text-xs text-[#3B3109]/60">
          using {getCurrentStyleName()}
        </span>
      )}

      {/* Custom Prompt Dialog */}
      <CustomPromptDialog
        open={isCustomDialogOpen}
        onOpenChange={setIsCustomDialogOpen}
        onApply={handleCustomPromptApply}
        isApplying={isApplyingCustom}
        currentPromptText={getCurrentPromptText()}
      />
    </div>
  );
}
