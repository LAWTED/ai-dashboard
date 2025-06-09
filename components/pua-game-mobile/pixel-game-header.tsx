import React from "react";
import { Info, Cpu } from "lucide-react";

interface PixelGameHeaderProps {
  gameDay: number;
  onShowInstructions: () => void;
  currentModel: 'deepseek' | 'openai';
  onModelChange: (model: 'deepseek' | 'openai') => void;
}

export function PixelGameHeader({
  gameDay,
  onShowInstructions,
  currentModel,
  onModelChange
}: PixelGameHeaderProps) {
  return (
    <div className="pixel-header bg-black text-white p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="pixel-text text-xl font-bold">PUA GAME</h1>
          <div className="pixel-text text-sm">
            Day: {gameDay}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onShowInstructions}
            className="pixel-button-small p-2 bg-blue-600 hover:bg-blue-700"
            title="游戏说明"
          >
            <Info size={16} />
          </button>

          <button
            onClick={() => onModelChange(currentModel === 'openai' ? 'deepseek' : 'openai')}
            className={`pixel-button-small p-2 flex items-center gap-1 ${
              currentModel === 'openai' ? 'bg-green-600' : 'bg-purple-600'
            }`}
            title="切换模型"
          >
            <Cpu size={16} />
            <span className="text-xs">{currentModel === 'openai' ? 'GPT' : 'DS'}</span>
          </button>
        </div>
      </div>

      <style jsx>{`
        .pixel-header {
          border-bottom: 4px solid #fff;
          box-shadow: 0 4px 0 0 rgba(0,0,0,0.2);
        }

        .pixel-button-small {
          font-family: "Courier New", monospace;
          border: 2px solid #fff;
          image-rendering: pixelated;
          transition: all 0.1s;
        }

        .pixel-button-small:active {
          transform: translate(1px, 1px);
        }
      `}</style>
    </div>
  );
}