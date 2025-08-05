"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Type, Image as ImageIcon, Smile } from "lucide-react";
import Image from "next/image";

interface CanvasElement {
  id: string;
  type: 'text' | 'image' | 'emoji';
  content: string;
  position: { x: number; y: number };
  style?: {
    // 文本样式
    fontSize?: number;
    color?: string;
    fontWeight?: string;
    fontFamily?: string;
    // 图片样式
    width?: number;
    height?: number;
    opacity?: number;
    borderRadius?: number;
    // emoji样式
    emojiSize?: number;
  };
}

interface TextSegment {
  id: string;
  content: string;
  type: 'user' | 'ai';
  isUsed: boolean;
}

interface ImageItem {
  id: string;
  url: string;
  isUsed: boolean;
}

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

const EMOJI_LIST = [
  "😊", "😍", "🥰", "😘", "🤗", "🤔", "😎", "🤩", "🥳", "😇",
  "🌟", "⭐", "✨", "💫", "🌈", "🌸", "🌺", "🌻", "🌹", "💐",
  "❤️", "💕", "💖", "💗", "💝", "💘", "💞", "💓", "💟", "♥️",
  "🎉", "🎊", "🎈", "🎁", "🎀", "🎯", "🎨", "🎭", "🎪", "🎵"
];

export default function QuoteDesignCanvas({
  open,
  onOpenChange,
  entry,
  language
}: QuoteDesignCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);

  const [canvasElements, setCanvasElements] = useState<CanvasElement[]>([]);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'emoji'>('text');
  const [draggedItem, setDraggedItem] = useState<{item: TextSegment | ImageItem | string, type: 'text' | 'image' | 'emoji'} | null>(null);
  const [dropZoneActive, setDropZoneActive] = useState(false);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);

  // 提取文字片段
  const extractTextSegments = useCallback((): TextSegment[] => {
    if (!entry?.entries?.conversationHistory) return [];

    return entry.entries.conversationHistory
      .filter(msg => msg.content && msg.content.trim())
      .flatMap(msg => {
        // 按段落分割
        const segments = msg.content.split(/[.!?。！？\n]/)
          .filter(segment => segment.trim().length > 5)
          .map(segment => ({
            id: `${msg.type}-${Math.random().toString(36).substring(2, 11)}`,
            content: segment.trim(),
            type: msg.type as 'user' | 'ai',
            isUsed: false
          }));
        return segments;
      });
  }, [entry]);

  // 提取图片
  const extractImages = useCallback((): ImageItem[] => {
    if (!entry?.entries?.conversationHistory) return [];

    return entry.entries.conversationHistory
      .filter(msg => msg.images && msg.images.length > 0)
      .flatMap(msg =>
        msg.images!.map(url => ({
          id: `img-${Math.random().toString(36).substring(2, 11)}`,
          url,
          isUsed: false
        }))
      );
  }, [entry]);

  const textSegments = extractTextSegments();
  const images = extractImages();

  // 添加元素到画布
  const addToCanvas = (item: TextSegment | ImageItem | string, type: 'text' | 'image' | 'emoji', position?: { x: number; y: number }) => {
    const newElement: CanvasElement = {
      id: `canvas-${Math.random().toString(36).substring(2, 11)}`,
      type,
      content: typeof item === 'string' ? item : type === 'image' ? (item as ImageItem).url : (item as TextSegment).content,
      position: position || { x: 50, y: 50 + canvasElements.length * 60 },
      style: type === 'text' ? {
        fontSize: 16,
        color: '#1f2937',
        fontWeight: 'normal',
        fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif'
      } : type === 'image' ? {
        width: 128,
        height: 128,
        opacity: 1,
        borderRadius: 8
      } : type === 'emoji' ? {
        emojiSize: 32
      } : undefined
    };

    setCanvasElements(prev => [...prev, newElement]);
  };

  // 处理拖拽放置
  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    if (!draggedItem || !canvasRef.current) return;

    const canvasRect = canvasRef.current.getBoundingClientRect();
    const dropPosition = {
      x: event.clientX - canvasRect.left - 50, // 减去元素一半宽度用于居中
      y: event.clientY - canvasRect.top - 25   // 减去元素一半高度用于居中
    };

    addToCanvas(draggedItem.item, draggedItem.type, dropPosition);
    setDraggedItem(null);
    setDropZoneActive(false);
  };

  // 处理拖拽悬停
  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDropZoneActive(true);
  };

  // 处理拖拽离开
  const handleDragLeave = (event: React.DragEvent) => {
    // 只有当拖拽真正离开画布时才设置为false
    if (!canvasRef.current?.contains(event.relatedTarget as Node)) {
      setDropZoneActive(false);
    }
  };

  // 更新元素位置
  const updateElementPosition = (id: string, position: { x: number; y: number }) => {
    setCanvasElements(prev =>
      prev.map(el => el.id === id ? { ...el, position } : el)
    );
  };

  // 更新元素样式
  const updateElementStyle = (id: string, styleUpdates: Partial<CanvasElement['style']>) => {
    setCanvasElements(prev =>
      prev.map(el => el.id === id ? {
        ...el,
        style: { ...el.style, ...styleUpdates }
      } : el)
    );
  };

  // 删除元素
  const deleteElement = (id: string) => {
    setCanvasElements(prev => prev.filter(el => el.id !== id));
    setSelectedElementId(null);
  };

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.key === 'Delete' || event.key === 'Backspace') && selectedElementId) {
        event.preventDefault();
        event.stopPropagation();
        deleteElement(selectedElementId);
      }
    };

    // 只在对话框打开时监听键盘事件
    if (open) {
      document.addEventListener('keydown', handleKeyDown, true);
      return () => {
        document.removeEventListener('keydown', handleKeyDown, true);
      };
    }
  }, [open, selectedElementId]);

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        layoutId="quote-design-container"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1
        }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="fixed inset-0 z-50 bg-yellow-50"
        style={{ zIndex: 9999 }}
      >
        <div className="flex h-screen">
          {/* 左侧画布区域 - 3/4 宽度 */}
          <div className="flex-1 relative bg-gray-100 mr-1 p-8">
            <div className="w-full h-full bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden">
            <div
              ref={canvasRef}
              tabIndex={0}
              className={`w-full h-full relative overflow-hidden transition-all duration-200 outline-none ${
                dropZoneActive ? 'ring-4 ring-yellow-400 ring-opacity-50' : ''
              }`}
              style={{
                backgroundColor: '#fefefe',
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px),
                  linear-gradient(90deg, #fca5a5 0px, #fca5a5 2px, transparent 2px),
                  linear-gradient(90deg, rgba(59, 49, 9, 0.1) 0px, rgba(59, 49, 9, 0.1) 80px, transparent 80px)
                `,
                backgroundSize: '20px 24px, 20px 24px, 100% 100%, 100% 100%',
                backgroundPosition: '0 0, 0 0, 0 0, 0 0',
                boxShadow: dropZoneActive
                  ? 'inset 0 0 20px rgba(251, 191, 36, 0.3), 0 0 30px rgba(251, 191, 36, 0.2)'
                  : 'inset 0 0 10px rgba(0, 0, 0, 0.05)'
              }}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => {
                setSelectedElementId(null);
                if (canvasRef.current) {
                  canvasRef.current.focus();
                }
              }}
              onKeyDown={(e) => {
                if ((e.key === 'Delete' || e.key === 'Backspace') && selectedElementId) {
                  e.preventDefault();
                  e.stopPropagation();
                  deleteElement(selectedElementId);
                }
              }}
            >
              {/* 信纸装订孔 */}
              <div className="absolute left-6 top-0 bottom-0 w-px bg-red-300 opacity-60" />
              <div className="absolute left-4 space-y-12 top-8">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 bg-gray-300 rounded-full opacity-40"
                  />
                ))}
              </div>

              {/* 拖拽提示 - 仅在拖拽时显示 */}
              {dropZoneActive && (
                <div className="absolute inset-8 border-2 border-dashed border-yellow-500 rounded-lg opacity-60 bg-yellow-50/50" />
              )}

              {/* 画布元素 */}
              {canvasElements.map((element) => (
                <motion.div
                  key={element.id}
                  drag
                  dragMomentum={false}
                  dragElastic={0}
                  dragConstraints={canvasRef}
                  style={{
                    x: element.position.x,
                    y: element.position.y
                  }}
                  onDragEnd={(_, info) => {
                    updateElementPosition(element.id, {
                      x: element.position.x + info.offset.x,
                      y: element.position.y + info.offset.y
                    });
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedElementId(element.id);
                    if (canvasRef.current) {
                      canvasRef.current.focus();
                    }
                  }}
                  className="absolute cursor-move select-none"
                >
                  {element.type === 'text' && (
                    <div className="relative">
                      <div
                        className={`max-w-xs px-3 py-2 transition-all duration-200 ${
                          selectedElementId === element.id
                            ? 'border-2 border-blue-400 border-dashed rounded-lg'
                            : 'border-2 border-transparent'
                        }`}
                        style={{
                          fontSize: element.style?.fontSize || 16,
                          color: element.style?.color || '#1f2937',
                          fontWeight: element.style?.fontWeight || 'normal',
                          fontFamily: element.style?.fontFamily || 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                          lineHeight: '1.6'
                        }}
                      >
                        {element.content}
                      </div>

                      {/* 字体编辑控制面板 */}
                      {selectedElementId === element.id && (
                        <div className="absolute -top-12 -right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-20">
                          {/* 字体选择 */}
                          <select
                            value={element.style?.fontFamily || 'ui-serif'}
                            onChange={(e) => updateElementStyle(element.id, { fontFamily: e.target.value })}
                            className="text-xs border border-gray-300 rounded px-1 py-0.5 min-w-0 w-16"
                          >
                            <option value="ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif">Serif</option>
                            <option value="ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto">Sans</option>
                            <option value="ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo">Mono</option>
                          </select>

                          {/* 字体大小 */}
                          <input
                            type="number"
                            min="12"
                            max="48"
                            value={element.style?.fontSize || 16}
                            onChange={(e) => updateElementStyle(element.id, { fontSize: parseInt(e.target.value) })}
                            className="text-xs border border-gray-300 rounded px-1 py-0.5 w-12"
                          />

                          {/* 加粗按钮 */}
                          <button
                            onClick={() => updateElementStyle(element.id, {
                              fontWeight: element.style?.fontWeight === 'bold' ? 'normal' : 'bold'
                            })}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                              element.style?.fontWeight === 'bold'
                                ? 'bg-blue-500 text-white border-blue-500'
                                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            <strong>B</strong>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {element.type === 'image' && (
                    <div className="relative">
                      <div className={`bg-white rounded-lg shadow-md p-1 transition-all duration-200 ${
                        selectedElementId === element.id ? 'ring-2 ring-blue-400 ring-offset-0' : 'ring-2 ring-transparent'
                      }`}>
                        <Image
                          src={element.content}
                          alt="Canvas image"
                          width={element.style?.width || 128}
                          height={element.style?.height || 128}
                          className="object-cover"
                          style={{
                            width: element.style?.width || 128,
                            height: element.style?.height || 128,
                            opacity: element.style?.opacity || 1,
                            borderRadius: (element.style?.borderRadius || 8) + 'px'
                          }}
                          draggable={false}
                        />
                      </div>

                      {/* 图片编辑控制面板 */}
                      {selectedElementId === element.id && (
                        <div className="absolute -top-12 -right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-2 z-20">
                          {/* 宽度 */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs text-gray-600 mb-1">W</label>
                            <input
                              type="number"
                              min="50"
                              max="300"
                              value={element.style?.width || 128}
                              onChange={(e) => updateElementStyle(element.id, { width: parseInt(e.target.value) })}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 w-12"
                            />
                          </div>

                          {/* 高度 */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs text-gray-600 mb-1">H</label>
                            <input
                              type="number"
                              min="50"
                              max="300"
                              value={element.style?.height || 128}
                              onChange={(e) => updateElementStyle(element.id, { height: parseInt(e.target.value) })}
                              className="text-xs border border-gray-300 rounded px-1 py-0.5 w-12"
                            />
                          </div>

                          {/* 透明度 */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs text-gray-600 mb-1">α</label>
                            <input
                              type="range"
                              min="0.1"
                              max="1"
                              step="0.1"
                              value={element.style?.opacity || 1}
                              onChange={(e) => updateElementStyle(element.id, { opacity: parseFloat(e.target.value) })}
                              className="w-12 h-4"
                            />
                          </div>

                          {/* 圆角 */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs text-gray-600 mb-1">⚪</label>
                            <input
                              type="range"
                              min="0"
                              max="20"
                              value={element.style?.borderRadius || 8}
                              onChange={(e) => updateElementStyle(element.id, { borderRadius: parseInt(e.target.value) })}
                              className="w-12 h-4"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {element.type === 'emoji' && (
                    <div className="relative">
                      <div
                        className={`select-none px-2 py-1 transition-all duration-200 ${
                          selectedElementId === element.id ? 'border-2 border-blue-400 border-dashed rounded-lg' : 'border-2 border-transparent'
                        }`}
                        style={{
                          fontSize: (element.style?.emojiSize || 32) + 'px'
                        }}
                      >
                        {element.content}
                      </div>

                      {/* Emoji编辑控制面板 */}
                      {selectedElementId === element.id && (
                        <div className="absolute -top-12 -right-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex items-center gap-3 z-20">
                          {/* 大小 */}
                          <div className="flex flex-col items-center">
                            <label className="text-xs text-gray-600 mb-1">Size</label>
                            <input
                              type="range"
                              min="16"
                              max="72"
                              value={element.style?.emojiSize || 32}
                              onChange={(e) => updateElementStyle(element.id, { emojiSize: parseInt(e.target.value) })}
                              className="w-16 h-4"
                            />
                          </div>

                          {/* 大小数值显示 */}
                          <div className="text-xs text-gray-600 font-mono">
                            {element.style?.emojiSize || 32}px
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}

              {/* 画布提示 */}
              {canvasElements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="text-center text-gray-500/60 ml-12">
                    <div className="text-6xl mb-4">✍️</div>
                    <p className="text-lg mb-2 font-serif">
                      {language === 'zh' ? '从右侧工具栏拖拽元素到信纸上开始创作' : 'Drag elements from the toolbar to start writing'}
                    </p>
                    <p className="text-sm opacity-75 font-serif">
                      {language === 'zh' ? '或点击工具栏中的元素添加到信纸' : 'Or click elements in the toolbar to add'}
                    </p>
                  </div>
                </div>
              )}

              {/* 拖拽悬停提示 */}
              {dropZoneActive && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                  <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl border border-gray-300 shadow-lg ml-12">
                    <div className="text-center text-gray-700">
                      <div className="text-4xl mb-2">📝</div>
                      <p className="font-semibold font-serif">
                        {language === 'zh' ? '松开鼠标写在信纸上' : 'Release to place on paper'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            </div>
          </div>

          {/* 右侧工具栏 - 1/4 宽度 */}
          <motion.div
            className="w-80 bg-yellow-400 border-l-4 border-[#E4BE10] flex flex-col"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            {/* 标签选择 */}
            <div className="flex bg-[#E4BE10] border-b-2 border-[#D4A017]">
              <button
                onClick={() => setActiveTab('text')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'text'
                    ? 'bg-yellow-400 text-[#3B3109]'
                    : 'text-[#3B3109]/70 hover:text-[#3B3109]'
                }`}
              >
                <Type className="w-4 h-4 inline mr-2" />
                {language === 'zh' ? '文字' : 'Text'}
              </button>
              <button
                onClick={() => setActiveTab('image')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'image'
                    ? 'bg-yellow-400 text-[#3B3109]'
                    : 'text-[#3B3109]/70 hover:text-[#3B3109]'
                }`}
              >
                <ImageIcon className="w-4 h-4 inline mr-2" />
                {language === 'zh' ? '图片' : 'Images'}
              </button>
              <button
                onClick={() => setActiveTab('emoji')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'emoji'
                    ? 'bg-yellow-400 text-[#3B3109]'
                    : 'text-[#3B3109]/70 hover:text-[#3B3109]'
                }`}
              >
                <Smile className="w-4 h-4 inline mr-2" />
                {language === 'zh' ? '贴纸' : 'Stickers'}
              </button>
            </div>

            {/* 工具栏内容 */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'text' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#3B3109] mb-3">
                    {language === 'zh' ? '文字片段' : 'Text Segments'}
                  </h3>
                  {textSegments.map((segment) => (
                    <motion.div
                      key={segment.id}
                      className={`p-3 rounded-lg border-2 cursor-move transition-all ${
                        segment.type === 'user'
                          ? 'bg-blue-100 border-blue-200 hover:border-blue-300'
                          : 'bg-green-100 border-green-200 hover:border-green-300'
                      }`}
                      draggable
                      onDragStart={() => setDraggedItem({ item: segment, type: 'text' })}
                      onDragEnd={() => setDraggedItem(null)}
                      onClick={() => addToCanvas(segment, 'text')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        {segment.type === 'user' ? (language === 'zh' ? '你' : 'You') : 'AI'}
                      </div>
                      <div className="text-sm text-[#3B3109] line-clamp-3">
                        {segment.content}
                      </div>
                    </motion.div>
                  ))}
                  {textSegments.length === 0 && (
                    <div className="text-center text-[#3B3109]/60 py-8">
                      {language === 'zh' ? '没有找到文字内容' : 'No text content found'}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'image' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#3B3109] mb-3">
                    {language === 'zh' ? '图片' : 'Images'}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((image) => (
                      <motion.div
                        key={image.id}
                        className="aspect-square bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 cursor-move overflow-hidden"
                        draggable
                        onDragStart={() => setDraggedItem({ item: image, type: 'image' })}
                        onDragEnd={() => setDraggedItem(null)}
                        onClick={() => addToCanvas(image, 'image')}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Image
                          src={image.url}
                          alt="Diary image"
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    ))}
                  </div>
                  {images.length === 0 && (
                    <div className="text-center text-[#3B3109]/60 py-8">
                      {language === 'zh' ? '没有找到图片' : 'No images found'}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'emoji' && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-[#3B3109] mb-3">
                    {language === 'zh' ? 'Emoji 贴纸' : 'Emoji Stickers'}
                  </h3>
                  <div className="grid grid-cols-5 gap-2">
                    {EMOJI_LIST.map((emoji, index) => (
                      <motion.button
                        key={index}
                        className="aspect-square bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 text-2xl flex items-center justify-center cursor-move"
                        draggable
                        onDragStart={() => setDraggedItem({ item: emoji, type: 'emoji' })}
                        onDragEnd={() => setDraggedItem(null)}
                        onClick={() => addToCanvas(emoji, 'emoji')}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        {emoji}
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 底部操作按钮 */}
            <div className="p-4 border-t-2 border-[#E4BE10] bg-[#F5D000]">
              <div className="flex gap-3">
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="outline"
                  className="flex-1 bg-white hover:bg-gray-50 text-[#3B3109] border-[#3B3109]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '返回' : 'Back'}
                </Button>
                <Button
                  onClick={() => {
                    // TODO: 实现保存功能
                    console.log('Save canvas elements:', canvasElements);
                  }}
                  className="flex-1 bg-[#3B3109] hover:bg-[#2A240A] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '保存' : 'Save'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}