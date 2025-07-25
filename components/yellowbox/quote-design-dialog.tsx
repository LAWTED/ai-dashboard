"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Download, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useYellowBoxContext } from "@/contexts/yellowbox-context";
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
} from '@/components/ui/carousel';

interface QuoteTemplate {
  id: string;
  name: string;
  background: string;
  textColor: string;
  fontSize: number;
  fontFamily: string;
  layout: "center" | "left" | "right";
  decorativeElements?: string[];
}

interface YellowboxEntry {
  id: string;
  entries: {
    selectedQuestion?: string;
    conversationHistory: Array<{
      type: "user" | "ai";
      content: string;
    }>;
    timeOfDay: "morning" | "daytime" | "evening";
    conversationCount: number;
    completedAt: string;
  };
  metadata: {
    currentFont?: string;
    language?: string;
    totalMessages: number;
    aiSummary?: string;
    enhancedSummary?: {
      title: string;
      tags: string[];
      emotion: {
        primary: string;
        intensity: 'low' | 'medium' | 'high';
        confidence: number;
      };
      themes: string[];
    };
  };
  created_at: string;
}

interface QuoteDesignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entries: YellowboxEntry[];
}

const QUOTE_TEMPLATES: QuoteTemplate[] = [
  {
    id: "classic-wisdom",
    name: "经典智慧",
    background: "#ffffff",
    textColor: "#2d3748",
    fontSize: 28,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u201c", "\u201d"],
  },
  {
    id: "elegant-simple",
    name: "简约雅致", 
    background: "#ffffff",
    textColor: "#1a202c",
    fontSize: 26,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u2014", "\u2014"],
  },
  {
    id: "modern-clean",
    name: "现代简洁",
    background: "#ffffff", 
    textColor: "#374151",
    fontSize: 24,
    fontFamily: "sans-serif",
    layout: "center",
    decorativeElements: ["\u25e6", "\u25e6"],
  },
  {
    id: "literary-style",
    name: "文学风格",
    background: "#ffffff",
    textColor: "#4a5568",
    fontSize: 27,
    fontFamily: "serif",
    layout: "center", 
    decorativeElements: ["\u275d", "\u275e"],
  },
  {
    id: "minimalist-zen",
    name: "禅意简约",
    background: "#ffffff",
    textColor: "#2d3748",
    fontSize: 25,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u25cf", "\u25cf"],
  },
];

export function QuoteDesignDialog({ open, onOpenChange, entries }: QuoteDesignDialogProps) {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [generatedQuote, setGeneratedQuote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { lang, getFontClass } = useYellowBoxContext();

  const generateQuoteFromEntries = useCallback(async () => {
    if (entries.length === 0) {
      toast.error(lang === "zh" ? "没有可用的日记条目" : "No diary entries available");
      return;
    }

    setIsGenerating(true);
    
    try {
      // Select a random entry
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];
      
      // Get all user messages from the conversation
      const userMessages = randomEntry.entries.conversationHistory
        .filter(msg => msg.type === "user")
        .map(msg => msg.content)
        .join(" ");

      // Call API to generate quote
      const response = await fetch("/api/yellowbox/generate-quote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: userMessages,
          aiSummary: randomEntry.metadata?.aiSummary,
          emotion: randomEntry.metadata?.enhancedSummary?.emotion?.primary,
          themes: randomEntry.metadata?.enhancedSummary?.themes,
          language: lang,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate quote");
      }

      const result = await response.json();
      
      if (result.success) {
        setGeneratedQuote(result.quote);
      } else {
        throw new Error(result.message || "Failed to generate quote");
      }
    } catch (error) {
      console.error("Error generating quote:", error);
      toast.error(lang === "zh" ? "生成引言失败" : "Failed to generate quote");
    } finally {
      setIsGenerating(false);
    }
  }, [entries, lang]);

  const regenerateQuote = () => {
    generateQuoteFromEntries();
  };

  // Generate initial quote when dialog opens
  useEffect(() => {
    if (open && !generatedQuote) {
      generateQuoteFromEntries();
    }
  }, [open, generatedQuote, generateQuoteFromEntries]);

  const exportQuote = async () => {
    const currentTemplate = QUOTE_TEMPLATES[currentTemplateIndex];
    if (!currentTemplate || !generatedQuote) return;

    setIsExporting(true);
    
    try {
      // Create a canvas element for export
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      // Set canvas size with high DPI scaling for crisp output
      const devicePixelRatio = window.devicePixelRatio || 1;
      const scale = Math.max(devicePixelRatio, 2) * 2; // At least 2x, up to 4x for retina displays
      const cardWidth = 600;
      const cardHeight = 400;
      
      canvas.width = cardWidth * scale;
      canvas.height = cardHeight * scale;
      
      // Scale the context to ensure correct drawing operations
      ctx.scale(scale, scale);
      
      // Enable anti-aliasing for smoother text
      ctx.textRenderingOptimization = 'optimizeQuality';
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Draw card background
      ctx.fillStyle = currentTemplate.background;
      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Draw card border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, cardWidth, cardHeight);

      // Add icon sticker
      ctx.font = "32px Arial";
      ctx.fillStyle = "rgba(0,0,0,0.8)";
      ctx.save();
      ctx.translate(cardWidth - 50, 50);
      ctx.rotate(12 * Math.PI / 180); // 12 degrees
      ctx.fillText("🔯", -16, 16);
      ctx.restore();

      // Add decorative elements if they exist
      if (currentTemplate.decorativeElements) {
        ctx.font = "48px serif";
        ctx.fillStyle = currentTemplate.textColor;
        ctx.globalAlpha = 0.3;
        
        // Left decoration
        ctx.fillText(currentTemplate.decorativeElements[0], 32, 80);
        
        // Right decoration
        const rightDecor = currentTemplate.decorativeElements[1] || currentTemplate.decorativeElements[0];
        ctx.textAlign = "right";
        ctx.fillText(rightDecor, cardWidth - 32, cardHeight - 32);
        ctx.textAlign = "start";
        
        ctx.globalAlpha = 1;
      }

      // Set text properties for quote
      ctx.fillStyle = currentTemplate.textColor;
      ctx.font = `${currentTemplate.fontSize}px ${currentTemplate.fontFamily}`;
      ctx.textAlign = currentTemplate.layout === "center" ? "center" : currentTemplate.layout === "left" ? "left" : "right";
      ctx.textBaseline = "middle";

      // Word wrap and draw text
      const words = generatedQuote.split(" ");
      const lines = [];
      let currentLine = "";
      const maxWidth = cardWidth - 100;

      for (const word of words) {
        const testLine = currentLine + (currentLine ? " " : "") + word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);

      const lineHeight = currentTemplate.fontSize * 1.6;
      const totalHeight = lines.length * lineHeight;
      const startY = (cardHeight - totalHeight) / 2 + lineHeight / 2;

      const x = currentTemplate.layout === "center" ? cardWidth / 2 : 
                currentTemplate.layout === "left" ? 50 : cardWidth - 50;

      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeight);
      });

      // Export as high-quality image
      const link = document.createElement("a");
      link.download = `quote-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success(lang === "zh" ? "引言已导出" : "Quote exported successfully");
    } catch (error) {
      console.error("Export error:", error);
      toast.error(lang === "zh" ? "导出失败" : "Export failed");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className={`bg-white ${getFontClass()}`}
        style={{ 
          maxWidth: 'none', 
          width: 'auto', 
          maxHeight: '90vh' 
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#3B3109] flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-600" />
            {lang === "zh" ? "设计精彩瞬间" : "Design Quote"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 p-4 w-full">
          {/* Carousel */}
          <div className="relative w-full mx-auto"
               style={{ maxWidth: '700px' }}>
            <Carousel 
              onIndexChange={setCurrentTemplateIndex}
              className="w-full"
            >
              <CarouselContent>
                {QUOTE_TEMPLATES.map((template) => (
                  <CarouselItem key={template.id} className="p-4">
                    <div className="flex justify-center">
                      <div
                        className="w-[600px] h-[400px] bg-white rounded-lg shadow-lg border border-gray-200 flex items-center justify-center text-center relative p-12"
                        style={{
                          background: template.background,
                          color: template.textColor,
                          fontFamily: template.fontFamily,
                        }}
                      >
                        {/* Icon Sticker */}
                        <div 
                          className="absolute top-4 right-4 text-3xl transform rotate-12 opacity-80"
                          style={{ 
                            filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.1))',
                            zIndex: 10
                          }}
                        >
                          🔯
                        </div>

                        {/* Decorative Elements */}
                        {template.decorativeElements && (
                          <>
                            <div 
                              className="absolute top-8 left-8 text-4xl opacity-30"
                              style={{ color: template.textColor }}
                            >
                              {template.decorativeElements[0]}
                            </div>
                            <div 
                              className="absolute bottom-8 right-8 text-4xl opacity-30"
                              style={{ color: template.textColor }}
                            >
                              {template.decorativeElements[1] || template.decorativeElements[0]}
                            </div>
                          </>
                        )}
                        
                        {/* Quote Content */}
                        <div
                          className="max-w-full leading-relaxed"
                          style={{ 
                            fontSize: `${template.fontSize}px`,
                            textAlign: template.layout
                          }}
                        >
                          {isGenerating ? (
                            <div className="text-center opacity-60">
                              {lang === "zh" ? "正在生成精彩瞬间..." : "Generating your quote..."}
                            </div>
                          ) : generatedQuote ? (
                            <div>
                              {generatedQuote}
                            </div>
                          ) : (
                            <div className="text-center opacity-60">
                              {lang === "zh" ? "正在准备你的引言..." : "Preparing your quote..."}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselIndicator />
            </Carousel>
          </div>

          {/* Template Name */}
          <div className="flex justify-center">
            <Badge variant="outline" className="text-lg px-4 py-2">
              {QUOTE_TEMPLATES[currentTemplateIndex]?.name}
            </Badge>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              onClick={regenerateQuote}
              disabled={isGenerating}
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isGenerating 
                ? (lang === "zh" ? "生成中..." : "Generating...")
                : (lang === "zh" ? "重新生成" : "Regenerate")
              }
            </Button>
            <Button
              onClick={exportQuote}
              disabled={isExporting || !generatedQuote}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting
                ? (lang === "zh" ? "导出中..." : "Exporting...")
                : (lang === "zh" ? "导出" : "Export")
              }
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}