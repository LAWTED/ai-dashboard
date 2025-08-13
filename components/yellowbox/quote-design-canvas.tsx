"use client";

import TldrawQuoteCanvas from './TldrawQuoteCanvas';

interface YellowboxEntry {
  id: string;
  entries: {
    conversationHistory: Array<{
      type: "user" | "ai";
      content: string;
      images?: string[];
    }>;
    timeOfDay: "morning" | "daytime" | "evening";
  };
  metadata: {
    language?: string;
    aiSummary?: string;
  };
}

interface QuoteDesignCanvasProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entry: YellowboxEntry;
  language: string;
}

export default function QuoteDesignCanvas({
  open,
  onOpenChange,
  entry,
  language
}: QuoteDesignCanvasProps) {
  // 使用新的 TldrawQuoteCanvas 组件
  return (
    <TldrawQuoteCanvas
      open={open}
      onOpenChange={onOpenChange}
      entry={entry}
      language={language}
    />
  );
}