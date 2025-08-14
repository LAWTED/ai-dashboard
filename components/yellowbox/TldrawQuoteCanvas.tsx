"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Download, Heart } from "lucide-react";
import {
  Tldraw,
  Editor,
  createShapeId,
  toRichText,
  AssetRecordType,
  StateNode,
  TLUiOverrides,
  TLComponents,
  DefaultToolbar,
  DefaultToolbarContent,
  TldrawUiMenuItem,
  useTools,
  useIsToolSelected,
} from "tldraw";
import 'tldraw/tldraw.css';

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


// Custom Sticker Tool
class StickerTool extends StateNode {
  static override id = 'sticker'
  static override initial = 'idle'

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onPointerDown() {
    const { currentPagePoint } = this.editor.inputs

    // Add a random emoji sticker
    const randomEmoji = EMOJI_LIST[Math.floor(Math.random() * EMOJI_LIST.length)]

    const shapeId = createShapeId()
    this.editor.createShape({
      id: shapeId,
      type: 'text',
      x: currentPagePoint.x - 20,
      y: currentPagePoint.y - 20,
      props: {
        size: 'xl',
        color: 'yellow',
        font: 'draw',
        autoSize: true,
        richText: toRichText(randomEmoji),
      },
    })

    // Return to select tool after placing sticker
    this.editor.setCurrentTool('select')
  }

  override onCancel() {
    this.editor.setCurrentTool('select')
  }

  override onExit() {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }
}


// UI Overrides to add sticker tool
const uiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools.sticker = {
      id: 'sticker',
      icon: 'heart-icon',
      label: 'Sticker',
      kbd: 's',
      onSelect: () => {
        editor.setCurrentTool('sticker')
      },
    }
    return tools
  },
}

// Custom Toolbar Component
const CustomToolbar = (props: React.ComponentProps<typeof DefaultToolbar>) => {
  const tools = useTools()
  const isStickerSelected = useIsToolSelected(tools['sticker'])

  return (
    <DefaultToolbar {...props}>
      <DefaultToolbarContent />
      <TldrawUiMenuItem 
        {...tools['sticker']} 
        isSelected={isStickerSelected}
        icon={<Heart size={16} />}
      />
    </DefaultToolbar>
  )
}

// Components override - hide unnecessary UI elements but keep essential ones
const components: TLComponents = {
  Toolbar: CustomToolbar,
  // Hide these UI elements
  ActionsMenu: null,
  MainMenu: null,
  HelperButtons: null,
  DebugMenu: null,
  MenuPanel: null,
  PageMenu: null,
  NavigationPanel: null,
  Minimap: null,
  ZoomMenu: null,
  HelpMenu: null,
  SharePanel: null,
  // Keep StylePanel, context menu and QuickActions by not defining them (use default components)
}


export default function TldrawQuoteCanvas({
  open,
  onOpenChange,
  entry,
  language
}: TldrawQuoteCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);
  const [hasInitializedContent, setHasInitializedContent] = useState(false);
  const [isExporting, setIsExporting] = useState(false);



  // 智能布局算法 - 防止重叠
  const createSmartLayout = useCallback(() => {
    const canvasWidth = 1200;
    const canvasHeight = 800;
    const gridSize = 20; // 网格大小
    const occupiedCells = new Set<string>();
    
    // 检查位置是否被占用
    const isPositionOccupied = (x: number, y: number, width: number, height: number) => {
      const startGridX = Math.floor(x / gridSize);
      const startGridY = Math.floor(y / gridSize);
      const endGridX = Math.floor((x + width) / gridSize);
      const endGridY = Math.floor((y + height) / gridSize);
      
      for (let gx = startGridX; gx <= endGridX; gx++) {
        for (let gy = startGridY; gy <= endGridY; gy++) {
          if (occupiedCells.has(`${gx},${gy}`)) {
            return true;
          }
        }
      }
      return false;
    };
    
    // 标记位置为已占用
    const markPositionOccupied = (x: number, y: number, width: number, height: number) => {
      const startGridX = Math.floor(x / gridSize);
      const startGridY = Math.floor(y / gridSize);
      const endGridX = Math.floor((x + width) / gridSize);
      const endGridY = Math.floor((y + height) / gridSize);
      
      for (let gx = startGridX; gx <= endGridX; gx++) {
        for (let gy = startGridY; gy <= endGridY; gy++) {
          occupiedCells.add(`${gx},${gy}`);
        }
      }
    };
    
    // 找到适合的位置
    const findNextPosition = (preferredX: number, preferredY: number, width: number, height: number) => {
      // 先尝试首选位置
      if (!isPositionOccupied(preferredX, preferredY, width, height)) {
        return { x: preferredX, y: preferredY };
      }
      
      // 如果首选位置被占用，使用螺旋搜索
      const maxRadius = Math.max(canvasWidth, canvasHeight) / gridSize;
      for (let radius = 1; radius < maxRadius; radius++) {
        for (let angle = 0; angle < 360; angle += 15) {
          const radian = (angle * Math.PI) / 180;
          const testX = preferredX + Math.cos(radian) * radius * gridSize;
          const testY = preferredY + Math.sin(radian) * radius * gridSize;
          
          if (testX >= 50 && testY >= 80 && 
              testX + width <= canvasWidth - 50 && 
              testY + height <= canvasHeight - 50 &&
              !isPositionOccupied(testX, testY, width, height)) {
            return { x: testX, y: testY };
          }
        }
      }
      
      // 如果仍然找不到，返回随机位置
      return {
        x: Math.random() * (canvasWidth - width - 100) + 50,
        y: Math.random() * (canvasHeight - height - 100) + 80
      };
    };
    
    return { findNextPosition, markPositionOccupied };
  }, []);
  
  // 自动加载日记内容到画布
  const loadDiaryContentToCanvas = useCallback(() => {
    if (!editor || !entry || hasInitializedContent) return;

    // 检查是否有保存的设计
    const storageKey = `tldraw-quote-${entry.id}`;
    const savedData = localStorage.getItem(storageKey);
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        // 加载保存的画布状态
        editor.loadSnapshot(parsedData.data);
        setHasInitializedContent(true);
        console.log('Loaded saved design from localStorage');
        return;
      } catch (error) {
        console.warn('Failed to load saved design:', error);
        // 如果加载失败，继续使用默认内容
      }
    }

    // 如果没有保存的设计，加载默认内容
    // 先清空画布
    const allShapeIds = editor.getCurrentPageShapeIds();
    if (allShapeIds.size > 0) {
      editor.deleteShapes(Array.from(allShapeIds));
    }

    // 初始化智能布局系统
    const { findNextPosition, markPositionOccupied } = createSmartLayout();

    // 1. 添加日记标题（使用 aiSummary 或默认标题）
    const title = entry.metadata?.aiSummary ||
      (entry.entries.timeOfDay === 'morning' ? 'Morning Reflection' :
       entry.entries.timeOfDay === 'evening' ? 'Evening Reflection' :
       'Daily Reflection');

    if (title) {
      const titleWidth = 450;
      const titleHeight = 60;
      const titlePos = findNextPosition(150, 80, titleWidth, titleHeight);
      
      const titleShapeId = createShapeId();
      editor.createShape({
        id: titleShapeId,
        type: 'text',
        x: titlePos.x,
        y: titlePos.y,
        props: {
          size: 'xl',
          color: 'orange',
          font: 'draw',
          w: titleWidth,
          autoSize: false,
          richText: toRichText(title),
        },
      });

      markPositionOccupied(titlePos.x, titlePos.y, titleWidth, titleHeight);
    }

    // 2. 添加对话历史中的文本和图片
    if (entry.entries.conversationHistory) {
      entry.entries.conversationHistory.forEach((message) => {
        // 添加图片 - 横向排列，不重叠
        if (message.images && message.images.length > 0) {
          const imagesPerRow = 2; // 每行最多2张图片
          const imageWidth = 180;
          const imageHeight = 180;

          for (let imgIndex = 0; imgIndex < message.images.length; imgIndex++) {
            const imageUrl = message.images[imgIndex];
            const row = Math.floor(imgIndex / imagesPerRow);
            const col = imgIndex % imagesPerRow;

            try {
              // 创建 asset
              const assetId = AssetRecordType.createId();
              editor.createAssets([{
                id: assetId,
                type: 'image',
                typeName: 'asset',
                meta: {},
                props: {
                  name: `diary-image-${imgIndex}`,
                  src: imageUrl,
                  w: imageWidth,
                  h: imageHeight,
                  mimeType: 'image/jpeg',
                  isAnimated: false,
                }
              }]);

              // 创建图片形状
              const imageShapeId = createShapeId();
              editor.createShape({
                id: imageShapeId,
                type: 'image',
                x: 150 + (col * 200),
                y: 200 + (row * 200),
                props: {
                  w: imageWidth,
                  h: imageHeight,
                  assetId: assetId,
                },
              });
            } catch (error) {
              console.warn('Failed to create image:', error);
              // fallback: 使用 text 形状显示图片占位符
              const imageShapeId = createShapeId();
              editor.createShape({
                id: imageShapeId,
                type: 'text',
                x: 150 + (col * 200),
                y: 200 + (row * 200),
                props: {
                  size: 'm',
                  color: 'orange',
                  font: 'draw',
                  w: imageWidth,
                  autoSize: false,
                  richText: toRichText(`📷 Image ${imgIndex + 1}\n\n[${imageUrl.split('/').pop()?.slice(0, 20)}...]`),
                },
              });
            }
          }

          // 已处理图片
        }

        // 添加文本（过滤掉太短的内容）
        if (message.content && message.content.trim().length > 10) {
          const textWidth = Math.min(400, Math.max(200, message.content.length * 2));
          const textX = message.type === 'user' ? 150 : 600;
          const textY = 400 + Math.random() * 200; // 简单的随机定位避免重叠

          const textShapeId = createShapeId();
          editor.createShape({
            id: textShapeId,
            type: 'text',
            x: textX,
            y: textY,
            props: {
              size: 'm',
              color: message.type === 'user' ? 'yellow' : 'orange',
              font: 'draw',
              w: textWidth,
              autoSize: false,
              richText: toRichText(message.content),
            },
          });
        }
      });
    }

    // 3. 添加装饰性元素 - 放在右侧，避免与主内容重叠
    const decorativeEmojis = ['✨', '💭', '🌟'];
    decorativeEmojis.forEach((emoji, index) => {
      const emojiShapeId = createShapeId();
      editor.createShape({
        id: emojiShapeId,
        type: 'text',
        x: 900 + (index % 2) * 80, // 错开排列
        y: 150 + (index * 120),
        props: {
          size: 'xl',
          color: 'yellow',
          font: 'draw',
          autoSize: true,
          richText: toRichText(emoji),
        },
      });
    });

    setHasInitializedContent(true);
  }, [editor, entry, hasInitializedContent, createSmartLayout]);

  // 自动保存功能
  const autoSave = useCallback(() => {
    if (!editor || !entry) return;
    
    try {
      const canvasData = editor.getSnapshot();
      const storageKey = `tldraw-quote-${entry.id}`;
      
      localStorage.setItem(storageKey, JSON.stringify({
        data: canvasData,
        timestamp: Date.now(),
        entryId: entry.id
      }));
      
      console.log('Auto-saved canvas state');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }, [editor, entry]);

  // 监听画布变化并自动保存
  useEffect(() => {
    if (!editor || !hasInitializedContent) return;

    let saveTimeout: NodeJS.Timeout;

    const handleChange = () => {
      clearTimeout(saveTimeout);
      saveTimeout = setTimeout(() => {
        autoSave();
      }, 2000);
    };

    // 监听历史变化事件
    const cleanup = editor.store.listen(handleChange, {
      source: 'user',
      scope: 'document'
    });

    return () => {
      clearTimeout(saveTimeout);
      cleanup();
    };
  }, [editor, hasInitializedContent, autoSave]);

  // 当 Design Quote 画布打开且编辑器准备好时，自动加载内容
  useEffect(() => {
    if (editor && entry && open && !hasInitializedContent) {
      // 稍微延迟以确保画布完全初始化
      const timer = setTimeout(() => {
        loadDiaryContentToCanvas();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [editor, entry, open, hasInitializedContent, loadDiaryContentToCanvas]);

  // 当 Design Quote 画布关闭或切换条目时重置初始化状态
  useEffect(() => {
    if (!open) {
      setHasInitializedContent(false);
    }
  }, [open]);

  // 当条目 ID 改变时重置初始化状态
  useEffect(() => {
    setHasInitializedContent(false);
  }, [entry?.id]);

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
        <div className="relative h-screen">
          {/* 右下角控制面板 - 模仿 yellowbox layout 样式 */}
          <div className="absolute right-0 bottom-0 w-10 md:w-12 bg-yellow-400 rounded-tl-lg flex flex-col items-center py-2 md:py-4 z-20">
            {/* 导出按钮 */}
            <Button
              onClick={async () => {
                if (!editor) return;
                
                setIsExporting(true);
                try {
                  // 导出为 PNG
                  const ids = editor.getCurrentPageShapeIds();
                  if (ids.size === 0) {
                    alert(language === 'zh' ? '画布为空，没有内容可导出' : 'Canvas is empty, nothing to export');
                    return;
                  }

                  // 获取 SVG 数据
                  const svgResult = await editor.getSvgString(Array.from(ids), {
                    background: true,
                    bounds: editor.getSelectionPageBounds() || editor.getCurrentPageBounds(),
                    padding: 16,
                    scale: 2 // 高质量导出
                  });
                  
                  if (svgResult) {
                    // 使用 data URL 创建 canvas，避免 CORS 问题
                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    const img = new Image();
                    
                    // 设置 crossOrigin 属性避免污染 canvas
                    img.crossOrigin = 'anonymous';
                    
                    img.onload = () => {
                      canvas.width = img.naturalWidth;
                      canvas.height = img.naturalHeight;
                      
                      // 白色背景
                      if (ctx) {
                        ctx.fillStyle = '#ffffff';
                        ctx.fillRect(0, 0, canvas.width, canvas.height);
                        ctx.drawImage(img, 0, 0);
                      }
                      
                      // 下载 PNG
                      canvas.toBlob((blob) => {
                        if (blob) {
                          const url = URL.createObjectURL(blob);
                          const a = document.createElement('a');
                          a.href = url;
                          a.download = `quote-design-${Date.now()}.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
                          URL.revokeObjectURL(url);
                          
                          console.log('Canvas exported as PNG');
                        }
                      }, 'image/png');
                    };
                    
                    img.onerror = () => {
                      console.error('Failed to load SVG image');
                    };
                    
                    // 使用 data URL 避免 CORS 问题
                    const svgDataUrl = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgResult.svg)}`;
                    img.src = svgDataUrl;
                  } else {
                    throw new Error('Failed to generate SVG');
                  }
                } catch (error) {
                  console.error('Export failed:', error);
                  alert(language === 'zh' ? '导出失败，请重试' : 'Export failed, please try again');
                } finally {
                  setIsExporting(false);
                }
              }}
              className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-2 md:mb-3 p-0 h-auto bg-transparent border-none"
              disabled={isExporting}
              title={language === 'zh' ? (isExporting ? '导出中...' : '导出 PNG') : (isExporting ? 'Exporting...' : 'Export PNG')}
              variant="ghost"
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                transition={{ duration: 0.1 }}
              >
                <Download className={`w-4 h-4 md:w-5 md:h-5 ${isExporting ? 'animate-bounce' : ''}`} />
              </motion.div>
            </Button>

            {/* 返回按钮 */}
            <Button
              onClick={() => onOpenChange(false)}
              className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
              title={language === 'zh' ? '返回' : 'Back'}
              variant="ghost"
            >
              <motion.div
                whileTap={{ scale: 1.2 }}
                transition={{ duration: 0.1 }}
              >
                <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
              </motion.div>
            </Button>
          </div>

          {/* tldraw 画布区域 - 全屏 */}
          <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
            {/* 信纸背景层 - 最底层 */}
            <div
              className="absolute inset-0 bg-white rounded-lg"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e5e7eb 1px, transparent 1px),
                  linear-gradient(to bottom, #e5e7eb 1px, transparent 1px),
                  linear-gradient(90deg, #fca5a5 0px, #fca5a5 2px, transparent 2px),
                  linear-gradient(90deg, rgba(59, 49, 9, 0.1) 0px, rgba(59, 49, 9, 0.1) 80px, transparent 80px)
                `,
                backgroundSize: '20px 24px, 20px 24px, 100% 100%, 100% 100%',
                backgroundPosition: '0 0, 0 0, 0 0, 0 0',
                zIndex: 1,
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

            {/* tldraw 画布层 - 在背景之上 */}
            <div
              className="relative w-full h-full tldraw-container rounded-lg overflow-hidden"
              style={{ zIndex: 2 }}
            >
              <Tldraw
                tools={[StickerTool]}
                overrides={uiOverrides}
                components={components}
                onMount={(editor: Editor) => {
                  setEditor(editor);
                  // 设置画布为透明背景，让下层的信纸背景显示，并启用网格
                  editor.updateInstanceState({
                    isDebugMode: false,
                    isGridMode: true,
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
              persistenceKey={`quote-canvas-${entry.id}`}
            />
            </div>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
}