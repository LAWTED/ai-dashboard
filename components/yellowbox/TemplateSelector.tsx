"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Image, Type, Sparkles, X, Check } from 'lucide-react';
import { TemplateMetadata } from '@/lib/yellowbox/templates/template-manager';
import { useYellowBoxI18n } from '@/contexts/yellowbox-i18n-context';

interface TemplateSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (templateId: string) => void;
  isApplying?: boolean;
}

interface TemplateCardProps {
  template: TemplateMetadata;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.98 }}
    >
      <Card 
        className={`cursor-pointer transition-all duration-200 ${
          isSelected 
            ? 'ring-2 ring-yellow-400 bg-yellow-50 dark:bg-yellow-900/20' 
            : 'hover:shadow-md hover:bg-gray-50 dark:hover:bg-gray-800/50'
        } ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onClick={disabled ? undefined : onSelect}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {isSelected && <Check className="w-5 h-5 text-yellow-600" />}
              {template.name}
            </CardTitle>
            <div className="flex gap-1">
              <Badge variant="outline" className="text-xs">
                <Type className="w-3 h-3 mr-1" />
                {template.textShapeCount}
              </Badge>
              <Badge variant="outline" className="text-xs">
                <Image className="w-3 h-3 mr-1" />
                {template.imageCount}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
            {template.description}
          </p>
          
          {/* Template Preview - Placeholder for now */}
          <div className="w-full h-32 bg-gradient-to-br from-yellow-100 via-orange-50 to-red-50 dark:from-yellow-900/30 dark:via-orange-900/20 dark:to-red-900/20 rounded-lg flex items-center justify-center mb-3 border border-yellow-200 dark:border-yellow-800">
            <div className="text-center text-gray-500 dark:text-gray-400">
              <Sparkles className="w-8 h-8 mx-auto mb-2" />
              <span className="text-xs">模板预览</span>
            </div>
          </div>

          {/* Tags */}
          {template.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {template.tags.map((tag) => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="text-xs px-2 py-1"
                >
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  isApplying = false,
}) => {
  const [templates, setTemplates] = useState<TemplateMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { t } = useYellowBoxI18n();

  // Load available templates
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
    } catch (error) {
      console.error('Error loading templates:', error);
      setError('加载模板失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    if (isApplying) return;
    setSelectedTemplateId(templateId);
  };

  const handleApplyTemplate = () => {
    if (selectedTemplateId && !isApplying) {
      onSelectTemplate(selectedTemplateId);
    }
  };

  const handleClose = () => {
    if (!isApplying) {
      setSelectedTemplateId(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-yellow-600" />
                选择模板
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                选择一个模板来重新设计您的日记内容
              </p>
            </div>
            {!isApplying && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="p-2"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </DialogHeader>

        <div className="px-6 pb-6 flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  正在加载模板...
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-8 h-8 text-red-600" />
                </div>
                <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                  {error}
                </p>
                <Button onClick={loadTemplates} variant="outline" size="sm">
                  重新加载
                </Button>
              </div>
            </div>
          ) : templates.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  暂无可用模板
                </p>
              </div>
            </div>
          ) : (
            <>
              <ScrollArea className="h-96">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-4">
                  <AnimatePresence>
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
                </div>
              </ScrollArea>

              {/* Action Buttons */}
              <div className="flex justify-between items-center mt-6 pt-4 border-t">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedTemplateId ? '已选择模板，点击应用开始生成' : '请选择一个模板'}
                </div>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleClose}
                    disabled={isApplying}
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleApplyTemplate}
                    disabled={!selectedTemplateId || isApplying}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    {isApplying ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        正在应用...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        应用模板
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};