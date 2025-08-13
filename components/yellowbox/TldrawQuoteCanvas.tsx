"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save, Type, Image as ImageIcon, Smile } from "lucide-react";
import Image from "next/image";
import { Tldraw, Editor, createShapeId } from "tldraw";
import 'tldraw/tldraw.css';
import { customShapeUtils } from './shapes';
import HolographicImageSticker from "./HolographicImageSticker";

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

interface TldrawQuoteCanvasProps {
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

const IMAGE_STICKERS = [
  {
    id: 'holographic-lightning',
    name: 'Holographic Lightning',
    url: 'https://holographic-sticker.vercel.app/light.png'
  }
];

export default function TldrawQuoteCanvas({
  open,
  onOpenChange,
  entry,
  language
}: TldrawQuoteCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image' | 'emoji'>('text');
  const [activeStickerTab, setActiveStickerTab] = useState<'emoji' | 'image_sticker'>('emoji');

  // 提取文字片段
  const extractTextSegments = useCallback((): TextSegment[] => {
    if (!entry?.entries?.conversationHistory) return [];

    return entry.entries.conversationHistory
      .filter(msg => msg.content && msg.content.trim())
      .flatMap(msg => {
        // 按段落分割
        const segments = msg.content.split(/[.!?。！？\\n]/)
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

  // 添加文字到画布
  const addTextToCanvas = (segment: TextSegment) => {
    if (!editor) return;

    const shapeId = createShapeId();
    editor.createShape({
      id: shapeId,
      type: 'quote-text',
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      props: {
        w: 250,
        h: 80,
        text: segment.content,
        color: segment.type === 'user' ? 'user' : 'ai',
        fontSize: 16,
        fontFamily: 'serif',
        fontWeight: 'normal',
      },
    });
  };

  // 添加图片到画布
  const addImageToCanvas = (image: ImageItem) => {
    if (!editor) return;

    const shapeId = createShapeId();
    editor.createShape({
      id: shapeId,
      type: 'quote-image',
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      props: {
        w: 200,
        h: 200,
        url: image.url,
        opacity: 1,
        borderRadius: 8,
      },
    });
  };

  // 添加 Emoji 到画布
  const addEmojiToCanvas = (emoji: string) => {
    if (!editor) return;

    const shapeId = createShapeId();
    editor.createShape({
      id: shapeId,
      type: 'quote-emoji',
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      props: {
        w: 64,
        h: 64,
        emoji: emoji,
        size: 32,
      },
    });
  };

  // 添加图片贴纸到画布
  const addImageStickerToCanvas = (sticker: { id: string; name: string; url: string }) => {
    if (!editor) return;

    const shapeId = createShapeId();
    editor.createShape({
      id: shapeId,
      type: 'quote-image-sticker',
      x: 100 + Math.random() * 300,
      y: 100 + Math.random() * 300,
      props: {
        w: 200,
        h: 200,
        stickerId: sticker.id,
        stickerName: sticker.name,
      },
    });
  };

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
        className="fixed inset-0 bg-yellow-50"
        style={{ 
          zIndex: 99999,
          transformStyle: 'flat'
        }}
      >
        <div className="flex h-screen">
          {/* 左侧 tldraw 画布区域 - 3/4 宽度 */}
          <div className="flex-1 relative bg-gray-100 mr-1">
            <div className="w-full h-full bg-white">
              <div className="relative w-full h-full">
                <Tldraw
                  shapeUtils={customShapeUtils}
                  onMount={(editor: Editor) => {
                    setEditor(editor);
                    // 设置画布背景为信纸样式
                    editor.updateInstanceState({
                      isDebugMode: false,
                    });
                    
                    // 添加键盘快捷键
                    const handleKeyDown = (e: KeyboardEvent) => {
                      // Ctrl/Cmd + Z: 撤销
                      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                        e.preventDefault();
                        editor.undo();
                      }
                      // Ctrl/Cmd + Shift + Z: 重做
                      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                        e.preventDefault();
                        editor.redo();
                      }
                      // Ctrl/Cmd + A: 全选
                      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                        e.preventDefault();
                        editor.selectAll();
                      }
                      // Delete/Backspace: 删除选中元素
                      if ((e.key === 'Delete' || e.key === 'Backspace')) {
                        const selectedShapes = editor.getSelectedShapes();
                        if (selectedShapes.length > 0) {
                          editor.deleteShapes(selectedShapes.map(s => s.id));
                        }
                      }
                    };
                    
                    document.addEventListener('keydown', handleKeyDown);
                    
                    // 清理事件监听器
                    return () => {
                      document.removeEventListener('keydown', handleKeyDown);
                    };
                  }}
                  persistenceKey="quote-canvas"
                />
                {/* 信纸背景叠加 */}
                <div 
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                      linear-gradient(to bottom, #e5e7eb 1px, transparent 1px),
                      linear-gradient(90deg, #fca5a5 0px, #fca5a5 2px, transparent 2px),
                      linear-gradient(90deg, rgba(59, 49, 9, 0.1) 0px, rgba(59, 49, 9, 0.1) 80px, transparent 80px)
                    `,
                    backgroundSize: '20px 24px, 20px 24px, 100% 100%, 100% 100%',
                    backgroundPosition: '0 0, 0 0, 0 0, 0 0',
                    opacity: 0.3
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
                </div>
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
                    <button
                      key={segment.id}
                      className={`w-full p-3 rounded-lg border-2 cursor-pointer transition-all text-left ${
                        segment.type === 'user'
                          ? 'bg-blue-100 border-blue-200 hover:border-blue-300'
                          : 'bg-green-100 border-green-200 hover:border-green-300'
                      }`}
                      onClick={() => addTextToCanvas(segment)}
                    >
                      <div className="text-xs text-gray-600 mb-1">
                        {segment.type === 'user' ? (language === 'zh' ? '你' : 'You') : 'AI'}
                      </div>
                      <div className="text-sm text-[#3B3109] line-clamp-3">
                        {segment.content}
                      </div>
                    </button>
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
                      <button
                        key={image.id}
                        className="aspect-square bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 cursor-pointer overflow-hidden"
                        onClick={() => addImageToCanvas(image)}
                      >
                        <Image
                          src={image.url}
                          alt="Diary image"
                          width={100}
                          height={100}
                          className="w-full h-full object-cover"
                        />
                      </button>
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
                    {language === 'zh' ? '贴纸' : 'Stickers'}
                  </h3>

                  {/* 子标签选择 */}
                  <div className="flex bg-yellow-300 rounded-lg p-1 mb-3">
                    <button
                      onClick={() => setActiveStickerTab('emoji')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeStickerTab === 'emoji'
                          ? 'bg-yellow-400 text-[#3B3109] shadow-sm'
                          : 'text-[#3B3109]/70 hover:text-[#3B3109]'
                      }`}
                    >
                      Emoji
                    </button>
                    <button
                      onClick={() => setActiveStickerTab('image_sticker')}
                      className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                        activeStickerTab === 'image_sticker'
                          ? 'bg-yellow-400 text-[#3B3109] shadow-sm'
                          : 'text-[#3B3109]/70 hover:text-[#3B3109]'
                      }`}
                    >
                      {language === 'zh' ? '图片' : 'Images'}
                    </button>
                  </div>

                  {/* Emoji 贴纸 */}
                  {activeStickerTab === 'emoji' && (
                    <div className="grid grid-cols-5 gap-2">
                      {EMOJI_LIST.map((emoji, index) => (
                        <button
                          key={index}
                          className="aspect-square bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 text-2xl flex items-center justify-center cursor-pointer"
                          onClick={() => addEmojiToCanvas(emoji)}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* 图片贴纸 */}
                  {activeStickerTab === 'image_sticker' && (
                    <div className="grid grid-cols-2 gap-3">
                      {IMAGE_STICKERS.map((sticker) => (
                        <button
                          key={sticker.id}
                          className="aspect-square bg-white rounded-lg border-2 border-yellow-200 hover:border-yellow-300 cursor-pointer overflow-hidden flex items-center justify-center p-2"
                          onClick={() => addImageStickerToCanvas(sticker)}
                        >
                          <div className="w-full h-full">
                            <HolographicImageSticker className="w-full h-full" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
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
                  onClick={async () => {
                    if (!editor) return;
                    
                    try {
                      // 导出为 PNG
                      const ids = editor.getCurrentPageShapeIds();
                      if (ids.size === 0) {
                        alert(language === 'zh' ? '画布为空，没有内容可导出' : 'Canvas is empty, nothing to export');
                        return;
                      }
                      
                      const svg = await editor.getSvgString(Array.from(ids));
                      if (svg) {
                        // 创建下载链接
                        const blob = new Blob([svg.svg], { type: 'image/svg+xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `quote-design-${Date.now()}.svg`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                        
                        console.log('Canvas exported successfully');
                      }
                    } catch (error) {
                      console.error('Export failed:', error);
                      alert(language === 'zh' ? '导出失败，请重试' : 'Export failed, please try again');
                    }
                  }}
                  className="flex-1 bg-[#3B3109] hover:bg-[#2A240A] text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {language === 'zh' ? '导出' : 'Export'}
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}