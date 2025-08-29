"use client";

import React, { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, Save } from "lucide-react";
import {
  Tldraw,
  Editor,
  createShapeId,
  toRichText,
  StateNode,
  TLUiOverrides,
  TLComponents,
  DefaultToolbar,
  DefaultToolbarContent,
  TldrawUiMenuItem,
  useTools,
  useIsToolSelected,
  getSnapshot,
  TLStoreSnapshot,
} from "tldraw";
import 'tldraw/tldraw.css';
import { supabaseAssetStore } from "@/lib/yellowbox/tldraw-asset-store";

import { TldrawSnapshot } from "@/lib/yellowbox/types/template";

interface TemplateCanvasProps {
  onSnapshotChange?: (snapshot: TldrawSnapshot) => void;
  initialSnapshot?: TldrawSnapshot;
  onSave?: () => void;
  onBack?: () => void;
  isSaving?: boolean;
  showSaveButton?: boolean;
  templateName?: string;
}

const EMOJI_LIST = [
  "😊", "😍", "🥰", "😘", "🤗", "🤔", "😎", "🤩", "🥳", "😇",
  "🌟", "⭐", "✨", "💫", "🌈", "🌸", "🌺", "🌻", "🌹", "💐",
  "❤️", "💕", "💖", "💗", "💝", "💘", "💞", "💓", "💟", "♥️",
  "🎉", "🎊", "🎈", "🎁", "🎀", "🎯", "🎨", "🎭", "🎪", "🎵"
];

// 模板专用贴纸工具
class TemplateStickerTool extends StateNode {
  static override id = 'template-sticker'
  static override initial = 'idle'

  override onEnter() {
    this.editor.setCursor({ type: 'cross', rotation: 0 })
  }

  override onPointerDown() {
    const { currentPagePoint } = this.editor.inputs

    // 添加随机表情贴纸
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

    // 放置贴纸后返回选择工具
    this.editor.setCurrentTool('select')
  }

  override onCancel() {
    this.editor.setCurrentTool('select')
  }

  override onExit() {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }
}

// 模板模式的 UI 覆盖
const templateUiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools['template-sticker'] = {
      id: 'template-sticker',
      icon: 'heart-icon',
      label: '贴纸',
      kbd: 's',
      onSelect: () => {
        editor.setCurrentTool('template-sticker')
      },
    }
    return tools
  },
}

// 模板专用工具栏
const TemplateToolbar = (props: React.ComponentProps<typeof DefaultToolbar>) => {
  const tools = useTools()
  const isStickerSelected = useIsToolSelected(tools['template-sticker'])

  return (
    <DefaultToolbar {...props}>
      <DefaultToolbarContent />
      <TldrawUiMenuItem
        {...tools['template-sticker']}
        isSelected={isStickerSelected}
        icon={<Heart size={16} />}
      />
    </DefaultToolbar>
  )
}

// 模板模式的组件覆盖
const templateComponents: TLComponents = {
  Toolbar: TemplateToolbar,
  // 隐藏不必要的UI元素，提供更清洁的模板设计体验
  ActionsMenu: null,
  MainMenu: null,
  HelperButtons: null,
  DebugMenu: null,
  MenuPanel: null,
  PageMenu: null,
  NavigationPanel: null,
}

export function TemplateCanvas({ 
  onSnapshotChange, 
  initialSnapshot,
  onSave,
  onBack,
  isSaving = false,
  showSaveButton = false,
  templateName
}: TemplateCanvasProps) {
  const [editor, setEditor] = useState<Editor | null>(null);

  // 监听画布变化并通知父组件
  const handleSnapshot = useCallback(() => {
    if (!editor) return;
    
    const fullSnapshot = getSnapshot(editor.store);
    const templateSnapshot: TldrawSnapshot = {
      document: fullSnapshot, // 保留完整的 snapshot 结构，包括 schema
      meta: {
        id: crypto.randomUUID(),
        createdAt: Date.now(),
        version: "1.0.0"
      }
    };
    
    onSnapshotChange?.(templateSnapshot);
  }, [editor, onSnapshotChange]);

  // 设置编辑器变化监听
  useEffect(() => {
    if (!editor) return;

    let debounceTimeout: NodeJS.Timeout;

    const handleChange = () => {
      // 使用防抖来减少频繁调用
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        handleSnapshot();
      }, 1000);
    };

    // 监听 store 变化
    const unsubscribe = editor.store.listen(handleChange);

    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      unsubscribe();
    };
  }, [editor, handleSnapshot]);

  return (
    <div className="relative w-full h-full bg-black">
      {/* 背景图片 */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/room.png')",
        }}
        initial={false}
        animate={{ opacity: 1 }}
      />

      {/* 模板设计说明浮层 */}
      <div className="absolute top-4 left-4 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-yellow-200 max-w-xs"
        >
          <h4 className="font-medium text-gray-900 mb-1">
            {templateName ? `编辑: ${templateName}` : '模板设计模式'}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            在这里设计您的模板布局。添加的文本将在应用模板时被 AI 替换为个性化内容。
          </p>
        </motion.div>
      </div>

      {/* 右下角控制面板 - 模仿 yellowbox layout 样式 */}
      <div className="absolute right-0 bottom-12 w-10 md:w-12 bg-yellow-400 rounded-l-lg flex flex-col items-center py-2 md:py-4 z-20">
        {/* 保存按钮 */}
        {showSaveButton && onSave && (
          <Button
            onClick={onSave}
            className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-2 md:mb-3 p-0 h-auto bg-transparent border-none"
            disabled={isSaving}
            title={isSaving ? '保存中...' : '保存模板'}
            variant="ghost"
          >
            <motion.div
              whileTap={{ scale: 1.2 }}
              transition={{ duration: 0.1 }}
            >
              {isSaving ? (
                <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-[#3B3109]/30 border-t-[#3B3109] rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 md:w-5 md:h-5" />
              )}
            </motion.div>
          </Button>
        )}
        
        {/* 返回按钮 */}
        {onBack && (
          <Button
            onClick={onBack}
            className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
            title="返回模板中心"
            variant="ghost"
          >
            <motion.div
              whileTap={{ scale: 1.2 }}
              transition={{ duration: 0.1 }}
            >
              <ArrowLeft className="w-4 h-4 md:w-5 md:h-5" />
            </motion.div>
          </Button>
        )}
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
            tools={[TemplateStickerTool]}
            overrides={templateUiOverrides}
            components={templateComponents}
            assets={supabaseAssetStore}
            snapshot={initialSnapshot?.document as TLStoreSnapshot}
            onMount={(editor: Editor) => {
              setEditor(editor);
              
              // 设置画布为透明背景，启用网格
              editor.updateInstanceState({
                isDebugMode: false,
                isGridMode: true,
              });

              // 初始化时触发一次快照更新，使用统一格式
              setTimeout(() => {
                handleSnapshot();
              }, 100);

              // 添加键盘快捷键
              const handleKeyDown = (e: KeyboardEvent) => {
                // 只在画布获得焦点时处理快捷键
                if (!document.activeElement?.closest('.tldraw-container')) {
                  return;
                }
                
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
              };

              document.addEventListener('keydown', handleKeyDown, false);

              // 清理事件监听器
              return () => {
                document.removeEventListener('keydown', handleKeyDown, false);
              };
            }}
            persistenceKey={`template-canvas-${templateName || 'new'}`}
          />
        </div>
      </div>
    </div>
  );
}