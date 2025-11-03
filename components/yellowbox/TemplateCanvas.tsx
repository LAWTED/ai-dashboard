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

import { TldrawSnapshot } from "@/lib/yellowbox/template-types";

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

// Template-specific sticker tool
class TemplateStickerTool extends StateNode {
  static override id = 'template-sticker'
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

    // Return to the select tool once placed
    this.editor.setCurrentTool('select')
  }

  override onCancel() {
    this.editor.setCurrentTool('select')
  }

  override onExit() {
    this.editor.setCursor({ type: 'default', rotation: 0 })
  }
}

// UI overrides used in template mode
const templateUiOverrides: TLUiOverrides = {
  tools(editor, tools) {
    tools['template-sticker'] = {
      id: 'template-sticker',
      icon: 'heart-icon',
      label: 'Stickers',
      kbd: 's',
      onSelect: () => {
        editor.setCurrentTool('template-sticker')
      },
    }
    return tools
  },
}

// Template toolbar
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

// Component overrides for template mode
const templateComponents: TLComponents = {
  Toolbar: TemplateToolbar,
  // Hide extraneous UI for a cleaner design surface
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

  // Watch canvas changes and notify the parent component
  const handleSnapshot = useCallback(() => {
    if (!editor) return;
    
    const templateSnapshot = getSnapshot(editor.store) as unknown as TldrawSnapshot;
    
    onSnapshotChange?.(templateSnapshot);
  }, [editor, onSnapshotChange]);

  // Set up listeners for editor changes
  useEffect(() => {
    if (!editor) return;

    let debounceTimeout: NodeJS.Timeout;

    const handleChange = () => {
      // Debounce updates to avoid excessive calls
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
      debounceTimeout = setTimeout(() => {
        handleSnapshot();
      }, 1000);
    };

    // Subscribe to store changes
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
      {/* Background image */}
      <motion.div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url('/room.png')",
        }}
        initial={false}
        animate={{ opacity: 1 }}
      />

      {/* Template guidance panel */}
      <div className="absolute top-4 left-4 z-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-yellow-200 max-w-xs"
        >
          <h4 className="font-medium text-gray-900 mb-1">
            {templateName ? `Editing: ${templateName}` : 'Template Design Mode'}
          </h4>
          <p className="text-sm text-gray-600 mb-2">
            Design your template layout here. Any text you add will be personalized by AI when applied.
          </p>
        </motion.div>
      </div>

      {/* Bottom-right control panel styled like YellowBox layout */}
      <div className="absolute right-0 bottom-12 w-10 md:w-12 bg-yellow-400 rounded-l-lg flex flex-col items-center py-2 md:py-4 z-20">
        {/* Save button */}
        {showSaveButton && onSave && (
          <Button
            onClick={onSave}
            className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity mb-2 md:mb-3 p-0 h-auto bg-transparent border-none"
            disabled={isSaving}
            title={isSaving ? 'Saving...' : 'Save template'}
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
        
        {/* Back button */}
        {onBack && (
          <Button
            onClick={onBack}
            className="text-[#3B3109] hover:opacity-70 hover:bg-transparent transition-opacity p-0 h-auto bg-transparent border-none"
            title="Back to template hub"
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

      {/* Fullscreen tldraw canvas */}
      <div className="absolute inset-0 bg-gray-100 rounded-lg overflow-hidden">
        {/* Stationery-style background layer */}
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
          {/* Notebook binding holes */}
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

        {/* tldraw canvas layer above the background */}
        <div
          className="relative w-full h-full tldraw-container rounded-lg overflow-hidden"
          style={{ zIndex: 2 }}
        >
          <Tldraw
            tools={[TemplateStickerTool]}
            overrides={templateUiOverrides}
            components={templateComponents}
            assets={supabaseAssetStore}
            snapshot={initialSnapshot as unknown as TLStoreSnapshot}
            onMount={(editor: Editor) => {
              setEditor(editor);
              
              // Configure the canvas with a transparent background and grid
              editor.updateInstanceState({
                isDebugMode: false,
                isGridMode: true,
              });

              // Trigger a snapshot update after mount
              setTimeout(() => {
                handleSnapshot();
              }, 100);

              // Keyboard shortcuts
              const handleKeyDown = (e: KeyboardEvent) => {
                // Only respond when the canvas is focused
                if (!document.activeElement?.closest('.tldraw-container')) {
                  return;
                }
                
                // Ctrl/Cmd + Z: Undo
                if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
                  e.preventDefault();
                  editor.undo();
                }
                // Ctrl/Cmd + Shift + Z: Redo
                if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
                  e.preventDefault();
                  editor.redo();
                }
                // Ctrl/Cmd + A: Select all
                if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
                  e.preventDefault();
                  editor.selectAll();
                }
              };

              document.addEventListener('keydown', handleKeyDown, false);

              // Clean up listeners on unmount
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
