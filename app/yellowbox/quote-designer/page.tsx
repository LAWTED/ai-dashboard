"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Undo2, Redo2, Trash2 } from "lucide-react";
import { useYellowBoxContext } from "@/contexts/yellowbox-context";
import { toast } from "sonner";
import Link from "next/link";
import { Canvas } from "./components/Canvas";
import { ElementsPanel } from "./components/ElementsPanel";
import { CanvasSettings } from "./components/CanvasSettings";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

export interface CanvasElement {
  id: string;
  type: "text" | "sticker" | "shape";
  content: string;
  x: number;
  y: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  rotation?: number;
  zIndex: number;
}

export interface CanvasState {
  elements: CanvasElement[];
  background: string;
  width: number;
  height: number;
}

export default function QuoteDesignerPage() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entry");
  const { lang, getFontClass } = useYellowBoxContext();

  const [canvasState, setCanvasState] = useState<CanvasState>({
    elements: [],
    background: "yellow-gradient",
    width: 800,
    height: 600,
  });

  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [history, setHistory] = useState<CanvasState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [entryData, setEntryData] = useState<{
    title?: string;
    content?: string;
    quote?: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load entry data if provided
  useEffect(() => {
    const loadEntryData = async () => {
      if (entryId) {
        try {
          const response = await fetch(`/api/yellowbox/entries/${entryId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              setEntryData(result.data);
            }
          }
        } catch (err) {
          console.error("Error loading entry:", err);
        }
      }
      setIsLoading(false);
    };

    loadEntryData();
  }, [entryId]);

  // History management
  const saveToHistory = () => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(JSON.parse(JSON.stringify(canvasState)));
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setCanvasState(JSON.parse(JSON.stringify(history[historyIndex - 1])));
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setCanvasState(JSON.parse(JSON.stringify(history[historyIndex + 1])));
    }
  };

  // Element management
  const addElement = (element: Omit<CanvasElement, "id" | "zIndex">) => {
    const newElement: CanvasElement = {
      ...element,
      id: `element-${Date.now()}`,
      zIndex: canvasState.elements.length,
    };

    setCanvasState(prev => ({
      ...prev,
      elements: [...prev.elements, newElement],
    }));

    saveToHistory();
  };

  const updateElement = (id: string, updates: Partial<CanvasElement>) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.map(el =>
        el.id === id ? { ...el, ...updates } : el
      ),
    }));
  };

  const deleteElement = (id: string) => {
    setCanvasState(prev => ({
      ...prev,
      elements: prev.elements.filter(el => el.id !== id),
    }));
    setSelectedElement(null);
    saveToHistory();
  };

  const clearCanvas = () => {
    if (confirm(lang === "zh" ? "确定要清空画布吗？" : "Are you sure you want to clear the canvas?")) {
      setCanvasState(prev => ({
        ...prev,
        elements: [],
      }));
      setSelectedElement(null);
      saveToHistory();
    }
  };

  const exportCanvas = async () => {
    try {
      // This will be implemented with HTML5 Canvas API
      toast.success(lang === "zh" ? "导出功能开发中..." : "Export feature coming soon...");
    } catch {
      toast.error(lang === "zh" ? "导出失败" : "Export failed");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FEF3C7]">
        <div className="text-2xl text-[#3B3109]">
          {lang === "zh" ? "加载中..." : "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="min-h-screen bg-[#FEF3C7] flex flex-col">
        {/* Header */}
        <div className="bg-yellow-400 p-4 flex items-center justify-between border-b-2 border-[#E4BE10]">
          <div className="flex items-center gap-4">
            <Link href="/yellowbox/entries">
              <Button variant="ghost" size="icon" className="hover:bg-yellow-300">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className={`text-2xl font-bold text-[#3B3109] ${getFontClass()}`}>
              {lang === "zh" ? "精彩瞬间设计器" : "Quote Designer"}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={undo}
              disabled={historyIndex <= 0}
              className="hover:bg-yellow-300 text-[#3B3109]"
            >
              <Undo2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className="hover:bg-yellow-300 text-[#3B3109]"
            >
              <Redo2 className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearCanvas}
              className="hover:bg-yellow-300 text-red-600"
            >
              <Trash2 className="w-5 h-5" />
            </Button>
            <Button
              onClick={exportCanvas}
              className="bg-[#3B3109] hover:bg-[#2A2207] text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              {lang === "zh" ? "导出" : "Export"}
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex">
          {/* Canvas Area */}
          <div className="flex-1 p-8 flex flex-col items-center justify-center">
            <Canvas
              state={canvasState}
              selectedElement={selectedElement}
              onSelectElement={setSelectedElement}
              onUpdateElement={updateElement}
              onDeleteElement={deleteElement}
              onAddElement={addElement}
            />

            <CanvasSettings
              background={canvasState.background}
              onBackgroundChange={(bg) => {
                setCanvasState(prev => ({ ...prev, background: bg }));
                saveToHistory();
              }}
            />
          </div>

          {/* Elements Panel */}
          <ElementsPanel
            entryData={entryData}
            onAddElement={addElement}
          />
        </div>
      </div>
    </DndProvider>
  );
}