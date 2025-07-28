import { useState } from "react";
import { useDrag } from "react-dnd";
import { useYellowBoxI18n } from "@/contexts/yellowbox-i18n-context";
import { ChevronDown, ChevronRight, Type, Sparkles, Calendar, MessageSquare, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

interface ElementsPanelProps {
  entryData: any;
  onAddElement: (element: any) => void;
}

interface DraggableItemProps {
  type: "text" | "sticker";
  content: string;
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  icon?: React.ReactNode;
}

function DraggableItem({ type, content, fontSize, fontFamily, color, icon }: DraggableItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: type,
    item: { type, content, fontSize, fontFamily, color },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [type, content, fontSize, fontFamily, color]);

  return (
    <div
      ref={drag}
      className={cn(
        "p-3 bg-white rounded-lg cursor-move hover:bg-yellow-50 transition-colors border border-[#E4BE10]",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex items-start gap-2">
        {icon && <div className="text-[#C04635] mt-0.5">{icon}</div>}
        <div className="flex-1">
          <div className="text-sm text-[#3B3109] line-clamp-2">
            {content}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ElementsPanel({ entryData, onAddElement }: ElementsPanelProps) {
  const { lang, t } = useYellowBoxI18n();
  const [expandedSections, setExpandedSections] = useState({
    text: true,
    stickers: true,
    backgrounds: false,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Extract text elements from entry data
  const textElements = [];
  
  if (entryData) {
    // Entry title (from enhanced summary)
    if (entryData.metadata?.enhancedSummary?.title) {
      textElements.push({
        type: "text" as const,
        content: entryData.metadata.enhancedSummary.title,
        fontSize: 32,
        fontFamily: "Georgia",
        color: "#3B3109",
        icon: <Type className="w-4 h-4" />,
      });
    }

    // User messages
    const userMessages = entryData.entries?.conversationHistory?.filter(
      (msg: any) => msg.type === "user"
    ) || [];
    userMessages.forEach((msg: any, index: number) => {
      if (msg.content) {
        textElements.push({
          type: "text" as const,
          content: msg.content.slice(0, 100) + (msg.content.length > 100 ? "..." : ""),
          fontSize: 20,
          fontFamily: "Georgia",
          color: "#1F2937",
          icon: <MessageSquare className="w-4 h-4" />,
        });
      }
    });

    // AI responses (golden quotes)
    const aiMessages = entryData.entries?.conversationHistory?.filter(
      (msg: any) => msg.type === "ai"
    ) || [];
    aiMessages.forEach((msg: any, index: number) => {
      if (msg.content && index < 2) { // Limit to first 2 AI responses
        textElements.push({
          type: "text" as const,
          content: msg.content.slice(0, 80) + (msg.content.length > 80 ? "..." : ""),
          fontSize: 24,
          fontFamily: "Georgia",
          color: "#C04635",
          icon: <Bot className="w-4 h-4" />,
        });
      }
    });

    // Date and time
    if (entryData.created_at) {
      const date = new Date(entryData.created_at);
      textElements.push({
        type: "text" as const,
        content: date.toLocaleDateString(),
        fontSize: 18,
        fontFamily: "Helvetica",
        color: "#6B7280",
        icon: <Calendar className="w-4 h-4" />,
      });
    }
  }

  // Default text elements if no entry data
  if (textElements.length === 0) {
    textElements.push(
      {
        type: "text" as const,
        content: lang === "zh" ? "你的美好回忆" : "Your Beautiful Memory",
        fontSize: 32,
        fontFamily: "Georgia",
        color: "#3B3109",
        icon: <Type className="w-4 h-4" />,
      },
      {
        type: "text" as const,
        content: lang === "zh" ? "在这里添加文字..." : "Add your text here...",
        fontSize: 20,
        fontFamily: "Georgia",
        color: "#1F2937",
        icon: <MessageSquare className="w-4 h-4" />,
      }
    );
  }

  const stickers = [
    "🌻", "🌸", "🌺", "🌼", "🌷", "🌹", "🌿", "🍃", "🍂",
    "✨", "⭐", "🌟", "💫", "🌙", "☀️", "🌈", "☁️",
    "❤️", "💛", "💚", "💙", "💜", "🤍", "🖤", "💕",
    "📝", "📌", "📍", "🎯", "🎨", "🖊️", "✏️", "📐",
    "🦋", "🌴", "🌊", "🏔️", "🌅", "🎭", "🎪", "🎡",
  ];

  return (
    <div className="w-80 bg-yellow-400 p-4 border-l-2 border-[#E4BE10] overflow-y-auto">
      <h2 className="text-xl font-bold text-[#3B3109] mb-4">
        {lang === "zh" ? "元素" : "Elements"}
      </h2>

      {/* Text Elements Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("text")}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h3 className="text-lg font-semibold text-[#3B3109]">
            {lang === "zh" ? "文字元素" : "Text Elements"}
          </h3>
          {expandedSections.text ? (
            <ChevronDown className="w-5 h-5 text-[#3B3109]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#3B3109]" />
          )}
        </button>
        
        {expandedSections.text && (
          <div className="space-y-2">
            {textElements.map((element, index) => (
              <DraggableItem key={`text-${index}`} {...element} />
            ))}
          </div>
        )}
      </div>

      {/* Stickers Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("stickers")}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h3 className="text-lg font-semibold text-[#3B3109]">
            {lang === "zh" ? "贴纸" : "Stickers"}
          </h3>
          {expandedSections.stickers ? (
            <ChevronDown className="w-5 h-5 text-[#3B3109]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[#3B3109]" />
          )}
        </button>
        
        {expandedSections.stickers && (
          <div className="grid grid-cols-6 gap-2">
            {stickers.map((sticker, index) => (
              <div
                key={`sticker-${index}`}
                className="relative"
              >
                <DraggableSticker content={sticker} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Section */}
      <div className="mt-6 p-3 bg-yellow-300 rounded-lg">
        <h4 className="text-sm font-semibold text-[#3B3109] mb-2">
          {lang === "zh" ? "快速添加" : "Quick Add"}
        </h4>
        <div className="space-y-2">
          <button
            onClick={() => {
              onAddElement({
                type: "text",
                content: lang === "zh" ? "双击编辑文字" : "Double-click to edit",
                x: 100,
                y: 100,
                fontSize: 24,
                fontFamily: "Georgia",
                color: "#1F2937",
              });
            }}
            className="w-full text-left text-sm bg-white p-2 rounded hover:bg-yellow-50 transition-colors"
          >
            + {lang === "zh" ? "添加文字" : "Add Text"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DraggableSticker({ content }: { content: string }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "sticker",
    item: { type: "sticker", content },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [content]);

  return (
    <div
      ref={drag}
      className={cn(
        "w-10 h-10 flex items-center justify-center bg-white rounded-lg cursor-move hover:bg-yellow-50 transition-colors text-2xl",
        isDragging && "opacity-50"
      )}
    >
      {content}
    </div>
  );
}