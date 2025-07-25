"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Download, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { useYellowBoxContext } from "@/contexts/yellowbox-context";
import {
  Carousel,
  CarouselContent,
  CarouselIndicator,
  CarouselItem,
} from "@/components/ui/carousel";

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
        intensity: "low" | "medium" | "high";
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
    id: "elegant-simple",
    name: "简约雅致",
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    textColor: "#1a202c",
    fontSize: 26,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u2014", "\u2014"],
  },
  {
    id: "modern-clean",
    name: "现代简洁",
    background: "linear-gradient(135deg, #fef3e2 0%, #fde68a 100%)",
    textColor: "#374151",
    fontSize: 24,
    fontFamily: "sans-serif",
    layout: "center",
    decorativeElements: ["\u25e6", "\u25e6"],
  },
  {
    id: "literary-style",
    name: "文学风格",
    background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)",
    textColor: "#166534",
    fontSize: 27,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u275d", "\u275e"],
  },
  {
    id: "minimalist-zen",
    name: "禅意简约",
    background: "linear-gradient(135deg, #fdf2f8 0%, #fce7f3 100%)",
    textColor: "#831843",
    fontSize: 25,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u25cf", "\u25cf"],
  },
  {
    id: "vintage-paper",
    name: "复古纸张",
    background: "linear-gradient(135deg, #fef9e7 0%, #f3e8c2 100%)",
    textColor: "#8b4513",
    fontSize: 26,
    fontFamily: "serif",
    layout: "center",
    decorativeElements: ["\u2766", "\u2766"],
  },
  {
    id: "ocean-breeze",
    name: "海洋微风",
    background: "linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)",
    textColor: "#0277bd",
    fontSize: 25,
    fontFamily: "sans-serif",
    layout: "center",
    decorativeElements: ["\u2248", "\u2248"],
  },
];

export function QuoteDesignDialog({
  open,
  onOpenChange,
  entries,
}: QuoteDesignDialogProps) {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0);
  const [generatedQuote, setGeneratedQuote] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { lang, getFontClass } = useYellowBoxContext();

  const generateQuoteFromEntries = useCallback(async () => {
    if (entries.length === 0) {
      toast.error(
        lang === "zh" ? "没有可用的日记条目" : "No diary entries available"
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Select a random entry
      const randomEntry = entries[Math.floor(Math.random() * entries.length)];

      // Get all user messages from the conversation
      const userMessages = randomEntry.entries.conversationHistory
        .filter((msg) => msg.type === "user")
        .map((msg) => msg.content)
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
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Draw card background with gradient support
      if (currentTemplate.background.startsWith('linear-gradient')) {
        // Parse linear gradient
        const gradientMatch = currentTemplate.background.match(/linear-gradient\(([^)]+)\)/);
        if (gradientMatch) {
          const gradientString = gradientMatch[1];
          const parts = gradientString.split(',').map(s => s.trim());

          // Extract angle (135deg)
          const angle = parseFloat(parts[0].replace('deg', '')) || 0;

          // Convert angle to x1,y1,x2,y2 coordinates
          const angleRad = (angle - 90) * (Math.PI / 180);
          const x1 = cardWidth / 2 + Math.cos(angleRad) * cardWidth / 2;
          const y1 = cardHeight / 2 + Math.sin(angleRad) * cardHeight / 2;
          const x2 = cardWidth / 2 - Math.cos(angleRad) * cardWidth / 2;
          const y2 = cardHeight / 2 - Math.sin(angleRad) * cardHeight / 2;

          const gradient = ctx.createLinearGradient(x1, y1, x2, y2);

          // Add color stops
          for (let i = 1; i < parts.length; i++) {
            const colorStop = parts[i].trim();
            const colorMatch = colorStop.match(/(#[a-fA-F0-9]{6}|rgba?\([^)]+\))\s+(\d+)%/);
            if (colorMatch) {
              const color = colorMatch[1];
              const position = parseInt(colorMatch[2]) / 100;
              gradient.addColorStop(position, color);
            }
          }

          ctx.fillStyle = gradient;
        } else {
          ctx.fillStyle = '#ffffff';
        }
      } else {
        ctx.fillStyle = currentTemplate.background;
      }

      ctx.fillRect(0, 0, cardWidth, cardHeight);

      // Draw subtle pattern overlay
      ctx.fillStyle = currentTemplate.textColor;
      ctx.globalAlpha = 0.02;
      for (let x = 0; x < cardWidth; x += 30) {
        for (let y = 0; y < cardHeight; y += 30) {
          if ((x + y) % 60 === 0) {
            ctx.beginPath();
            ctx.arc(x, y, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      ctx.globalAlpha = 1;

      // Draw card border
      ctx.strokeStyle = "#e5e7eb";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, cardWidth, cardHeight);

      // Add icon sticker without background
      ctx.save();
      ctx.translate(cardWidth - 50, 50);
      ctx.rotate((12 * Math.PI) / 180); // 12 degrees

      // Draw icon
      ctx.font = "32px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🔯", 0, 0);

      ctx.restore();

      // Add decorative elements if they exist
      if (currentTemplate.decorativeElements) {
        ctx.font = "48px serif";
        ctx.fillStyle = currentTemplate.textColor;
        ctx.globalAlpha = 0.4;

        // Left decoration with rotation
        ctx.save();
        ctx.translate(50, 80);
        ctx.rotate((-12 * Math.PI) / 180);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(currentTemplate.decorativeElements[0], 0, 0);
        ctx.restore();

        // Right decoration with rotation
        const rightDecor =
          currentTemplate.decorativeElements[1] ||
          currentTemplate.decorativeElements[0];
        ctx.save();
        ctx.translate(cardWidth - 50, cardHeight - 50);
        ctx.rotate((12 * Math.PI) / 180);
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(rightDecor, 0, 0);
        ctx.restore();

        ctx.globalAlpha = 1;
      }

      // Set text properties for quote
      ctx.fillStyle = currentTemplate.textColor;
      ctx.font = `500 ${currentTemplate.fontSize}px ${currentTemplate.fontFamily}`;
      ctx.textAlign =
        currentTemplate.layout === "center"
          ? "center"
          : currentTemplate.layout === "left"
          ? "left"
          : "right";
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

      const x =
        currentTemplate.layout === "center"
          ? cardWidth / 2
          : currentTemplate.layout === "left"
          ? 50
          : cardWidth - 50;

      lines.forEach((line, index) => {
        ctx.fillText(line, x, startY + index * lineHeight);
      });

      // Export as high-quality image
      const link = document.createElement("a");
      link.download = `quote-${Date.now()}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();

      toast.success(
        lang === "zh" ? "引言已导出" : "Quote exported successfully"
      );
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
        className={`bg-yellow-400 border-4 border-[#E4BE10] ${getFontClass()}`}
        style={{
          maxWidth: "none",
          width: "auto",
          maxHeight: "90vh",
          borderRadius: "16px",
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-[#3B3109] flex items-center gap-2 mb-2">
            <Sparkles className="w-8 h-8 text-[#C04635]" />
            {lang === "zh" ? "设计精彩瞬间" : "Design Quote"}
          </DialogTitle>

          {/* Divider */}
          <div className="w-full h-px bg-[#E4BE10] mb-4"></div>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 p-2 w-full">
          {/* Carousel */}
          <div
            className="relative w-full mx-auto pb-4"
            style={{ maxWidth: "700px" }}
          >
            <Carousel
              onIndexChange={setCurrentTemplateIndex}
              className="w-full"
            >
              <CarouselContent>
                {QUOTE_TEMPLATES.map((template) => (
                  <CarouselItem key={template.id} className="p-4">
                    <div className="flex justify-center">
                      <div
                        className="w-[600px] h-[400px] bg-white rounded-xl shadow-lg border border-gray-200 flex items-center justify-center text-center relative p-12 overflow-hidden"
                        style={{
                          background: template.background,
                          color: template.textColor,
                          fontFamily: template.fontFamily,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.06)",
                        }}
                      >
                        {/* Icon Sticker */}
                        <div
                          className="absolute top-4 right-4 text-4xl transform rotate-12 opacity-90"
                          style={{
                            filter: "drop-shadow(3px 3px 8px rgba(0,0,0,0.2))",
                            zIndex: 10,
                            background: "rgba(255, 255, 255, 0.8)",
                            borderRadius: "50%",
                            padding: "6px",
                            border: "2px solid rgba(255, 255, 255, 0.9)",
                          }}
                        >
                          🔯
                        </div>

                        {/* Subtle pattern overlay */}
                        <div
                          className="absolute inset-0 pointer-events-none opacity-5"
                          style={{
                            backgroundImage: `radial-gradient(circle at 20% 20%, ${template.textColor} 1px, transparent 1px)`,
                            backgroundSize: "30px 30px",
                          }}
                        ></div>

                        {/* Decorative Elements */}
                        {template.decorativeElements && (
                          <>
                            <div
                              className="absolute top-8 left-8 text-5xl opacity-40 transform -rotate-12"
                              style={{
                                color: template.textColor,
                                filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                                textShadow: "1px 1px 2px rgba(255,255,255,0.8)"
                              }}
                            >
                              {template.decorativeElements[0]}
                            </div>
                            <div
                              className="absolute bottom-8 right-8 text-5xl opacity-40 transform rotate-12"
                              style={{
                                color: template.textColor,
                                filter: "drop-shadow(2px 2px 4px rgba(0,0,0,0.1))",
                                textShadow: "1px 1px 2px rgba(255,255,255,0.8)"
                              }}
                            >
                              {template.decorativeElements[1] ||
                                template.decorativeElements[0]}
                            </div>
                          </>
                        )}

                        {/* Quote Content */}
                        <div
                          className="max-w-full leading-relaxed relative z-10"
                          style={{
                            fontSize: `${template.fontSize}px`,
                            textAlign: template.layout,
                            textShadow: "1px 1px 3px rgba(255,255,255,0.8)",
                            lineHeight: "1.8",
                            fontWeight: "500",
                            letterSpacing: "0.5px",
                          }}
                        >
                          {isGenerating ? (
                            <div className="text-center opacity-60">
                              {lang === "zh"
                                ? "正在生成精彩瞬间..."
                                : "Generating your quote..."}
                            </div>
                          ) : generatedQuote ? (
                            <div>{generatedQuote}</div>
                          ) : (
                            <div className="text-center opacity-60">
                              {lang === "zh"
                                ? "正在准备你的引言..."
                                : "Preparing your quote..."}
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

          {/* Action Buttons */}
          <div className="flex gap-4 pb-2">
            <Button
              onClick={regenerateQuote}
              disabled={isGenerating}
              className="bg-yellow-300 hover:bg-yellow-200 text-[#3B3109] border-2 border-[#E4BE10] font-medium px-6 py-2 rounded-lg transition-colors shadow-sm"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              {isGenerating
                ? lang === "zh"
                  ? "生成中..."
                  : "Generating..."
                : lang === "zh"
                ? "重新生成"
                : "Regenerate"}
            </Button>
            <Button
              onClick={exportQuote}
              disabled={isExporting || !generatedQuote}
              className="bg-[#C04635] hover:bg-[#A03B2A] text-white font-medium px-6 py-2 rounded-lg transition-colors border-2 border-[#A03B2A] shadow-sm"
            >
              <Download className="w-4 h-4 mr-2" />
              {isExporting
                ? lang === "zh"
                  ? "导出中..."
                  : "Exporting..."
                : lang === "zh"
                ? "导出"
                : "Export"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
