"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Loader2, 
  Sparkles, 
  X, 
  Check,
  Star
} from 'lucide-react';
import { ApplyTemplateRequest, DiaryContent } from '@/lib/yellowbox/template-types';

interface TemplateListItem {
  id: string;
  name: string;
  description: string;
  previewUrl?: string;
}

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyTemplate: (request: ApplyTemplateRequest) => Promise<void>;
  diaryContent: DiaryContent;
  isApplying?: boolean;
}

interface TemplateCardProps {
  template: TemplateListItem;
  onSelect: () => void;
  isSelected?: boolean;
  disabled?: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onSelect,
  isSelected = false,
  disabled = false,
}) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={disabled ? {} : { scale: 1.02, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
    >
      <div
        className={`
          relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
          ${isSelected
            ? 'border-yellow-400 bg-yellow-50/80 shadow-lg shadow-yellow-200/50' 
            : 'border-yellow-200/50 bg-white/60 hover:bg-yellow-50/60 hover:border-yellow-300'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          backdrop-blur-sm
        `}
        onClick={disabled ? undefined : onSelect}
      >
        {/* Selection indicator */}
        <AnimatePresence>
          {isSelected && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center shadow-md"
            >
              <Check className="w-4 h-4 text-yellow-900" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Template preview area */}
        <div className="w-full h-24 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 rounded-lg flex items-center justify-center mb-3 border border-yellow-200/50 overflow-hidden">
          <div className="text-center text-yellow-600/70">
            <Sparkles className="w-6 h-6 mx-auto mb-1" />
            <span className="text-xs font-medium">Template Preview</span>
          </div>
        </div>

        {/* Template information */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-800 text-sm line-clamp-1">
              {template.name}
            </h3>
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs text-yellow-600 font-medium">Built-in</span>
            </div>
          </div>
          
          {template.description && (
            <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
              {template.description}
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onApplyTemplate,
  diaryContent,
  isApplying = false,
}) => {
  const [templates, setTemplates] = useState<TemplateListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Load template list
  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen]);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/yellowbox/templates');
      if (!response.ok) {
        throw new Error('Failed to load templates');
      }

      const data = await response.json();
      setTemplates(data.templates || []);
    } catch (err) {
      console.error('Error loading templates:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load templates';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    if (isApplying) return;
    setSelectedTemplateId(templateId);
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || isApplying) return;

    const request: ApplyTemplateRequest = {
      templateId: selectedTemplateId,
      diaryContent,
      language: 'en'
    };

    await onApplyTemplate(request);
  };

  const handleClose = () => {
    if (!isApplying) {
      setSelectedTemplateId(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 bg-gradient-to-br from-yellow-50/95 via-orange-50/95 to-red-50/95 backdrop-blur-md border-yellow-200">
        {/* Header */}
        <div className="relative p-6 pb-4 border-b border-yellow-200/50">
          <div className="text-center">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="inline-flex items-center gap-3 mb-2"
            >
              <div className="w-10 h-10 bg-yellow-400/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-yellow-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Choose a Template</h2>
            </motion.div>
            <p className="text-sm text-gray-600">
              Pick a beautiful layout for your journal entry.
            </p>
          </div>
          
          {!isApplying && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-yellow-100"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Main content */}
        <div className="flex-1 p-6 pt-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-yellow-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                </div>
                <p className="text-sm text-gray-600">Loading templates...</p>
              </motion.div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm text-red-600 mb-4">{error}</p>
                <Button onClick={loadTemplates} variant="outline" size="sm" className="border-yellow-300 hover:bg-yellow-50">
                  Try again
                </Button>
              </motion.div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <div className="w-16 h-16 bg-yellow-100/80 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-yellow-600/60" />
                </div>
                <p className="text-sm text-gray-600 mb-2">No templates available yet</p>
                <p className="text-xs text-gray-500">We are preparing more beautiful layouts for you.</p>
              </motion.div>
            </div>
          ) : (
            <>
              <ScrollArea className="h-96 pr-4">
                <motion.div 
                  layout
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <AnimatePresence mode="popLayout">
                    {templates.map((template) => (
                      <TemplateCard
                        key={template.id}
                        template={template}
                        onSelect={() => handleSelectTemplate(template.id)}
                        isSelected={selectedTemplateId === template.id}
                        disabled={isApplying}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              </ScrollArea>

              {/* Action bar */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mt-6 pt-4 border-t border-yellow-200/50"
              >
                <div className="text-sm text-gray-600">
                  {selectedTemplateId ? (
                    <span className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600" />
                      Template selected - click Apply to generate.
                    </span>
                  ) : (
                    "Please choose a template."
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isApplying}
                    className="border-yellow-300 hover:bg-yellow-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleApplyTemplate}
                    disabled={!selectedTemplateId || isApplying}
                    className="bg-yellow-400 hover:bg-yellow-500 text-yellow-900 shadow-lg shadow-yellow-200/50"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Applying template...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Apply Template
                      </>
                    )}
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
