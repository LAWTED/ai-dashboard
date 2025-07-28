import { useRef, useState } from "react";
import { useDrop } from "react-dnd";
import { CanvasElement, CanvasState } from "../page";
import { cn } from "@/lib/utils";
import { Trash2, RotateCw } from "lucide-react";

interface CanvasProps {
  state: CanvasState;
  selectedElement: string | null;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, updates: Partial<CanvasElement>) => void;
  onDeleteElement: (id: string) => void;
  onAddElement: (element: Omit<CanvasElement, "id" | "zIndex">) => void;
}

export function Canvas({
  state,
  selectedElement,
  onSelectElement,
  onUpdateElement,
  onDeleteElement,
  onAddElement,
}: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [{ isOver }, drop] = useDrop(() => ({
    accept: ["text", "sticker"],
    drop: (item: { type: string; content: string; fontSize?: number; fontFamily?: string; color?: string }, monitor) => {
      const canvasRect = canvasRef.current?.getBoundingClientRect();
      if (!canvasRect) return;

      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;

      // Calculate position with offset to center the element on cursor
      const elementWidth = item.type === "sticker" ? 50 : 150;
      const elementHeight = item.type === "sticker" ? 50 : 40;
      
      const x = clientOffset.x - canvasRect.left - elementWidth / 2;
      const y = clientOffset.y - canvasRect.top - elementHeight / 2;

      onAddElement({
        type: item.type as "text" | "sticker",
        content: item.content,
        x: Math.max(0, Math.min(x, state.width - elementWidth)),
        y: Math.max(0, Math.min(y, state.height - elementHeight)),
        fontSize: item.fontSize || 24,
        fontFamily: item.fontFamily || "Georgia",
        color: item.color || "#1F2937",
      });
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  drop(canvasRef);

  const getBackgroundStyle = () => {
    switch (state.background) {
      case "yellow-gradient":
        return "bg-gradient-to-br from-[#FEF3C7] to-[#FACC15]";
      case "white":
        return "bg-white";
      case "blue-watercolor":
        return "bg-gradient-to-br from-blue-100 to-blue-300";
      case "sunset":
        return "bg-gradient-to-br from-orange-200 via-pink-200 to-purple-200";
      case "vintage":
        return "bg-[#F5E6D3]";
      default:
        return "bg-[#FEF3C7]";
    }
  };

  const handleElementMouseDown = (e: React.MouseEvent, elementId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const element = state.elements.find(el => el.id === elementId);
    if (!element) return;

    onSelectElement(elementId);
    setIsDragging(true);
    setDragStart({
      x: e.clientX - element.x,
      y: e.clientY - element.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedElement) return;

    const canvasRect = canvasRef.current?.getBoundingClientRect();
    if (!canvasRect) return;

    const x = e.clientX - canvasRect.left - dragStart.x;
    const y = e.clientY - canvasRect.top - dragStart.y;

    onUpdateElement(selectedElement, {
      x: Math.max(0, Math.min(x, state.width - 100)),
      y: Math.max(0, Math.min(y, state.height - 50)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null);
    }
  };

  return (
    <div className="relative">
      <div
        ref={canvasRef}
        className={cn(
          "relative border-4 border-[#E4BE10] rounded-lg shadow-2xl overflow-hidden transition-colors",
          getBackgroundStyle(),
          isOver && "border-[#C04635]"
        )}
        style={{
          width: state.width,
          height: state.height,
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleCanvasClick}
      >
        {/* Grid overlay for alignment help */}
        {isDragging && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(0deg, rgba(0,0,0,0.05) 0px, transparent 1px, transparent 49px, rgba(0,0,0,0.05) 50px),
                repeating-linear-gradient(90deg, rgba(0,0,0,0.05) 0px, transparent 1px, transparent 49px, rgba(0,0,0,0.05) 50px)
              `,
            }}
          />
        )}

        {/* Render elements */}
        {state.elements
          .sort((a, b) => a.zIndex - b.zIndex)
          .map((element) => (
            <div
              key={element.id}
              className={cn(
                "absolute cursor-move select-none",
                selectedElement === element.id && "ring-2 ring-[#C04635] ring-offset-2"
              )}
              style={{
                left: element.x,
                top: element.y,
                transform: `rotate(${element.rotation || 0}deg)`,
                zIndex: element.zIndex,
              }}
              onMouseDown={(e) => handleElementMouseDown(e, element.id)}
            >
              {element.type === "text" ? (
                <div
                  contentEditable={selectedElement === element.id}
                  suppressContentEditableWarning
                  className="outline-none px-2 py-1"
                  style={{
                    fontSize: element.fontSize,
                    fontFamily: element.fontFamily,
                    color: element.color,
                  }}
                  onBlur={(e) => {
                    onUpdateElement(element.id, {
                      content: e.currentTarget.textContent || "",
                    });
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {element.content}
                </div>
              ) : (
                <div className="text-4xl">{element.content}</div>
              )}

              {/* Element controls */}
              {selectedElement === element.id && (
                <div className="absolute -top-10 left-0 flex gap-1 bg-white rounded-lg shadow-lg p-1">
                  <button
                    className="p-1 hover:bg-gray-100 rounded text-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(element.id, {
                        rotation: ((element.rotation || 0) + 15) % 360,
                      });
                    }}
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 hover:bg-gray-100 rounded text-red-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(element.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          ))}

        {/* Drop hint */}
        {isOver && (
          <div className="absolute inset-0 bg-[#C04635] bg-opacity-10 pointer-events-none flex items-center justify-center">
            <div className="text-2xl text-[#C04635] font-bold">Drop here!</div>
          </div>
        )}
      </div>
    </div>
  );
}